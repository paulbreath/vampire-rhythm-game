import { AudioManager } from './audioManager';
import { ChartData } from './chartLoader';

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
}

export interface Player {
  x: number;
  y: number;
  targetX?: number; // 目标X坐标，用于平滑移动
  targetY?: number; // 目标Y坐标，用于平滑移动
  rotation?: number; // 角色旋转角度（弧度），剑锋指向鼠标
  width: number;
  height: number;
  image?: HTMLImageElement; // 玩家精灵图
  idleAnimation: number; // 待机动画计时器
  attackAnimation?: number; // 放击动画计时器
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

export type GameOrientation = 'portrait' | 'landscape';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private enemies: Enemy[] = [];
  private player: Player;
  private particles: Particle[] = []; // 粒子系统
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
  
  // 回调函数
  private onScoreChange?: (score: number) => void;
  private onComboChange?: (combo: number) => void;
  private onLivesChange?: (lives: number) => void;
  private onGameOver?: () => void;
  
  private isGameStarted = false;  // 标记游戏是否已开始

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;
    
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
      width: 80,
      height: 120,
      idleAnimation: oldIdleAnimation,
      attackAnimation: oldAttackAnimation,
      image: oldImage,
    };
  }
  
  private async loadAssets(): Promise<void> {
    // 加载背景
    const bgImg = new Image();
    bgImg.src = '/images/backgrounds/castle-bg.png';
    bgImg.onload = () => {
      this.backgroundImage = bgImg;
      console.log('Background loaded');
    };
    
    // 加载玩家精灵
    const playerImg = new Image();
    playerImg.src = '/images/characters/blade-warrior-side.png';
    playerImg.onload = () => {
      this.player.image = playerImg;
      console.log('Player sprite loaded');
    };
    
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
  }): void {
    this.onScoreChange = callbacks.onScoreChange;
    this.onComboChange = callbacks.onComboChange;
    this.onLivesChange = callbacks.onLivesChange;
    this.onGameOver = callbacks.onGameOver;
  }
  
  public setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
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
      if (now - this.lastSpawnTime > this.spawnInterval) {
        this.spawnEnemy();
        this.lastSpawnTime = now;
      }
    }

    // 更新敌人位置和动画（只支持横屏）
    this.enemies.forEach(enemy => {
      // 横屏：敌人从右往左移动
      enemy.x -= enemy.speed;
      
      // 更新飞行动画
      enemy.animationOffset += 0.1;
      
      // 更新受击动画
      if (enemy.hitAnimation !== undefined && enemy.hitAnimation > 0) {
        enemy.hitAnimation--;
      }
    });
    
    // 平滑移动玩家到目标位置
    if (this.player.targetX !== undefined && this.player.targetY !== undefined) {
      const speed = 0.15; // 插值系数，越大越快
      this.player.x += (this.player.targetX - this.player.x) * speed;
      this.player.y += (this.player.targetY - this.player.y) * speed;
      
      // 边界限制，确保角色不会移出画布
      this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
      this.player.y = Math.max(this.player.height / 2, Math.min(this.canvas.height - this.player.height / 2, this.player.y));
    }
    
    // 更新玩家待机动画
    this.player.idleAnimation += 0.05;
    if (this.player.attackAnimation !== undefined && this.player.attackAnimation > 0) {
      this.player.attackAnimation--;
    }
    
    // 更新粒子
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // 重力
      particle.life--;
      return particle.life > 0;
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
        size = 60;
        speed = 2.0;  // BOSS速度也增加
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
      speed,
      size,
      color,
      image: this.enemyImages.get(enemyType),
      animationOffset: Math.random() * Math.PI * 2, // 随机初始动画偏移，让敌人动画不同步
    };
    
    this.enemies.push(enemy);
  }

  public handleSwipe(x: number, y: number): void {
    if (this.isPaused || this.isGameOver) return;

    // 角色跟随鼠标/手指移动
    this.player.targetX = x;
    this.player.targetY = y;
    
    // 计算角色旋转角度（剑锋指向鼠标）
    const dx = x - this.player.x;
    const dy = y - this.player.y;
    this.player.rotation = Math.atan2(dy, dx);

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
          // 击中炸弹，扣血
          this.loseLife();
          this.combo = 0;
          this.onComboChange?.(this.combo);
          // 炸弹爆炸特效
          this.createParticles(enemy.x, enemy.y, '#ff0000', 20);
          this.triggerScreenShake(15);
        } else {
          // 击中普通敌人，加分
          this.addScore(enemy.type);
          // 击中特效
          this.createParticles(enemy.x, enemy.y, enemy.color, 10);
          this.triggerScreenShake(5);
          // 触发玩家攻击动画
          this.player.attackAnimation = 10;
        }
        return false; // 移除敌人
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

  private addScore(enemyType: Enemy['type']): void {
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
    this.score += points * (1 + this.combo * 0.1);
    
    this.onScoreChange?.(Math.floor(this.score));
    this.onComboChange?.(this.combo);
  }

  private loseLife(): void {
    this.lives--;
    this.combo = 0;
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
    
    // 绘制玩家
    if (this.player.image && this.player.image.complete) {
      this.ctx.save();
      
      // 待机动画：上下浮动
      const idleOffset = Math.sin(this.player.idleAnimation) * 3;
      
      // 攻击动画：缩放效果
      let attackScale = 1.0;
      if (this.player.attackAnimation && this.player.attackAnimation > 0) {
        attackScale = 1.0 + (this.player.attackAnimation / 10) * 0.2;
      }
      
      // 只支持横屏：玩家跟随鼠标旋转
      this.ctx.translate(this.player.x, this.player.y + idleOffset);
      
      // 应用旋转（剑锋指向鼠标）
      if (this.player.rotation !== undefined) {
        this.ctx.rotate(this.player.rotation);
      }
      
      this.ctx.scale(attackScale, attackScale);
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
    
    // 绘制粒子
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
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
