import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  output: "export",
  webpack: (config, { dev, isServer }) => {
    console.log("Webpack build, isServer =", isServer);

    // Always null-loader .node files (especially sharp native bindings)
    config.module.rules.unshift({
      test: /\.node$/,
      use: "null-loader",
    });

    if (!isServer) {
      // Alias 'onnxruntime-node' to noop in client bundle
      config.resolve.alias["onnxruntime-node"] = path.resolve(
        "./noop-onnxruntime-node/index.js",
      );

      // Alias sharp to noop in client bundle
      config.resolve.alias["sharp"] = path.resolve("./noop-sharp/index.js");
    } else {
      // Mark onnxruntime-node as external on server bundle
      config.externals.push({
        "onnxruntime-node": "commonjs onnxruntime-node",
      });
    }

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
