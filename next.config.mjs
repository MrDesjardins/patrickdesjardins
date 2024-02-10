/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'stackexchange.com',
        port: '',
        pathname: '/users/flair/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars0.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
    ],
  },
};

export default nextConfig;
