/**
 * 音频管理器
 * 使用Web Audio API实现音频播放、同步和可视化
 */

export interface AudioConfig {
  onBeatUpdate?: (beatTime: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  
  private startTime = 0;
  private pauseTime = 0;
  private isPlaying = false;
  private isPaused = false;
  
  private config: AudioConfig;
  
  constructor(config: AudioConfig = {}) {
    this.config = config;
  }
  
  /**
   * 初始化音频上下文
   */
  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 创建分析器节点（用于可视化）
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      // 创建增益节点（用于音量控制）
      this.gainNode = this.audioContext.createGain();
      
      // 连接节点
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }
  }
  
  /**
   * 加载音频文件
   */
  async loadAudio(url: string): Promise<void> {
    this.initAudioContext();
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  }
  
  /**
   * 播放音频
   */
  play() {
    if (!this.audioContext || !this.audioBuffer) {
      console.error('Audio not loaded');
      return;
    }
    
    // 恢复音频上下文（某些浏览器需要用户交互后才能播放）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // 创建新的音源节点
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.connect(this.gainNode!);
    
    // 如果是从暂停恢复，从暂停位置开始
    const offset = this.isPaused ? this.pauseTime : 0;
    this.sourceNode.start(0, offset);
    
    this.startTime = this.audioContext.currentTime - offset;
    this.isPlaying = true;
    this.isPaused = false;
  }
  
  /**
   * 暂停音频
   */
  pause() {
    if (!this.isPlaying || !this.sourceNode || !this.audioContext) return;
    
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.sourceNode.stop();
    this.isPlaying = false;
    this.isPaused = true;
  }
  
  /**
   * 停止音频
   */
  stop() {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode = null;
    }
    
    this.isPlaying = false;
    this.isPaused = false;
    this.startTime = 0;
    this.pauseTime = 0;
  }
  
  /**
   * 获取当前播放时间（秒）
   */
  getCurrentTime(): number {
    if (!this.audioContext) return 0;
    
    if (this.isPlaying) {
      return this.audioContext.currentTime - this.startTime;
    } else if (this.isPaused) {
      return this.pauseTime;
    }
    
    return 0;
  }
  
  /**
   * 获取音频总时长（秒）
   */
  getDuration(): number {
    return this.audioBuffer?.duration || 0;
  }
  
  /**
   * 设置音量 (0-1)
   */
  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  /**
   * 获取频谱数据（用于可视化）
   */
  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
  }
  
  /**
   * 获取波形数据（用于可视化）
   */
  getWaveformData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    
    return dataArray;
  }
  
  /**
   * 检查是否正在播放
   */
  isAudioPlaying(): boolean {
    return this.isPlaying;
  }
  
  /**
   * 检查是否已暂停
   */
  isAudioPaused(): boolean {
    return this.isPaused;
  }
  
  /**
   * 销毁音频管理器
   */
  destroy() {
    this.stop();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.audioBuffer = null;
    this.analyser = null;
    this.gainNode = null;
  }
}

/**
 * 音效管理器
 * 用于播放短音效（如打击音效）
 */
export class SoundEffectManager {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();
  
  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  /**
   * 加载音效
   */
  async loadSound(name: string, url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
    }
  }
  
  /**
   * 播放音效
   */
  play(name: string, volume = 1.0) {
    const buffer = this.sounds.get(name);
    if (!buffer) {
      console.warn(`Sound ${name} not loaded`);
      return;
    }
    
    // 恢复音频上下文
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start(0);
  }
  
  /**
   * 生成简单的音效（用于测试）
   */
  generateBeep(frequency: number, duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < numSamples; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * Math.exp(-3 * i / numSamples);
    }
    
    return buffer;
  }
  
  /**
   * 添加程序生成的音效
   */
  addGeneratedSound(name: string, frequency: number, duration: number) {
    const buffer = this.generateBeep(frequency, duration);
    this.sounds.set(name, buffer);
  }
  
  /**
   * 销毁音效管理器
   */
  destroy() {
    this.sounds.clear();
    this.audioContext.close();
  }
}
