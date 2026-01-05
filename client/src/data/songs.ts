// 歌曲元数据配置
export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number; // 秒
  difficulty: 'normal' | 'hard' | 'insane';
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
    difficulty: 'insane',
    audioPath: '/music/EternalBloodlust.mp3',
    chartPath: '/charts/eternal-bloodlust.json',
    description: '永恒的嗜血',
  },
  {
    id: 'blood-moon-rises',
    title: 'Blood Moon Rises',
    artist: 'AI Composer',
    bpm: 130,
    duration: 219, // 3:39
    difficulty: 'normal',
    audioPath: '/music/BloodMoonRises.mp3',
    chartPath: '/charts/blood-moon-rises.json',
    description: '血月升起 - 地下墓穴的恐怖',
  },
  {
    id: 'blood-moon-rises-2',
    title: 'Blood Moon Rises II',
    artist: 'AI Composer',
    bpm: 135,
    duration: 289, // 4:49
    difficulty: 'normal',
    audioPath: '/music/BloodMoonRises2.mp3',
    chartPath: '/charts/blood-moon-rises-2.json',
    description: '血月升起 第二章 - 古老陵墓的诗篇',
  },
  {
    id: 'battle-of-the-highlands',
    title: 'Battle of the Highlands',
    artist: 'AI Composer',
    bpm: 145,
    duration: 350, // 5:49
    difficulty: 'insane',
    audioPath: '/music/BattleoftheHighlands.mp3',
    chartPath: '/charts/battle-of-the-highlands.json',
    description: '高地之战 - 王座厅的史诗决战',
  },
  {
    id: 'highlands-breath',
    title: "Highland's Breath",
    artist: 'AI Composer',
    bpm: 120,
    duration: 223, // 3:43
    difficulty: 'normal',
    audioPath: '/music/HighlandsBreath.mp3',
    chartPath: '/charts/highlands-breath.json',
    description: '高地之息 - 诅咒森林的呼唤',
  },
  {
    id: 'electric-shadows-whispering-doom-2',
    title: 'Electric Shadows Whispering Doom II',
    artist: 'AI Composer',
    bpm: 128,
    duration: 215, // 3:34
    difficulty: 'normal',
    audioPath: '/music/ElectricShadowsWhisperingDoom2.mp3',
    chartPath: '/charts/electric-shadows-whispering-doom-2.json',
    description: '电子阴影 第二章 - 禁忌图书馆的秘密',
  },
  {
    id: 'witches-parade-assassin',
    title: 'Witches Parade Assassin',
    artist: 'AI Composer',
    bpm: 135,
    duration: 140, // 2:20
    difficulty: 'normal',
    audioPath: '/music/WitchesParadeAssassin.mp3',
    chartPath: '/charts/witches-parade-assassin.json',
    description: '女巫游行刺客 - 神秘的钟楼',
  },
  {
    id: 'cathedral-of-hollow-echoes',
    title: 'Cathedral of Hollow Echoes',
    artist: 'AI Composer',
    bpm: 120,
    duration: 190, // 3:10
    difficulty: 'normal',
    audioPath: '/music/CathedralofHollowEchoes.mp3',
    chartPath: '/charts/cathedral-of-hollow-echoes.json',
    description: '空洞回声的教堂 - 地下墓穴的回音',
  },
  {
    id: 'cathedral-of-blood-and-bone',
    title: 'Cathedral of Blood and Bone',
    artist: 'AI Composer',
    bpm: 130,
    duration: 197, // 3:17
    difficulty: 'normal',
    audioPath: '/music/CathedralofBloodandBone.mp3',
    chartPath: '/charts/cathedral-of-blood-and-bone.json',
    description: '鲜血与白骨的教堂 - 炼金实验室的恐怖',
  },
  {
    id: 'crimson-moon-siege',
    title: 'Crimson Moon Siege',
    artist: 'AI Composer',
    bpm: 140,
    duration: 212, // 3:32
    difficulty: 'insane',
    audioPath: '/music/CrimsonMoonSiege.mp3',
    chartPath: '/charts/crimson-moon-siege.json',
    description: '猩红月亮围城 - 迷雾墓地的最终战',
  },
];

// 根据ID获取歌曲
export function getSongById(id: string): SongMetadata | undefined {
  return SONGS.find((song) => song.id === id);
}

// 根据难度筛选歌曲
export function getSongsByDifficulty(difficulty: 'normal' | 'hard' | 'insane'): SongMetadata[] {
  return SONGS.filter((song) => song.difficulty === difficulty);
}
