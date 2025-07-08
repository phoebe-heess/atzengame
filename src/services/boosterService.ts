export interface Booster {
  id: string;
  name: string;
  description: string;
  type: 'booster';
  icon: string;
  color: string;
  duration?: number; // in seconds
}

class BoosterService {
  private activeBooster: Booster | null = null;
  private boosterStartTime: number | null = null;

  // Single booster type - matching Atzenwin
  private readonly booster: Booster = {
    id: 'booster-1',
    name: 'Booster',
    description: 'Du hast einen Booster gewonnen!',
    type: 'booster',
    icon: '🚀',
    color: '#d69229', // Atzenwin orange
  };

  getRandomBooster(): Booster | null {
    // 20% chance to win a booster
    if (Math.random() < 0.2) {
      return this.booster;
    }
    return null;
  }

  activateBooster(booster: Booster, userId?: string): void {
    this.activeBooster = booster;
    this.boosterStartTime = Date.now();
    
    // Store in localStorage for persistence
    localStorage.setItem('activeBooster', JSON.stringify({
      booster,
      startTime: this.boosterStartTime,
      userId
    }));
  }

  getActiveBooster(): Booster | null {
    if (!this.activeBooster) {
      // Try to restore from localStorage
      const stored = localStorage.getItem('activeBooster');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          this.activeBooster = data.booster;
          this.boosterStartTime = data.startTime;
        } catch (error) {
          console.error('Failed to parse stored booster:', error);
        }
      }
    }
    return this.activeBooster;
  }

  getBoosterTimeRemaining(): number | null {
    if (!this.activeBooster || !this.boosterStartTime) {
      return null;
    }

    const elapsed = (Date.now() - this.boosterStartTime) / 1000;
    const remaining = (this.activeBooster.duration || 30) - elapsed;
    
    if (remaining <= 0) {
      this.clearActiveBooster();
      return null;
    }
    
    return Math.max(0, remaining);
  }

  clearActiveBooster(): void {
    this.activeBooster = null;
    this.boosterStartTime = null;
    localStorage.removeItem('activeBooster');
  }

  clearExpiredBoosters(): void {
    const remaining = this.getBoosterTimeRemaining();
    if (remaining === null) {
      this.clearActiveBooster();
    }
  }

  isBoosterActive(): boolean {
    return this.getActiveBooster() !== null && this.getBoosterTimeRemaining() !== null;
  }
}

export const boosterService = new BoosterService(); 