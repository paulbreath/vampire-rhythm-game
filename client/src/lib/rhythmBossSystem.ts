/**
 * 节奏大师风格BOSS战系统
 * 
 * 实现4轨道下落式音游机制：
 * - 3D透视轨道渲染
 * - Note下落系统
 * - DFJK按键判定
 * - BOSS召唤AI
 */

export type LaneKey = 'D' | 'F' | 'J' | 'K';
export type JudgementType = 'perfect' | 'nice' | 'good' | 'miss';

// 谱面数据接口
export interface ChartNote {
  time: number; // 音符出现时间（秒）
  type: string; // 音符类型
  lane: number; // 轨道编号（1-4）
}

export interface ChartData {
  metadata: {
    title: string;
    bpm: number;
    duration: number;
    difficulty: string;
  };
  notes: ChartNote[];
}

export interface RhythmNote {
  id: number;
  lane: number; // 0-3 对应 D F J K
  y: number; // 当前Y坐标（0=BOSS位置，1=判定线）
  speed: number; // 下落速度
  hit: boolean; // 是否已击中
  judgement?: JudgementType; // 判定结果
}

export interface LaneConfig {
  key: LaneKey;
  x: number; // 判定区X坐标
  width: number; // 判定区宽度
  color: string; // 轨道颜色
}

export interface RhythmBossConfig {
  canvas: HTMLCanvasElement;
  bossY: number; // BOSS位置Y坐标
  judgeLineY: number; // 判定线Y坐标
  noteSpeed: number; // Note下落速度
  perfectWindow: number; // Perfect判定窗口（毫秒）
  niceWindow: number; // Nice判定窗口（毫秒）
  goodWindow: number; // Good判定窗口（毫秒）
  chartPath?: string; // 谱面文件路径（可选）
  bossType?: string; // BOSS类型（用于加载动画）
  // UI配置
  playerName?: string; // 玩家名称
  playerHealth?: number; // 玩家生命值
  playerMaxHealth?: number; // 玩家最大生命值
  bossName?: string; // BOSS名称
  bossHealth?: number; // BOSS生命值
  bossMaxHealth?: number; // BOSS最大生命值
  score?: number; // 当前分数
  songDuration?: number; // 歌曲总时长（秒）
  currentTime?: number; // 当前播放时间（秒）
}

