/**
 * 序列帧动画播放器
 * 用于加载和播放sprite sheet切割后的序列帧动画
 */

export interface AnimationConfig {
  frameCount: number;
  layout: {
    cols: number;
    rows: number;
  };
  theoreticalFrameSize: {
    width: number;
    height: number;
  };
  fps: number;
  loop: boolean;
}

export interface AnimationFrame {
  image: HTMLImageElement;
  width: number;
  height: number;
}

export class AnimationPlayer {
  private frames: AnimationFrame[] = [];
  private currentFrame: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private lastFrameTime: number = 0;
  private config: AnimationConfig | null = null;
  private animationName: string;
  private basePath: string;
  private onComplete?: () => void;
  private loadPromise: Promise<void> | null = null;

  constructor(animationName: string, basePath: string = '/animations') {
    this.animationName = animationName;
    this.basePath = basePath;
  }

  /**
   * 加载动画资源
   */
  async load(): Promise<void> {
    // 如果已经在加载，返回现有的Promise
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._loadAnimation();
    return this.loadPromise;
  }

  private async _loadAnimation(): Promise<void> {
    try {
      // 加载配置文件
      const configPath = `${this.basePath}/${this.animationName}/animation.json`;
      const configResponse = await fetch(configPath);
      
      if (!configResponse.ok) {
        throw new Error(`Failed to load animation config: ${configPath}`);
      }

      this.config = await configResponse.json();

      // 加载所有帧
      const framePromises: Promise<AnimationFrame>[] = [];
      
      for (let i = 0; i < this.config!.frameCount; i++) {
        const framePath = `${this.basePath}/${this.animationName}/frame_${String(i).padStart(2, '0')}.png`;
        framePromises.push(this.loadFrame(framePath));
      }

      this.frames = await Promise.all(framePromises);
      
      console.log(`[AnimationPlayer] Loaded ${this.frames.length} frames for ${this.animationName}`);
    } catch (error) {
      console.error(`[AnimationPlayer] Failed to load animation: ${this.animationName}`, error);
      throw error;
    }
  }

  private async loadFrame(path: string): Promise<AnimationFrame> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          image: img,
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        reject(new Error(`Failed to load frame: ${path}`));
      };

      img.src = path;
    });
  }

  /**
   * 播放动画
   */
  play(onComplete?: () => void): void {
    if (!this.isLoaded()) {
      console.warn(`[AnimationPlayer] Animation not loaded: ${this.animationName}`);
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.onComplete = onComplete;
    this.lastFrameTime = performance.now();
  }

  /**
   * 暂停动画
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * 恢复动画
   */
  resume(): void {
    if (this.isPlaying) {
      this.isPaused = false;
      this.lastFrameTime = performance.now();
    }
  }

  /**
   * 停止动画
   */
  stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentFrame = 0;
  }

  /**
   * 重置到第一帧
   */
  reset(): void {
    this.currentFrame = 0;
    this.lastFrameTime = performance.now();
  }

  /**
   * 更新动画（每帧调用）
   */
  update(timestamp: number): void {
    if (!this.isPlaying || this.isPaused || !this.config) {
      return;
    }

    const frameInterval = 1000 / this.config.fps;
    
    if (timestamp - this.lastFrameTime >= frameInterval) {
      this.currentFrame++;

      // 检查是否播放完成
      if (this.currentFrame >= this.frames.length) {
        if (this.config.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.isPlaying = false;
          
          if (this.onComplete) {
            this.onComplete();
          }
        }
      }

      this.lastFrameTime = timestamp;
    }
  }

  /**
   * 渲染当前帧
   */
  render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    if (!this.isLoaded() || this.frames.length === 0) {
      return;
    }

    const frame = this.frames[this.currentFrame];
    
    if (!frame) {
      return;
    }

    // 如果没有指定尺寸，使用原始尺寸
    const renderWidth = width !== undefined ? width : frame.width;
    const renderHeight = height !== undefined ? height : frame.height;

    // 居中渲染
    const renderX = x - renderWidth / 2;
    const renderY = y - renderHeight / 2;

    ctx.drawImage(
      frame.image,
      renderX,
      renderY,
      renderWidth,
      renderHeight
    );
  }

  /**
   * 检查动画是否已加载
   */
  isLoaded(): boolean {
    return this.frames.length > 0 && this.config !== null;
  }

  /**
   * 获取当前帧索引
   */
  getCurrentFrame(): number {
    return this.currentFrame;
  }

  /**
   * 获取总帧数
   */
  getTotalFrames(): number {
    return this.frames.length;
  }

  /**
   * 获取动画配置
   */
  getConfig(): AnimationConfig | null {
    return this.config;
  }

  /**
   * 获取当前帧的尺寸
   */
  getCurrentFrameSize(): { width: number; height: number } | null {
    const frame = this.frames[this.currentFrame];
    if (!frame) {
      return null;
    }
    return {
      width: frame.width,
      height: frame.height,
    };
  }

  /**
   * 设置FPS
   */
  setFPS(fps: number): void {
    if (this.config) {
      this.config.fps = fps;
    }
  }

  /**
   * 设置循环播放
   */
  setLoop(loop: boolean): void {
    if (this.config) {
      this.config.loop = loop;
    }
  }

  /**
   * 检查是否正在播放
   */
  getIsPlaying(): boolean {
    return this.isPlaying && !this.isPaused;
  }

  /**
   * 销毁动画播放器
   */
  destroy(): void {
    this.stop();
    this.frames = [];
    this.config = null;
    this.onComplete = undefined;
    this.loadPromise = null;
  }
}
