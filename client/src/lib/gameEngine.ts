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
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  image?: HTMLImageElement; // 玩家精灵图
}

export type GameOrientation = 'portrait' | 'landscape';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private enemies: Enemy[] = [];
  private player: Player;
  private score: number = 0;
  private combo: number = 0;
  private lives: number = 3;
  private maxLives: number = 3;
  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private lastSpawnTime: number = 0;
  private spawnInterval: number = 1000;
  private swipeTrail: { x: number; y: number; time: number }[] = [];
  private trailMaxLength: number = 20;
  private nextEnemyId: number = 0;
  
  // 音频和谱面相关
  private audioManager: AudioManager | null = null;
  private chartData: ChartData | null = null;
  private upcomingNotes: Array<{ time: number; type: Enemy['type'] }> = [];
  
  // 屏幕方向
  private orientation: GameOrientation = 'portrait';
  
  // 背景图片
  private backgroundImage: HTMLImageElement | null = null;
  
  // 敌人精灵图
  private enemyImages: Map<Enemy['type'], HTMLImageElement> = new Map();
  
  // 回调函数
  private onScoreChange?: (score: number) => void;
  private onComboChange?: (combo: number) => void;
  private onLivesChange?: (lives: number) => void;
  private onGameOver?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;
    
    // 初始化玩家位置（根据屏幕方向）
    this.player = this.initializePlayer();
    
    // 检测屏幕方向
    this.detectOrientation();
    window.addEventListener('resize', () => this.handleResize());
    
    // 设置画布大小
    this.resizeCanvas();
    
    // 加载美术资源
    this.loadAssets();
  }
  
  private detectOrientation(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.orientation = width > height ? 'landscape' : 'portrait';
    console.log(`Screen orientation: ${this.orientation} (${width}x${height})`);
  }
  
  private handleResize(): void {
    const oldOrientation = this.orientation;
    this.detectOrientation();
    this.resizeCanvas();
    
    // 如果方向改变，重新初始化玩家位置
    if (oldOrientation !== this.orientation) {
      this.player = this.initializePlayer();
      console.log(`Orientation changed to ${this.orientation}, player repositioned`);
    }
  }
  
  private initializePlayer(): Player {
    const width = this.canvas.width || window.innerWidth;
    const height = this.canvas.height || window.innerHeight;
    
    if (this.orientation === 'portrait') {
      // 竖屏：玩家在底部
      return {
        x: width / 2,
        y: height - 100,
        width: 80,
        height: 120,
      };
    } else {
      // 横屏：玩家在左侧
      return {
        x: 150,
        y: height / 2,
        width: 80,
        height: 120,
      };
    }
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
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
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
    this.isPaused = false;
    this.isGameOver = false;
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
    }
    
    // 开始播放音乐
    if (this.audioManager) {
      this.audioManager.play();
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
    if (this.isPaused) return;
    
    const now = Date.now();
    
    // 如果有谱面和音频，根据音乐时间生成敌人
    if (this.audioManager && this.chartData && this.upcomingNotes.length > 0) {
      const currentTime = this.audioManager.getCurrentTime();
      const spawnLeadTime = 3.0; // 提前3秒生成敌人（增加时间以确保可见）
      
      // 调试日志：每5秒输出一次
      if (Math.floor(currentTime) % 5 === 0 && Math.floor(currentTime * 10) % 10 === 0) {
        console.log(`Current time: ${currentTime.toFixed(2)}s, Upcoming notes: ${this.upcomingNotes.length}, Enemies: ${this.enemies.length}`);
      }
      
      // 检查是否有需要生成的音符
      let spawnedCount = 0;
      while (this.upcomingNotes.length > 0 && this.upcomingNotes[0].time - currentTime <= spawnLeadTime) {
        const note = this.upcomingNotes.shift()!;
        this.spawnEnemy(note.type);
        spawnedCount++;
      }
      
      if (spawnedCount > 0) {
        console.log(`Spawned ${spawnedCount} enemies at time ${currentTime.toFixed(2)}s`);
      }
    } else {
      // 无谱面模式：随机生成
      if (now - this.lastSpawnTime > this.spawnInterval) {
        this.spawnEnemy();
        this.lastSpawnTime = now;
      }
    }

    // 更新敌人位置
    this.enemies.forEach(enemy => {
      if (this.orientation === 'portrait') {
        // 竖屏：敌人从上往下移动
        enemy.y += enemy.speed;
      } else {
        // 横屏：敌人从右往左移动
        enemy.x -= enemy.speed;
      }
    });

    // 移除超出屏幕的敌人（未被击中）
    const initialEnemyCount = this.enemies.length;
    this.enemies = this.enemies.filter(enemy => {
      const isOutOfBounds = this.orientation === 'portrait' 
        ? enemy.y > this.canvas.height + enemy.size  // 竖屏：y超过屏幕底部
        : enemy.x < -enemy.size;  // 横屏：x小于屏幕左侧
      
      if (isOutOfBounds) {
        // 敌人逃脱，扣血（炸弹除外）
        if (enemy.type !== 'bomb') {
          this.loseLife();
          console.log(`Enemy escaped! Lives: ${this.lives}`);
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
        speed = 1.5;  // 降低速度，给玩家更多反应时间
        color = '#00ffff';
        break;
      case 'bat_purple':
        size = 40;
        speed = 1.5;
        color = '#ff00ff';
        break;
      case 'bat_red':
        size = 40;
        speed = 2.0;
        color = '#ff0000';
        break;
      case 'bat_yellow':
        size = 40;
        speed = 2.0;
        color = '#ffff00';
        break;
      case 'vampire':
        size = 60;
        speed = 1.0;  // BOSS移动较慢
        color = '#ffd700';
        break;
      case 'bomb':
        size = 45;
        speed = 1.5;
        color = '#ff0000';
        break;
    }
    
    // 根据屏幕方向设置初始位置
    let x, y;
    if (this.orientation === 'portrait') {
      // 竖屏：从顶部随机位置生成
      x = Math.random() * (this.canvas.width - size * 2) + size;
      y = -size;
    } else {
      // 横屏：从右侧随机位置生成
      x = this.canvas.width + size;
      y = Math.random() * (this.canvas.height - size * 2) + size;
    }
    
    const enemy: Enemy = {
      id: this.nextEnemyId++,
      type: enemyType,
      x,
      y,
      speed,
      size,
      color,
      image: this.enemyImages.get(enemyType),
    };
    
    this.enemies.push(enemy);
  }

  public handleSwipe(x: number, y: number): void {
    if (this.isPaused || this.isGameOver) return;

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
        } else {
          // 击中普通敌人，加分
          this.addScore(enemy.type);
        }
        return false; // 移除敌人
      }
      return true;
    });
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
    // 清空画布
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制背景
    if (this.backgroundImage && this.backgroundImage.complete) {
      // 根据屏幕方向调整背景
      if (this.orientation === 'portrait') {
        // 竖屏：旋转背景90度
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(Math.PI / 2);
        this.ctx.drawImage(
          this.backgroundImage,
          -this.canvas.height / 2,
          -this.canvas.width / 2,
          this.canvas.height,
          this.canvas.width
        );
        this.ctx.restore();
      } else {
        // 横屏：正常绘制
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
    }
    
    // 绘制玩家
    if (this.player.image && this.player.image.complete) {
      this.ctx.save();
      
      if (this.orientation === 'portrait') {
        // 竖屏：玩家朝上
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.drawImage(
          this.player.image,
          -this.player.width / 2,
          -this.player.height / 2,
          this.player.width,
          this.player.height
        );
      } else {
        // 横屏：玩家朝右
        this.ctx.drawImage(
          this.player.image,
          this.player.x - this.player.width / 2,
          this.player.y - this.player.height / 2,
          this.player.width,
          this.player.height
        );
      }
      
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
      if (enemy.image && enemy.image.complete) {
        // 绘制精灵图
        this.ctx.save();
        
        if (this.orientation === 'portrait') {
          // 竖屏：敌人朝下
          this.ctx.translate(enemy.x, enemy.y);
          this.ctx.rotate(Math.PI / 2);
          this.ctx.drawImage(
            enemy.image,
            -enemy.size,
            -enemy.size,
            enemy.size * 2,
            enemy.size * 2
          );
        } else {
          // 横屏：敌人朝左
          this.ctx.drawImage(
            enemy.image,
            enemy.x - enemy.size,
            enemy.y - enemy.size,
            enemy.size * 2,
            enemy.size * 2
          );
        }
        
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
  
  public getOrientation(): GameOrientation {
    return this.orientation;
  }
}
