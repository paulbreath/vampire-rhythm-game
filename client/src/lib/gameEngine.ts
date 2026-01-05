import { AudioManager } from './audioManager';
import { ChartData } from './chartLoader';
import { SpriteAnimation, AnimationState, createPlayerAnimations } from './spriteAnimation';
import { experienceManager, type PlayerStats } from './experienceManager';

export interface Enemy {
  id: number;
  type: 'bat_blue' | 'bat_purple' | 'bat_red' | 'bat_yellow' | 'vampire' | 'bomb';
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
  maxHealth?: number; // BOSS最大血量
  guardBombs?: number[]; // BOSS护卫炸弹的ID列表
  isGuardBomb?: boolean; // 是否为BOSS护卫炸弹
  guardBossId?: number; // 护卫的BOSS ID
  guardAngle?: number; // 护卫环绕角度（弧度）
  guardRadius?: number; // 护卫环绕半径
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

  constructor(canvas: HTMLCanvasElement, speedMultiplier: number = 1.0, densityMultiplier: number = 1.0) {
    this.speedMultiplier = speedMultiplier;
    this.densityMultiplier = densityMultiplier;
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;
    
    // 加载玩家经验数据
    this.playerStats = experienceManager.loadStats();
    console.log('Player stats loaded:', this.playerStats);
    
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
  }
  
  // 已移除orientation检测，只支持横屏模式
  
