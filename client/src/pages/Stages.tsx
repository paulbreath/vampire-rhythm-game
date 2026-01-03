import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { SONGS, type SongMetadata } from "@/data/songs";

export default function Stages() {
  const [, setLocation] = useLocation();

  const handleStageClick = (song: SongMetadata) => {
    // 跳转到游戏页面，并传递歌曲ID
    setLocation(`/game?song=${song.id}`);
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {SONGS.map((song) => (
            <div
              key={song.id}
              className="bg-card border-4 border-border p-6 space-y-4 hover:border-primary transition-colors cursor-pointer"
              onClick={() => handleStageClick(song)}
            >
              <div className="text-6xl">🦇</div>
              <h3 className="text-xl" style={{ fontFamily: 'Creepster, cursive' }}>
                {song.title}
              </h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{song.artist}</p>
                <p>
                  {song.bpm} BPM • {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </p>
                <p>{song.description}</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary">
                  {song.difficulty.toUpperCase()}
                </span>
              </div>
              <Button
                className="pixel-button bg-primary text-primary-foreground w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStageClick(song);
                }}
              >
                PLAY
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          {SONGS.length} stages available • More coming soon...
        </p>
      </div>
    </div>
  );
}
