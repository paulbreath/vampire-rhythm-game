import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Equipment() {
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
        <h1 className="text-4xl glow-red" style={{ fontFamily: 'Creepster, cursive' }}>
          EQUIPMENT
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {/* Weapons */}
          <div className="bg-card border-4 border-border p-6 space-y-4">
            <h3 className="text-2xl glow-gold" style={{ fontFamily: 'Creepster, cursive' }}>WEAPONS</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background border-2 border-border">
                <span>⚔️ Silver Sword</span>
                <Button
                  onClick={() => toast.info("Feature coming soon!")}
                  className="pixel-button bg-primary text-primary-foreground text-xs"
                  size="sm"
                >
                  EQUIP
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-background border-2 border-border opacity-50">
                <span>🗡️ Blood Blade</span>
                <Button
                  disabled
                  className="pixel-button text-xs"
                  size="sm"
                >
                  LOCKED
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-background border-2 border-border opacity-50">
                <span>🔪 Shadow Dagger</span>
                <Button
                  disabled
                  className="pixel-button text-xs"
                  size="sm"
                >
                  LOCKED
                </Button>
              </div>
            </div>
          </div>

          {/* Armor */}
          <div className="bg-card border-4 border-border p-6 space-y-4">
            <h3 className="text-2xl glow-purple" style={{ fontFamily: 'Creepster, cursive' }}>ARMOR</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background border-2 border-border">
                <span>🛡️ Leather Vest</span>
                <Button
                  onClick={() => toast.info("Feature coming soon!")}
                  className="pixel-button bg-primary text-primary-foreground text-xs"
                  size="sm"
                >
                  EQUIP
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-background border-2 border-border opacity-50">
                <span>🛡️ Chain Mail</span>
                <Button
                  disabled
                  className="pixel-button text-xs"
                  size="sm"
                >
                  LOCKED
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-background border-2 border-border opacity-50">
                <span>🛡️ Plate Armor</span>
                <Button
                  disabled
                  className="pixel-button text-xs"
                  size="sm"
                >
                  LOCKED
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-card border-4 border-border max-w-md">
          <h3 className="text-xl mb-4" style={{ fontFamily: 'Creepster, cursive' }}>CURRENT LOADOUT</h3>
          <div className="space-y-2 text-sm">
            <p>Weapon: ⚔️ Silver Sword</p>
            <p>Armor: 🛡️ Leather Vest</p>
            <p>Health: ❤️❤️❤️</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Unlock new equipment by completing stages
        </p>
      </div>
    </div>
  );
}
