import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`), for more information see:
// https://github.com/cloudflare/next-on-pages/blob/main/internal-packages/next-dev/README.md
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_BACKEND_URL: process.env.NEXT_BACKEND_URL,
    MAPTILER_API_KEY: process.env.MAPTILER_API_KEY
    // Add other environment variables here as needed
  },
};

export default nextConfig;
