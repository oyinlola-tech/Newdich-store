import 'dotenv/config';
import { appConfig as baseAppConfig } from './app.config.js';
import { authConfig } from './auth.config.js';
import { databaseConfig } from './database.config.js';
import { emailConfig } from './email.config.js';
import { paymentConfig } from './payment.config.js';
import { shippingConfig } from './shipping.config.js';
import { storageConfig } from './storage.config.js';
import { cacheConfig } from './cache.config.js';
import { securityConfig } from './security.config.js';

export const appConfig = {
  ...baseAppConfig,
  ...authConfig,
  ...databaseConfig,
  ...emailConfig,
  ...paymentConfig,
  ...shippingConfig,
  ...storageConfig,
  ...cacheConfig,
  ...securityConfig
};

export type AppConfig = typeof appConfig;

export {
  baseAppConfig as appConfigBase,
  authConfig,
  databaseConfig,
  emailConfig,
  paymentConfig,
  shippingConfig,
  storageConfig,
  cacheConfig,
  securityConfig
};
