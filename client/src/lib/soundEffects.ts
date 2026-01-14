/**
 * 音效管理系统
 * 使用Web Audio API生成游戏音效
 */

export class SoundEffectsManager {
  private audioContext: AudioContext;
  private masterVolume: number = 0.3;
  private enabled: boolean = true;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  /**
   * 设置主音量
   */
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * 播放击中音效
   */
  playHit() {
    if (!this.enabled) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 快速的高频音效
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  /**
   * 播放连击音效
   */
  playCombo(comboCount: number) {
    if (!this.enabled) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 根据连击数调整音高
    const baseFreq = 400 + (comboCount * 50);
    oscillator.frequency.setValueAtTime(baseFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  /**
   * 播放游戏开始音效
   */
  playGameStart() {
    if (!this.enabled) return;

    const now = this.audioContext.currentTime;
    
    // 上升的三音符旋律
    [440, 554, 659].forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);

      oscillator.start(now + i * 0.1);
      oscillator.stop(now + i * 0.1 + 0.2);
    });
  }

  /**
   * 播放游戏结束音效
   */
  playGameOver() {
    if (!this.enabled) return;

    const now = this.audioContext.currentTime;
    
    // 下降的音符序列
    [659, 554, 440, 330].forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);

      oscillator.start(now + i * 0.15);
      oscillator.stop(now + i * 0.15 + 0.3);
    });
  }

  /**
   * 播放胜利音效
   */
  playVictory() {
    if (!this.enabled) return;

    const now = this.audioContext.currentTime;
    
    // 欢快的上升旋律
    [523, 659, 784, 1047].forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

      oscillator.start(now + i * 0.1);
      oscillator.stop(now + i * 0.1 + 0.3);
    });
  }

  /**
   * 播放UI点击音效
   */
  playClick() {
    if (!this.enabled) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(1000, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }

  /**
   * 播放敌人逃脱音效
   */
  playMiss() {
    if (!this.enabled) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 低沉的下降音
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.2);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  /**
   * 播放得分音效
   */
  playScore(points: number) {
    if (!this.enabled) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 根据得分调整音高
    const freq = 600 + (points / 10) * 100;
    oscillator.frequency.setValueAtTime(freq, now);
    oscillator.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.1);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  /**
   * 播放暂停音效
   */
  playPause() {
    if (!this.enabled) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 440;
    gainNode.gain.setValueAtTime(this.masterVolume * 0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