export class RhythmBossSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // 配置
  private bossY: number;
  private judgeLineY: number;
  private noteSpeed: number;
  private perfectWindow: number;
  private niceWindow: number;
  private goodWindow: number;
  
  // 轨道配置（匹配魔法阵颜色）
  private lanes: LaneConfig[] = [
    { key: 'D', x: 0, width: 0, color: '#00ff00' }, // 绿色
    { key: 'F', x: 0, width: 0, color: '#00ffff' }, // 青色
    { key: 'J', x: 0, width: 0, color: '#ff00ff' }, // 品红色
    { key: 'K', x: 0, width: 0, color: '#ffff00' }, // 黄色
  ];
  
  // Note管理
  private notes: RhythmNote[] = [];
  private nextNoteId: number = 0;
  
  // 判定统计
  private perfectCount: number = 0;
  private niceCount: number = 0;
  private goodCount: number = 0;
  private missCount: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  
  // 按键状态
  private keyPressed: Set<LaneKey> = new Set();
  
  // 判定结果显示
  private currentJudgement: JudgementType | null = null;
  private judgementDisplayTime: number = 0;
  private judgementDuration: number = 500; // 显示500ms
  
  // 谱面数据
  private chartData: ChartData | null = null;
  private chartNoteIndex: number = 0;
  private musicStartTime: number = 0;
  private fallTime: number = 0; // note下落时间（秒）
  private chartLoopOffset: number = 0; // 谱面循环时的时间偏移（秒）
  
  // 回调
  public onNoteHit?: (lane: number, judgement: JudgementType) => void;
  public onNoteMiss?: (lane: number) => void;
  public onComboChange?: (combo: number) => void;
  
  // UI状态
  private playerName: string = 'ALUCARD';
  private playerHealth: number = 4;
  private playerMaxHealth: number = 4;
  private bossName: string = 'BOSS';
  private bossHealth: number = 10;
  private bossMaxHealth: number = 10;
  private score: number = 0;
  private songDuration: number = 180; // 默认3分钟
  private currentTime: number = 0;
  
  // UI图片资源
  private uiImages: Map<string, HTMLImageElement> = new Map();
  private imagesLoaded: boolean = false;
  
  // 魔法阵图片资源
  private magicCircles: HTMLImageElement[] = []; // 4个魔法阵图片（对应D/F/J/K）
  private magicCirclesLoaded: boolean = false;
  private magicCircleRotation: number = 0; // 旋转角度
  
  // 轨道图片资源
  private lanesImage: HTMLImageElement | null = null;
  private lanesImageLoaded: boolean = false;
  
  // 动画资源
  private bossType: string = 'bat-king'; // 默认BOSS类型
  private bossAnimationPlayer: any = null; // BOSS动画播放器
  private playerAnimationPlayer: any = null; // 玩家动画播放器
  
  constructor(config: RhythmBossConfig) {
    this.canvas = config.canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
    
    this.bossY = config.bossY;
    this.judgeLineY = config.judgeLineY;
    this.noteSpeed = config.noteSpeed;
    this.perfectWindow = config.perfectWindow;
    this.niceWindow = config.niceWindow;
    this.goodWindow = config.goodWindow;
    
    // 计算note下落时间（从y=0到y=1需要多少秒）
    this.fallTime = 1.0 / this.noteSpeed;
    
    // 初始UI配置
    if (config.playerName) this.playerName = config.playerName;
    if (config.playerHealth !== undefined) this.playerHealth = config.playerHealth;
    if (config.playerMaxHealth) this.playerMaxHealth = config.playerMaxHealth;
    if (config.bossName) this.bossName = config.bossName;
    if (config.bossHealth !== undefined) this.bossHealth = config.bossHealth;
    if (config.bossMaxHealth) this.bossMaxHealth = config.bossMaxHealth;
    if (config.score !== undefined) this.score = config.score;
    if (config.songDuration) this.songDuration = config.songDuration;
    if (config.currentTime !== undefined) this.currentTime = config.currentTime;
    if (config.bossType) this.bossType = config.bossType;
    
    this.initializeLanes();
    this.setupKeyboardListeners();
    this.loadUIImages();
    this.loadMagicCircles();
    this.loadLanesImage();
    this.loadAnimations();
    
    // 加载谱面数据
    if (config.chartPath) {
      this.loadChart(config.chartPath);
    }
  }
  
  /**
   * 初始化轨道位置
   */
  private initializeLanes(): void {
    const canvasWidth = this.canvas.width;
    const laneWidth = canvasWidth / 4;
    
    for (let i = 0; i < 4; i++) {
      this.lanes[i].x = laneWidth * i + laneWidth / 2;
      this.lanes[i].width = laneWidth * 0.8; // 80%宽度，留出间隙
    }
  }
  
  /**
   * 设置键盘监听
   */
  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase() as LaneKey;
      if (['D', 'F', 'J', 'K'].includes(key) && !this.keyPressed.has(key)) {
        this.keyPressed.add(key);
        this.handleKeyPress(key);
      }
    });
    
    window.addEventListener('keyup', (e) => {
      const key = e.key.toUpperCase() as LaneKey;
      if (['D', 'F', 'J', 'K'].includes(key)) {
        this.keyPressed.delete(key);
      }
    });
  }
  
  /**
   * 加载谱面数据
   */
  public async loadChart(chartPath: string): Promise<void> {
    try {
      const response = await fetch(chartPath);
      if (!response.ok) {
        console.error(`Failed to load chart: ${chartPath}`);
        return;
      }
      this.chartData = await response.json();
      console.log(`[RhythmBossSystem] Chart loaded: ${this.chartData?.metadata.title}, ${this.chartData?.notes.length} notes`);
    } catch (error) {
      console.error(`Error loading chart:`, error);
    }
  }
  
  /**
   * 启动音乐同步（在音乐开始播放时调用）
   */
  public startMusicSync(): void {
    this.musicStartTime = Date.now();
    this.chartNoteIndex = 0;
    
    // 重置统计数据（避免初始Miss）
    this.perfectCount = 0;
    this.niceCount = 0;
    this.goodCount = 0;
    this.missCount = 0;
    this.combo = 0;
    this.maxCombo = 0;
    
    // 清除所有已存在的note
    this.notes = [];
    
    console.log('[RhythmBossSystem] Music sync started, stats reset');
  }
  
  /**
   * 处理按键
   */
  private handleKeyPress(key: LaneKey): void {
    const laneIndex = ['D', 'F', 'J', 'K'].indexOf(key);
    if (laneIndex === -1) return;
    
    // 查找该轨道上最接近判定线的note
    const laneNotes = this.notes.filter(n => n.lane === laneIndex && !n.hit);
    if (laneNotes.length === 0) return;
    
    // 按Y坐标排序，找到最接近判定线的note
    laneNotes.sort((a, b) => Math.abs(a.y - 1) - Math.abs(b.y - 1));
    const closestNote = laneNotes[0];
    
    // 计算判定
    const distance = Math.abs(closestNote.y - 1); // 1 = 判定线位置
    const timeDistance = distance / this.noteSpeed * 1000; // 转换为毫秒
    
    let judgement: JudgementType;
    if (timeDistance <= this.perfectWindow) {
      judgement = 'perfect';
      this.perfectCount++;
      this.combo++;
    } else if (timeDistance <= this.niceWindow) {
      judgement = 'nice';
      this.niceCount++;
      this.combo++;
    } else if (timeDistance <= this.goodWindow) {
      judgement = 'good';
      this.goodCount++;
      this.combo++;
    } else {
      judgement = 'miss';
      this.missCount++;
      this.combo = 0;
    }
    
    // 更新最大连击
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    
    // 标记note为已击中
    closestNote.hit = true;
    closestNote.judgement = judgement;
    
    // 设置当前判定结果（用于显示）
    this.currentJudgement = judgement;
    this.judgementDisplayTime = Date.now();
    
    // 触发回调
    if (judgement !== 'miss') {
      this.onNoteHit?.(laneIndex, judgement);
    } else {
      this.onNoteMiss?.(laneIndex);
    }
    this.onComboChange?.(this.combo);
  }
  
  /**
   * 召唤note
   */
  public spawnNote(lane: number): void {
    if (lane < 0 || lane > 3) return;
    
    const note: RhythmNote = {
      id: this.nextNoteId++,
      lane,
      y: 0, // 从BOSS位置开始
      speed: this.noteSpeed,
      hit: false,
    };
    
    this.notes.push(note);
  }
  
  /**
   * 根据谱面生成note（循环模式）
   */
  private updateChartNotes(): void {
    if (!this.chartData) return;
    
    // 如果音乐还没开始，不生成note
    if (this.musicStartTime === 0) return;
    
    const currentTime = (Date.now() - this.musicStartTime) / 1000; // 当前音乐时间（秒）
    const spawnTime = currentTime + this.fallTime; // 需要生成note的时间点
    
    // 遍历谱面，生成到达时间的note
    while (
      this.chartNoteIndex < this.chartData.notes.length &&
      this.chartData.notes[this.chartNoteIndex].time + this.chartLoopOffset <= spawnTime
    ) {
      const chartNote = this.chartData.notes[this.chartNoteIndex];
      // 将谱面的lane（1-4）转换为系统的lane（0-3）
      const lane = chartNote.lane - 1;
      this.spawnNote(lane);
      this.chartNoteIndex++;
    }
    
    // 循环模式：如果谱面播放完了，重置索引并更新时间偏移
    if (this.chartNoteIndex >= this.chartData.notes.length) {
      this.chartNoteIndex = 0;
      // 更新时间偏移：基于谱面最后一个音符的时间
      const lastNoteTime = this.chartData.notes[this.chartData.notes.length - 1].time;
      this.chartLoopOffset += lastNoteTime + 2; // +2秒的缓冲时间
    }
  }
  
  /**
   * 加载魔法阵图片
   */
  private loadMagicCircles(): void {
    const circleNames = ['green', 'cyan', 'magenta', 'yellow']; // 对应D/F/J/K
    let loadedCount = 0;
    
    for (let i = 0; i < 4; i++) {
      const img = new Image();
      img.src = `/ui/magic-circle-${circleNames[i]}-transparent_nobg.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 4) {
          this.magicCirclesLoaded = true;
          console.log('[RhythmBossSystem] Magic circles loaded!');
        }
      };
      img.onerror = () => {
        console.error(`[RhythmBossSystem] Failed to load magic circle: ${circleNames[i]}`);
      };
      this.magicCircles.push(img);
    }
  }
  
  /**
   * 加载轨道图片
   */
  private loadLanesImage(): void {
    const img = new Image();
    img.src = '/rhythm-lanes/lanes-user-transparent-v2.png';
    img.onload = () => {
      this.lanesImage = img;
      this.lanesImageLoaded = true;
      console.log('[RhythmBossSystem] Lanes image loaded!');
    };
    img.onerror = () => {
      console.error('[RhythmBossSystem] Failed to load lanes image');
    };
  }
  
  /**
   * 更新系统
   */
  public update(deltaTime: number): void {
    // 移除魔法阵旋转动画，保持静止
    // this.magicCircleRotation += deltaTime * 30; // 每秒旋轫30度
    // if (this.magicCircleRotation >= 360) {
    //   this.magicCircleRotation -= 360;
    // }
    // 更新玩家动画
    if (this.playerAnimationPlayer) {
      this.playerAnimationPlayer.update(deltaTime);
    }
    
    // 更新BOSS动画
    // 注释：BOSS现在使用静态图，不需要动画更新
    /*
    if (this.bossAnimationPlayer) {
      this.bossAnimationPlayer.update(deltaTime);
    }
    */
    
    // 如果有谱面数据，根据音乐时间自动生成note
    if (this.chartData && this.musicStartTime > 0) {
      this.updateChartNotes();
    }
    
    // 更新所有note位置
    for (const note of this.notes) {
      if (!note.hit) {
        note.y += note.speed * deltaTime;
        
        // 检查是否Miss（超过判定线太远）
        if (note.y > 1.2) {
          note.hit = true;
          note.judgement = 'miss';
          this.missCount++;
          this.combo = 0;
          
          // 设置当前判定结果
          this.currentJudgement = 'miss';
          this.judgementDisplayTime = Date.now();
          
          this.onNoteMiss?.(note.lane);
          this.onComboChange?.(this.combo);
        }
      }
    }
    
    // 清理已击中或超出屏幕的note
    this.notes = this.notes.filter(n => !n.hit || n.y < 1.3);
  }
  
  /**
   * 渲染系统
   */
  public render(): void {
    // 渲染游戏元素
    this.renderLanes();
    this.renderNotes();
    this.renderJudgeLine();
    this.renderJudgementText();
    
    // 渲染UI元素（已简化）
  }
  
  /**
   * 渲染轨道（3D透视效果）
   */
  private renderLanes(): void {
    const ctx = this.ctx;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    
    // 轨道起点（BOSS位置，窄）
    const topY = this.bossY;
    const topWidth = canvasWidth * 0.3; // 顶部宽度30%
    const topLeft = (canvasWidth - topWidth) / 2;
    
    // 轨道终点（判定线，宽）
    const bottomY = this.judgeLineY;
    const bottomWidth = canvasWidth * 0.9; // 底部宽度90%
    const bottomLeft = (canvasWidth - bottomWidth) / 2;
    
    // 绘制轨道图片（如果已加载）
    if (this.lanesImageLoaded && this.lanesImage) {
      ctx.save();
      
      // 计算梯形轨道的四个顶点
      const topRight = topLeft + topWidth;
      const bottomRight = bottomLeft + bottomWidth;
      
      // 使用clip裁剪为梯形
      ctx.beginPath();
      ctx.moveTo(topLeft, topY);
      ctx.lineTo(topRight, topY);
      ctx.lineTo(bottomRight, bottomY);
      ctx.lineTo(bottomLeft, bottomY);
      ctx.closePath();
      ctx.clip();
      
      // 绘制图片（填充整个梯形区域）
      ctx.drawImage(
        this.lanesImage,
        bottomLeft,
        topY,
        bottomWidth,
        bottomY - topY
      );
      
      ctx.restore();
    }
    
    // 绘制4条轨道
    for (let i = 0; i < 4; i++) {
      const laneTopLeft = topLeft + (topWidth / 4) * i;
      const laneTopRight = topLeft + (topWidth / 4) * (i + 1);
      const laneBottomLeft = bottomLeft + (bottomWidth / 4) * i;
      const laneBottomRight = bottomLeft + (bottomWidth / 4) * (i + 1);
      
      // 绘制轨道背景（梯形） - 已移除，让背景图完全可见
      // ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      // ctx.beginPath();
      // ctx.moveTo(laneTopLeft, topY);
      // ctx.lineTo(laneTopRight, topY);
      // ctx.lineTo(laneBottomRight, bottomY);
      // ctx.lineTo(laneBottomLeft, bottomY);
      // ctx.closePath();
      // ctx.fill();
      
      // 绘制轨道边界（发光线条） - 已隐藏，让轨道图片完全可见
      // ctx.strokeStyle = this.lanes[i].color;
      // ctx.lineWidth = 2;
      // ctx.shadowBlur = 10;
      // ctx.shadowColor = this.lanes[i].color;
      // ctx.beginPath();
      // ctx.moveTo(laneTopLeft, topY);
      // ctx.lineTo(laneBottomLeft, bottomY);
      // ctx.stroke();
      // 
      // ctx.beginPath();
      // ctx.moveTo(laneTopRight, topY);
      // ctx.lineTo(laneBottomRight, bottomY);
      // ctx.stroke();
      // 
      // ctx.shadowBlur = 0;
    }
  }
  
  /**
   * 渲染note
   */
  private renderNotes(): void {
    const ctx = this.ctx;
    const canvasWidth = this.canvas.width;
    
    // 轨道参数
    const topY = this.bossY;
    const bottomY = this.judgeLineY;
    const topWidth = canvasWidth * 0.3;
    const bottomWidth = canvasWidth * 0.9;
    const topLeft = (canvasWidth - topWidth) / 2;
    const bottomLeft = (canvasWidth - bottomWidth) / 2;
    
    for (const note of this.notes) {
      if (note.hit && note.judgement) continue; // 跳过已击中的note
      
      const progress = note.y; // 0=顶部，1=判定线
      
      // 计算note在轨道上的位置
      const currentY = topY + (bottomY - topY) * progress;
      const currentWidth = topWidth + (bottomWidth - topWidth) * progress;
      const currentLeft = topLeft + (bottomLeft - topLeft) * progress;
      
      const laneLeft = currentLeft + (currentWidth / 4) * note.lane;
      const laneRight = currentLeft + (currentWidth / 4) * (note.lane + 1);
      const laneCenterX = (laneLeft + laneRight) / 2;
      const laneWidth = laneRight - laneLeft;
      
      // Note尺寸（根据进度缩放）
      const noteWidth = laneWidth * 0.8;
      const noteHeight = 20 + progress * 30; // 从20px到50px
      
      // 绘制note（长条形，带发光）
      ctx.fillStyle = this.lanes[note.lane].color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.lanes[note.lane].color;
      ctx.fillRect(
        laneCenterX - noteWidth / 2,
        currentY - noteHeight / 2,
        noteWidth,
        noteHeight
      );
      ctx.shadowBlur = 0;
    }
  }
  
  /**
   * 渲染判定线（魔法阵）
   */
  private renderJudgeLine(): void {
    const ctx = this.ctx;
    const canvasWidth = this.canvas.width;
    const bottomWidth = canvasWidth * 0.9;
    const bottomLeft = (canvasWidth - bottomWidth) / 2;
    
    // 绘制4个魔法阵判定线
    for (let i = 0; i < 4; i++) {
      const laneLeft = bottomLeft + (bottomWidth / 4) * i;
      const laneRight = bottomLeft + (bottomWidth / 4) * (i + 1);
      const laneCenterX = (laneLeft + laneRight) / 2;
      const laneWidth = laneRight - laneLeft;
      
      // 魔法阵尺寸
      const circleSize = Math.min(laneWidth * 0.9, 120) * 1.5; // 放大50%
      
      // 如果魔法阵图片已加载，渲染魔法阵
      if (this.magicCirclesLoaded && this.magicCircles[i]) {
        ctx.save();
        
        // 移动到魔法阵中心
        ctx.translate(laneCenterX, this.judgeLineY);
        
        // 添加纵向压缩（透视效果）
        ctx.scale(1, 0.3);
        
        // 移除旋转动画，保持静止
        // ctx.rotate((this.magicCircleRotation * Math.PI) / 180);
        
        // 按键按下时增加发光效果
        if (this.keyPressed.has(this.lanes[i].key)) {
          ctx.shadowBlur = 30;
          ctx.shadowColor = this.lanes[i].color;
          ctx.globalAlpha = 1.0;
        } else {
          ctx.shadowBlur = 15;
          ctx.shadowColor = this.lanes[i].color;
          ctx.globalAlpha = 0.8;
        }
        
        // 绘制魔法阵图片
        ctx.drawImage(
          this.magicCircles[i],
          -circleSize / 2,
          -circleSize / 2,
          circleSize,
          circleSize
        );
        
        ctx.restore();
      } else {
        // 魔法阵未加载时，显示简单的圆形占位符
        ctx.fillStyle = this.keyPressed.has(this.lanes[i].key) 
          ? 'rgba(255, 255, 255, 0.3)' 
          : 'rgba(255, 255, 255, 0.1)';
        ctx.strokeStyle = this.lanes[i].color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.lanes[i].color;
        
        ctx.beginPath();
        ctx.arc(laneCenterX, this.judgeLineY, circleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.shadowBlur = 0;
      
      // 计算轨道的透视参数
      const topY = this.bossY;
      const topWidth = canvasWidth * 0.3;
      const topLeft = (canvasWidth - topWidth) / 2;
      const topLaneLeft = topLeft + (topWidth / 4) * i;
      const topLaneRight = topLeft + (topWidth / 4) * (i + 1);
      
      // 判定线位置（底部）
      const bottomLaneLeft = laneLeft;
      const bottomLaneRight = laneRight;
      
      // 绘制三层判定范围（从下到上：Perfect, Nice, Good） - 已隐藏
      // const perfectHeight = 40;
      // const niceHeight = 60;
      // const goodHeight = 80;
      // 
      // // Good范围（黄色，最上层）
      // const goodTopY = this.judgeLineY - perfectHeight - niceHeight - goodHeight;
      // const goodProgress = (goodTopY - topY) / (this.judgeLineY - topY);
      // const goodWidth = topWidth + (bottomWidth - topWidth) * goodProgress;
      // const goodLeft = (canvasWidth - goodWidth) / 2;
      // const goodLaneLeft = goodLeft + (goodWidth / 4) * i;
      // const goodLaneRight = goodLeft + (goodWidth / 4) * (i + 1);
      // 
      // ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
      // ctx.beginPath();
      // ctx.moveTo(goodLaneLeft, goodTopY);
      // ctx.lineTo(goodLaneRight, goodTopY);
      // ctx.lineTo(bottomLaneRight, this.judgeLineY - perfectHeight - niceHeight);
      // ctx.lineTo(bottomLaneLeft, this.judgeLineY - perfectHeight - niceHeight);
      // ctx.closePath();
      // ctx.fill();
      // 
      // // Nice范围（蓝色，中间层）
      // const niceTopY = this.judgeLineY - perfectHeight - niceHeight;
      // const niceProgress = (niceTopY - topY) / (this.judgeLineY - topY);
      // const niceWidth = topWidth + (bottomWidth - topWidth) * niceProgress;
      // const niceLeft = (canvasWidth - niceWidth) / 2;
      // const niceLaneLeft = niceLeft + (niceWidth / 4) * i;
      // const niceLaneRight = niceLeft + (niceWidth / 4) * (i + 1);
      // 
      // ctx.fillStyle = 'rgba(0, 150, 255, 0.25)';
      // ctx.beginPath();
      // ctx.moveTo(niceLaneLeft, niceTopY);
      // ctx.lineTo(niceLaneRight, niceTopY);
      // ctx.lineTo(bottomLaneRight, this.judgeLineY - perfectHeight);
      // ctx.lineTo(bottomLaneLeft, this.judgeLineY - perfectHeight);
      // ctx.closePath();
      // ctx.fill();
      // 
      // // Perfect范围（绿色，最下层）
      // const perfectTopY = this.judgeLineY - perfectHeight;
      // const perfectProgress = (perfectTopY - topY) / (this.judgeLineY - topY);
      // const perfectWidth = topWidth + (bottomWidth - topWidth) * perfectProgress;
      // const perfectLeft = (canvasWidth - perfectWidth) / 2;
      // const perfectLaneLeft = perfectLeft + (perfectWidth / 4) * i;
      // const perfectLaneRight = perfectLeft + (perfectWidth / 4) * (i + 1);
      // 
      // ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      // ctx.beginPath();
      // ctx.moveTo(perfectLaneLeft, perfectTopY);
      // ctx.lineTo(perfectLaneRight, perfectTopY);
      // ctx.lineTo(bottomLaneRight, this.judgeLineY);
      // ctx.lineTo(bottomLaneLeft, this.judgeLineY);
      // ctx.closePath();
      // ctx.fill();
      // 
      // // 绘制分界线（梯形）
      // ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      // ctx.lineWidth = 2;
      // 
      // // Perfect与Nice分界线
      // ctx.beginPath();
      // ctx.moveTo(perfectLaneLeft, perfectTopY);
      // ctx.lineTo(perfectLaneRight, perfectTopY);
      // ctx.stroke();
      // 
      // // Nice与Good分界线
      // ctx.beginPath();
      // ctx.moveTo(niceLaneLeft, niceTopY);
      // ctx.lineTo(niceLaneRight, niceTopY);
      // ctx.stroke();
      
      // 绘制按键提示
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.lanes[i].key, laneCenterX, this.judgeLineY);
    }
  }
  
  /**
   * 渲染判定结果文字
   */
  private renderJudgementText(): void {
    if (!this.currentJudgement) return;
    
    const now = Date.now();
    const elapsed = now - this.judgementDisplayTime;
    
    // 如果超过显示时间，清除判定结果
    if (elapsed > this.judgementDuration) {
      this.currentJudgement = null;
      return;
    }
    
    const ctx = this.ctx;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    
    // 计算透明度（淡入淡出）
    let alpha = 1.0;
    if (elapsed < 100) {
      // 淡入（0-100ms）
      alpha = elapsed / 100;
    } else if (elapsed > this.judgementDuration - 100) {
      // 淡出（最后100ms）
      alpha = (this.judgementDuration - elapsed) / 100;
    }
    
    // 根据判定类型设置颜色和文字
    let text: string;
    let color: string;
    let fontSize: number;
    
    switch (this.currentJudgement) {
      case 'perfect':
        text = 'PERFECT';
        color = `rgba(0, 255, 0, ${alpha})`;
        fontSize = 72;
        break;
      case 'nice':
        text = 'NICE';
        color = `rgba(0, 150, 255, ${alpha})`;
        fontSize = 64;
        break;
      case 'good':
        text = 'GOOD';
        color = `rgba(255, 255, 0, ${alpha})`;
        fontSize = 56;
        break;
      case 'miss':
        text = 'MISS';
        color = `rgba(255, 0, 0, ${alpha})`;
        fontSize = 48;
        break;
    }
    
    // 绘制文字（屏幕中央）
    ctx.save();
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 描边（黑色）
    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.strokeText(text, canvasWidth / 2, canvasHeight / 2);
    
    // 填充（彩色）
    ctx.fillStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);
    
    ctx.restore();
  }
  
  /**
   * 获取统计数据
   */
  public getStats() {
    return {
      perfect: this.perfectCount,
      nice: this.niceCount,
      good: this.goodCount,
      miss: this.missCount,
      combo: this.combo,
      maxCombo: this.maxCombo,
    };
  }
  
  /**
   * 获取音乐开始时间（用于BOSS延迟登场）
   */
  public getMusicStartTime(): number {
    return this.musicStartTime;
  }
  
  /**
   * 重置系统
   */
  public reset(): void {
    this.notes = [];
    this.nextNoteId = 0;
    this.perfectCount = 0;
    this.niceCount = 0;
    this.goodCount = 0;
    this.missCount = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.keyPressed.clear();
  }
  
  /**
   * 加载UI图片资源
   */
  private loadUIImages(): void {
    const imagePaths = {
      'ui-frame-player': '/ui/player-card-frame-transparent.png',
      'ui-frame-boss': '/ui/boss-card-frame-transparent.png',
      'ui-gramophone': '/ui/gramophone-transparent.png',
      'ui-music-notes': '/ui/music-notes-transparent.png',
      'ui-element-symbols': '/ui/element-circles-transparent.png',
    };
    
    let loadedCount = 0;
    const totalImages = Object.keys(imagePaths).length;
    
    Object.entries(imagePaths).forEach(([key, path]) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          this.imagesLoaded = true;
          console.log('[RhythmBossSystem] All UI images loaded');
        }
      };
      img.onerror = () => {
        console.warn(`[RhythmBossSystem] Failed to load UI image: ${path}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          this.imagesLoaded = true;
        }
      };
      img.src = path;
      this.uiImages.set(key, img);
    });
  }
  
  /**
   * 加载BOSS和玩家的序列帧动画
   */
  public async loadAnimations(): Promise<void> {
    try {
      const { AnimationPlayer } = await import('./AnimationPlayer');
      
      // 加载玩家序列帧动画
      const playerAnimationName = 'hero-idle';
      this.playerAnimationPlayer = new AnimationPlayer(playerAnimationName, '/animations');
      await this.playerAnimationPlayer.load();
      this.playerAnimationPlayer.play();
      console.log(`[RhythmBossSystem] Player animation loaded: ${playerAnimationName}`);
      
      // 加载BOSS序列帧动画
      // 注释：BOSS序列帧动画已删除，现在使用静态图
      /*
      const bossAnimationName = `boss-${this.bossType}-idle`;
      this.bossAnimationPlayer = new AnimationPlayer(bossAnimationName, '/animations');
      await this.bossAnimationPlayer.load();
      this.bossAnimationPlayer.play();
      console.log(`[RhythmBossSystem] BOSS animation loaded: ${bossAnimationName}`);
      */
    } catch (error) {
      console.error('[RhythmBossSystem] Failed to load animations:', error);
    }
  }
  
  /**
   * 更新UI状态
   */
  public updateUIState(state: {
    playerHealth?: number;
    bossHealth?: number;
    score?: number;
    currentTime?: number;
  }): void {
    if (state.playerHealth !== undefined) this.playerHealth = state.playerHealth;
    if (state.bossHealth !== undefined) this.bossHealth = state.bossHealth;
    if (state.score !== undefined) this.score = state.score;
    if (state.currentTime !== undefined) this.currentTime = state.currentTime;
  }
  
  /**
   * 渲染玩家信息卡
   */
  private renderPlayerCard(): void {
    if (!this.imagesLoaded) return;
    
    const ctx = this.ctx;
    const frameImg = this.uiImages.get('ui-frame-player');
    if (!frameImg) return;
    
    // 卡片位置和尺寸（参考设计图：左上角）
    const cardX = 20;
    const cardY = 80;
    const cardWidth = 220;
    const cardHeight = 140;
    
    // 绘制主角动画（在边框内部）
    if (this.playerAnimationPlayer) {
      const frame = this.playerAnimationPlayer.getCurrentFrame();
      if (frame) {
        const imgSize = 80;
        const imgX = cardX + (cardWidth - imgSize) / 2;
        const imgY = cardY + 30;
        ctx.drawImage(frame, imgX, imgY, imgSize, imgSize);
      }
    }
    
    // 绘制边框（覆盖在图片上方）
    ctx.drawImage(frameImg, cardX, cardY, cardWidth, cardHeight);
    
    // 绘制玩家名称（顶部）
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(this.playerName, cardX + cardWidth / 2, cardY + 20);
    ctx.shadowBlur = 0;
    
    // 绘制生命值（心形图标，底部）
    const heartSize = 18;
    const heartSpacing = 22;
    const heartsStartX = cardX + (cardWidth - this.playerMaxHealth * heartSpacing) / 2 + 10;
    const heartsY = cardY + cardHeight - 20;
    
    for (let i = 0; i < this.playerMaxHealth; i++) {
      const heartX = heartsStartX + i * heartSpacing;
      ctx.fillStyle = i < this.playerHealth ? '#ff0000' : '#666666';
      ctx.font = `${heartSize}px Arial`;
      ctx.fillText('❤️', heartX, heartsY);
    }
  }
  
  /**
   * 渲染BOSS信息卡
   */
  private renderBossCard(): void {
    if (!this.imagesLoaded) return;
    
    const ctx = this.ctx;
    const frameImg = this.uiImages.get('ui-frame-boss');
    if (!frameImg) return;
    
    const canvasWidth = this.canvas.width;
    
    // 卡片位置和尺寸（参考设计图：右上角）
    const cardWidth = 220;
    const cardHeight = 140;
    const cardX = canvasWidth - cardWidth - 20;
    const cardY = 80;
    
    // 绘制BOSS静态图（在边框内部）
    // 注释：暂时不在这里绘制BOSS，由gameEngine统一绘制
    /*
    if (this.bossAnimationPlayer) {
      const frame = this.bossAnimationPlayer.getCurrentFrame();
      if (frame) {
        const imgSize = 90;
        const imgX = cardX + (cardWidth - imgSize) / 2;
        const imgY = cardY + 25;
        ctx.drawImage(frame, imgX, imgY, imgSize, imgSize);
      }
    }
    */
    
    // 绘制边框（覆盖在动画上方）
    ctx.drawImage(frameImg, cardX, cardY, cardWidth, cardHeight);
    
    // 绘制BOSS名称（顶部）
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(this.bossName, cardX + cardWidth / 2, cardY + 20);
    ctx.shadowBlur = 0;
    
    // 绘制BOSS血条（底部）
    const barWidth = 180;
    const barHeight = 18;
    const barX = cardX + (cardWidth - barWidth) / 2;
    const barY = cardY + cardHeight - 30;
    
    // 血条背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 血条前景
    const healthPercent = this.bossHealth / this.bossMaxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // 血条边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // 血条文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`HP: ${this.bossHealth}/${this.bossMaxHealth}`, barX + barWidth / 2, barY + barHeight + 15);
  }
  
  /**
   * 渲染顶部进度条和分数
   */
  private renderTopBar(): void {
    const ctx = this.ctx;
    const canvasWidth = this.canvas.width;
    
    // 绘制彩虹进度条（顶部中央）
    const barWidth = 500;
    const barHeight = 25;
    const barX = (canvasWidth - barWidth) / 2;
    const barY = 10;
    
    // 进度条背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 彩虹进度
    const progress = Math.min(this.currentTime / this.songDuration, 1.0);
    const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(0.2, '#ff7f00');
    gradient.addColorStop(0.4, '#ffff00');
    gradient.addColorStop(0.6, '#00ff00');
    gradient.addColorStop(0.8, '#0000ff');
    gradient.addColorStop(1, '#8b00ff');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    
    // 进度条边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // 绘制分数（大号黄色数字，在进度条下方）
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(this.score.toString(), canvasWidth / 2, barY + barHeight + 45);
    ctx.fillText(this.score.toString(), canvasWidth / 2, barY + barHeight + 45);
    
    // 绘制Combo（青色数字，在分数下方）
    if (this.combo > 0) {
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 28px monospace';
      ctx.strokeText(`x${this.combo}`, canvasWidth / 2, barY + barHeight + 75);
      ctx.fillText(`x${this.combo}`, canvasWidth / 2, barY + barHeight + 75);
    }
  }
  
  /**
   * 渲染音乐装饰
   */
  private renderMusicDecoration(): void {
    if (!this.imagesLoaded) return;
    
    const ctx = this.ctx;
    const gramophoneImg = this.uiImages.get('ui-gramophone');
    const notesImg = this.uiImages.get('ui-music-notes');
    
    // 绘制留声机（左下角）
    if (gramophoneImg) {
      ctx.drawImage(gramophoneImg, 20, this.canvas.height - 100, 80, 80);
    }
    
    // 绘制音符装饰
    if (notesImg) {
      ctx.drawImage(notesImg, 110, this.canvas.height - 90, 120, 60);
    }
  }
  
  /**
   * 清理资源
   */
  public dispose(): void {
    // 移除键盘监听器（需要在实际使用时保存引用）
    this.notes = [];
    this.keyPressed.clear();
  }
}
