/**
 * 游戏引擎核心类
 * 负责游戏循环、渲染、碰撞检测和音频同步
 */

export interface GameConfig {
  onScoreUpdate: (score: number) => void;
  onComboUpdate: (combo: number) => void;
  onHealthUpdate: (health: number) => void;
  onGameOver: () => void;
}

export interface Enemy {
  id: string;
  type: 'bat_blue' | 'bat_purple' | 'bat_red' | 'bat_yellow' | 'vampire' | 'bomb';
  x: number;
  y: number;
  targetY: number;
  speed: number;
  size: number;
  isHit: boolean;
  hitTime?: number;
}

export interface SlashTrail {
  points: { x: number; y: number; time: number }[];
  color: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameConfig;
  
  private enemies: Enemy[] = [];
  private slashTrails: SlashTrail[] = [];
  private animationFrameId: number | null = null;
  
  private score = 0;
  private combo = 0;
  private health = 3;
  private isRunning = false;
  private isPaused = false;
  
  private lastSpawnTime = 0;
  private spawnInterval = 1000; // ms
  
  private mouseDown = false;
  private currentTrail: { x: number; y: number; time: number }[] = [];
  
  constructor(canvas: HTMLCanvasElement, config: GameConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
    this.config = config;
    
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handlePointerDown);
    this.canvas.addEventListener('mousemove', this.handlePointerMove);
    this.canvas.addEventListener('mouseup', this.handlePointerUp);
    
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
  }
  
  private handlePointerDown = (e: MouseEvent) => {
    this.mouseDown = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    this.currentTrail = [{ x, y, time: Date.now() }];
  };
  
  private handlePointerMove = (e: MouseEvent) => {
    if (!this.mouseDown) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    this.currentTrail.push({ x, y, time: Date.now() });
    
    // Check collision with enemies
    this.checkSlashCollision(x, y);
  };
  
  private handlePointerUp = () => {
    this.mouseDown = false;
    if (this.currentTrail.length > 1) {
      this.slashTrails.push({
        points: [...this.currentTrail],
        color: '#ff0033'
      });
    }
    this.currentTrail = [];
  };
  
  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
    this.mouseDown = true;
    this.currentTrail = [{ x, y, time: Date.now() }];
  };
  
  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!this.mouseDown) return;
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
    this.currentTrail.push({ x, y, time: Date.now() });
    
    // Check collision
    this.checkSlashCollision(x, y);
  };
  
  private handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    this.handlePointerUp();
  };
  
  private checkSlashCollision(x: number, y: number) {
    for (const enemy of this.enemies) {
      if (enemy.isHit) continue;
      
      const dx = x - enemy.x;
      const dy = y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < enemy.size) {
        this.hitEnemy(enemy);
      }
    }
  }
  
  private hitEnemy(enemy: Enemy) {
    enemy.isHit = true;
    enemy.hitTime = Date.now();
    
    if (enemy.type === 'bomb') {
      // Hit bomb - lose health and reset combo
      this.health = Math.max(0, this.health - 1);
      this.combo = 0;
      this.config.onHealthUpdate(this.health);
      this.config.onComboUpdate(this.combo);
      
      if (this.health <= 0) {
        this.gameOver();
      }
    } else {
      // Hit enemy - gain score and combo
      const baseScore = enemy.type === 'vampire' ? 100 : 50;
      const comboMultiplier = 1 + (this.combo * 0.1);
      const earnedScore = Math.floor(baseScore * comboMultiplier);
      
      this.score += earnedScore;
      this.combo += 1;
      
      this.config.onScoreUpdate(this.score);
      this.config.onComboUpdate(this.combo);
    }
  }
  
  private spawnEnemy() {
    const types: Enemy['type'][] = ['bat_blue', 'bat_purple', 'bat_red', 'bat_yellow', 'vampire', 'bomb'];
    const weights = [25, 20, 15, 15, 20, 5]; // Probability weights
    
    // Weighted random selection
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedType: Enemy['type'] = 'bat_blue';
    
    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedType = types[i];
        break;
      }
    }
    
    const enemy: Enemy = {
      id: Math.random().toString(36),
      type: selectedType,
      x: Math.random() * (this.canvas.width - 100) + 50,
      y: this.canvas.height + 50,
      targetY: Math.random() * (this.canvas.height * 0.6) + 50,
      speed: 2 + Math.random() * 2,
      size: selectedType === 'vampire' ? 40 : selectedType === 'bomb' ? 30 : 35,
      isHit: false
    };
    
    this.enemies.push(enemy);
  }
  
  private update(deltaTime: number) {
    if (this.isPaused) return;
    
    // Spawn enemies
    const now = Date.now();
    if (now - this.lastSpawnTime > this.spawnInterval) {
      this.spawnEnemy();
      this.lastSpawnTime = now;
    }
    
    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      if (enemy.isHit) {
        // Remove hit enemies after animation
        if (now - (enemy.hitTime || 0) > 300) {
          this.enemies.splice(i, 1);
        }
        continue;
      }
      
      // Move enemy up
      enemy.y -= enemy.speed;
      
      // Remove if off screen (missed)
      if (enemy.y < -50) {
        this.enemies.splice(i, 1);
        
        // Lose combo if missed a non-bomb enemy
        if (enemy.type !== 'bomb') {
          this.combo = 0;
          this.config.onComboUpdate(this.combo);
        }
      }
    }
    
    // Update slash trails
    for (let i = this.slashTrails.length - 1; i >= 0; i--) {
      const trail = this.slashTrails[i];
      const age = now - trail.points[0].time;
      if (age > 500) {
        this.slashTrails.splice(i, 1);
      }
    }
  }
  
  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a0f1f';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw enemies
    for (const enemy of this.enemies) {
      this.drawEnemy(enemy);
    }
    
    // Draw slash trails
    for (const trail of this.slashTrails) {
      this.drawSlashTrail(trail);
    }
    
    // Draw current trail
    if (this.currentTrail.length > 1) {
      this.drawSlashTrail({ points: this.currentTrail, color: '#ff3366' });
    }
  }
  
  private drawEnemy(enemy: Enemy) {
    this.ctx.save();
    this.ctx.translate(enemy.x, enemy.y);
    
    if (enemy.isHit) {
      // Hit animation
      const progress = (Date.now() - (enemy.hitTime || 0)) / 300;
      this.ctx.globalAlpha = 1 - progress;
      this.ctx.scale(1 + progress, 1 + progress);
    }
    
    // Draw enemy based on type
    const size = enemy.size;
    
    switch (enemy.type) {
      case 'vampire':
        // Vampire (red)
        this.ctx.fillStyle = '#cc0033';
        this.ctx.fillRect(-size/2, -size/2, size, size);
        this.ctx.fillStyle = '#ff3366';
        this.ctx.fillRect(-size/3, -size/3, size*2/3, size*2/3);
        break;
        
      case 'bat_blue':
        this.ctx.fillStyle = '#3366ff';
        this.drawBat(size);
        break;
        
      case 'bat_purple':
        this.ctx.fillStyle = '#9933ff';
        this.drawBat(size);
        break;
        
      case 'bat_red':
        this.ctx.fillStyle = '#ff3333';
        this.drawBat(size);
        break;
        
      case 'bat_yellow':
        this.ctx.fillStyle = '#ffcc33';
        this.drawBat(size);
        break;
        
      case 'bomb':
        // Bomb (black with red warning)
        this.ctx.fillStyle = '#330000';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = `${size/2}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('💣', 0, 0);
        break;
    }
    
    this.ctx.restore();
  }
  
  private drawBat(size: number) {
    // Simple bat shape
    this.ctx.beginPath();
    this.ctx.moveTo(-size/2, 0);
    this.ctx.lineTo(-size/4, -size/3);
    this.ctx.lineTo(0, -size/4);
    this.ctx.lineTo(size/4, -size/3);
    this.ctx.lineTo(size/2, 0);
    this.ctx.lineTo(size/4, size/4);
    this.ctx.lineTo(0, size/3);
    this.ctx.lineTo(-size/4, size/4);
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  private drawSlashTrail(trail: SlashTrail) {
    if (trail.points.length < 2) return;
    
    const now = Date.now();
    const age = now - trail.points[0].time;
    const alpha = Math.max(0, 1 - age / 500);
    
    this.ctx.save();
    this.ctx.strokeStyle = trail.color;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.globalAlpha = alpha;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = trail.color;
    
    this.ctx.beginPath();
    this.ctx.moveTo(trail.points[0].x, trail.points[0].y);
    
    for (let i = 1; i < trail.points.length; i++) {
      this.ctx.lineTo(trail.points[i].x, trail.points[i].y);
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }
  
  private gameLoop = (timestamp: number) => {
    if (!this.isRunning) return;
    
    const deltaTime = 16; // Assume 60fps
    this.update(deltaTime);
    this.render();
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
  
  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.combo = 0;
    this.health = 3;
    this.enemies = [];
    this.slashTrails = [];
    this.lastSpawnTime = Date.now();
    
    this.config.onScoreUpdate(this.score);
    this.config.onComboUpdate(this.combo);
    this.config.onHealthUpdate(this.health);
    
    this.gameLoop(0);
  }
  
  public pause() {
    this.isPaused = true;
  }
  
  public resume() {
    this.isPaused = false;
    this.lastSpawnTime = Date.now(); // Reset spawn timer
  }
  
  public gameOver() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.config.onGameOver();
  }
  
  public destroy() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.handlePointerDown);
    this.canvas.removeEventListener('mousemove', this.handlePointerMove);
    this.canvas.removeEventListener('mouseup', this.handlePointerUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }
}