  private initializePlayer(): Player {
    const width = this.canvas.width || window.innerWidth;
    const height = this.canvas.height || window.innerHeight;
    
    // 保留已加载的图片和动画状态
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
      width: 120, // 2x larger than normal bat
      height: 180, // 2x larger than normal bat
      idleAnimation: oldIdleAnimation,
      attackAnimation: oldAttackAnimation,
      attackDashX: 0,
      attackDashY: 0,
      attackDashDuration: 0,
      image: oldImage,
    };
  }
  
  private async loadAssets(): Promise<void> {
    const imageLoadPromises: Promise<void>[] = [];
    // 加载背景
    const bgImg = new Image();
    bgImg.src = '/images/backgrounds/castle-bg.png';
    bgImg.onload = () => {
      this.backgroundImage = bgImg;
      console.log('Background loaded');
    };
    
    // 加载玩家静态精灵图
    const playerImg = new Image();
    playerImg.onload = () => {
      this.player.image = playerImg;
      console.log('Player static sprite loaded');
    };
    playerImg.onerror = () => {
      console.error('Failed to load player sprite');
    };
    playerImg.src = '/images/characters/castlevania-hero-side.png';
    
    // 加载敌人精灵
    const enemyTypes: Enemy['type'][] = ['bat_blue', 'bat_purple', 'bat_red', 'bat_yellow', 'vampire', 'bomb'];
    const enemyImagePaths: Record<Enemy['type'], string> = {
      bat_blue: '/images/enemies/bat-blue-side.png',
      bat_purple: '/images/enemies/bat-purple-side.png',
      bat_red: '/images/enemies/bat-red-side.png',
      bat_yellow: '/images/enemies/bat-yellow-side.png',
      vampire: '/images/enemies/vampire-boss-side.png',
      bomb: '/images/enemies/bomb-bat-side.png',
    };
    
    for (const type of enemyTypes) {
      const img = new Image();
      img.src = enemyImagePaths[type];
      img.onload = () => {
        this.enemyImages.set(type, img);
        console.log(`Enemy sprite loaded: ${type}`);
      };
    }
  }
  
  private initializePlayerAnimation(idleImg: HTMLImageElement, attackImg: HTMLImageElement): void {
    // 创建动画状态配置
    const idleState: AnimationState = {
      name: 'idle',
      config: {
        frameWidth: 200,
        frameHeight: 200,
        frameSequence: [0, 1, 2, 3], // 4帧待机动画
        frameRate: 6, // 6帧/秒，缓慢呼吸
        loop: true,
        direction: 'horizontal'
      }
    };
    
    const attackState: AnimationState = {
      name: 'attack',
      config: {
        frameWidth: 200,
        frameHeight: 200,
        frameSequence: [0, 1, 2, 3, 4, 5], // 6帧攻击动画
        frameRate: 20, // 20帧/秒，快速攻击
        loop: false,
        direction: 'horizontal'
      }
    };
    
    // 创建两个动画实例
    const idleAnimation = new SpriteAnimation(idleImg, idleState);
    const attackAnimation = new SpriteAnimation(attackImg, attackState);
    
    // 存储到player对象
    this.player.spriteAnimation = {
      idle: idleAnimation,
      attack: attackAnimation,
      current: idleAnimation // 默认使用待机动画
    };
    this.player.animationState = 'idle';
    
    console.log('Player sprite animations initialized');
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
    }
    
    this.onScoreChange?.(this.score);
    this.onComboChange?.(this.combo);
    this.onLivesChange?.(this.lives);
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
    
    const now = Date.now();
    
    // 如果有谱面和音频，    // 根据谱面生成敌人
    if (this.audioManager && this.chartData && this.upcomingNotes.length > 0) {
      const currentTime = this.audioManager.getCurrentTime();
      const spawnLeadTime = 1.5; // 减少到1.5秒，让敌人生成更平缓
      const initialDelay = 1.0; // 游戏开始的前1秒不生成敌人  
      // 调试日志：每5秒输出一次
      if (Math.floor(currentTime) % 5 === 0 && Math.floor(currentTime * 10) % 10 === 0) {
        console.log(`Current time: ${currentTime.toFixed(2)}s, Upcoming notes: ${this.upcomingNotes.length}, Enemies: ${this.enemies.length}`);
      }
      
      // 只在音乐实际播放且超过初始延迟后才生成敌人
      if (currentTime >= initialDelay) {  // 等待初始延迟结束
        // 检查是否有需要生成的音符，限制每帧最多生成数量
        let spawnedCount = 0;
        const maxSpawnPerFrame = 3; // 每帧最多生成3个敌人，防止一次性生成太多
        const maxTimeSpan = 0.2; // 每帧最多生成0.2秒范围内的敌人
        let firstNoteTime: number | null = null;
        
        while (this.upcomingNotes.length > 0 && 
               this.upcomingNotes[0].time - currentTime <= spawnLeadTime &&
               spawnedCount < maxSpawnPerFrame) {
          const note = this.upcomingNotes[0];
          
          // 如果是本帧第一个音符，记录时间
          if (firstNoteTime === null) {
            firstNoteTime = note.time;
          }
          
          // 如果这个音符距离第一个音符太远，停止生成
          if (note.time - firstNoteTime > maxTimeSpan) {
            break;
          }
          
          this.upcomingNotes.shift();
          this.spawnEnemy(note.type);
          spawnedCount++;
        }
        
        if (spawnedCount > 0) {
          console.log(`Spawned ${spawnedCount} enemies at time ${currentTime.toFixed(2)}s`);
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
          enemy.guardAngle = (enemy.guardAngle || 0) + 0.05; // 每帧旋转0.05弧度
          
          // 计算新位置（相对于BOSS）
          const radius = enemy.guardRadius || 100;
          enemy.x = boss.x + Math.cos(enemy.guardAngle) * radius;
          enemy.y = boss.y + Math.sin(enemy.guardAngle) * radius;
        } else {
          // BOSS已死，护卫炸弹正常移动
          enemy.x -= enemy.speed;
        }
      } else {
        // 横屏：敌人从右往左移动
        enemy.x -= enemy.speed;
      }
      
      // 更新飞行动画
      enemy.animationOffset += 0.1;
      
      // 更新受击动画
      if (enemy.hitAnimation !== undefined && enemy.hitAnimation > 0) {
        enemy.hitAnimation--;
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
      this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
      this.player.y = Math.max(this.player.height / 2, Math.min(this.canvas.height - this.player.height / 2, this.player.y));
    }
    
    // 更新玩家待机动画（旧系统）
    this.player.idleAnimation += 0.05;
    if (this.player.attackAnimation !== undefined && this.player.attackAnimation > 0) {
      this.player.attackAnimation--;
    }
    
    // 更新sprite动画（新系统）
    if (this.player.spriteAnimation) {
      const dt = 1 / 60; // 假设60FPS，每帧约16.67ms
      
      // 更新当前动画
      this.player.spriteAnimation.current.update(dt);
      
      // 如果政击动画播放完毕，切换回待机动画
      if (this.player.animationState === 'attack' && 
          this.player.spriteAnimation.current.isAnimationFinished()) {
        this.player.spriteAnimation.current = this.player.spriteAnimation.idle;
        this.player.animationState = 'idle';
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
      // 只支持横屏：敌人从x负值处离开屏幕
      const isOutOfBounds = enemy.x < -enemy.size;
      
      if (isOutOfBounds) {
        // 敌人逃脱，扣血（炸弹除外）
        if (enemy.type !== 'bomb' && this.isGameStarted) {
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
    // 如果没有指定类型，随机选择
    if (!type) {
      const types: Enemy['type'][] = ['bat_blue', 'bat_purple', 'bat_red', 'bat_yellow', 'vampire', 'bomb'];
      const weights = [25, 25, 15, 15, 15, 5]; // 权重
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      
      for (let i = 0; i < types.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          type = types[i];
          break;
        }
      }
    }
    
    const enemyType = type!;
    
    // 根据类型设置大小和速度
    let size = 40;
    let speed = 2;
    let color = '#ff0000';
    
    switch (enemyType) {
      case 'bat_blue':
        size = 40;
        speed = 3.0;  // 增加速度，让敌人更快离开屏幕
        color = '#00ffff';
        break;
      case 'bat_purple':
        size = 40;
        speed = 3.0;
        color = '#ff00ff';
        break;
      case 'bat_red':
        size = 40;
        speed = 3.5;
        color = '#ff0000';
        break;
      case 'bat_yellow':
        size = 40;
        speed = 3.5;
        color = '#ffff00';
        break;
      case 'vampire':
        size = 80; // BOSS更大
        speed = 1.5;  // BOSS速度较慢
        color = '#ffd700';
        break;
      case 'bomb':
        size = 45;
        speed = 3.0;
        color = '#ff0000';
        break;
    }
    
    // 只支持横屏：从右侧随机位置生成
    const x = this.canvas.width + size;
    const y = Math.random() * (this.canvas.height - size * 2) + size;
    
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
    };
    
    // 如果是BOSS，添加血量和护卫炸弹
    if (enemyType === 'vampire') {
      enemy.isBoss = true;
      enemy.health = 10;
      enemy.maxHealth = 10;
      enemy.guardBombs = [];
      
      // 生成1个护卫炸弹
      const guardRadius = 100; // 环绕半径
      for (let i = 0; i < 1; i++) {
        const guardAngle = (Math.PI * 2 / 1) * i; // 均匀分布在圆周上
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

    // 添加到轨迹
    this.swipeTrail.push({ x, y, time: Date.now() });
    
    // 限制轨迹长度
    if (this.swipeTrail.length > this.trailMaxLength) {
      this.swipeTrail.shift();
    }

    // 检测与敌人的碰撞
    this.enemies = this.enemies.filter(enemy => {
      const distance = Math.sqrt((x - enemy.x) ** 2 + (y - enemy.y) ** 2);
      
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
          if (this.player.spriteAnimation) {
            this.player.spriteAnimation.current = this.player.spriteAnimation.attack;
            this.player.spriteAnimation.current.reset();
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
            
            // 移除BOSS的护卫炸弹
            if (enemy.guardBombs) {
              this.enemies = this.enemies.filter(e => !enemy.guardBombs!.includes(e.id));
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
          
          // 触发sprite政击动画（新系统）
          if (this.player.spriteAnimation) {
            this.player.spriteAnimation.current = this.player.spriteAnimation.attack;
            this.player.spriteAnimation.current.reset(); // 重置动画到第一帧
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
    this.lives--;
    this.combo = 0;
    this.soundEffects?.playMiss();
    this.onLivesChange?.(this.lives);
    this.onComboChange?.(this.combo);
    
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
    
    // 绘制玩家 - 使用静态图片 + 程序化动画
    if (this.player.image && this.player.image.complete) {
      // 使用静态图片 + 程序化动画
      this.ctx.save();
      
      // 待机动画：轻微上下浮动
      const idleOffset = Math.sin(this.player.idleAnimation) * 3;
      
      // 攻击动画：缩放 + 旋转 + 闪光
      let attackScale = 1.0;
      let attackRotation = 0;
      let attackGlow = 0;
      let attackOffset = 0; // 攻击时的位移
      
      if (this.player.attackAnimation && this.player.attackAnimation > 0) {
        const attackProgress = this.player.attackAnimation / 10; // 1.0 -> 0.0
        
        // 缩放效果：先放大再缩小
        attackScale = 1.0 + Math.sin(attackProgress * Math.PI) * 0.3;
        
        // 旋转效果：模拟挥剑动作
        // 从-30°快速旋转到+30°，再回到0°
        if (attackProgress > 0.5) {
          // 前半段：举剑 -30° -> +30°
          attackRotation = -0.5 + (1 - attackProgress) * 2; // -0.5 -> 0.5 弧度
        } else {
          // 后半段：收剑 +30° -> 0°
          attackRotation = attackProgress * 2; // 0.5 -> 0
        }
        
        // 闪光效果
        attackGlow = this.player.attackAnimation * 2;
        
        // 攻击时向前冲刺一小段距离
        attackOffset = Math.sin(attackProgress * Math.PI) * 10;
      }
      
      // 移动到玩家位置
      const flipScale = this.player.facingRight ? 1 : -1;
      this.ctx.translate(
        this.player.x + attackOffset * flipScale, 
        this.player.y + idleOffset
      );
      
      // 应用缩放和翻转
      this.ctx.scale(flipScale * attackScale, attackScale);
      
      // 应用旋转（攻击动作 + 轻微指向）
      let totalRotation = attackRotation;
      if (this.player.rotation !== undefined && attackRotation === 0) {
        totalRotation = this.player.rotation * flipScale;
      }
      this.ctx.rotate(totalRotation);
      
      // 攻击时添加闪光效果
      if (attackGlow > 0) {
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = attackGlow;
      }
      
      this.ctx.drawImage(
        this.player.image,
        -this.player.width / 2,
        -this.player.height / 2,
        this.player.width,
        this.player.height
      );
      
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
      
      if (enemy.image && enemy.image.complete) {
        // 绘制精灵图
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
          enemy.size * 2,
          enemy.size * 2
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
      if (enemy.isBoss && enemy.health !== undefined && enemy.maxHealth !== undefined) {
        const barWidth = 100;
        const barHeight = 8;
        const barX = enemy.x - barWidth / 2;
        const barY = enemy.y - enemy.size - 20;
        
        // 背景（灰色）
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 血量（红色渐变到金色）
        const healthPercent = enemy.health / enemy.maxHealth;
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
        this.ctx.fillText(`${enemy.health}/${enemy.maxHealth}`, enemy.x, barY - 5);
      }
    });

    // 绘制切削轨迹
    if (this.swipeTrail.length > 1) {
      const gradient = this.ctx.createLinearGradient(
        this.swipeTrail[0].x,
        this.swipeTrail[0].y,
        this.swipeTrail[this.swipeTrail.length - 1].x,
        this.swipeTrail[this.swipeTrail.length - 1].y
      );
      gradient.addColorStop(0, '#ff000000');
      gradient.addColorStop(1, '#ff0000ff');
      
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.shadowColor = '#ff0000';
      this.ctx.shadowBlur = 10;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.swipeTrail[0].x, this.swipeTrail[0].y);
      for (let i = 1; i < this.swipeTrail.length; i++) {
        this.ctx.lineTo(this.swipeTrail[i].x, this.swipeTrail[i].y);
      }
      this.ctx.stroke();
            this.ctx.shadowBlur = 0;
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
}
