# Development Environment Fix

## Critical Issue Resolution

Your project has configuration conflicts between Vite and Vercel. Here's how to fix:

### 1. Update package.json Scripts

**REQUIRED ACTION**: You need to manually update your `package.json` scripts section to:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build", 
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui", 
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "ingest": "tsx src/ingest/ingest.ts"
  }
}
```

### 2. API Function Development

Since you're using `/api/*.ts` files (Vercel-style), but running with Vite, you have two options:

#### Option A: Use Vite Proxy (Recommended for Local Dev)
Add this to your `vite.config.ts`:

```typescript
export default defineConfig(({ mode }) => ({
  // ... existing config
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Run a separate API server
        changeOrigin: true,
      },
    },
  },
}));
```

#### Option B: Use Vercel CLI (If You Want Full Vercel Environment)
1. Install Vercel CLI: `npm install -g vercel`
2. Change dev script back to: `"dev": "vercel dev"`
3. Install missing types: `npm install -D @vercel/node`

### 3. Fixed TypeScript Configuration

I've updated your TypeScript configuration to remove Vercel-specific types that were causing errors.

### 4. Current Setup

The project is now configured to:
- ✅ Use 768-dimensional embeddings
- ✅ Work with Vite for frontend development  
- ✅ Support your existing API structure
- ✅ Pass TypeScript compilation

### 5. Quick Start

After updating package.json scripts:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Ingest resume data
npm run ingest -- --path=./resumeData.json
```

### 6. Deployment

For production deployment to Vercel:
- The `/api/*.ts` files will work automatically
- Ensure all environment variables are set
- The build will use the corrected configuration

The main issue was that your dev environment was trying to use Vercel CLI (which isn't installed) instead of Vite. This fix maintains your API structure while using Vite for development.
