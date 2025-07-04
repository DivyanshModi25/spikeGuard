/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://13.233.178.82/:path*', // Proxy to your backend
      },
    ];
  },
};

export default nextConfig;
