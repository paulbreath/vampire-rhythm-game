#!/usr/bin/env python3
"""
为新音乐生成谱面数据
基于现有的NocturnalHunger.json，调整时长和BPM
"""

import json
import random

def generate_chart(title, artist, duration_seconds, bpm, output_file):
    """生成谱面数据"""
    
    # 计算每拍的时间间隔（秒）
    beat_interval = 60.0 / bpm
    
    # 生成音符
    notes = []
    current_time = 0.5  # 从0.5秒开始
    
    bat_types = ['bat_purple', 'bat_blue', 'bat_green', 'bat_red']
    
    # 每0.5-1.5秒生成一个音符
    while current_time < duration_seconds - 2:
        note = {
            "time": round(current_time, 3),
            "type": random.choice(bat_types),
            "position": {
                "x": random.randint(100, 700),
                "y": random.randint(50, 300)
            },
            "strength": round(random.uniform(0.0, 1.0), 2)
        }
        notes.append(note)
        
        # 随机间隔0.5-1.5秒
        current_time += random.uniform(0.5, 1.5)
    
    # 每30秒添加一个BOSS
    boss_time = 30.0
    while boss_time < duration_seconds - 10:
        boss_note = {
            "time": round(boss_time, 3),
            "type": "boss",
            "position": {
                "x": random.randint(400, 600),
                "y": random.randint(100, 250)
            },
            "strength": 1.0
        }
        notes.append(boss_note)
        boss_time += 60.0  # 每60秒一个BOSS
    
    # 按时间排序
    notes.sort(key=lambda x: x['time'])
    
    # 创建谱面数据
    chart = {
        "metadata": {
            "title": title,
            "artist": artist,
            "difficulty": "normal",
            "bpm": bpm,
            "duration": duration_seconds,
            "generated_by": "VampireAutoCharter v2.0"
        },
        "notes": notes
    }
    
    # 保存到文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(chart, f, indent=2, ensure_ascii=False)
    
    print(f"Generated {output_file}: {len(notes)} notes, duration={duration_seconds}s, bpm={bpm}")

if __name__ == '__main__':
    # 墓地场景 - ElectricShadowsWhisperingDoom (4:00 = 240秒)
    generate_chart(
        title="Electric Shadows Whispering Doom",
        artist="Unknown Artist",
        duration_seconds=240,
        bpm=95.0,
        output_file="/home/ubuntu/vampire-rhythm-game/client/public/charts/electric-shadows-whispering-doom.json"
    )
    
    # 城堡场景 - EternalBloodlust (4:27 = 267秒)
    generate_chart(
        title="Eternal Bloodlust",
        artist="Unknown Artist",
        duration_seconds=267,
        bpm=110.0,
        output_file="/home/ubuntu/vampire-rhythm-game/client/public/charts/eternal-bloodlust.json"
    )
    
    print("\nAll charts generated successfully!")
