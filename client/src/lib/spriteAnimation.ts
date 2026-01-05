// Sprite Sheet动画系统
// 参考：James Long的Sprite类和Dev.to教程的混合方案

export interface AnimationConfig {
  frameWidth: number;      // 单帧宽度
  frameHeight: number;     // 单帧高度
  frameSequence: number[]; // 帧序列，如 [0, 1, 2, 1] 表示往返动画
  frameRate: number;       // 帧率（帧/秒）
  loop: boolean;           // 是否循环播放
  direction?: 'horizontal' | 'vertical'; // sprite sheet方向
  columns?: number;        // 2D网格布局的列数（如果指定，则自动计算行列号）
}

export interface AnimationState {
  name: string;
  config: AnimationConfig;
  row?: number; // 如果是多行sprite sheet，指定行号
}

export class SpriteAnimation {
  private image: HTMLImageElement;
  private currentState: AnimationState;
  private currentFrameIndex: number = 0;
  private frameTimer: number = 0;
  private isFinished: boolean = false;
  
  constructor(image: HTMLImageElement, initialState: AnimationState) {
    this.image = image;
    this.currentState = initialState;
  }
  
  /**
   * 更新动画状态
   * @param dt 距离上次更新的时间（秒）
   */
  public update(dt: number): void {
    if (this.isFinished) return;
    
    const config = this.currentState.config;
    
    // 基于时间的动画更新
    this.frameTimer += dt * config.frameRate;
    
    // 当计时器超过1时，切换到下一帧
    if (this.frameTimer >= 1.0) {
      this.frameTimer = 0;
      this.currentFrameIndex++;
      
      // 检查是否到达序列末尾
      if (this.currentFrameIndex >= config.frameSequence.length) {
        if (config.loop) {
          this.currentFrameIndex = 0; // 循环播放
        } else {
          this.currentFrameIndex = config.frameSequence.length - 1; // 停在最后一帧
          this.isFinished = true;
        }
      }
    }
  }
  
  /**
   * 渲染当前帧
   * @param ctx Canvas渲染上下文
   * @param x 目标X坐标（画布上的位置）
   * @param y 目标Y坐标（画布上的位置）
   * @param scale 缩放比例（可选）
   * @param flipH 是否水平翻转（可选）
   */
  public render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number = 1.0,
    flipH: boolean = false
  ): void {
    // 检查图片是否加载完成
    if (!this.image || !this.image.complete) {
      console.warn('SpriteAnimation: Image not loaded yet');
      return;
    }
    
    const config = this.currentState.config;
    const frameNumber = config.frameSequence[this.currentFrameIndex];
    
    // 计算sprite sheet中的源坐标
    let sx = 0;
    let sy = 0;
    
    // 如果指定了columns，使用2D网格布局
    if (config.columns !== undefined && config.columns > 0) {
      const col = frameNumber % config.columns;  // 列号
      const row = Math.floor(frameNumber / config.columns);  // 行号
      sx = col * config.frameWidth;
      sy = row * config.frameHeight;
    } else if (config.direction === 'vertical') {
      // 纵向sprite sheet
      sx = 0;
      sy = frameNumber * config.frameHeight;
      if (this.currentState.row !== undefined) {
        sx = this.currentState.row * config.frameWidth;
      }
    } else {
      // 横向sprite sheet（默认）
      sx = frameNumber * config.frameWidth;
      sy = 0;
      if (this.currentState.row !== undefined) {
        sy = this.currentState.row * config.frameHeight;
      }
    }
    
    ctx.save();
    
    // 修复后的水平翻转逻辑
    if (flipH) {
      // 移动到图片中心点，翻转，再移回来
      const centerX = x + (config.frameWidth * scale) / 2;
      ctx.translate(centerX, 0);
      ctx.scale(-1, 1);
      ctx.translate(-centerX, 0);
    }
    
    // 使用drawImage的9参数形式切割sprite sheet
    ctx.drawImage(
      this.image,
      sx, sy, config.frameWidth, config.frameHeight,  // 源区域
      x, y, config.frameWidth * scale, config.frameHeight * scale  // 目标区域
    );
    
    ctx.restore();
  }
  
  /**
   * 切换动画状态
   * @param newState 新的动画状态
   * @param reset 是否重置动画（默认true）
   */
  public setState(newState: AnimationState, reset: boolean = true): void {
    // 如果是同一个状态且不需要重置，则不做任何操作
    if (this.currentState.name === newState.name && !reset) {
      return;
    }
    
    this.currentState = newState;
    if (reset) {
      this.currentFrameIndex = 0;
      this.frameTimer = 0;
      this.isFinished = false;
    }
  }
  
  /**
   * 获取当前状态名称
   */
  public getCurrentStateName(): string {
    return this.currentState.name;
  }
  
  /**
   * 检查动画是否完成（仅对非循环动画有效）
   */
  public isAnimationFinished(): boolean {
    return this.isFinished;
  }
  
  /**
   * 重置动画到第一帧
   */
  public reset(): void {
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
    this.isFinished = false;
  }
  
  /**
   * 获取当前帧的边界框（用于碰撞检测等）
   */
  public getBounds(x: number, y: number, scale: number = 1.0): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const config = this.currentState.config;
    return {
      x,
      y,
      width: config.frameWidth * scale,
      height: config.frameHeight * scale
    };
  }
}

/**
 * 创建预定义的动画状态
 */
export const createPlayerAnimations = (frameWidth: number, frameHeight: number) => {
  // 待机动画：单帧或轻微摆动
  const idle: AnimationState = {
    name: 'idle',
    config: {
      frameWidth,
      frameHeight,
      frameSequence: [0], // 单帧
      frameRate: 0,
      loop: true,
      direction: 'horizontal'
    }
  };
  
  // 攻击动画：快速挥剑
  const attack: AnimationState = {
    name: 'attack',
    config: {
      frameWidth,
      frameHeight,
      frameSequence: [0, 1, 2, 1, 0], // 攻击往返动画
      frameRate: 20, // 20帧/秒，快速攻击
      loop: false, // 不循环，播放一次
      direction: 'horizontal'
    }
  };
  
  // 受击动画：闪烁效果
  const hit: AnimationState = {
    name: 'hit',
    config: {
      frameWidth,
      frameHeight,
      frameSequence: [0, 1, 0], // 简单的闪烁
      frameRate: 15,
      loop: false,
      direction: 'horizontal'
    }
  };
  
  return { idle, attack, hit };
};
