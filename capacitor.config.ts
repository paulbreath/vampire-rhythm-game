import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vamprhythm.game',
  appName: 'Blood Rhapsody',
  webDir: 'client/dist',
  server: {
    url: 'https://3000-izrah8ksxvgw9hkmqj2ku-746ed23b.us2.manus.computer',
    cleartext: true
  }
};

export default config;
