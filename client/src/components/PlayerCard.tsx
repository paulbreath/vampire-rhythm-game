import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { playerProfileManager, AVATAR_OPTIONS, type PlayerProfile } from '@/lib/playerProfile';

interface PlayerCardProps {
  onProfileUpdate?: (profile: PlayerProfile) => void;
}

export function PlayerCard({ onProfileUpdate }: PlayerCardProps) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    const loadedProfile = playerProfileManager.loadProfile();
    setProfile(loadedProfile);
    setEditName(loadedProfile.name);
  }, []);

  const handleNameSave = () => {
    if (profile && editName.trim()) {
      const newProfile = playerProfileManager.updateName(profile, editName.trim());
      setProfile(newProfile);
      setIsEditing(false);
      onProfileUpdate?.(newProfile);
    }
  };

  const handleAvatarChange = (avatar: string) => {
    if (profile) {
      const newProfile = playerProfileManager.updateAvatar(profile, avatar);
      setProfile(newProfile);
      setShowAvatarPicker(false);
      onProfileUpdate?.(newProfile);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  const levelProgress = (profile.experience / (100 * profile.level)) * 100;

  return (
    <div className="bg-card border-4 border-border p-6 space-y-4">
      {/* Avatar and Name */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="relative w-20 h-20 flex items-center justify-center bg-primary/20 border-4 border-primary rounded-lg cursor-pointer hover:scale-110 transition-transform"
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
        >
          <span className="text-4xl">{profile.avatar}</span>
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full border-2 border-background">
            Lv.{profile.level}
          </div>
        </div>

        {/* Name */}
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 bg-background border-2 border-border px-3 py-2 text-sm"
                maxLength={20}
                autoFocus
              />
              <Button
                onClick={handleNameSave}
                className="pixel-button bg-primary text-primary-foreground text-xs"
                size="sm"
              >
                SAVE
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(profile.name);
                }}
                className="pixel-button bg-secondary text-secondary-foreground text-xs"
                size="sm"
              >
                CANCEL
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-2xl" style={{ fontFamily: 'Creepster, cursive' }}>
                {profile.name}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                ✏️ Edit
              </button>
            </div>
          )}

          {/* Level Progress Bar */}
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Level {profile.level}</span>
              <span>{profile.experience} / {100 * profile.level} EXP</span>
            </div>
            <div className="w-full h-2 bg-muted border border-border">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Picker */}
      {showAvatarPicker && (
        <div className="border-2 border-border p-4 bg-background">
          <p className="text-xs text-muted-foreground mb-2">Choose your avatar:</p>
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => handleAvatarChange(avatar)}
                className={`
                  w-12 h-12 flex items-center justify-center text-2xl
                  border-2 transition-all hover:scale-110
                  ${profile.avatar === avatar 
                    ? 'border-primary bg-primary/20' 
                    : 'border-border bg-card hover:border-primary'
                  }
                `}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{profile.totalScore.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Score</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{profile.totalKills.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Enemies Slain</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{profile.achievements.length}</p>
          <p className="text-xs text-muted-foreground">Achievements</p>
        </div>
      </div>
    </div>
  );
}
