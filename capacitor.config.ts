import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartlearning.app',
  appName: '智慧学习整理系统',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      signingType: 'jks',
      keystorePath: './keystore.jks',
      keystoreAlias: 'smart-learning',
      keystorePassword: '',
      keyPassword: '',
      releaseType: 'apk'
    }
  }
};

export default config;
