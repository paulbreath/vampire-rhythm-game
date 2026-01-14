/**
 * 动画管理器
 * 管理所有动画实例，提供预加载和缓存功能
 */

import { AnimationPlayer } from './AnimationPlayer';

export interface AnimationDefinition {
  name: string;
  path: string;
}

export class AnimationManager {
  private static instance: AnimationManager;
  private animations: Map<string, AnimationPlayer> = new Map();
  private loadingPromises: Map<string, Promise<AnimationPlayer>> = new Map();

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  /**
   * 预加载动画
   */
  async preloadAnimation(animationName: string, basePath: string = '/animations'): Promise<AnimationPlayer> {
    // 如果已经加载，直接返回
    if (this.animations.has(animationName)) {
      return this.animations.get(animationName)!;
    }

    // 如果正在加载，返回加载Promise
    if (this.loadingPromises.has(animationName)) {
      return this.loadingPromises.get(animationName)!;
    }

    // 开始加载
    const loadPromise = this._loadAnimation(animationName, basePath);
    this.loadingPromises.set(animationName, loadPromise);

    try {
      const player = await loadPromise;
      this.animations.set(animationName, player);
      this.loadingPromises.delete(animationName);
      return player;
    } catch (error) {
      this.loadingPromises.delete(animationName);
      throw error;
    }
  }

  private async _loadAnimation(animationName: string, basePath: string): Promise<AnimationPlayer> {
    const player = new AnimationPlayer(animationName, basePath);
    await player.load();
    return player;
  }

  /**
   * 批量预加载动画
   */
  async preloadAnimations(definitions: AnimationDefinition[]): Promise<void> {
    const promises = definitions.map(def => 
      this.preloadAnimation(def.name, def.path || '/animations')
    );

    await Promise.all(promises);
    console.log(`[AnimationManager] Preloaded ${definitions.length} animations`);
  }

  /**
   * 获取动画播放器
   */
  getAnimation(animationName: string): AnimationPlayer | null {
    return this.animations.get(animationName) || null;
  }

  /**
   * 创建动画播放器实例（不缓存）
   */
  createAnimation(animationName: string, basePath: string = '/animations'): AnimationPlayer {
    return new AnimationPlayer(animationName, basePath);
  }

  /**
   * 检查动画是否已加载
   */
  isLoaded(animationName: string): boolean {
    return this.animations.has(animationName);
  }

  /**
   * 卸载动画
   */
  unloadAnimation(animationName: string): void {
    const player = this.animations.get(animationName);
    if (player) {
      player.destroy();
      this.animations.delete(animationName);
      console.log(`[AnimationManager] Unloaded animation: ${animationName}`);
    }
  }

  /**
   * 卸载所有动画
   */
  unloadAll(): void {
    this.animations.forEach((player, name) => {
      player.destroy();
    });
    this.animations.clear();
    this.loadingPromises.clear();
    console.log('[AnimationManager] Unloaded all animations');
  }

  /**
   * 获取已加载的动画数量
   */
  getLoadedCount(): number {
    return this.animations.size;
  }

  /**
   * 获取所有已加载的动画名称
   */
  getLoadedAnimations(): string[] {
    return Array.from(this.animations.keys());
  }
}

// 导出单例实例
export const animationManager = AnimationManager.getInstance();
