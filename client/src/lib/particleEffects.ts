// 自定义粒子系统 - 专为像素风格优化
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
}

export class ParticleEffects {
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // 创建击中敌人的爆炸特效
  createHitExplosion(x: number, y: number, color: string) {
    const particleCount = 20 + Math.floor(Math.random() * 10); // 20-30个粒子
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4; // 速度2-6
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.5, // 0.3-0.8秒
        maxLife: 0.3 + Math.random() * 0.5,
        size: 2 + Math.random() * 4, // 2-6像素
        color,
        gravity: 0.2, // 重力
      });
    }
  }

  // 创建连击特效
  createComboEffect(x: number, y: number, comboCount: number) {
    const particleCount = Math.min(10 + comboCount * 2, 50);
    const colors = ['#FFD700', '#FFA500', '#FF6347']; // 金色、橙色、红色
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 5; // 速度3-8
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.7, // 0.5-1.2秒
        maxLife: 0.5 + Math.random() * 0.7,
        size: 3 + Math.random() * 5, // 3-8像素
        color,
        gravity: 0.15,
      });
    }
  }

  // 创建切削轨迹特效
  createSlashTrail(x: number, y: number) {
    const particleCount = 2 + Math.floor(Math.random() * 2); // 2-4个粒子
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random();
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.2 + Math.random() * 0.2, // 0.2-0.4秒
        maxLife: 0.2 + Math.random() * 0.2,
        size: 1 + Math.random() * 2, // 1-3像素
        color: '#ff0000',
        gravity: 0,
      });
    }
  }

  // 更新粒子系统
  update(deltaTime: number = 1 / 60) {
    // 更新所有粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // 应用重力
      particle.vy += particle.gravity;
      
      // 更新生命值
      particle.life -= deltaTime;
      
      // 移除死亡的粒子
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // 渲染粒子
  render() {
    this.particles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size * alpha; // 粒子随时间缩小
      
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = alpha;
      
      // 绘制方形粒子（像素风格）
      this.ctx.fillRect(
        Math.floor(particle.x - size / 2),
        Math.floor(particle.y - size / 2),
        Math.ceil(size),
        Math.ceil(size)
      );
    });
    
    // 恢复全局alpha
    this.ctx.globalAlpha = 1;
  }

  // 获取当前粒子数量
  getParticleCount(): number {
    return this.particles.length;
  }

  // 清除所有粒子
  clear() {
    this.particles = [];
  }

  // 销毁粒子系统
  destroy() {
    this.clear();
  }
}
