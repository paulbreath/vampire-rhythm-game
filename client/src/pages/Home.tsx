import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { newEquipmentManager } from '@/lib/newEquipmentManager';
import { toast } from 'sonner';

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-foreground/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-12 px-4">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl glow-red animate-pulse" style={{ fontFamily: 'Creepster, cursive' }}>
            VAMPIRE
          </h1>
          <h2 className="text-4xl md:text-6xl glow-purple" style={{ fontFamily: 'Creepster, cursive' }}>
            RHYTHM
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-6">
            Hybrid Hunter's Requiem
          </p>
        </div>

        {/* Menu buttons */}
        <div className="flex flex-col gap-6 items-center">
          <Button
            onClick={() => setLocation("/game")}
            className="pixel-button bg-primary text-primary-foreground hover:bg-primary/90 w-64"
          >
            START GAME
          </Button>
          
          <Button
            onClick={() => setLocation("/map")}
            className="pixel-button bg-secondary text-secondary-foreground hover:bg-secondary/90 w-64"
          >
            CASTLE MAP
          </Button>
          
          <Button
            onClick={() => setLocation("/stages")}
            className="pixel-button bg-secondary text-secondary-foreground hover:bg-secondary/90 w-64"
          >
            SELECT STAGE
          </Button>
          
          <Button
            onClick={() => setLocation("/equipment")}
            className="pixel-button bg-accent text-accent-foreground hover:bg-accent/90 w-64"
          >
            EQUIPMENT
          </Button>
          
          <Button
            onClick={() => setLocation("/leaderboard")}
            className="pixel-button bg-accent text-accent-foreground hover:bg-accent/90 w-64"
          >
            LEADERBOARD
          </Button>
          
          {/* 测试按钮：解锁所有装备 */}
          <Button
            onClick={() => {
              newEquipmentManager.unlockAll();
              toast.success('🎉 All equipment unlocked! (Test Mode)', {
                duration: 2000
              });
            }}
            className="pixel-button bg-destructive text-destructive-foreground hover:bg-destructive/90 w-64 text-xs"
          >
            🔓 UNLOCK ALL (TEST)
          </Button>
        </div>

        {/* Footer info */}
        <div className="text-xs text-muted-foreground space-y-2 mt-12">
          <p>Press START to begin your hunt</p>
          <p className="animate-pulse">🦇</p>
        </div>
      </div>

      {/* Blood drip effect */}
      <div className="blood-drip absolute top-0 left-0 right-0 h-32" />
    </div>
  );
}
