import logger from '../utils/logger';

interface RequiredEnvVars {
  [key: string]: {
    required: boolean;
    description: string;
  };
}

const requiredEnvVars: RequiredEnvVars = {
  // Database
  MONGODB_URI: { required: true, description: 'MongoDB connection string' },

  // JWT
  JWT_SECRET: { required: true, description: 'JWT signing secret' },
  JWT_REFRESH_SECRET: { required: true, description: 'JWT refresh token secret' },

  // Payment (Critical)
  RAZORPAY_KEY_ID: { required: true, description: 'Razorpay API Key ID' },
  RAZORPAY_KEY_SECRET: { required: true, description: 'Razorpay API Secret' },

  // Storage (Critical)
  R2_ACCOUNT_ID: { required: true, description: 'Cloudflare R2 Account ID' },
  R2_ACCESS_KEY_ID: { required: true, description: 'R2 Access Key' },
  R2_SECRET_ACCESS_KEY: { required: true, description: 'R2 Secret Key' },
  R2_BUCKET_NAME: { required: true, description: 'R2 Bucket Name' },
  R2_PUBLIC_URL: { required: true, description: 'R2 Public URL' },
  R2_ENDPOINT: { required: true, description: 'R2 Endpoint URL' },

  // Email
  EMAIL_HOST: { required: true, description: 'SMTP host' },
  EMAIL_USER: { required: true, description: 'SMTP username' },
  EMAIL_PASSWORD: { required: true, description: 'SMTP password' },
};

export const validateEnvironment = (): void => {
  logger.info('🔍 Validating environment variables...');

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];

    if (config.required && !value) {
      missing.push(`${key} (${config.description})`);
    } else if (config.required && value) {
      // Check for whitespace issues
      if (value !== value.trim()) {
        warnings.push(`${key} has leading/trailing whitespace`);
      }

      logger.info(`✓ ${key} is set (length: ${value.length})`);
    }
  }

  // Additional validation for specific formats
  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  if (r2PublicUrl && !r2PublicUrl.startsWith('http')) {
    warnings.push('R2_PUBLIC_URL should start with http:// or https://');
  }

  // Report findings
  if (warnings.length > 0) {
    logger.warn('⚠️  Environment variable warnings:');
    warnings.forEach(w => logger.warn(`  - ${w}`));
  }

  if (missing.length > 0) {
    logger.error('❌ Missing required environment variables:');
    missing.forEach(m => logger.error(`  - ${m}`));
    throw new Error(`Missing required environment variables: ${missing.map(m => m.split(' ')[0]).join(', ')}`);
  }

  logger.info('✅ Environment validation passed');
};
