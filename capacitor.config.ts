import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vamprhythm.game',
  appName: 'Blood Rhapsody',
  webDir: 'client/dist',
  server: {
    url: 'https://vampirerhythm.vip',
    cleartext: true
  }
};

export default config;
