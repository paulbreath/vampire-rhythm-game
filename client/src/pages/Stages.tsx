import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Stages() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-4 border-b-2 border-border">
        <Button
          onClick={() => setLocation("/")}
          className="pixel-button bg-secondary text-secondary-foreground text-xs"
          size="sm"
        >
          BACK
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
        <h1 className="text-4xl glow-purple" style={{ fontFamily: 'Creepster, cursive' }}>
          SELECT STAGE
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {/* Graveyard */}
          <div className="bg-card border-4 border-border p-6 space-y-4">
            <div className="text-6xl">🪦</div>
            <h3 className="text-xl" style={{ fontFamily: 'Creepster, cursive' }}>GRAVEYARD</h3>
            <p className="text-xs text-muted-foreground">Haunted cemetery under moonlight</p>
            <Button
              onClick={() => toast.info("Feature coming soon!")}
              className="pixel-button bg-primary text-primary-foreground w-full"
            >
              PLAY
            </Button>
          </div>

          {/* Castle */}
          <div className="bg-card border-4 border-border p-6 space-y-4">
            <div className="text-6xl">🏰</div>
            <h3 className="text-xl" style={{ fontFamily: 'Creepster, cursive' }}>CASTLE</h3>
            <p className="text-xs text-muted-foreground">Vampire lord's dark fortress</p>
            <Button
              onClick={() => toast.info("Feature coming soon!")}
              className="pixel-button bg-primary text-primary-foreground w-full"
            >
              PLAY
            </Button>
          </div>

          {/* Cathedral */}
          <div className="bg-card border-4 border-border p-6 space-y-4">
            <div className="text-6xl">⛪</div>
            <h3 className="text-xl" style={{ fontFamily: 'Creepster, cursive' }}>CATHEDRAL</h3>
            <p className="text-xs text-muted-foreground">Gothic church of eternal night</p>
            <Button
              onClick={() => toast.info("Feature coming soon!")}
              className="pixel-button bg-primary text-primary-foreground w-full"
            >
              PLAY
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          More stages coming soon...
        </p>
      </div>
    </div>
  );
}
