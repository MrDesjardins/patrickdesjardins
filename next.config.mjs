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
    // Always null-loader .node files (especially sharp native bindings)
    config.module.rules.unshift({
      test: /\.node$/,
      use: "null-loader",
    });

    // Always alias sharp to noop — native bindings are never needed in a Next.js static export
    config.resolve.alias["sharp"] = path.resolve("./noop-sharp/index.js");

    if (!isServer) {
      // Alias 'onnxruntime-node' to noop in client bundle
      config.resolve.alias["onnxruntime-node"] = path.resolve(
        "./noop-onnxruntime-node/index.js",
      );
    } else {
      // Mark onnxruntime-node as external on server bundle
      config.externals.push({
        "onnxruntime-node": "commonjs onnxruntime-node",
      });
    }

    if (dev && isServer) {
      // Register _posts as a context dependency so webpack invalidates the
      // compilation whenever any MDX file is added, removed, or changed.
      config.plugins.push({
        apply(compiler) {
          compiler.hooks.thisCompilation.tap("MDXWatcher", (compilation) => {
            const postsDir = path.resolve(__dirname, "src/_posts");
            compilation.contextDependencies.add(postsDir);
          });
        },
      });
    }

    if (dev && !isServer) {
      config.watchOptions = {
        followSymlinks: false,
        ignored: [
          "**/.git/**",
          "**/node_modules/**",
          "**/.next/**",
          "**/public/**",
          "**/.DS_Store",
        ],
        poll: 1500,
        aggregateTimeout: 600,
      };
    }

    return config;
  },
};

export default nextConfig;
