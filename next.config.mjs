/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stackexchange.com",
        port: "",
        pathname: "/users/flair/**",
      },
      {
        protocol: "https",
        hostname: "avatars0.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
    ],
  },
  output: "export",
};

export default nextConfig;
