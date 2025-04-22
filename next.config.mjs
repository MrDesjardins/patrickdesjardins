import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  output: "export",
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        followSymlinks: false,
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/.next/**',
          '**/src/_posts/**',
          '**/public/**',
          '**/.DS_Store',
          '**/*.md'
        ],
        poll: 5000,
        aggregateTimeout: 600,
      };
    }
    return config;
  },
};

export default nextConfig;
