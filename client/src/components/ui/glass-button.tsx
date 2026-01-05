import React from 'react';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function GlassButton({ 
  children, 
  onClick, 
  className = "", 
  icon,
  variant = 'primary',
  size = 'md'
}: GlassButtonProps) {
  
  const sizeClasses = {
    sm: 'h-12 text-base md:text-lg',
    md: 'h-16 text-lg md:text-xl',
    lg: 'h-20 text-xl md:text-2xl'
  };

  const variantStyles = {
    primary: {
      bg: 'from-red-900/70 via-red-800/80 to-red-900/70 group-hover:from-red-800/80 group-hover:via-red-700/90 group-hover:to-red-800/80',
      border: 'border-yellow-600 group-hover:border-yellow-400',
      shadow: '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.2)'
    },
    secondary: {
      bg: 'from-purple-900/70 via-purple-800/80 to-purple-900/70 group-hover:from-purple-800/80 group-hover:via-purple-700/90 group-hover:to-purple-800/80',
      border: 'border-purple-400 group-hover:border-purple-300',
      shadow: '0 0 20px rgba(138, 43, 226, 0.4), inset 0 0 20px rgba(138, 43, 226, 0.2)'
    },
    danger: {
      bg: 'from-gray-800/70 via-gray-700/80 to-gray-800/70 group-hover:from-gray-700/80 group-hover:via-gray-600/90 group-hover:to-gray-700/80',
      border: 'border-gray-500 group-hover:border-gray-400',
      shadow: '0 0 15px rgba(128, 128, 128, 0.3), inset 0 0 15px rgba(128, 128, 128, 0.2)'
    }
  };

  const style = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden ${sizeClasses[size]} ${className}`}
      style={{ fontFamily: '"Press Start 2P", cursive' }}
    >
      {/* 血红玻璃背景 */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${style.bg} backdrop-blur-sm transition-all duration-300`}
        style={{
          boxShadow: 'inset 0 0 30px rgba(139, 0, 0, 0.5)',
        }}
      />
      
      {/* 金色边框 */}
      <div 
        className={`absolute inset-0 border-4 ${style.border} transition-colors duration-300 rounded-lg`}
        style={{
          boxShadow: style.shadow,
        }}
      />
      
      {/* 顶部高光 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-lg" />
      
      {/* 悬停发光效果 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)',
        }}
      />
      
      {/* 文字内容 */}
      <div className="relative z-10 flex items-center justify-center gap-3 h-full px-6">
        {icon && (
          <span className="text-2xl md:text-3xl drop-shadow-lg">{icon}</span>
        )}
        <span 
          className="font-bold text-white group-hover:text-yellow-50 transition-colors duration-300"
          style={{
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          {children}
        </span>
      </div>
      
      {/* 装饰角 - 蝙蝠翅膀 */}
      {variant === 'primary' && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-600 group-hover:text-yellow-400 transition-colors text-2xl drop-shadow-lg">
          🦇
        </div>
      )}
    </button>
  );
}
