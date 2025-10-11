// next.config.js
// version: 0.0.4
/** @type {import('next').NextConfig} */
const nextConfig = {
  // FIX: Adding the internal IP to remotePatterns as the API response in search results 
  // might be returning absolute paths using this IP, which is listed in Django's ALLOWED_HOSTS.
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'hotel.mirisafar.com',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'hotel.mirisafar.com',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '2.180.44.137',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '2.180.44.137',
        pathname: '/media/**',
      },
      // Pattern for the demo domain
      {
        protocol: 'http',
        hostname: 'demo.mirisafar.com',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'demo.mirisafar.com',
        pathname: '/media/**',
      },
      // ADDED: Pattern for the internal development IP
      {
        protocol: 'http',
        hostname: '192.168.10.131',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '192.168.10.131',
        pathname: '/media/**',
      },
    ],
  },
};

module.exports = nextConfig;
