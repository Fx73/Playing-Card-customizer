import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Playing Card Customizer',
  webDir: 'website/www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
