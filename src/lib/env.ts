import { z } from 'zod';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env files
// Try multiple locations for different environments
config({ path: '.env.local' });
config({ path: '.env' });
config({ path: join(process.cwd(), '.env.local') });
config({ path: join(process.cwd(), '.env') });

const envSchema = z.object({
  GOOGLE_AI_API_KEY: z.string().min(1, 'GOOGLE_AI_API_KEY is required'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required').optional(),
  CORS_ALLOW_ORIGINS: z.string().default('https://ilanklimberg.com,http://localhost:8080'),
  DAILY_QUERY_CAP: z.coerce.number().int().positive().default(10),
});

// Debug: Log what environment variables are available
const availableVars = Object.keys(process.env).filter(key => 
  ['GOOGLE_AI_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'].includes(key)
);
console.log('🔍 Available environment variables:', availableVars);

// Check if required vars are missing
const missingVars = ['GOOGLE_AI_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY']
  .filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('💡 Make sure you have a .env.local file with these variables');
  console.error('💡 Copy env.example to .env.local and fill in your values');
}

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error('❌ Invalid environment variables:', envParse.error.flatten().fieldErrors);
  console.error('💡 Check your .env.local file format');
  throw new Error('Invalid environment variables');
}

export const env = envParse.data;

export const corsOrigins = env.CORS_ALLOW_ORIGINS.split(',').map(origin => origin.trim());