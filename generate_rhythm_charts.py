#!/usr/bin/env python3
"""
4轨道节奏游戏打谱生成器
为DFJK四键节奏游戏生成高密度谱面
"""

import json
import random
import math

def generate_rhythm_chart(title, duration_seconds, bpm, difficulty="normal", output_file=None):
    """
    生成4轨道节奏游戏谱面
    
    Args:
        title: 歌曲标题
        duration_seconds: 歌曲时长（秒）
        bpm: 节拍数（每分钟）
        difficulty: 难度（easy/normal/hard/insane）
        output_file: 输出文件路径
    """
    
    # 计算每拍的时间间隔（秒）
    beat_interval = 60.0 / bpm
    
    # 根据难度设置音符密度
    density_config = {
        "easy": {
            "notes_per_beat": 0.5,  # 每拍0.5个音符（每2拍1个）
            "min_interval": 0.5,    # 最小间隔0.5秒
        },
        "normal": {
            "notes_per_beat": 1.0,  # 每拍1个音符
            "min_interval": 0.3,    # 最小间隔0.3秒
        },
        "hard": {
            "notes_per_beat": 2.0,  # 每拍2个音符
            "min_interval": 0.2,    # 最小间隔0.2秒
        },
        "insane": {
            "notes_per_beat": 3.0,  # 每拍3个音符
            "min_interval": 0.15,   # 最小间隔0.15秒
        }
    }
    
    config = density_config.get(difficulty, density_config["normal"])
    notes_per_beat = config["notes_per_beat"]
    min_interval = config["min_interval"]
    
    # 生成音符
    notes = []
    current_time = 1.0  # 从1秒开始，给玩家准备时间
    
    while current_time < duration_seconds - 1:
        # 随机选择轨道（1-4对应DFJK）
        lane = random.randint(1, 4)
        
        note = {
            "time": round(current_time, 3),
            "type": "normal",
            "lane": lane
        }
        notes.append(note)
        
        # 计算下一个音符的时间间隔
        # 基于BPM和难度，添加一些随机性
        base_interval = beat_interval / notes_per_beat
        interval = max(min_interval, base_interval * random.uniform(0.8, 1.2))
        current_time += interval
    
    # 按时间排序
    notes.sort(key=lambda x: x['time'])
    
    # 创建谱面数据
    chart = {
        "metadata": {
            "title": title,
            "artist": "Unknown",
            "bpm": bpm,
            "duration": duration_seconds,
            "difficulty": difficulty
        },
        "notes": notes
    }
    
    # 保存到文件
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(chart, f, indent=2, ensure_ascii=False)
        print(f"✅ Generated {output_file}")
    
    print(f"   📊 {len(notes)} notes, {duration_seconds}s, {bpm} BPM, {difficulty}")
    print(f"   ⏱️  Average interval: {duration_seconds/len(notes):.2f}s")
    
    return chart

if __name__ == '__main__':
    # 为Blood Moon Rises重新生成谱面
    print("🎵 Generating rhythm charts for Blood Moon Rises...")
    
    # Normal难度（目标：每秒2个音符 = 219秒 × 2 = 438个音符）
    generate_rhythm_chart(
        title="Blood Moon Rises",
        duration_seconds=219,
        bpm=130,
        difficulty="normal",
        output_file="client/public/charts/blood-moon-rises.json"
    )
    
    print("\n✨ Chart generation complete!")
