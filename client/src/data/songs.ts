// 歌曲元数据配置
export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number; // 秒
  difficulty: 'easy' | 'normal' | 'hard';
  audioPath: string;
  chartPath: string;
  coverImage?: string;
  description?: string;
}

export const SONGS: SongMetadata[] = [
  {
    id: 'nocturnal-hunger',
    title: 'Nocturnal Hunger',
    artist: 'AI Composer',
    bpm: 140,
    duration: 157,
    difficulty: 'normal',
    audioPath: '/audio/NocturnalHunger.mp3',
    chartPath: '/charts/NocturnalHunger.json',
    description: '原版吸血鬼之夜',
  },
  {
    id: 'electric-stardust',
    title: 'Electric Stardust',
    artist: 'AI Composer',
    bpm: 129,
    duration: 121,
    difficulty: 'normal',
    audioPath: '/audio/ElectricStardust.mp3',
    chartPath: '/charts/ElectricStardust.json',
    description: '电子星尘',
  },
  {
    id: 'nocturnal-hunger-2',
    title: 'Nocturnal Hunger II',
    artist: 'AI Composer',
    bpm: 89,
    duration: 228,
    difficulty: 'normal',
    audioPath: '/audio/NocturnalHunger2.mp3',
    chartPath: '/charts/NocturnalHunger2.json',
    description: '吸血鬼之夜 第二章',
  },
  {
    id: 'nocturnal-hunger-3',
    title: 'Nocturnal Hunger III',
    artist: 'AI Composer',
    bpm: 99,
    duration: 180,
    difficulty: 'normal',
    audioPath: '/audio/NocturnalHunger3.mp3',
    chartPath: '/charts/NocturnalHunger3.json',
    description: '吸血鬼之夜 第三章',
  },
  {
    id: 'nocturnal-hunger-4',
    title: 'Nocturnal Hunger IV',
    artist: 'AI Composer',
    bpm: 118,
    duration: 210,
    difficulty: 'normal',
    audioPath: '/audio/NocturnalHunger4.mp3',
    chartPath: '/charts/NocturnalHunger4.json',
    description: '吸血鬼之夜 第四章',
  },
  {
    id: 'nocturnal-hunger-5',
    title: 'Nocturnal Hunger V',
    artist: 'AI Composer',
    bpm: 89,
    duration: 200,
    difficulty: 'normal',
    audioPath: '/audio/NocturnalHunger5.mp3',
    chartPath: '/charts/NocturnalHunger5.json',
    description: '吸血鬼之夜 第五章',
  },
  {
    id: 'electric-shadows-whispering-doom',
    title: 'Electric Shadows Whispering Doom',
    artist: 'AI Composer',
    bpm: 125,
    duration: 240, // 4:00
    difficulty: 'normal',
    audioPath: '/music/ElectricShadowsWhisperingDoom.mp3',
    chartPath: '/charts/electric-shadows-whispering-doom.json',
    description: '墓地的电子阴影',
  },
  {
    id: 'eternal-bloodlust',
    title: 'Eternal Bloodlust',
    artist: 'AI Composer',
    bpm: 140,
    duration: 267, // 4:27
    difficulty: 'hard',
    audioPath: '/music/EternalBloodlust.mp3',
    chartPath: '/charts/eternal-bloodlust.json',
    description: '永恒的嗜血',
  },
];

// 根据ID获取歌曲
export function getSongById(id: string): SongMetadata | undefined {
  return SONGS.find((song) => song.id === id);
}

// 根据难度筛选歌曲
export function getSongsByDifficulty(difficulty: 'easy' | 'normal' | 'hard'): SongMetadata[] {
  return SONGS.filter((song) => song.difficulty === difficulty);
}
