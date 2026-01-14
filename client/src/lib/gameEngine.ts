import { AudioManager } from './audioManager';
import { ChartData } from './chartLoader';
import { SpriteAnimation, AnimationState, createPlayerAnimations } from './spriteAnimation';
import { experienceManager, type PlayerStats } from './experienceManager';
import { newEquipmentManager } from './newEquipmentManager';
import { vampireHeroAnimations, vampireHeroSprites } from '../data/vampireHeroAnimations';
import type { WeaponConfig } from '../types/equipment';
import { getEnemiesForStage, ENEMY_CONFIGS, type EnemyType } from '../data/enemyTypes';
import { getBossForMap, hasBoss, type BossConfig, BOSS_TYPES, type BossType } from '../data/bossTypes';
import { getBossSize } from '../data/sizeConfig';
// import { bossSpriteConfigs } from '../data/bossAnimations'; // 暂时禁用，使用序列帧动画
import { enemySpriteConfigs } from '../data/enemyAnimations';
import { FrameAnimationAdapter } from './FrameAnimationAdapter';
import { RhythmBossSystem } from './rhythmBossSystem';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  image?: HTMLImageElement; // 敌人精灵图
  animationOffset: number; // 动画偏移，用于飞行效果
  hitAnimation?: number; // 受击动画计时器
  isBoss?: boolean; // 是否为BOSS
  health?: number; // BOSS血量（普通敌人为1）
  guardBombs?: number[]; // BOSS护卫炸弹的ID列表
  isGuardBomb?: boolean; // 是否为BOSS护卫炸弹
  guardBossId?: number; // 护卫的BOSS ID
  guardAngle?: number; // 护卫环绕角度（弧度）
  guardRadius?: number; // 护卫环绕半径
  movementPattern?: 'linear' | 'wave' | 'sine' | 'dash' | 'dive'; // 移动模式
  initialY?: number; // 初始Y坐标，用于波浪移动
  dashCooldown?: number; // 冲刺冷却时间
  isDashing?: boolean; // 是否正在冲刺
  spriteAnimation?: any; // 精灵动画实例（支持多个动画状态：idle/attack）
  animationState?: 'idle' | 'walk' | 'attack'; // 当前动画状态
  frameAnimation?: FrameAnimationAdapter; // 序列帧动画实例（用于新怪物）
  attackCooldown?: number; // 攻击冷却时间
  isAttacking?: boolean; // 是否正在攻击
  attackHitFrame?: number; // 攻击命中帧（在这一帧判定伤害）
  hasDealtDamage?: boolean; // 本次攻击是否已经造成伤害
  // BOSS召唤技能相关
  summonCooldown?: number; // 召唤冷却时间（毫秒）
  lastSummonTime?: number; // 上次召唤时间戳
  summonCount?: number; // 每次召唤的数量
}

export interface Player {
  x: number;
  y: number;
  targetX?: number; // 目标X坐标，用于平滑移动
  targetY?: number; // 目标Y坐标，用于平滑移动
  rotation?: number; // 角色旋转角度（弧度），剑锋指向鼠标
  facingRight?: boolean; // 角色朝向：true=右，false=左
  width: number;
  height: number;
  image?: HTMLImageElement; // 玩家精灵图
  idleAnimation: number; // 待机动画计时器（旧系统，保留兼容）
  attackAnimation?: number; // 攻击动画计时器（旧系统，保留兼容）
  attackDashX?: number; // 攻击冲刺X方向
  attackDashY?: number; // 攻击冲刺Y方向
  attackDashDuration?: number; // 攻击冲刺持续时间
  spriteAnimation?: any; // SpriteAnimation实例（新系统）
  animationState?: string; // 当前动画状态名称（idle/attack/hit）
  isInvincible?: boolean; // 是否处于无敌状态
  invincibleEndTime?: number; // 无敌状态结束时间
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface HeartPickup {
  id: number;
  x: number;
  y: number;
  vx: number; // 水平速度
  vy: number; // 垂直速度
  size: number;
  lifetime: number; // 存在时间（毫秒）
  createdAt: number; // 创建时间戳
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  fontSize: number;
  vy: number; // 向上移动速度
  scale?: number; // 缩放比例，用于动画
  isCombo?: boolean; // 是否是连击文字，用于特殊动画
}

export type GameOrientation = 'portrait' | 'landscape';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private enemies: Enemy[] = [];
  private player: Player;
  private particles: Particle[] = []; // 粒子系统
  private floatingTexts: FloatingText[] = []; // 浮动文字系统
  private heartPickups: HeartPickup[] = []; // 心形道具系统
  private nextHeartId: number = 1; // 心形道具ID计数器
  private screenShake: { x: number; y: number; duration: number } = { x: 0, y: 0, duration: 0 }; // 屏幕震动
  private score: number = 0;
  private combo: number = 0;
  private lives: number = 3;
  private maxLives: number = 3;
  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private lastSpawnTime: number = 0;
  private lastLoseLifeTime: number = 0; // 上次扣血时间，用于防止短时间内连续扣血
  private spawnInterval: number = 1000;
  private swipeTrail: { x: number; y: number; time: number }[] = [];
  private trailMaxLength: number = 20;
  private nextEnemyId: number = 0;
  
  // 音频和谱面相关
  private audioManager: AudioManager | null = null;
  private chartData: ChartData | null = null;
  private upcomingNotes: Array<{ time: number; type: Enemy['type'] }> = [];
  
  // 只支持横屏模式，简化MVP
  // private orientation: GameOrientation = 'portrait';
  
  // 背景图片
  private backgroundImage: HTMLImageElement | null = null;
  
  // 敌人精灵图
  private enemyImages: Map<Enemy['type'], HTMLImageElement> = new Map();
  
  // 敌人动画（支持多个动画状态）
  private enemyAnimations: Map<string, any> = new Map();
  
  // 新怪物序列帧动画
  private newEnemyAnimations: Map<string, FrameAnimationAdapter> = new Map();
  
  // 音效管理器
  private soundEffects: any = null; // 将在Game.tsx中设置
  
  // 回调函数
  private onScoreChange?: (score: number) => void;
  private onComboChange?: (combo: number) => void;
  private onLivesChange?: (lives: number) => void;
  private onGameOver?: () => void;
  private onExpChange?: (stats: PlayerStats) => void;
  private onLevelUp?: (level: number, message: string) => void;
  private playerStats: PlayerStats;
  
  private isGameStarted = false;  // 标记游戏是否已开始
  
  // 难度倍率
  private speedMultiplier: number = 1.0;
  private densityMultiplier: number = 1.0;
  private stageId: string = 'abandoned-church'; // 当前地图ID
  private allowedEnemyTypes: EnemyType[] = []; // 当前地图允许的怪物类型
  private difficulty: 'easy' | 'normal' | 'hard' = 'normal'; // 难度等级
  private bossConfig: BossConfig | null = null; // 当前地图的BOSS配置
  private bossSpawned: boolean = false; // BOSS是否已生成
  
  // 节奏大师系统（第6关）
  private rhythmBossSystem: RhythmBossSystem | null = null;
  private isRhythmBossMode: boolean = false; // 是否为节奏大师模式（第6关）
  private lastNoteSpawnTime: number = 0; // 上次生成Note的时间
  
  // 怪物总数限制（防止谱面音符过多）
  private totalEnemiesSpawned: number = 0; // 已生成怪物总数
  private maxEnemiesPerStage: number = 300; // 每关怪物上限
  
  // 新手引导系统
  private isTutorialStage: boolean = false; // 是否是新手关卡
  private tutorialStep: number = 0; // 当前引导步骤
  private tutorialPaused: boolean = false; // 引导是否暂停游戏
  private tutorialMessage: string = ''; // 当前引导消息
  private tutorialTimer: number = 0; // 引导计时器
  private tutorialCompleted: boolean = false; // 引导是否完成
  private firstEnemyKilled: boolean = false; // 是否击杀了第一个敌人
  private firstBombSeen: boolean = false; // 是否看到了第一个炸弹

