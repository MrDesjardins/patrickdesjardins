import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  output: "export",
  webpack: (config, { dev, isServer }) => {
    config.externals.push({
      "onnxruntime-node": "commonjs onnxruntime-node",
    });
    config.module.rules.push({
      test: /\.node$/,
      use: "null-loader", // or 'file-loader' if needed
    });

    if (dev && !isServer) {
      config.watchOptions = {
        followSymlinks: false,
        ignored: [
          "**/.git/**",
          "**/node_modules/**",
          "**/.next/**",
          "**/src/_posts/**",
          "**/public/**",
          "**/.DS_Store",
          "**/*.md",
        ],
        poll: 5000,
        aggregateTimeout: 600,
      };
    }
    return config;
  },
};

export default nextConfig;
