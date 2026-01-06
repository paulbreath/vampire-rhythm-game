import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// 剧情内容
const storyScenes = [
  {
    id: 1,
    text: "在德古拉城堡的阴影下，一个混血猎人踏上了复仇之路...",
    textEn: "In the shadow of Dracula's Castle, a dhampir hunter embarks on a path of vengeance...",
  },
  {
    id: 2,
    text: "他的名字叫阿鲁卡多，德古拉之子，却选择与黑暗为敌。",
    textEn: "His name is Alucard, son of Dracula, yet he chose to stand against the darkness.",
  },
  {
    id: 3,
    text: "手持家族的圣剑，他将用音乐的节奏，斩杀一切邪恶。",
    textEn: "Wielding his family's holy blade, he shall slay all evil to the rhythm of music.",
  },
  {
    id: 4,
    text: "废弃教堂，是他旅途的起点...",
    textEn: "The Abandoned Church marks the beginning of his journey...",
  },
];

export default function Story() {
  const [, setLocation] = useLocation();
  const [currentScene, setCurrentScene] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // 打字机效果
  useEffect(() => {
    if (currentScene >= storyScenes.length) {
      // 剧情结束，跳转到废弃教堂关卡
      setFadeOut(true);
      setTimeout(() => {
        setLocation('/game?stage=abandoned-church&difficulty=normal');
      }, 1000);
      return;
    }

    const scene = storyScenes[currentScene];
    const fullText = scene.text;
    let charIndex = 0;
    setDisplayedText('');
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.substring(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50); // 每50ms显示一个字符

    return () => clearInterval(typingInterval);
  }, [currentScene, setLocation]);

  // 点击继续或跳过
  const handleClick = () => {
    if (isTyping) {
      // 如果正在打字，直接显示完整文本
      setDisplayedText(storyScenes[currentScene].text);
      setIsTyping(false);
    } else {
      // 进入下一个场景
      setCurrentScene(prev => prev + 1);
    }
  };

  // 跳过剧情
  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => {
      setLocation('/game?stage=abandoned-church&difficulty=normal');
    }, 500);
  };

  return (
    <div 
      className={`min-h-screen bg-black flex flex-col items-center justify-center p-8 cursor-pointer transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClick}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-black to-black" />
        {/* 飘动的粒子效果 */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 剧情文字 */}
      <div className="relative z-10 max-w-2xl text-center">
        <p 
          className="text-2xl md:text-3xl text-red-100 leading-relaxed"
          style={{ 
            fontFamily: '"Creepster", cursive',
            textShadow: '0 0 20px rgba(220, 38, 38, 0.5), 0 0 40px rgba(220, 38, 38, 0.3)',
            letterSpacing: '0.05em',
          }}
        >
          {displayedText}
          {isTyping && <span className="animate-pulse">|</span>}
        </p>

        {/* 英文副标题 */}
        {!isTyping && currentScene < storyScenes.length && (
          <p 
            className="mt-6 text-lg text-gray-400 italic animate-fade-in"
            style={{ fontFamily: 'serif' }}
          >
            {storyScenes[currentScene].textEn}
          </p>
        )}
      </div>

      {/* 提示文字 */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-gray-500 text-sm animate-pulse">
          {isTyping ? '点击跳过...' : '点击继续...'}
        </p>
      </div>

      {/* 跳过按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute top-4 right-4 px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 rounded transition-colors"
        style={{ fontFamily: '"Press Start 2P", cursive' }}
      >
        SKIP
      </button>

      {/* 进度指示器 */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
        {storyScenes.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentScene ? 'bg-red-500' : index < currentScene ? 'bg-red-800' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
