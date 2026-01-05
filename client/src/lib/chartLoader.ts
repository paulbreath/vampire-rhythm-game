/**
 * 谱面加载器
 * 加载和解析AI打谱系统生成的谱面数据
 */

export interface ChartNote {
  time: number; // 音符出现时间（秒）
  type: 'bat_blue' | 'bat_purple' | 'bat_red' | 'bat_yellow' | 'vampire' | 'bomb' | 'skeleton' | 'ghost' | 'werewolf' | 'medusa_head' | 'crow';
  x?: number; // X坐标（可选，如果没有则随机生成）
  y?: number; // Y坐标（可选）
  intensity?: number; // 音符强度（0-1）
}

export interface ChartData {
  metadata: {
    title: string;
    artist?: string;
    bpm: number;
    duration: number;
    difficulty: 'easy' | 'normal' | 'hard';
  };
  notes: ChartNote[];
}

export class ChartLoader {
  /**
   * 从URL加载谱面
   */
  static async loadFromURL(url: string): Promise<ChartData> {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return this.parseChart(data);
    } catch (error) {
      console.error('Failed to load chart:', error);
      throw error;
    }
  }
  
  /**
   * 从JSON字符串加载谱面
   */
  static loadFromJSON(jsonString: string): ChartData {
    try {
      const data = JSON.parse(jsonString);
      return this.parseChart(data);
    } catch (error) {
      console.error('Failed to parse chart JSON:', error);
      throw error;
    }
  }
  
  /**
   * 解析谱面数据
   */
  private static parseChart(data: any): ChartData {
    // 验证必需字段
    if (!data.metadata || !data.notes) {
      throw new Error('Invalid chart format: missing metadata or notes');
    }
    
    const chart: ChartData = {
      metadata: {
        title: data.metadata.title || 'Untitled',
        artist: data.metadata.artist,
        bpm: data.metadata.bpm || 120,
        duration: data.metadata.duration || 0,
        difficulty: data.metadata.difficulty || 'normal'
      },
      notes: []
    };
    
    // 解析音符
    for (const note of data.notes) {
      chart.notes.push({
        time: note.time || 0,
        type: this.mapNoteType(note.type),
        x: note.x,
        y: note.y,
        intensity: note.intensity || 0.5
      });
    }
    
    // 按时间排序
    chart.notes.sort((a, b) => a.time - b.time);
    
    return chart;
  }
  
  /**
   * 映射音符类型
   */
  private static mapNoteType(type: string): ChartNote['type'] {
    const typeMap: { [key: string]: ChartNote['type'] } = {
      'bat_blue': 'bat_blue',
      'bat_purple': 'bat_purple',
      'bat_red': 'bat_red',
      'bat_yellow': 'bat_yellow',
      'vampire': 'vampire',
      'bomb': 'bomb',
      // AI打谱系统的类型映射
      'light': 'bat_blue',
      'normal': 'bat_purple',
      'heavy': 'vampire',
      'special': 'bat_yellow',
      'danger': 'bomb'
    };
    
    return typeMap[type] || 'bat_blue';
  }
  
  /**
   * 生成测试谱面
   */
  static generateTestChart(duration: number = 60, bpm: number = 120): ChartData {
    const chart: ChartData = {
      metadata: {
        title: 'Test Chart',
        bpm,
        duration,
        difficulty: 'normal'
      },
      notes: []
    };
    
    const beatInterval = 60 / bpm; // 每拍的时间（秒）
    const numBeats = Math.floor(duration / beatInterval);
    
    // 每拍生成1-2个音符
    for (let i = 0; i < numBeats; i++) {
      const time = i * beatInterval;
      
      // 主音符
      chart.notes.push({
        time,
        type: this.getRandomNoteType(),
        intensity: 0.5 + Math.random() * 0.5
      });
      
      // 50%概率添加副音符
      if (Math.random() > 0.5) {
        chart.notes.push({
          time: time + beatInterval * 0.5,
          type: this.getRandomNoteType(),
          intensity: 0.3 + Math.random() * 0.4
        });
      }
    }
    
    return chart;
  }
  
  /**
   * 获取随机音符类型
   */
  private static getRandomNoteType(): ChartNote['type'] {
    const types: ChartNote['type'][] = ['bat_blue', 'bat_purple', 'bat_red', 'bat_yellow', 'vampire', 'skeleton', 'ghost', 'werewolf', 'medusa_head', 'crow'];
    const weights = [15, 15, 10, 10, 15, 10, 10, 5, 5, 5]; // 概率权重
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return types[i];
      }
    }
    
    return 'bat_blue';
  }
  
  /**
   * 验证谱面数据
   */
  static validateChart(chart: ChartData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!chart.metadata) {
      errors.push('Missing metadata');
    }
    
    if (!chart.notes || chart.notes.length === 0) {
      errors.push('No notes in chart');
    }
    
    if (chart.metadata && chart.metadata.bpm <= 0) {
      errors.push('Invalid BPM');
    }
    
    if (chart.notes) {
      for (let i = 0; i < chart.notes.length; i++) {
        const note = chart.notes[i];
        
        if (note.time < 0) {
          errors.push(`Note ${i}: negative time`);
        }
        
        if (!['bat_blue', 'bat_purple', 'bat_red', 'bat_yellow', 'vampire', 'bomb'].includes(note.type)) {
          errors.push(`Note ${i}: invalid type ${note.type}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
