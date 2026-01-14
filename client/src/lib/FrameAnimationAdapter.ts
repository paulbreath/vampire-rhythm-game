/**
 * 序列帧动画适配器
 * 将AnimationPlayer适配为与现有SpriteAnimation兼容的接口
 */

import { AnimationPlayer } from './AnimationPlayer';

export class FrameAnimationAdapter {
  private player: AnimationPlayer;
  private lastUpdateTime: number = 0;

  constructor(animationName: string, basePath: string = '/animations') {
    this.player = new AnimationPlayer(animationName, basePath);
  }

  /**
   * 加载动画
   */
  async load(): Promise<void> {
    await this.player.load();
  }

  /**
   * 更新动画（兼容SpriteAnimation的dt参数）
   * @param dt 距离上次更新的时间（秒）
   */
  update(dt: number): void {
    const now = performance.now();
    this.player.update(now);
    this.lastUpdateTime = now;
  }

  /**
   * 渲染当前帧（兼容SpriteAnimation的接口）
   * @param ctx Canvas渲染上下文
   * @param x 目标X坐标（左上角）
   * @param y 目标Y坐标（左上角）
   * @param scale 缩放比例
   * @param flipH 是否水平翻转
   */
  render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number = 1.0,
    flipH: boolean = false
  ): void {
    const frameSize = this.player.getCurrentFrameSize();
    if (!frameSize) return;

    const width = frameSize.width * scale;
    const height = frameSize.height * scale;

    // 计算中心点坐标
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    ctx.save();

    // 如果需要水平翻转
    if (flipH) {
      ctx.translate(centerX, centerY);
      ctx.scale(-1, 1);
      ctx.translate(-centerX, -centerY);
    }

    // 使用AnimationPlayer的render方法（它需要中心点坐标）
    this.player.render(ctx, centerX, centerY, width, height);

    ctx.restore();
  }

  /**
   * 播放动画
   */
  play(onComplete?: () => void): void {
    this.player.play(onComplete);
  }

  /**
   * 停止动画
   */
  stop(): void {
    this.player.stop();
  }

  /**
   * 重置动画
   */
  reset(): void {
    this.player.reset();
  }

  /**
   * 获取帧宽度（兼容SpriteAnimation接口）
   */
  getFrameWidth(): number {
    const size = this.player.getCurrentFrameSize();
    return size ? size.width : 0;
  }

  /**
   * 获取帧高度（兼容SpriteAnimation接口）
   */
  getFrameHeight(): number {
    const size = this.player.getCurrentFrameSize();
    return size ? size.height : 0;
  }

  /**
   * 检查动画是否已加载
   */
  isLoaded(): boolean {
    return this.player.isLoaded();
  }

  /**
   * 销毁动画
   */
  destroy(): void {
    this.player.destroy();
  }

  /**
   * 获取底层AnimationPlayer实例
   */
  getPlayer(): AnimationPlayer {
    return this.player;
  }
}

/**
 * 创建多状态动画集合（兼容现有的多状态动画系统）
 */
export interface MultiStateAnimation {
  idle?: FrameAnimationAdapter;
  walk?: FrameAnimationAdapter;
  attack?: FrameAnimationAdapter;
  hurt?: FrameAnimationAdapter;
  death?: FrameAnimationAdapter;
}

/**
 * 创建BOSS多状态动画
 */
export async function createBossAnimations(bossId: string): Promise<MultiStateAnimation> {
  const animations: MultiStateAnimation = {};

  const states = ['idle', 'attack', 'hurt', 'death'];
  
  for (const state of states) {
    const animName = `boss-${bossId}-${state}`;
    const adapter = new FrameAnimationAdapter(animName);
    
    try {
      await adapter.load();
      animations[state as keyof MultiStateAnimation] = adapter;
      console.log(`[FrameAnimationAdapter] Loaded ${animName}`);
    } catch (error) {
      console.warn(`[FrameAnimationAdapter] Failed to load ${animName}:`, error);
    }
  }

  return animations;
}

/**
 * 创建敌人动画
 */
export async function createEnemyAnimation(enemyId: string): Promise<FrameAnimationAdapter | null> {
  const animName = `enemy-${enemyId}`;
  const adapter = new FrameAnimationAdapter(animName);

  try {
    await adapter.load();
    console.log(`[FrameAnimationAdapter] Loaded ${animName}`);
    return adapter;
  } catch (error) {
    console.warn(`[FrameAnimationAdapter] Failed to load ${animName}:`, error);
    return null;
  }
}
