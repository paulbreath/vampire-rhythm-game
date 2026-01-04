#!/usr/bin/env python3
from PIL import Image
import os

# 优化sprite sheet图片大小
def optimize_image(input_path, output_path, quality=85):
    print(f"Optimizing {input_path}...")
    img = Image.open(input_path)
    
    # 如果是RGBA模式，保持透明度
    if img.mode == 'RGBA':
        img.save(output_path, 'PNG', optimize=True, compress_level=9)
    else:
        img.save(output_path, 'PNG', optimize=True, quality=quality)
    
    # 检查文件大小
    original_size = os.path.getsize(input_path) / (1024 * 1024)
    optimized_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  Original: {original_size:.2f}MB")
    print(f"  Optimized: {optimized_size:.2f}MB")
    print(f"  Saved: {(original_size - optimized_size):.2f}MB ({((original_size - optimized_size) / original_size * 100):.1f}%)")

# 优化两个sprite sheet
base_path = "/home/ubuntu/vampire-rhythm-game/client/public/images/characters"

optimize_image(
    f"{base_path}/blade-warrior-idle-spritesheet.png",
    f"{base_path}/blade-warrior-idle-spritesheet.png"
)

optimize_image(
    f"{base_path}/blade-warrior-attack-spritesheet.png",
    f"{base_path}/blade-warrior-attack-spritesheet.png"
)

print("\nOptimization complete!")