  constructor(canvas: HTMLCanvasElement, speedMultiplier: number = 1.0, densityMultiplier: number = 1.0, stageId: string = 'abandoned-church') {
    this.speedMultiplier = speedMultiplier;
    this.densityMultiplier = densityMultiplier;
    this.stageId = stageId;
    this.allowedEnemyTypes = getEnemiesForStage(stageId);
    this.bossConfig = getBossForMap(stageId);
    console.log(`Stage ${stageId} enemy types:`, this.allowedEnemyTypes);
    console.log(`Difficulty: ${this.difficulty}, Max enemies per stage: ${this.maxEnemiesPerStage}`);
    if (this.bossConfig) {
      console.log(`Stage ${stageId} has BOSS:`, this.bossConfig.name);
    }
    
    // 根据speedMultiplier推断难度
    if (speedMultiplier <= 1.0) {
      this.difficulty = 'easy';
      this.maxEnemiesPerStage = 200; // Easy难度最多200个怪物
    } else if (speedMultiplier <= 1.3) {
      this.difficulty = 'normal';
      this.maxEnemiesPerStage = 300; // Normal难度最多300个怪物
    } else {
      this.difficulty = 'hard';
      this.maxEnemiesPerStage = 500; // Hard难度最多500个怪物
    }
    console.log(`Difficulty: ${this.difficulty}, Max enemies: ${this.maxEnemiesPerStage}`);
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;
    
    // 加载玩家经验数据
    this.playerStats = experienceManager.loadStats();
    console.log('Player stats loaded:', this.playerStats);
    
    // 从装备管理器获取最大生命值
    this.maxLives = newEquipmentManager.getMaxHearts();
    this.lives = this.maxLives;
    console.log('Max lives from equipment:', this.maxLives);
    
    // 初始化玩家位置（只支持横屏）
    this.player = this.initializePlayer();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.player = this.initializePlayer(); // 重新计算玩家位置
    });
    
    // 设置画布大小
    this.resizeCanvas();
    
    // 加载美术资源
    this.loadAssets();
    
    // 检查是否是新手关卡（第一关：废弃教堂）
    this.isTutorialStage = stageId === 'abandoned-church';
    if (this.isTutorialStage) {
      // 检查是否已经完成过新手引导
      const tutorialDone = localStorage.getItem('tutorial_completed');
      if (tutorialDone === 'true') {
        this.tutorialCompleted = true;
      }
      console.log('Tutorial stage detected, tutorial completed:', this.tutorialCompleted);
    }
    
    // 检查是否为BOSS关（所有BOSS关都使用节奏大师模式）
    this.isRhythmBossMode = this.bossConfig !== null;
    if (this.isRhythmBossMode) {
      console.log(`节奏大师模式启用！BOSS: ${this.bossConfig?.name}`);
    }
  }
  
  // 已移除orientation检测，只支持横屏模式
  
  private initializePlayer(): Player {
    const width = this.canvas.width || window.innerWidth;
    const height = this.canvas.height || window.innerHeight;
    
    // 保留已加载的精灵动画
    const oldSpriteAnimation = this.player?.spriteAnimation;
    const oldAnimationState = this.player?.animationState || 'idle';
    const oldImage = this.player?.image;
    const oldIdleAnimation = this.player?.idleAnimation || 0;
    const oldAttackAnimation = this.player?.attackAnimation;
    
    // 只支持横屏模式：玩家站在教堂地毯上
    const initialX = 150;
    const initialY = height * 0.75;
    return {
      x: initialX,
      y: initialY,
      targetX: initialX,  // 初始目标位置
      targetY: initialY,
      rotation: 0,  // 初始朝向右
      facingRight: true,  // 初始朝向右
      width: 240, // 4x larger than normal bat (diameter 40), makes hero prominent
      height: 360, // 4x larger than normal bat, makes hero stand out
      idleAnimation: oldIdleAnimation,
      attackAnimation: oldAttackAnimation,
      attackDashX: 0,
      attackDashY: 0,
      attackDashDuration: 0,
      image: oldImage,
      spriteAnimation: oldSpriteAnimation,
      animationState: oldAnimationState,
    };
  }
  
  private playerImage: HTMLImageElement | null = null; // 主角图片（用于左侧显示）
  
  private async loadAssets(): Promise<void> {
    const imageLoadPromises: Promise<void>[] = [];
    // 背景由Game.tsx通过setBackgroundImage设置，不在这里加载
    
    // 加载主角图片（用于左侧显示）
    this.playerImage = new Image();
    this.playerImage.onload = () => console.log('Player image loaded for left display');
    this.playerImage.onerror = () => console.error('Failed to load player image');
    this.playerImage.src = '/images/hero-player.png';
    
    // BOSS关卡中主角使用静态图片，不需要加载动画sprite
    // 只有普通关卡才需要主角动画
    if (!this.isBossStage) {
      // 加载玩家精灵动画
      const idleImg = new Image();
      const walkImg = new Image();
      const attackImg = new Image();
      const hurtImg = new Image();
      
      let loadedCount = 0;
      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === 4) {
          this.initializePlayerAnimation(idleImg, walkImg, attackImg, hurtImg);
        }
      };
      
      idleImg.onload = () => {
        console.log('Player IDLE sprite loaded');
        checkAllLoaded();
      };
      idleImg.onerror = () => console.error('Failed to load IDLE sprite');
      idleImg.src = vampireHeroSprites.idle; // 使用配置文件中的透明图片
      
      walkImg.onload = () => {
        console.log('Player WALK sprite loaded');
        checkAllLoaded();
      };
      walkImg.onerror = () => console.error('Failed to load WALK sprite');
      walkImg.src = vampireHeroSprites.walk; // 使用配置文件中的透明图片
      
      attackImg.onload = () => {
        console.log('Player ATTACK sprite loaded');
        checkAllLoaded();
      };
      attackImg.onerror = () => console.error('Failed to load ATTACK sprite');
      attackImg.src = vampireHeroSprites.attack; // 使用配置文件中的透明图片
      
      hurtImg.onload = () => {
        console.log('Player HURT sprite loaded');
        checkAllLoaded();
      };
      hurtImg.onerror = () => console.error('Failed to load HURT sprite');
      hurtImg.src = vampireHeroSprites.hurt; // 使用配置文件中的透明图片
    } else {
      console.log('BOSS关卡：跳过主角动画加载，使用静态图片');
    }
    
    // 加载敌人精灵
    const enemyTypes: Enemy['type'][] = [
      'bat_blue', 'bat_purple', 'bat_red', 'bat_yellow', 'vampire', 'bomb', 'bomb-bat',
      'skeleton', 'ghost', 'werewolf', 'medusa_head', 'crow',
      // 场曷1: 废弃教堂
      'corrupted-believer', 'evil-nun',
      // 场曷2: 钟楼
      'tower-ghost', 'vampire-bat',
      // 场曷3: 地下墓穴
      'crawling-skeleton', 'crypt-zombie',
      // 场曷4: 迷雾墓地
      'corpse', 'graveyard-wraith',
      // 场曷5: 古老陵墓
      'mummy', 'skeleton-warrior',
      // 场曷6: 诅咒森林
      'cursed-wolf', 'tree-demon',
      // 场曷7: 城堡大厅
      'armor-ghost', 'vampire-guard',
      // 场曷8: 禁忌图书馆
      'flying-book', 'ink-demon',
      // 场曷9: 魅魔刑讯室
      'charm-rose', 'whip-demon',
      // 场景10: 王座厅
      'elite-vampire', 'blood-knight'
    ];
    const enemyImagePaths: Partial<Record<Enemy['type'], string>> = {
      bat_blue: '/images/enemies/bat-blue-side.png',
      bat_purple: '/images/enemies/bat-purple-side.png',
      bat_red: '/images/enemies/bat-red-side.png',
      bat_yellow: '/images/enemies/bat-yellow-side.png',
      vampire: '/images/enemies/vampire-boss-side.png',
      bomb: '/images/enemies/bomb-bat-side.png',
      'bomb-bat': '/images/enemy-bomb-bat.png',
      skeleton: '/images/enemy-skeleton-idle.png',
      ghost: '/images/enemy-ghost-idle.png',
      werewolf: '/images/enemy-werewolf.png',
      medusa_head: '/images/enemy-medusa-head.png',
      crow: '/images/enemy-crow.png',
      // 场曷1: 废弃教堂
      'corrupted-believer': '/images/enemy-01-corrupted-believer.png',
      'evil-nun': '/images/enemy-01-evil-nun.png',
      // 场曷2: 钟楼
      'tower-ghost': '/images/enemy-02-tower-ghost.png',
      'vampire-bat': '/images/enemy-02-vampire-bat.png',
      // 场曷3: 地下墓穴
      'crawling-skeleton': '/images/enemy-03-crawling-skeleton.png',
      'crypt-zombie': '/images/enemy-03-crypt-zombie.png',
      // 场曷4: 迷雾墓地
      'corpse': '/images/enemy-04-corpse.png',
      'graveyard-wraith': '/images/enemy-04-graveyard-wraith.png',
      // 场曷5: 古老陵墓
      'mummy': '/images/enemy-05-mummy.png',
      'skeleton-warrior': '/images/enemy-05-skeleton-warrior.png',
      // 场曷6: 诅咒森林
      'cursed-wolf': '/images/enemy-06-cursed-wolf.png',
      'tree-demon': '/images/enemy-06-tree-demon.png',
      // 场曷7: 城堡大厅
      'armor-ghost': '/images/enemy-07-armor-ghost.png',
      'vampire-guard': '/images/enemy-07-vampire-guard.png',
      // 场曷8: 禁忌图书馆
      'flying-book': '/images/enemy-08-flying-book.png',
      'ink-demon': '/images/enemy-08-ink-demon.png',
      // 场曷9: 魅魔刑讯室
      'charm-rose': '/images/enemy-09-charm-rose.png',
      'whip-demon': '/images/enemy-09-whip-demon.png',
      // 场景10: 王座厅
      'elite-vampire': '/images/enemy-10-elite-vampire.png',
      'blood-knight': '/images/enemy-10-blood-knight.png',
    };
    
    for (const type of enemyTypes) {
      const imgPath = enemyImagePaths[type];
      if (!imgPath) continue; // 跳过没有图片路径的怪物（使用序列帧动画）
      const img = new Image();
      img.src = imgPath;
      img.onload = () => {
        this.enemyImages.set(type, img);
        console.log(`Enemy sprite loaded: ${type}`);
      };
    }
    
    // 加载BOSS静态图（使用像素风格战斗图）
    if (this.bossConfig) {
      const bossType = this.bossConfig.type;
      const bossConfig = BOSS_TYPES[bossType];
      if (bossConfig) {
        // 使用Promise等待BOSS图片加载完成
        await new Promise<void>((resolve, reject) => {
          const bossImg = new Image();
          bossImg.src = bossConfig.spriteSheet.idle; // 使用spriteSheet.idle路径
          bossImg.onload = () => {
            this.enemyImages.set(bossType as any, bossImg);
            console.log(`BOSS sprite loaded: ${bossType} from ${bossConfig.spriteSheet.idle}`);
            resolve();
          };
          bossImg.onerror = () => {
            console.error(`Failed to load BOSS sprite: ${bossType}`);
            reject(new Error(`Failed to load BOSS sprite: ${bossType}`));
          };
        });
      }
    }
    
    // 加载骨骼兵动画（idle + attack）
    // BOSS关卡不需要skeleton动画
    if (!this.isBossStage) {
      this.loadSkeletonAnimations();
    }
    
    // 加载新怪物序列帧动画（等待加载完成）
    await this.loadNewEnemyAnimations(); // 启用：加载所有BOSS和小怪的序列帧动画
  }
  
  private loadSkeletonAnimations(): void {
    
    // 加载骨骼兵动画（idle + walk + attack）
    const skeletonConfig = enemySpriteConfigs.skeleton;
    if (skeletonConfig) {
      const skeletonIdleImg = new Image();
      skeletonIdleImg.src = skeletonConfig.idle.path;
      
      const skeletonWalkImg = new Image();
      skeletonWalkImg.src = skeletonConfig.walk!.path;
      
      const skeletonAttackImg = new Image();
      skeletonAttackImg.src = skeletonConfig.attack!.path;
      
      let skeletonLoadedCount = 0;
      const totalToLoad = 3; // idle + walk + attack
      
      const checkSkeletonLoaded = () => {
        skeletonLoadedCount++;
        if (skeletonLoadedCount === totalToLoad) {
          // 转换为AnimationState格式
          const idleState: AnimationState = {
            name: 'idle',
            config: {
              frameWidth: skeletonIdleImg.width / skeletonConfig.idle.cols,
              frameHeight: skeletonIdleImg.height / skeletonConfig.idle.rows,
              frameSequence: Array.from({ length: skeletonConfig.idle.frameCount }, (_, i) => i),
              frameRate: skeletonConfig.idle.fps,
              loop: skeletonConfig.idle.loop,
              columns: skeletonConfig.idle.cols,
            },
          };
          
          const walkState: AnimationState = {
            name: 'walk',
            config: {
              frameWidth: skeletonWalkImg.width / skeletonConfig.walk!.cols,
              frameHeight: skeletonWalkImg.height / skeletonConfig.walk!.rows,
              frameSequence: Array.from({ length: skeletonConfig.walk!.frameCount }, (_, i) => i),
              frameRate: skeletonConfig.walk!.fps,
              loop: skeletonConfig.walk!.loop,
              columns: skeletonConfig.walk!.cols,
            },
          };
          
          const attackState: AnimationState = {
            name: 'attack',
            config: {
              frameWidth: skeletonAttackImg.width / skeletonConfig.attack!.cols,
              frameHeight: skeletonAttackImg.height / skeletonConfig.attack!.rows,
              frameSequence: Array.from({ length: skeletonConfig.attack!.frameCount }, (_, i) => i),
              frameRate: skeletonConfig.attack!.fps,
              loop: skeletonConfig.attack!.loop,
              columns: skeletonConfig.attack!.cols,
            },
          };
          
          const idleAnim = new SpriteAnimation(skeletonIdleImg, idleState);
          const walkAnim = new SpriteAnimation(skeletonWalkImg, walkState);
          const attackAnim = new SpriteAnimation(skeletonAttackImg, attackState);
          
          if (!this.enemyAnimations) {
            this.enemyAnimations = new Map();
          }
          this.enemyAnimations.set('skeleton', {
            idle: idleAnim,
            walk: walkAnim,
            attack: attackAnim,
          });
          
          console.log('Skeleton animations loaded (idle + walk + attack)');
        }
      };
      
      skeletonIdleImg.onload = checkSkeletonLoaded;
      skeletonIdleImg.onerror = () => console.error('Failed to load skeleton idle animation');
      
      skeletonWalkImg.onload = checkSkeletonLoaded;
      skeletonWalkImg.onerror = () => console.error('Failed to load skeleton walk animation');
      
      skeletonAttackImg.onload = checkSkeletonLoaded;
      skeletonAttackImg.onerror = () => console.error('Failed to load skeleton attack animation');
    }
    
    // 加载幽灵动画
    const ghostConfig = enemySpriteConfigs.ghost;
    if (ghostConfig) {
      const ghostIdleImg = new Image();
      ghostIdleImg.src = ghostConfig.idle.path;
      
      ghostIdleImg.onload = () => {
        // 转换为AnimationState格式
        const idleState: AnimationState = {
          name: 'idle',
          config: {
            frameWidth: ghostIdleImg.width / ghostConfig.idle.cols,
            frameHeight: ghostIdleImg.height / ghostConfig.idle.rows,
            frameSequence: Array.from({ length: ghostConfig.idle.frameCount }, (_, i) => i),
            frameRate: ghostConfig.idle.fps,
            loop: ghostConfig.idle.loop,
            columns: ghostConfig.idle.cols,
          },
        };
        
        const idleAnim = new SpriteAnimation(ghostIdleImg, idleState);
        
        if (!this.enemyAnimations) {
          this.enemyAnimations = new Map();
        }
        this.enemyAnimations.set('ghost', {
          idle: idleAnim,
        });
        
        console.log('Ghost animations loaded (idle)');
      };
      ghostIdleImg.onerror = () => console.error('Failed to load ghost idle animation');
    }
  }
  
  private async loadNewEnemyAnimations(): Promise<void> {
    // enemyType到动画文件夹的映射
    const enemyAnimationMap: Record<string, string> = {
      'corrupted-believer': '01-corrupted-believer',
      'evil-nun': '01-evil-nun',
      'tower-ghost': '02-tower-ghost',
      'vampire-bat': '02-vampire-bat',
      'crawling-skeleton': '03-crawling-skeleton',
      'crypt-zombie': '03-crypt-zombie',
      'graveyard-wraith': '04-graveyard-wraith',
      'mummy': '05-mummy',
      'skeleton-warrior': '05-skeleton-warrior',
      'cursed-wolf': '06-cursed-wolf',
      'tree-demon': '06-tree-demon',
      'armor-ghost': '07-armor-ghost',
      'vampire-guard': '07-vampire-guard',
      'flying-book': '08-flying-book',
      'ink-demon': '08-ink-demon',
      'charm-rose': '09-charm-rose',
      'lesser-succubus': '09-lesser-succubus',
      'elite-vampire': '10-elite-vampire',
      'blood-knight': '10-blood-knight',
      'bomb-bat': 'enemy-bomb-bat'  // 直接使用完整文件夹名，不加enemy-前缀
    };
    
    // BOSS动画映射已删除：BOSS现在使用静态图片，不再需要序列帧动画
    
    if (!this.newEnemyAnimations) {
      this.newEnemyAnimations = new Map();
    }
    
    // 加载所有小怪动画，使用enemyType作为key
    for (const [enemyType, animationFolder] of Object.entries(enemyAnimationMap)) {
      try {
        // 如果animationFolder已经包含'enemy-'前缀，则直接使用；否则添加前缀
        const folderName = animationFolder.startsWith('enemy-') ? animationFolder : `enemy-${animationFolder}`;
        const animation = new FrameAnimationAdapter(folderName, '/animations');
        await animation.load();
        this.newEnemyAnimations.set(enemyType, animation);
        console.log(`[GameEngine] Loaded animation for ${enemyType} from ${folderName}`);
      } catch (error) {
        console.error(`[GameEngine] Failed to load animation for ${enemyType}:`, error);
      }
    }
    
    // BOSS不再使用序列帧动画，直接使用静态图片渲染
    
    console.log('[GameEngine] All enemy and BOSS animations loading completed');
  }
  
  private initializePlayerAnimation(idleImg: HTMLImageElement, walkImg: HTMLImageElement, attackImg: HTMLImageElement, hurtImg: HTMLImageElement): void {
    // 使用vampireHeroAnimations配置
    const idleAnimation = new SpriteAnimation(idleImg, vampireHeroAnimations.idle);
    const walkAnimation = new SpriteAnimation(walkImg, vampireHeroAnimations.walk);
    const attackAnimation = new SpriteAnimation(attackImg, vampireHeroAnimations.attack);
    const hurtAnimation = new SpriteAnimation(hurtImg, vampireHeroAnimations.hurt);
    
    // 存储到player对象
    this.player.spriteAnimation = {
      idle: idleAnimation,
      walk: walkAnimation,
      attack: attackAnimation,
      hurt: hurtAnimation,
      current: idleAnimation // 默认使用待机动画
    };
    this.player.animationState = 'idle';
    
    console.log('Player sprite animations initialized (IDLE/WALK/ATTACK/HURT)');
  }

  private resizeCanvas(): void {
    // 使用16:9比例，适配大多数屏幕
    const aspectRatio = 16 / 9;
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight - 100; // 减去顶部状态栏高度
    
    if (maxWidth / maxHeight > aspectRatio) {
      // 窗口更宽，以高度为准
      this.canvas.height = maxHeight;
      this.canvas.width = maxHeight * aspectRatio;
    } else {
      // 窗口更高，以宽度为准
      this.canvas.width = maxWidth;
      this.canvas.height = maxWidth / aspectRatio;
    }
    
    console.log(`Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
  }

  public setCallbacks(callbacks: {
    onScoreChange?: (score: number) => void;
    onComboChange?: (combo: number) => void;
    onLivesChange?: (lives: number) => void;
    onGameOver?: () => void;
    onExpChange?: (stats: PlayerStats) => void;
    onLevelUp?: (level: number, message: string) => void;
  }): void {
    this.onScoreChange = callbacks.onScoreChange;
    this.onComboChange = callbacks.onComboChange;
    this.onLivesChange = callbacks.onLivesChange;
    this.onGameOver = callbacks.onGameOver;
    this.onExpChange = callbacks.onExpChange;
    this.onLevelUp = callbacks.onLevelUp;
  }
  
  public setSoundEffects(soundEffects: any): void {
    this.soundEffects = soundEffects;
  }
  
  public setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }
  
  public setBackgroundImage(imagePath: string): void {
    const bgImg = new Image();
    bgImg.src = imagePath;
    bgImg.onload = () => {
      this.backgroundImage = bgImg;
      console.log('Background loaded:', imagePath);
    };
    bgImg.onerror = () => {
      console.error('Failed to load background:', imagePath);
    };
  }
  
  public setChartData(chartData: ChartData): void {
    this.chartData = chartData;
    // 复制音符列表
    this.upcomingNotes = chartData.notes.map(note => ({
      time: note.time,
      type: note.type as Enemy['type']
    }));
    console.log(`Loaded ${this.upcomingNotes.length} notes from chart`);
  }

  public start(): void {
    console.log('GameEngine.start() called');
    this.isPaused = false;
    this.isGameOver = false;
    this.isGameStarted = true;  // 设置游戏已开始标志
    this.score = 0;
    this.combo = 0;
    this.lives = this.maxLives;
    this.enemies = [];
    this.bossSpawned = false; // 重置bossSpawned标志，让update()重新生成BOSS
    this.swipeTrail = [];
    this.lastSpawnTime = Date.now();
    
    // 重置音符列表
    if (this.chartData) {
      this.upcomingNotes = this.chartData.notes.map(note => ({
        time: note.time,
        type: note.type as Enemy['type']
      }));
      console.log(`Reset ${this.upcomingNotes.length} notes`);
    }
    
    // 停止并重置音频，确保从头开始播放
    if (this.audioManager) {
      this.audioManager.stop();  // 先停止，重置时间
      this.audioManager.play();   // 再播放，从头开始
      console.log('Audio restarted from beginning');
      
      // 如果是节奏大师模式，启动音乐同步
      if (this.isRhythmBossMode && this.rhythmBossSystem) {
        this.rhythmBossSystem.startMusicSync();
        console.log('音乐同步已启动！');
      }
    }
    
    this.onScoreChange?.(this.score);
    this.onComboChange?.(this.combo);
    this.onLivesChange?.(this.lives);
    
    // 初始化节奏大师系统（仅第6关）
    if (this.isRhythmBossMode) {
      // 先清理旧实例
      if (this.rhythmBossSystem) {
        this.rhythmBossSystem = null;
      }
      
      this.rhythmBossSystem = new RhythmBossSystem({
        canvas: this.canvas,
        bossY: 150, // BOSS位置
        judgeLineY: this.canvas.height - 100, // 判定线位置
        noteSpeed: 1.0, // Note下落速度（0-1的进度每秒）- 1秒从BOSS到判定线
        perfectWindow: 150, // Perfect判定窗口（毫秒）- 测试模式放宽3倍
        niceWindow: 300, // Nice判定窗口（毫秒）- 测试模式放宽3倍
        goodWindow: 450, // Good判定窗口（毫秒）- 测试模式放宽3倍
        chartPath: '/charts/blood-moon-rises.json', // 谱面文件路径
        bossType: this.bossConfig?.type || 'bat-king', // BOSS类型（用于加载动画）
        // UI配置
        playerName: 'ALUCARD',
        playerHealth: this.lives,
        playerMaxHealth: this.maxLives,
        bossName: this.bossConfig?.name || 'BOSS',
        bossHealth: this.bossConfig?.health || 1000,
        bossMaxHealth: this.bossConfig?.health || 1000, // 使用health作为最大血量
        score: this.score,
        songDuration: 180, // 3分钟
        currentTime: 0,
      });
      
      // 设置回调
      this.rhythmBossSystem.onNoteHit = (lane, judgement) => {
        // 击中Note，对BOSS造成伤害
        let damage = 0;
        let points = 0;
        
        switch (judgement) {
          case 'perfect':
            damage = 100;
            points = 100;
            break;
          case 'nice':
            damage = 75;
            points = 75;
            break;
          case 'good':
            damage = 50;
            points = 50;
            break;
          default:
            damage = 0;
            points = 0;
        }
        
        this.damageBossDirectly(damage);
        this.score += points;
        this.onScoreChange?.(this.score);
      };
      
      this.rhythmBossSystem.onNoteMiss = (lane) => {
        // Miss，玩家扣血
        this.loseLife();
      };
      
      this.rhythmBossSystem.onComboChange = (combo) => {
        this.combo = combo;
        this.onComboChange?.(this.combo);
      };
      
      // 等待动画和谱面加载完成后再启动音乐同步
      Promise.all([
        this.rhythmBossSystem.loadChart('/charts/blood-moon-rises.json'),
        // 等待动画加载完成
        this.rhythmBossSystem.loadAnimations()
      ]).then(() => {
        console.log('[GameEngine] 谱面和动画加载完成，启动音乐同步！');
        if (this.rhythmBossSystem) {
          this.rhythmBossSystem.startMusicSync();
        }
      }).catch(error => {
        console.error('[GameEngine] 资源加载失败:', error);
      });
      
      console.log('[GameEngine] 节奏大师系统初始化完成！');
    }
  }

  public pause(): void {
    this.isPaused = true;
    if (this.audioManager) {
      this.audioManager.pause();
    }
  }

  public resume(): void {
    this.isPaused = false;
    if (this.audioManager) {
      this.audioManager.play();
    }
  }

  public update(): void {
    if (this.isGameOver || this.isPaused) return;
    
    // 只在游戏开始后才运行敌人生成逻辑
    if (!this.isGameStarted) return;
    
    // 节奏大师模式：更新节奏系统
    if (this.isRhythmBossMode && this.rhythmBossSystem) {
      // 生成BOSS（只生成一次）
      if (this.bossConfig && !this.bossSpawned) {
        const success = this.spawnBoss();
        if (success) {
          this.bossSpawned = true;
          console.log(`[节奏大师] BOSS生成成功: ${this.bossConfig.name}`);
        } else {
          console.warn(`[节奏大师] BOSS生成失败，下一帧重试`);
        }
      }
      
      const deltaTime = 1 / 60; // 假设60FPS
      this.rhythmBossSystem.update(deltaTime);
      
      // 更新UI状态
      this.rhythmBossSystem.updateUIState({
        playerHealth: this.lives,
        bossHealth: this.bossConfig?.health || 1000,
        score: this.score,
        currentTime: this.audioManager?.getCurrentTime() || 0,
      });
      
      // 简单AI已禁用，使用谱面系统自动生成Note
      // const now = Date.now();
      // if (now - this.lastNoteSpawnTime > 1500) {
      //   const randomLane = Math.floor(Math.random() * 4);
      //   this.rhythmBossSystem.spawnNote(randomLane);
      //   this.lastNoteSpawnTime = now;
      // }
      
      // 更新BOSS位置和动画
      // 更新小怪的frameAnimation，BOSS使用静态图不需要更新
      this.enemies.forEach(enemy => {
        if (!enemy.isBoss && enemy.frameAnimation) {
          enemy.frameAnimation.update(deltaTime);
        }
      });
      
      return; // 节奏大师模式不需要下面的普通逻辑
    }
    
    // 检查是否需要生成BOSS（游戏开始时立即生成，不依赖谱面）
    if (this.bossConfig && !this.bossSpawned) {
      const success = this.spawnBoss();
      if (success) {
        this.bossSpawned = true;
        console.log(`BOSS spawned at game start: ${this.bossConfig.name}`);
      } else {
        console.warn(`BOSS spawn failed, will retry next frame`);
      }
    }
    
    const now = Date.now();
    
    // BOSS关不再通过谱面自动生成敌人（爆炸蝙蝠改为BOSS召唤技能）
    // 只有非BOSS关才使用谱面生成敌人
    if (!this.bossConfig && this.audioManager && this.chartData && this.upcomingNotes.length > 0) {
      const currentTime = this.audioManager.getCurrentTime();
      const spawnLeadTime = 1.5;
      const initialDelay = 1.0;
      
      // 只在音乐实际播放且超过初始延迟后才生成敌人
      if (currentTime >= initialDelay) {
        // 检查是否有需要生成的音符，限制每帧最多生成数量
        let spawnedCount = 0;
        const maxSpawnPerFrame = 3;
        const maxTimeSpan = 0.2;
        let firstNoteTime: number | null = null;
        
        while (this.upcomingNotes.length > 0 && 
               this.upcomingNotes[0].time - currentTime <= spawnLeadTime &&
               spawnedCount < maxSpawnPerFrame) {
          const note = this.upcomingNotes[0];
          
          if (firstNoteTime === null) {
            firstNoteTime = note.time;
          }
          
          if (note.time - firstNoteTime > maxTimeSpan) {
            break;
          }
          
          this.upcomingNotes.shift();
          this.spawnEnemy();
          spawnedCount++;
        }
      }
    } else {
      // 无谱面模式：随机生成
      const adjustedInterval = this.spawnInterval / this.densityMultiplier; // 应用难度密集度倍率
      if (now - this.lastSpawnTime > adjustedInterval) {
        this.spawnEnemy();
        this.lastSpawnTime = now;
      }
    }

    // 更新敌人位置和动画（只支持横屏）
    this.enemies.forEach(enemy => {
      // 如果是护卫炸弹，环绕BOSS飞行
      if (enemy.isGuardBomb && enemy.guardBossId !== undefined) {
        const boss = this.enemies.find(e => e.id === enemy.guardBossId);
        if (boss) {
          // 更新环绕角度
          enemy.guardAngle = (enemy.guardAngle || 0) + 0.02; // 每帧旋转0.02弧度（降低速度）
          
          // 计算新位置（相对于BOSS）
          const radius = enemy.guardRadius || 100;
          enemy.x = boss.x + Math.cos(enemy.guardAngle) * radius;
          enemy.y = boss.y + Math.sin(enemy.guardAngle) * radius;
        } else {
          // BOSS已死，护卫炸弹正常移动
          enemy.x -= enemy.speed;
        }
      } else {
        // BOSS特殊移动逻辑：到达画面中央后停止
        if (enemy.isBoss) {
          const targetX = this.canvas.width * 0.6; // 目标位置：画面中央偏右
          if (enemy.x > targetX) {
            enemy.x -= enemy.speed; // 继续移动直到到达目标位置
          }
          // 到达目标位置后停止移动
        } else {
          // 横屏：根据移动模式移动敌人
          const pattern = enemy.movementPattern || 'linear';
          
          switch (pattern) {
            case 'linear':
              // 直线移动（默认）
              enemy.x -= enemy.speed;
              break;
            
          case 'wave':
            // 波浪移动（鬼魂）
            enemy.x -= enemy.speed;
            if (enemy.initialY === undefined) enemy.initialY = enemy.y;
            enemy.y = enemy.initialY + Math.sin(enemy.animationOffset) * 30;
            break;
            
          case 'sine':
            // 正弦波移动（美杜莎头）
            enemy.x -= enemy.speed;
            if (enemy.initialY === undefined) enemy.initialY = enemy.y;
            enemy.y = enemy.initialY + Math.sin(enemy.animationOffset * 2) * 50;
            break;
            
          case 'dash':
            // 冲刺移动（狼人）
            if (enemy.isDashing) {
              enemy.x -= enemy.speed * 3; // 冲刺时3倍速度
              enemy.dashCooldown = (enemy.dashCooldown || 0) - 1;
              if (enemy.dashCooldown <= 0) {
                enemy.isDashing = false;
                enemy.dashCooldown = 60; // 60帧冷却
              }
            } else {
              enemy.x -= enemy.speed * 0.5; // 正常速度的一半
              enemy.dashCooldown = (enemy.dashCooldown || 60) - 1;
              if (enemy.dashCooldown <= 0) {
                enemy.isDashing = true;
                enemy.dashCooldown = 20; // 冲刺20帧
              }
            }
            break;
            
          case 'dive':
            // 俯冲移动（乌鸦）
            enemy.x -= enemy.speed;
            if (enemy.initialY === undefined) enemy.initialY = enemy.y;
            // 先上升再下降
            const progress = (this.canvas.width - enemy.x) / this.canvas.width;
            if (progress < 0.3) {
              enemy.y = enemy.initialY - progress * 200; // 上升
            } else {
              enemy.y = enemy.initialY + (progress - 0.3) * 300; // 俯冲
            }
            break;
          }
        }
      }
      
      // BOSS召唤技能
      // BOSS召唤系统：死亡后不再召唤
      if (enemy.isBoss && !enemy.isDead && enemy.summonCooldown && enemy.lastSummonTime && enemy.summonCount) {
        const now = Date.now();
        if (now - enemy.lastSummonTime >= enemy.summonCooldown) {
          // 召唤炸弹蝙蝠
          for (let i = 0; i < enemy.summonCount; i++) {
            const angle = Math.random() * Math.PI * 2; // 随机角度
            const distance = 150 + Math.random() * 50; // 随机距离
            const bombX = enemy.x + Math.cos(angle) * distance;
            const bombY = enemy.y + Math.sin(angle) * distance;
            
            // 使用bomb-bat类型生成炸弹蝙蝠
            const bombEnemy: Enemy = {
              id: this.nextEnemyId++,
              type: 'bomb-bat',
              x: bombX,
              y: bombY,
              speed: 2.0 * this.speedMultiplier,
              size: 60,
              color: '#ff6600',
              animationOffset: Math.random() * Math.PI * 2,
              movementPattern: 'linear',
              initialY: bombY,
            };
            
            // 为炸弹蝙蝠分配序列帧动画
            if (this.newEnemyAnimations.has('bomb-bat')) {
              bombEnemy.frameAnimation = this.newEnemyAnimations.get('bomb-bat');
            }
            
            this.enemies.push(bombEnemy);
          }
          
          // 更新上次召唤时间
          enemy.lastSummonTime = now;
          
          // 显示召唤提示
          this.createFloatingText(
            'SUMMON!',
            enemy.x,
            enemy.y - 50,
            '#ff6600',
            30,
            false
          );
        }
      }
      
      // 更新飞行动画
      enemy.animationOffset += 0.1;
      
      // 更新序列帧动画
      if (enemy.frameAnimation) {
        enemy.frameAnimation.update(16.67); // 假蔅60fps
      }
      
      // 更新受击动画
      if (enemy.hitAnimation !== undefined && enemy.hitAnimation > 0) {
        enemy.hitAnimation--;
      }
      
      // 幽灵动画更新
      if (enemy.type === 'ghost' && enemy.spriteAnimation && enemy.animationState === 'idle') {
        const idleAnim = enemy.spriteAnimation.idle;
        if (idleAnim) {
          idleAnim.update(1/60);
        }
      }
      
      // 骨骼兵攻击 AI
      if (enemy.type === 'skeleton' && enemy.spriteAnimation) {
        const distanceToPlayer = Math.sqrt(
          (enemy.x - this.player.x) ** 2 + 
          (enemy.y - this.player.y) ** 2
        );
        
        const attackRange = 100; // 攻击范围（减少到100像素防止围殴）
        
        // 如果正在攻击
        if (enemy.isAttacking) {
          // 更新攻击动画
          const attackAnim = enemy.spriteAnimation.attack;
          if (attackAnim) {
            attackAnim.update(1/60);
            
            // 在攻击命中帧判定伤害
            const currentFrame = attackAnim.currentFrame;
            if (currentFrame === enemy.attackHitFrame && !enemy.hasDealtDamage) {
              // 检查是否在攻击范围内
              if (distanceToPlayer < attackRange) {
                this.loseLife();
                enemy.hasDealtDamage = true; // 标记已造成伤害
              }
            }
            
            // 攻击动画播放完毕，回到walk状态
            if (attackAnim.isAnimationFinished()) {
              enemy.animationState = 'walk';
              enemy.isAttacking = false;
              enemy.hasDealtDamage = false;
              enemy.attackCooldown = 180; // 重置冷却（3秒，降低攻击频率）
              attackAnim.reset(); // 重置攻击动画
            }
          }
        } else {
          // 更新walk动画（如果有）或idle动画
          if (enemy.animationState === 'walk' && enemy.spriteAnimation.walk) {
            enemy.spriteAnimation.walk.update(1/60);
          } else {
            const idleAnim = enemy.spriteAnimation.idle;
            if (idleAnim) {
              idleAnim.update(1/60);
            }
          }
          
          // 检查是否进入攻击范围
          if (distanceToPlayer < attackRange && enemy.attackCooldown !== undefined) {
            if (enemy.attackCooldown > 0) {
              enemy.attackCooldown--;
            } else {
              // 触发攻击
              enemy.animationState = 'attack';
              enemy.isAttacking = true;
              enemy.hasDealtDamage = false;
            }
          }
        }
      }
    });
    
    // 平滑移动玩家到目标位置
    if (this.player.targetX !== undefined && this.player.targetY !== undefined) {
      const speed = 0.08; // 降低插值系数，让移动更平滑
      this.player.x += (this.player.targetX - this.player.x) * speed;
      this.player.y += (this.player.targetY - this.player.y) * speed;
      
      // 攻击冲刺效果
      if (this.player.attackDashDuration && this.player.attackDashDuration > 0) {
        const dashProgress = this.player.attackDashDuration / 8; // 0.0 -> 1.0
        this.player.x += (this.player.attackDashX || 0) * dashProgress * 0.3;
        this.player.y += (this.player.attackDashY || 0) * dashProgress * 0.3;
        this.player.attackDashDuration--;
      }
      
      // 边界限制，确保角色不会移出画布
      // 注意：主角height=360，所以上下各留180像素。但为了让主角能移动到画面底部，我们放宽下边界限制
      const minY = this.player.height / 2; // 上边界：180
      const maxY = this.canvas.height - 50; // 下边界：720-50=670，留50像素避免完全移出画面
      this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
      this.player.y = Math.max(minY, Math.min(maxY, this.player.y));
    }
    
    // 更新玩家待机动画（旧系统）
    this.player.idleAnimation += 0.05;
    if (this.player.attackAnimation !== undefined && this.player.attackAnimation > 0) {
      this.player.attackAnimation--;
    }
    
    // 更新sprite动画（新系统）
    if (this.player.spriteAnimation) {
      const dt = 1 / 60; // 假设60FPS，每帧约16.67ms
      
      // 更新当前动画状态的动画
      const currentState = this.player.animationState || 'idle';
      const currentAnim = this.player.spriteAnimation[currentState];
      if (currentAnim) {
        currentAnim.update(dt);
        
        // 如果攻击或受伤动画播放完毕，切换回待机动画
        if ((currentState === 'attack' || currentState === 'hurt') && currentAnim.isAnimationFinished()) {
          this.player.animationState = 'idle';
          // 重置动画
          currentAnim.reset();
        }
      }
    }
    
    // 更新心形道具
    this.updateHeartPickups();
    
    // 更新粒子
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // 重力
      particle.life--;
      return particle.life > 0;
    });
    
    // 更新浮动文字
    this.floatingTexts = this.floatingTexts.filter(text => {
      text.y += text.vy; // 向上移动
      text.life -= 0.02; // 每帧减少2%生命值，大约50帧（1秒）消失
      
      // 连击文字的缩放动画：0.5 -> 1.5 -> 1.0
      if (text.isCombo && text.scale !== undefined) {
        const progress = 1 - text.life; // 0.0 -> 1.0
        if (progress < 0.3) {
          // 前30%时间：从0.5放大到1.5
          text.scale = 0.5 + (progress / 0.3) * 1.0; // 0.5 -> 1.5
        } else if (progress < 0.5) {
          // 30%-50%时间：从1.5缩小到1.0
          text.scale = 1.5 - ((progress - 0.3) / 0.2) * 0.5; // 1.5 -> 1.0
        } else {
          // 50%之后：保持1.0
          text.scale = 1.0;
        }
      }
      
      return text.life > 0;
    });
    
    // 更新屏幕震动
    if (this.screenShake.duration > 0) {
      this.screenShake.duration--;
      this.screenShake.x = (Math.random() - 0.5) * 10;
      this.screenShake.y = (Math.random() - 0.5) * 10;
    } else {
      this.screenShake.x = 0;
      this.screenShake.y = 0;
    }

    // 移除超出屏幕的敌人（未被击中）
    const initialEnemyCount = this.enemies.length;
    this.enemies = this.enemies.filter(enemy => {
      // 检测炸弹蝙蝠是否碰到玩家
      if ((enemy.type === 'bomb' || enemy.type === 'bomb-bat') && this.isGameStarted) {
        const distanceToPlayer = Math.sqrt(
          (enemy.x - this.player.x) ** 2 + 
          (enemy.y - this.player.y) ** 2
        );
        const collisionDistance = enemy.size / 2 + 30; // 玩家半径约30
        
        if (distanceToPlayer < collisionDistance) {
          // 炸弹碰到玩家，扠1滴血
          this.loseLife();
          this.combo = 0;
          this.onComboChange?.(this.combo);
          // 炸弹爆炸特效
          this.createParticles(enemy.x, enemy.y, '#ff0000', 20);
          this.triggerScreenShake(15);
          console.log(`Bomb hit player! Lives: ${this.lives}`);
          return false; // 移除炸弹
        }
      }
      
      // 只支持横屏：敌人从x负值处离开屏幕
      const isOutOfBounds = enemy.x < -enemy.size;
      
      if (isOutOfBounds) {
        // 敌人逃脱，扣血（炸弹除外）
        if (enemy.type !== 'bomb' && enemy.type !== 'bomb-bat' && this.isGameStarted) {
          // 给玩家15秒的grace period，让他们有足够时间熟悉游戏
          const currentTime = this.audioManager?.getCurrentTime() || 0;
          const now = Date.now();
          
          // 只在grace period结束后且距离上次扣血至少500ms才扣血
          if (currentTime > 15.0 && now - this.lastLoseLifeTime > 500) {
            this.loseLife();
            this.lastLoseLifeTime = now;
            console.log(`Enemy escaped! Lives: ${this.lives}`);
          } else if (currentTime <= 15.0) {
            console.log(`Enemy escaped during grace period (${currentTime.toFixed(1)}s/15.0s)`);
          }
        }
        return false;
      }
      return true;
    });

    // 清理过期的轨迹点
    const trailCutoffTime = now - 500;
    this.swipeTrail = this.swipeTrail.filter(point => point.time > trailCutoffTime);
  }

  private spawnEnemy(type?: Enemy['type']): void {
    // 检查是否超过怪物总数限制
    if (this.totalEnemiesSpawned >= this.maxEnemiesPerStage) {
      console.log(`Reached max enemies limit: ${this.maxEnemiesPerStage}`);
      return; // 达到上限，不再生成怪物
    }
    
    // 如果没有指定类型，从当前地图允许的怪物类型中随机选择
    if (!type) {
      if (this.allowedEnemyTypes.length > 0) {
        // 从允许的类型中随机选择
        const randomIndex = Math.floor(Math.random() * this.allowedEnemyTypes.length);
        type = this.allowedEnemyTypes[randomIndex] as Enemy['type'];
      } else {
        // 如果没有配置，使用默认类型
        const types: Enemy['type'][] = ['bat_blue', 'bat_purple', 'skeleton'];
        const randomIndex = Math.floor(Math.random() * types.length);
        type = types[randomIndex];
      }
    }
    
    const enemyType = type!;
    
    // 从 ENEMY_CONFIGS 读取配置，如果没有则使用默认值
    const enemyConfig = ENEMY_CONFIGS[enemyType];
    const size = enemyConfig?.size || 40;
    const speed = enemyConfig?.speed || 2;
    const color = enemyConfig?.color || '#ff0000';
    
    // 只支持横屏：从右侧随机位置生成
    const x = this.canvas.width + size;
    // 限制敌人生成范围：避免在最上方和最下方生成（留出150像素的边距）
    const topMargin = 150;
    const bottomMargin = 150;
    const minY = topMargin + size;
    const maxY = this.canvas.height - bottomMargin - size;
    const y = Math.random() * (maxY - minY) + minY;
    
    // 根据敌人类型分配移动模式
    let movementPattern: Enemy['movementPattern'] = 'linear';
    switch (enemyType) {
      case 'skeleton':
        movementPattern = 'linear'; // 直线移动
        break;
      case 'ghost':
        movementPattern = 'wave'; // 波浪移动
        break;
      case 'werewolf':
        movementPattern = 'dash'; // 冲刺移动
        break;
      case 'medusa_head':
        movementPattern = 'sine'; // 正弦波移动
        break;
      case 'crow':
        movementPattern = 'dive'; // 俯冲移动
        break;
    }
    
    const enemy: Enemy = {
      id: this.nextEnemyId++,
      type: enemyType,
      x,
      y,
      speed: speed * this.speedMultiplier, // 应用难度速度倍率
      size,
      color,
      image: this.enemyImages.get(enemyType),
      animationOffset: Math.random() * Math.PI * 2, // 随机初始动画偏移，让敌人动画不同步
      movementPattern,
      initialY: y,
      dashCooldown: enemyType === 'werewolf' ? 60 : undefined,
      isDashing: false,
    };
    
    // 为骨骼兵分配动画和攻击属性
    if (enemyType === 'skeleton' && this.enemyAnimations.has('skeleton')) {
      enemy.spriteAnimation = this.enemyAnimations.get('skeleton');
      enemy.animationState = 'walk'; // 默认使用走路动画
      enemy.attackCooldown = 180; // 3秒攻击冷却（60fps，降低攻击频率）
      enemy.isAttacking = false;
      enemy.attackHitFrame = 3; // 在第3帧（剑劈下的一帧）判定伤害
      enemy.hasDealtDamage = false;
    }
    
    // 为幽灵分配动画
    if (enemyType === 'ghost' && this.enemyAnimations.has('ghost')) {
      enemy.spriteAnimation = this.enemyAnimations.get('ghost');
      enemy.animationState = 'idle';
    }
    
    // 为新怪物分配序列帧动画（直接匹配）
    // 暂时禁用：使用sprite sheet渲染代替
    // const enemyTypeStr = enemyType as string;
    // if (this.newEnemyAnimations.has(enemyTypeStr)) {
    //   enemy.frameAnimation = this.newEnemyAnimations.get(enemyTypeStr);
    //   console.log(`[spawnEnemy] Assigned frameAnimation for ${enemyTypeStr}`);
    // } else {
    //   console.warn(`[spawnEnemy] No frameAnimation found for ${enemyTypeStr}`);
    // }
    
    // 如果是BOSS，添加血量和护卫炸弹
    if (enemyType === 'vampire') {
      enemy.isBoss = true;
      enemy.health = 10;
      enemy.guardBombs = [];
      
      // 根据难度生成不同数量的护卫炸弹
      const guardRadius = 100; // 环绕半径
      const guardCount = this.difficulty === 'easy' ? 1 : this.difficulty === 'normal' ? 2 : 3;
      
      for (let i = 0; i < guardCount; i++) {
        const guardAngle = (Math.PI * 2 / guardCount) * i; // 均匀分布在圆周上
        const guardX = x + Math.cos(guardAngle) * guardRadius;
        const guardY = y + Math.sin(guardAngle) * guardRadius;
        
        const guardBomb: Enemy = {
          id: this.nextEnemyId++,
          type: 'bomb',
          x: guardX,
          y: guardY,
          speed: enemy.speed, // 与BOSS同速
          size: 45,
          color: '#ff0000',
          image: this.enemyImages.get('bomb'),
          animationOffset: Math.random() * Math.PI * 2,
          isGuardBomb: true,
          guardBossId: enemy.id,
          guardAngle: guardAngle,
          guardRadius: guardRadius,
        };
        
        this.enemies.push(guardBomb);
        enemy.guardBombs.push(guardBomb.id);
      }
    }
    
    this.enemies.push(enemy);
    
    // 增加怪物总数计数器
    this.totalEnemiesSpawned++;
    if (this.totalEnemiesSpawned % 50 === 0) {
      console.log(`Total enemies spawned: ${this.totalEnemiesSpawned}/${this.maxEnemiesPerStage}`);
    }
  }
  
  // 生成BOSS
  private spawnBoss(): boolean {
    if (!this.bossConfig) return false;
    
    const boss = this.bossConfig;
    const bossHeight = getBossSize(boss.sizeType); // getBossSize返回number
    // BOSS生成在右上角,面向左(根据用户偏好)
    const x = this.canvas.width - 200; // 右上角X坐标,留出一些边距
    const y = 150; // 右上角Y坐标,留出一些边距
    
    // 使用BOSS静态图（像素风格战斗图）
    const bossImage = this.enemyImages.get(boss.type as any);
    
    if (!bossImage || !bossImage.complete) {
      console.warn(`[spawnBoss] BOSS image not loaded yet: ${boss.type}`);
      return false; // 图片还没加载完成，下一帧再试
    }
    
    const bossEnemy: Enemy = {
      id: this.nextEnemyId++,
      type: boss.type as any,
      x,
      y,
      speed: boss.speed * this.speedMultiplier,
      size: bossHeight,
      color: boss.color,
      image: bossImage,
      animationOffset: 0,
      isBoss: true,
      health: boss.health,
      movementPattern: 'wave',
      initialY: y,
      guardBombs: [],
      // BOSS使用静态图，不需要frameAnimation
      // frameAnimation: undefined,
      // animationState: 'idle',
      // BOSS召唤技能初始化
      summonCooldown: boss.summonInterval,
      lastSummonTime: Date.now(), // 记录初始时间
      summonCount: boss.summonCount,
    };
    
    this.enemies.push(bossEnemy);
    
    // 不再生成初始护卫炸弹，改为通过召唤技能生成
    
    // 显示BOSS出现提示
    this.createFloatingText(
      `BOSS: ${boss.name}`,
      this.canvas.width / 2,
      this.canvas.height / 3,
      '#ff0000',
      48,
      true
    );
    
    return true; // BOSS生成成功
  }

  public handleSwipe(x: number, y: number): void {
    if (this.isPaused || this.isGameOver) return;

    // 角色跟随鼠标/手指移动
    this.player.targetX = x;
    this.player.targetY = y;
    
    // 计算角色旋转角度（剑锋指向鼠标），但限制在-30°到+30°范围内
    const dx = x - this.player.x;
    const dy = y - this.player.y;
    let targetRotation = Math.atan2(dy, dx);
    
    // 限制旋转角度：-30° 到 +30°（-0.52 到 +0.52 弧度）
    const maxRotation = Math.PI / 6; // 30°
    targetRotation = Math.max(-maxRotation, Math.min(maxRotation, targetRotation));
    this.player.rotation = targetRotation;
    
    // 更新角色朝向（根据鼠标相对位置）
    if (dx > 20) {
      this.player.facingRight = true;
    } else if (dx < -20) {
      this.player.facingRight = false;
    }

    // 计算攻击线起点：从主角上方发出，让攻击从上往下挥动
    // 根据主角朝向计算偏移量
    const attackOriginOffsetX = this.player.facingRight ? 40 : -40; // 身前40像素（较小的水平偏移）
    const attackOriginOffsetY = -80; // 主角上方80像素，让剑从上方挥下
    
    const attackOriginX = this.player.x + attackOriginOffsetX;
    const attackOriginY = this.player.y + attackOriginOffsetY;
    
    // 添加到轨迹：使用主角身前的位置作为起点
    this.swipeTrail.push({ x: attackOriginX, y: attackOriginY, time: Date.now() });
    
    // 限制轨迹长度
    if (this.swipeTrail.length > this.trailMaxLength) {
      this.swipeTrail.shift();
    }

    // 检测与敌人的碰撞：使用攻击线起点坐标
    this.enemies = this.enemies.filter(enemy => {
      const distance = Math.sqrt((attackOriginX - enemy.x) ** 2 + (attackOriginY - enemy.y) ** 2);
      
      if (distance < enemy.size) {
        // 击中敌人
        if (enemy.type === 'bomb') {
          // 击中炸弹，扫血
          this.loseLife();
          this.combo = 0;
          this.onComboChange?.(this.combo);
          // 炸弹爆炸特效
          this.createParticles(enemy.x, enemy.y, '#ff0000', 20);
          this.triggerScreenShake(15);
          return false; // 移除炸弹
        } else if (enemy.isBoss) {
          // 击中BOSS，减少血量
          enemy.health = (enemy.health || 1) - 1;
          enemy.hitAnimation = 10; // 受击动画
          
          // 击中特效
          this.createParticles(enemy.x, enemy.y, enemy.color, 15);
          this.triggerScreenShake(8);
          
          // 触发玩家攻击动画
          this.player.attackAnimation = 10;
          if (this.player.spriteAnimation && this.player.spriteAnimation.attack) {
            this.player.spriteAnimation.attack.reset();
            this.player.animationState = 'attack';
          }
          
          // 攻击冲刺
          const dashDx = enemy.x - this.player.x;
          const dashDy = enemy.y - this.player.y;
          const dashDistance = Math.sqrt(dashDx * dashDx + dashDy * dashDy);
          if (dashDistance > 0) {
            const dashSpeed = 30;
            this.player.attackDashX = (dashDx / dashDistance) * dashSpeed;
            this.player.attackDashY = (dashDy / dashDistance) * dashSpeed;
            this.player.attackDashDuration = 8;
          }
          
          // 如果BOSS血量归零，添加分数并移除
          if (enemy.health <= 0) {
            this.addScore(enemy.type, enemy.x, enemy.y);
            this.createParticles(enemy.x, enemy.y, '#ffd700', 30); // 金色爆炸
            this.triggerScreenShake(20);
            
            // 立即移除BOSS的所有护卫炸弹
            if (enemy.guardBombs && enemy.guardBombs.length > 0) {
              const guardBombIds = new Set(enemy.guardBombs);
              this.enemies = this.enemies.filter(e => !guardBombIds.has(e.id));
              console.log(`Removed ${enemy.guardBombs.length} guard bombs for BOSS ${enemy.id}`);
            }
            
            return false; // 移除BOSS
          }
          
          return true; // 保留BOSS
        } else {
          // 击中普通敌人，加分
          this.addScore(enemy.type, enemy.x, enemy.y);
          // 击中特效
          this.createParticles(enemy.x, enemy.y, enemy.color, 10);
          this.triggerScreenShake(5);
          // 触发玩家攻击动画和冲刺
          this.player.attackAnimation = 10;
          
          // 触发sprite攻击动画（新系统）
          if (this.player.spriteAnimation && this.player.spriteAnimation.attack) {
            this.player.spriteAnimation.attack.reset(); // 重置动画到第一帧
            this.player.animationState = 'attack';
          }
          
          // 攻击冲刺：向敌人方向冲刺一小段距离
          const dashDx = enemy.x - this.player.x;
          const dashDy = enemy.y - this.player.y;
          const dashDistance = Math.sqrt(dashDx * dashDx + dashDy * dashDy);
          if (dashDistance > 0) {
            const dashSpeed = 30; // 冲刺距离
            this.player.attackDashX = (dashDx / dashDistance) * dashSpeed;
            this.player.attackDashY = (dashDy / dashDistance) * dashSpeed;
            this.player.attackDashDuration = 8; // 冲刺持续8帧
          }
          
          return false; // 移除普通敌人
        }
      }
      return true;
    });
  }

  private createParticles(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3, // 向上喷射
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  }
  
  private triggerScreenShake(duration: number): void {
    this.screenShake.duration = Math.max(this.screenShake.duration, duration);
  }

  // 生成心形道具
  private spawnHeartPickup(x: number, y: number): void {
    const heart: HeartPickup = {
      id: this.nextHeartId++,
      x,
      y,
      vx: (Math.random() - 0.5) * 2, // 随机水平速度 -1 ~ 1
      vy: -3, // 向上飞出
      size: 20,
      lifetime: 5000, // 5秒后消失
      createdAt: Date.now(),
    };
    this.heartPickups.push(heart);
  }

  // 更新心形道具位置和拾取检测
  private updateHeartPickups(): void {
    const now = Date.now();
    
    this.heartPickups = this.heartPickups.filter(heart => {
      // 更新位置
      heart.x += heart.vx;
      heart.y += heart.vy;
      heart.vy += 0.2; // 重力加速度
      
      // 检查是否超时
      if (now - heart.createdAt > heart.lifetime) {
        return false;
      }
      
      // 检查是否飞出屏幕
      if (heart.x < -heart.size || heart.x > this.canvas.width + heart.size ||
          heart.y < -heart.size || heart.y > this.canvas.height + heart.size) {
        return false;
      }
      
      // 检测与玩家的碰撞
      const dx = heart.x - this.player.x;
      const dy = heart.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < heart.size + 30) { // 30是玩家的碰撞半径
        // 拾取心形道具
        if (this.lives < this.maxLives) {
          this.lives++;
          this.onLivesChange?.(this.lives);
          this.createFloatingText('+1 HP', heart.x, heart.y, '#FF69B4', 24); // 粉色
          this.createParticles(heart.x, heart.y, '#FF69B4', 15); // 粉色粒子
        }
        return false; // 移除心形道具
      }
      
      return true;
    });
  }

  private createFloatingText(text: string, x: number, y: number, color: string = '#FFD700', fontSize: number = 24, isCombo: boolean = false): void {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 1.0, // 1.0 = 100% 不透明
      maxLife: 1.0,
      fontSize,
      vy: -2, // 向上移动速度（2像素/帧）
      scale: isCombo ? 0.5 : 1.0, // 连击文字从0.5开始放大
      isCombo,
    });
  }

  private addScore(enemyType: Enemy['type'], x?: number, y?: number): void {
    let points = 10;
    
    switch (enemyType) {
      case 'bat_blue':
      case 'bat_purple':
        points = 10;
        break;
      case 'bat_red':
      case 'bat_yellow':
        points = 20;
        break;
      case 'vampire':
        points = 50;
        break;
    }
    
    this.combo++;
    const actualPoints = Math.floor(points * (1 + this.combo * 0.1));
    this.score += actualPoints;
    
    // 新手引导：标记第一次击杀敌人
    if (!this.firstEnemyKilled) {
      this.firstEnemyKilled = true;
    }
    
    // 添加经验值
    const expGained = experienceManager.calculateKillExp(enemyType, this.combo);
    const result = experienceManager.addExp(this.playerStats, expGained);
    this.playerStats = result.newStats;
    
    // 通知UI更新
    this.onExpChange?.(this.playerStats);
    
    // 如果升级，显示升级消息
    if (result.leveledUp && result.newLevel && result.rewards) {
      for (const reward of result.rewards) {
        this.onLevelUp?.(reward.level, reward.unlockMessage);
        if (x !== undefined && y !== undefined) {
          this.createFloatingText(`LEVEL UP! Lv.${reward.level}`, x, y - 60, '#00FF00', 36, true);
        }
      }
    }
    
    // 更新击杀数和最大连击
    this.playerStats = experienceManager.addKill(this.playerStats);
    this.playerStats = experienceManager.updateMaxCombo(this.playerStats, this.combo);
    
    // 创建浮动文字
    if (x !== undefined && y !== undefined) {
      this.createFloatingText(`+${actualPoints}`, x, y, '#FFD700'); // 金色
      
      // 连击里程碑：5x, 10x, 15x, 20x, 25x...
      if (this.combo >= 5 && this.combo % 5 === 0) {
        // 显示COMBO文字（带缩放动画）
        this.createFloatingText(`COMBO x${this.combo}!`, x, y - 40, '#FF4500', 32, true); // 红色，更大字号，isCombo=true
        
        // 金色粒子爆炸（数量和范围根据连击数增加）
        const particleCount = Math.min(30 + this.combo, 100); // 30-100个粒子
        this.createParticles(x, y, '#FFD700', particleCount); // 金色粒子
        
        // 屏幕震动（强度根据连击数增加）
        const shakeIntensity = Math.min(10 + this.combo / 2, 25); // 10-25强度
        this.triggerScreenShake(shakeIntensity);
        
        // 连击时有概率掉落心形道具（20%概率）
        if (Math.random() < 0.2) {
          this.spawnHeartPickup(x, y);
        }
      }
    }
    
    // 播放音效
    this.soundEffects?.playHit();
    if (this.combo >= 5) {
      this.soundEffects?.playCombo(this.combo);
    }
    
    this.onScoreChange?.(Math.floor(this.score));
    this.onComboChange?.(this.combo);
  }

  private loseLife(): void {
    // 无敌帧机制：受伤后1500ms内不会再次受伤（防止多个骷髅兵围殴）
    const now = Date.now();
    if (now - this.lastLoseLifeTime < 1500) {
      return; // 在无敌帧内，忽略伤害
    }
    
    this.lastLoseLifeTime = now;
    this.lives--;
    this.combo = 0;
    this.soundEffects?.playMiss();
    this.onLivesChange?.(this.lives);
    this.onComboChange?.(this.combo);
    
    // 设置无敌状态和视觉反馈
    this.player.isInvincible = true;
    this.player.invincibleEndTime = now + 1500; // 1500ms无敌时间
    
    // 触发受伤动画
    if (this.player.spriteAnimation && this.player.spriteAnimation.hurt) {
      this.player.spriteAnimation.hurt.reset();
      this.player.animationState = 'hurt';
    }
    
    console.log(`Lost life! Remaining lives: ${this.lives}`);
    
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.isGameOver = true;
    this.isPaused = true;
    if (this.audioManager) {
      this.audioManager.pause();
    }
    this.onGameOver?.();
  }

  public render(): void {
    // 节奏大师模式：使用专用渲染
    if (this.isRhythmBossMode) {
      this.renderRhythmBossMode();
      return;
    }
    
    // 应用屏幕震动
    this.ctx.save();
    this.ctx.translate(this.screenShake.x, this.screenShake.y);
    
    // 清空画布
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(-this.screenShake.x, -this.screenShake.y, this.canvas.width, this.canvas.height);
    
    // 绘制背景（只支持横屏）
    if (this.backgroundImage && this.backgroundImage.complete) {
      const scale = Math.max(
        this.canvas.width / this.backgroundImage.width,
        this.canvas.height / this.backgroundImage.height
      );
      const scaledWidth = this.backgroundImage.width * scale;
      const scaledHeight = this.backgroundImage.height * scale;
      const x = (this.canvas.width - scaledWidth) / 2;
      const y = (this.canvas.height - scaledHeight) / 2;
      this.ctx.drawImage(this.backgroundImage, x, y, scaledWidth, scaledHeight);
    }
    
    // 绘制玩家 - 使用精灵动画系统
    if (this.player.spriteAnimation) {
      this.ctx.save();
      
      // 移动到玩家位置
      const flipScale = this.player.facingRight ? 1 : -1;
      this.ctx.translate(this.player.x, this.player.y);
      
      // 应用翻转(水平翻转)
      this.ctx.scale(flipScale, 1);
      
      // 受伤时的视觉反馈：闪烁效果
      const now = Date.now();
      if (this.player.isInvincible && this.player.invincibleEndTime) {
        // 检查无敌状态是否结束
        if (now >= this.player.invincibleEndTime) {
          this.player.isInvincible = false;
          this.player.invincibleEndTime = undefined;
        } else {
          // 无敌期间：闪烁效果（每100ms切换一次）
          const blinkInterval = 100;
          const shouldShow = Math.floor((this.player.invincibleEndTime - now) / blinkInterval) % 2 === 0;
          
          if (shouldShow) {
            // 显示时添加红色滤镜
            this.ctx.globalAlpha = 0.7;
            this.ctx.shadowColor = '#ff0000';
            this.ctx.shadowBlur = 20;
          } else {
            // 隐藏时降低透明度
            this.ctx.globalAlpha = 0.3;
          }
        }
      }
      
      // 根据当前动画状态渲染对应的动画
      const currentAnim = this.player.spriteAnimation[this.player.animationState || 'idle'];
      if (currentAnim) {
        // 精灵图尺寸: 344x1536, 玩家尺寸: 120x180
        // 根据高度缩放: 180 / 1536 = 0.117
        const scale = this.player.height / 1536;
        const scaledWidth = 344 * scale;  // 约 40
        const scaledHeight = 1536 * scale; // = 180
        
        // 居中渲染
        currentAnim.render(
          this.ctx,
          -scaledWidth / 2,
          -scaledHeight / 2,
          scale,
          false // 不需要flipH，因为已经通过ctx.scale处理了翻转
        );
      }
      
      // 恢复透明度
      this.ctx.globalAlpha = 1.0;
      
      this.ctx.restore();
    } else {
      // 备用：绘制简单矩形
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillRect(
        this.player.x - this.player.width / 2,
        this.player.y - this.player.height / 2,
        this.player.width,
        this.player.height
      );
    }

    // 绘制敌人
    this.enemies.forEach(enemy => {
      
      // 飞行动画：上下波动 + 轻微旋转
      const flyOffset = Math.sin(enemy.animationOffset) * 5;
      const flyRotation = Math.sin(enemy.animationOffset * 0.5) * 0.1;
      
      // 受击动画：闪烁和缩放
      let hitAlpha = 1.0;
      let hitScale = 1.0;
      if (enemy.hitAnimation && enemy.hitAnimation > 0) {
        hitAlpha = enemy.hitAnimation % 2 === 0 ? 0.5 : 1.0;
        hitScale = 1.0 + (enemy.hitAnimation / 10) * 0.3;
      }
      
      // 优先检查frameAnimation（新系统，包括BOSS和新怪物）
      if (enemy.frameAnimation) {
        // 如果有frameAnimation（新怪物动画系统）
        // 渲染新怪物的序列帧动画
        this.ctx.save();
        this.ctx.globalAlpha = hitAlpha;
        
        // 根据sizeConfig设置高度
        let targetHeight = 220; // 默认medium尺寸
        const enemyTypeStr = enemy.type as string;
        
        // 如果是BOSS，直接使用enemy.size（已经在spawnBoss中设置为正确的高度）
        if (enemy.isBoss) {
          targetHeight = enemy.size; // enemy.size已经是BOSS的高度
        } else {
          // 普通敌人：根据ENEMY_CONFIGS设置
          const enemyConfig = (ENEMY_CONFIGS as any)[enemyTypeStr];
          if (enemyConfig) {
            const sizeType = enemyConfig.sizeType;
            if (sizeType === 'small') {
              targetHeight = 150;
            } else if (sizeType === 'medium') {
              targetHeight = 220;
            } else if (sizeType === 'large') {
              targetHeight = 280;
            }
          }
        }
        
        // 计算缩放比例（基于目标高度）
        const frameHeight2 = enemy.frameAnimation.getFrameHeight();
        const frameWidth2 = enemy.frameAnimation.getFrameWidth();
        const scale = frameHeight2 > 0 ? targetHeight / frameHeight2 : 1.0;
        const scaledWidth = frameWidth2 * scale;
        const scaledHeight = frameHeight2 * scale;
        
        // 移动到敌人位置
        this.ctx.translate(enemy.x, enemy.y + flyOffset);
        
        // 水平翻转（面向左侧）
        this.ctx.scale(-1 * hitScale, hitScale);
        
        // 渲染动画（x,y是左上角坐标）
        enemy.frameAnimation.render(
          this.ctx,
          -scaledWidth / 2,
          -scaledHeight / 2,
          scale,
          false
        );
        
        this.ctx.restore();
      } else if (enemy.spriteAnimation && enemy.animationState) {
        // 如果有精灵动画（骨骼兵/幽灵），使用帧动画渲某
        this.ctx.save();
        this.ctx.globalAlpha = hitAlpha;
        
        // 根据当前动画状态获取对应的动画
        let currentAnim = null;
        if (enemy.animationState === 'walk' && enemy.spriteAnimation.walk) {
          currentAnim = enemy.spriteAnimation.walk;
        } else if (enemy.animationState === 'idle') {
          currentAnim = enemy.spriteAnimation.idle;
        } else if (enemy.animationState === 'attack' && enemy.spriteAnimation.attack) {
          currentAnim = enemy.spriteAnimation.attack;
        }
        
        if (currentAnim) {
          // 从动画配置中获取实际帧尺寸
          const frameWidth = currentAnim.getFrameWidth();
          const frameHeight = currentAnim.getFrameHeight();
          
          // 根据敌人类型设置不同的尺寸和偏移
          let targetHeight = 360; // 默认高度
          let yOffsetPercent = 0.15; // 默认Y偏移百分比
          
          if (enemy.type === 'skeleton') {
            targetHeight = 150; // 骷髅兵：与幽灵高度接近（150px）
            yOffsetPercent = 0.02; // 向下偏移2%
          } else if (enemy.type === 'ghost') {
            targetHeight = 200; // 幽灵：比主角小
            yOffsetPercent = 0; // 居中对齐
          } else {
            // 新怪物：根据sizeConfig设置高度
            const enemyTypeStr = enemy.type as string;
            const enemyConfig = (ENEMY_CONFIGS as any)[enemyTypeStr];
            if (enemyConfig) {
              const sizeType = enemyConfig.sizeType;
              if (sizeType === 'small') {
                targetHeight = 150;
              } else if (sizeType === 'medium') {
                targetHeight = 220;
              } else if (sizeType === 'large') {
                targetHeight = 280;
              }
            }
          }
          
          const spriteScale = (targetHeight / frameHeight) * hitScale;
          
          // 移动到敌人位置
          this.ctx.translate(enemy.x, enemy.y + flyOffset);
          
          // 水平翻转（面向左侧）
          this.ctx.scale(-1, 1);
          
          const yOffset = (frameHeight * spriteScale) * yOffsetPercent;
          
          currentAnim.render(
            this.ctx,
            -(frameWidth * spriteScale) / 2,
            -(frameHeight * spriteScale) / 2 + yOffset,
            spriteScale,
            false
          );
        }
        
        this.ctx.restore();
      } else if (enemy.image && enemy.image.complete) {
        // 绘制精灵图（普通敌人）
        this.ctx.save();
        this.ctx.globalAlpha = hitAlpha;
        
        // 只支持横屏：敌人朝左
        this.ctx.translate(enemy.x, enemy.y + flyOffset);
        this.ctx.rotate(flyRotation);
        this.ctx.scale(hitScale, hitScale);
        this.ctx.drawImage(
          enemy.image,
          -enemy.size,
          -enemy.size,
          enemy.size * 1.5,
          enemy.size * 1.5
        );
        
        this.ctx.restore();
      } else {
        // 备用：绘制发光圆形
        const gradient = this.ctx.createRadialGradient(enemy.x, enemy.y, 0, enemy.x, enemy.y, enemy.size);
        gradient.addColorStop(0, enemy.color);
        gradient.addColorStop(0.5, enemy.color + '80');
        gradient.addColorStop(1, enemy.color + '00');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // 如果是BOSS，绘制血条
      if (enemy.isBoss && enemy.health !== undefined && enemy.bossType) {
        const barWidth = 100;
        const barHeight = 8;
        const barX = enemy.x - barWidth / 2;
        const barY = enemy.y - enemy.size - 20;
        
        // 背景（灰色）
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 血量（红色渐变到金色）
        const bossMaxHealth = BOSS_TYPES[enemy.bossType as BossType]?.health || 4000;
        const healthPercent = enemy.health / bossMaxHealth;
        const healthBarWidth = barWidth * healthPercent;
        const healthGradient = this.ctx.createLinearGradient(barX, barY, barX + healthBarWidth, barY);
        healthGradient.addColorStop(0, '#ff0000');
        healthGradient.addColorStop(1, '#ffd700');
        this.ctx.fillStyle = healthGradient;
        this.ctx.fillRect(barX, barY, healthBarWidth, barHeight);
        
        // 边框
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // 血量数字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${enemy.health}/${bossMaxHealth}`, enemy.x, barY - 5);
      }
    });

    // 绘制攻击轨迹（根据武器配置）
    if (this.swipeTrail.length > 1) {
      const weaponConfig = newEquipmentManager.getCurrentWeaponConfig();
      this.renderAttackTrail(weaponConfig);
    }
    
    // 绘制心形道具
    this.heartPickups.forEach(heart => {
      const now = Date.now();
      const age = now - heart.createdAt;
      const alpha = Math.min(1, (heart.lifetime - age) / 1000); // 最后1秒渐隐
      
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      
      // 绘制心形（简单的粉色心形）
      this.ctx.fillStyle = '#FF69B4';
      this.ctx.strokeStyle = '#FF1493';
      this.ctx.lineWidth = 2;
      
      // 绘制心形路径
      this.ctx.beginPath();
      const size = heart.size;
      this.ctx.moveTo(heart.x, heart.y + size / 4);
      this.ctx.bezierCurveTo(
        heart.x, heart.y - size / 4,
        heart.x - size / 2, heart.y - size / 2,
        heart.x - size / 2, heart.y
      );
      this.ctx.bezierCurveTo(
        heart.x - size / 2, heart.y + size / 4,
        heart.x, heart.y + size / 2,
        heart.x, heart.y + size
      );
      this.ctx.bezierCurveTo(
        heart.x, heart.y + size / 2,
        heart.x + size / 2, heart.y + size / 4,
        heart.x + size / 2, heart.y
      );
      this.ctx.bezierCurveTo(
        heart.x + size / 2, heart.y - size / 2,
        heart.x, heart.y - size / 4,
        heart.x, heart.y + size / 4
      );
      this.ctx.closePath();
      
      this.ctx.fill();
      this.ctx.stroke();
      
      // 添加发光效果
      this.ctx.shadowColor = '#FF69B4';
      this.ctx.shadowBlur = 15;
      this.ctx.fill();
      
      this.ctx.restore();
    });
    
    // 绘制粒子
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // 绘制浮动文字
    this.floatingTexts.forEach(text => {
      const alpha = text.life;
      const scale = text.scale || 1.0;
      
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      
      // 应用缩放变换
      this.ctx.translate(text.x, text.y);
      this.ctx.scale(scale, scale);
      
      this.ctx.font = `bold ${text.fontSize}px "Press Start 2P", monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // 连击文字添加发光效果
      if (text.isCombo) {
        this.ctx.shadowColor = text.color;
        this.ctx.shadowBlur = 20 * scale; // 发光强度跟随缩放
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
      }
      
      // 绘制描边（黑色）
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 4;
      this.ctx.strokeText(text.text, 0, 0); // 使用(0,0)因为已经translate
      
      // 绘制文字
      this.ctx.fillStyle = text.color;
      this.ctx.fillText(text.text, 0, 0);
      
      this.ctx.restore();
    });
    
    // 恢复屏幕震动
    this.ctx.restore();
    
    // 绘制屏幕顶部BOSS血条UI
    this.renderBossHealthBar();
    
    // 绘制新手引导
    this.renderTutorial();
  }
  
  private renderBossHealthBar(): void {
    // 查找当前BOSS
    const boss = this.enemies.find(e => e.isBoss);
    if (!boss || boss.health === undefined || !boss.bossType) {
      return; // 没有BOSS或BOSS已死亡
    }
    const bossMaxHealth = BOSS_TYPES[boss.bossType as BossType]?.health || 4000;
    
    const canvas = this.canvas;
    const barWidth = canvas.width * 0.6; // 占屏幕宽度60%
    const barHeight = 30;
    const barX = (canvas.width - barWidth) / 2; // 居中
    const barY = 20; // 距离顶部20px
    
    // 绘制半透明黑色背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(barX - 10, barY - 10, barWidth + 20, barHeight + 40);
    
    // BOSS名称
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = 'bold 20px "Creepster", cursive';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 5;
    this.ctx.fillText('🧛 VAMPIRE LORD', canvas.width / 2, barY - 15);
    this.ctx.shadowBlur = 0;
    
    // 血条背景（深灰色）
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 血量条（红色渐变到金色）
    const healthPercent = boss.health / bossMaxHealth;
    const healthBarWidth = barWidth * healthPercent;
    
    if (healthBarWidth > 0) {
      const healthGradient = this.ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
      healthGradient.addColorStop(0, '#8b0000'); // 深红色
      healthGradient.addColorStop(0.5, '#ff0000'); // 红色
      healthGradient.addColorStop(1, '#ff4500'); // 橙红色
      this.ctx.fillStyle = healthGradient;
      this.ctx.fillRect(barX, barY, healthBarWidth, barHeight);
      
      // 血条发光效果
      this.ctx.shadowColor = '#ff0000';
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(barX, barY, healthBarWidth, barHeight);
      this.ctx.shadowBlur = 0;
    }
    
    // 边框（金色）
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // 血量数字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 18px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 3;
    this.ctx.fillText(`${boss.health} / ${bossMaxHealth}`, canvas.width / 2, barY + barHeight / 2 + 6);
    this.ctx.shadowBlur = 0;
  }

  public getScore(): number {
    return Math.floor(this.score);
  }

  public getCombo(): number {
    return this.combo;
  }

  public getLives(): number {
    return this.lives;
  }

  public getIsGameOver(): boolean {
    return this.isGameOver;
  }
  
  // getOrientation已移除，只支持横屏模式
  
  // 渲染政击轨迹（根据武器配置）
  private renderAttackTrail(weaponConfig: WeaponConfig): void {
    const trailType = weaponConfig.trailType;
    const lineWidth = weaponConfig.lineWidth;
    const color = weaponConfig.color;
    
    // 创建渐变色（从透明到实色）
    const gradient = this.ctx.createLinearGradient(
      this.swipeTrail[0].x,
      this.swipeTrail[0].y,
      this.swipeTrail[this.swipeTrail.length - 1].x,
      this.swipeTrail[this.swipeTrail.length - 1].y
    );
    
    // 将颜色转换为透明版本
    const colorWithAlpha = color + '00'; // 透明
    const colorSolid = color + 'ff'; // 不透明
    gradient.addColorStop(0, colorWithAlpha);
    gradient.addColorStop(1, colorSolid);
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 10;
    
    // 根据不同的轨迹类型绘制
    switch (trailType) {
      case 'single_line':
        this.renderSingleLine();
        break;
      case 'dual_line':
        this.renderDualLine(weaponConfig.dualLineSpacing || 50);
        break;
      case 'thick_line':
      case 'ultra_thick':
        this.renderSingleLine(); // 粗线和超粗线使用相同的绘制逻辑，只是线宽不同
        break;
      case 'wave_line':
        this.renderWaveLine();
        break;
      case 'arc_line':
        this.renderArcLine();
        break;
      default:
        this.renderSingleLine();
    }
    
    this.ctx.shadowBlur = 0;
  }
  
  // 绘制单线攻击
  private renderSingleLine(): void {
    this.ctx.beginPath();
    this.ctx.moveTo(this.swipeTrail[0].x, this.swipeTrail[0].y);
    for (let i = 1; i < this.swipeTrail.length; i++) {
      this.ctx.lineTo(this.swipeTrail[i].x, this.swipeTrail[i].y);
    }
    this.ctx.stroke();
  }
  
  // 绘制双线攻击（双剑）
  private renderDualLine(spacing: number): void {
    // 计算垂直于轨迹的偏移方向
    for (let lineOffset = 0; lineOffset < 2; lineOffset++) {
      const offset = (lineOffset === 0 ? -spacing / 2 : spacing / 2);
      
      this.ctx.beginPath();
      for (let i = 0; i < this.swipeTrail.length; i++) {
        const point = this.swipeTrail[i];
        
        // 计算垂直方向
        let perpX = 0;
        let perpY = 0;
        if (i < this.swipeTrail.length - 1) {
          const nextPoint = this.swipeTrail[i + 1];
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length > 0) {
            perpX = -dy / length * offset;
            perpY = dx / length * offset;
          }
        } else if (i > 0) {
          const prevPoint = this.swipeTrail[i - 1];
          const dx = point.x - prevPoint.x;
          const dy = point.y - prevPoint.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length > 0) {
            perpX = -dy / length * offset;
            perpY = dx / length * offset;
          }
        }
        
        const offsetX = point.x + perpX;
        const offsetY = point.y + perpY;
        
        if (i === 0) {
          this.ctx.moveTo(offsetX, offsetY);
        } else {
          this.ctx.lineTo(offsetX, offsetY);
        }
      }
      this.ctx.stroke();
    }
  }
  
  // 绘制波浪线攻击（鞭子）
  private renderWaveLine(): void {
    this.ctx.beginPath();
    for (let i = 0; i < this.swipeTrail.length; i++) {
      const point = this.swipeTrail[i];
      const waveOffset = Math.sin(i * 0.5) * 10; // 波浪偏移
      
      // 计算垂直方向
      let perpX = 0;
      let perpY = 0;
      if (i < this.swipeTrail.length - 1) {
        const nextPoint = this.swipeTrail[i + 1];
        const dx = nextPoint.x - point.x;
        const dy = nextPoint.y - point.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
          perpX = -dy / length * waveOffset;
          perpY = dx / length * waveOffset;
        }
      }
      
      const offsetX = point.x + perpX;
      const offsetY = point.y + perpY;
      
      if (i === 0) {
        this.ctx.moveTo(offsetX, offsetY);
      } else {
        this.ctx.lineTo(offsetX, offsetY);
      }
    }
    this.ctx.stroke();
  }
  
  // 绘制弧形线政击（镰刀）
  private renderArcLine(): void {
    if (this.swipeTrail.length < 2) return;
    
    const startPoint = this.swipeTrail[0];
    const endPoint = this.swipeTrail[this.swipeTrail.length - 1];
    
    // 计算控制点（弧形的中点）
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;
    
    // 计算垂直方向的偏移，创造弧形效果
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const arcOffset = length * 0.3; // 弧形的弯曲程度
    
    const perpX = -dy / length * arcOffset;
    const perpY = dx / length * arcOffset;
    
    const controlX = midX + perpX;
    const controlY = midY + perpY;
    
    // 绘制二次贝塞尔曲线
    this.ctx.beginPath();
    this.ctx.moveTo(startPoint.x, startPoint.y);
    this.ctx.quadraticCurveTo(controlX, controlY, endPoint.x, endPoint.y);
    this.ctx.stroke();
  }
  
  // 新手引导渲染
  private renderTutorial(): void {
    // 如果不是新手关卡或已完成引导，不显示
    if (!this.isTutorialStage || this.tutorialCompleted) return;
    
    const canvas = this.canvas;
    const ctx = this.ctx;
    
    // 引导步骤逻辑
    let message = '';
    let subMessage = '';
    let showArrow = false;
    let arrowDirection = 'right'; // 箭头方向
    
    // 根据游戏状态决定显示哪个引导
    if (!this.isGameStarted) {
      // 游戏未开始，不显示引导
      return;
    }
    
    if (this.tutorialStep === 0) {
      // 第一步：教玩家滑动攻击
      message = '🗡️ 滑动攻击敌人';
      subMessage = '在屏幕上滑动来攻击飞过来的敌人';
      showArrow = true;
      arrowDirection = 'right';
      
      // 如果击杀了第一个敌人，进入下一步
      if (this.firstEnemyKilled) {
        this.tutorialStep = 1;
        this.tutorialTimer = 0;
      }
    } else if (this.tutorialStep === 1) {
      // 第二步：警告炸弹
      message = '💣 警告：躲避炸弹！';
      subMessage = '红色的炸弹不能攻击，触碰会扣血';
      
      // 3秒后自动进入下一步
      this.tutorialTimer++;
      if (this.tutorialTimer > 180) { // 3秒 @ 60fps
        this.tutorialStep = 2;
        this.tutorialTimer = 0;
      }
    } else if (this.tutorialStep === 2) {
      // 第三步：连击系统
      message = '🔥 连续击杀获得连击加成';
      subMessage = '连击越高，分数越多！';
      
      // 3秒后完成引导
      this.tutorialTimer++;
      if (this.tutorialTimer > 180) { // 3秒 @ 60fps
        this.tutorialCompleted = true;
        localStorage.setItem('tutorial_completed', 'true');
        console.log('Tutorial completed!');
        return;
      }
    }
    
    if (!message) return;
    
    // 绘制半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const boxWidth = 400;
    const boxHeight = 100;
    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = canvas.height - 150;
    
    // 绘制圆角矩形背景
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 15);
    ctx.fill();
    
    // 绘制边框
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 绘制主消息
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Creepster", cursive';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 5;
    ctx.fillText(message, canvas.width / 2, boxY + 40);
    
    // 绘制副消息
    ctx.fillStyle = '#cccccc';
    ctx.font = '16px sans-serif';
    ctx.fillText(subMessage, canvas.width / 2, boxY + 70);
    ctx.shadowBlur = 0;
    
    // 绘制箭头动画（指向右侧敌人）
    if (showArrow) {
      const arrowX = canvas.width / 2 + 150;
      const arrowY = canvas.height / 2;
      const arrowOffset = Math.sin(Date.now() / 200) * 10; // 抖动效果
      
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(arrowX + arrowOffset, arrowY);
      ctx.lineTo(arrowX - 30 + arrowOffset, arrowY - 20);
      ctx.lineTo(arrowX - 30 + arrowOffset, arrowY + 20);
      ctx.closePath();
      ctx.fill();
      
      // 箭头尾巴
      ctx.fillRect(arrowX - 60 + arrowOffset, arrowY - 8, 30, 16);
    }
  }
  
  /**
   * 直接对BOSS造成伤害（用于节奏大师模式）
   */
  private damageBossDirectly(damage: number): void {
    const boss = this.enemies.find(e => e.isBoss);
    if (!boss || !boss.health) return;
    
    boss.health -= damage;
    boss.hitAnimation = 200; // 受击动画
    
    // 检查BOSS是否死亡
    if (boss.health <= 0) {
      boss.health = 0;
      
      // 添加分数
      this.addScore(boss.type, boss.x, boss.y);
      
      // 爆炸特效
      this.createParticles(boss.x, boss.y, '#ffd700', 30);
      this.triggerScreenShake(20);
      
      // 标记BOSS为已死亡，但不移除，让它停留在画面中
      boss.isDead = true;
      // this.enemies = this.enemies.filter(e => e.id !== boss.id); // 注释掉，不移除BOSS
      
      console.log('BOSS被击败！');
    }
  }
  
  /**
   * 渲染节奏大师模式（第6关）
   */
  private renderRhythmBossMode(): void {
    if (!this.rhythmBossSystem) return;
    
    // 清空画布
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制背景（模糊效果）
    if (this.backgroundImage && this.backgroundImage.complete) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.3; // 降低背景亮度
      this.ctx.filter = 'blur(5px)';
      const scale = Math.max(
        this.canvas.width / this.backgroundImage.width,
        this.canvas.height / this.backgroundImage.height
      );
      const scaledWidth = this.backgroundImage.width * scale;
      const scaledHeight = this.backgroundImage.height * scale;
      const x = (this.canvas.width - scaledWidth) / 2;
      const y = (this.canvas.height - scaledHeight) / 2;
      this.ctx.drawImage(this.backgroundImage, x, y, scaledWidth, scaledHeight);
      this.ctx.restore();
    }
    
    // 绘制BOSS（在背景之上，轨道旁边）- 音乐响起后10秒才显示
    const boss = this.enemies.find(e => e.isBoss);
    
    // BOSS渲染：使用静态图，不使用frameAnimation
    if (boss && boss.image && boss.image.complete) {
      // BOSS位置：右上角，不遮挡轨道
      // 保持BOSS原始纵横比（279×500），不压扁
      const bossHeight = boss.size * 1.3; // BOSS高度，比主角高但不过大
      const aspectRatio = 279 / 500; // 实际BOSS图片宽高比 (279x500)
      const bossWidth = bossHeight * aspectRatio;
      
      const bossX = this.canvas.width - bossWidth / 2 - 20; // 距离右边缐20px
      const bossY = this.canvas.height * 0.35; // 位于屏幕上方35%位置
      
      // 绘制BOSS静态图（BOSS图片已经是面朝左，不需要翻转）
      this.ctx.drawImage(
        boss.image,
        bossX - bossWidth / 2,
        bossY - bossHeight / 2,
        bossWidth,
        bossHeight
      );
      
      // 绘制BOSS血条
      const barWidth = 400;
      const barHeight = 20;
      const barX = (this.canvas.width - barWidth) / 2;
      const barY = 50;
      
      // 血条背景
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
      
      // 血条边框
      this.ctx.strokeStyle = '#ffcc00';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
      
      // 血条填充
      const bossConfig = BOSS_TYPES[boss.bossType as BossType];
      const bossMaxHealth = bossConfig?.health || 4000;
      const healthPercent = Math.max(0, Math.min(1, (boss.health || 0) / bossMaxHealth));
      const fillWidth = barWidth * healthPercent;
      
      // 渐变色（绿色→黄色→红色）
      let barColor;
      if (healthPercent > 0.6) {
        barColor = '#00ff00';
      } else if (healthPercent > 0.3) {
        barColor = '#ffff00';
      } else {
        barColor = '#ff0000';
      }
      
      this.ctx.fillStyle = barColor;
      this.ctx.fillRect(barX, barY, fillWidth, barHeight);
      
      // 血量数字
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 16px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        `${Math.ceil(boss.health || 0)} / ${bossMaxHealth}`,
        this.canvas.width / 2,
        barY + 15
      );
    }
    
    // 绘制主角（在左侧，与BOSS对称）
    if (this.playerImage && this.playerImage.complete) {
      // 主角位置：左上角，与BOSS对称
      const targetHeight = boss ? boss.size * 1.0 : 400; // 主角高度与BOSS相同，实现左右对称
      
      // 保持原始宽高比，不拉伸
      const aspectRatio = this.playerImage.width / this.playerImage.height;
      const playerHeight = targetHeight;
      const playerWidth = playerHeight * aspectRatio;
      
      const playerX = playerWidth / 2 + 10; // 距离左边缘10px
      const playerY = this.canvas.height * 0.35; // 位于屏幕上方35%位置
      
      // 绘制主角图片
      this.ctx.save();
      this.ctx.drawImage(
        this.playerImage,
        playerX - playerWidth / 2,
        playerY - playerHeight / 2,
        playerWidth,
        playerHeight
      );
      this.ctx.restore();
    }
    
    // 绘制节奏大师系统（轨道、Note、判定线）- 在BOSS之上
    this.rhythmBossSystem.render();
    
    // 绘制统计信息（左上角）
    if (this.rhythmBossSystem) {
      const stats = this.rhythmBossSystem.getStats();
      
      // 移除黑色半透明背景，让背景图清晰可见
      // this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      // this.ctx.fillRect(10, 10, 200, 150);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 20px sans-serif';
      this.ctx.textAlign = 'left';
      
      let y = 35;
      this.ctx.fillText(`Combo: ${stats.combo}`, 20, y);
      y += 25;
      this.ctx.fillText(`Perfect: ${stats.perfect}`, 20, y);
      y += 25;
      this.ctx.fillText(`Nice: ${stats.nice}`, 20, y);
      y += 25;
      this.ctx.fillText(`Good: ${stats.good}`, 20, y);
      y += 25;
      this.ctx.fillText(`Miss: ${stats.miss}`, 20, y);
    }
  }
}
