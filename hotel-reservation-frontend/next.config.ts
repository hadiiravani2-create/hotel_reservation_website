// next.config.js
// version: 0.0.4

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOSTNAME,
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOSTNAME,
        pathname: '/media/**',
      },
    ],
  },
};

module.exports = nextConfig;
