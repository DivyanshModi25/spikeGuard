/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://13.201.67.169/:path*', // Proxy to your backend
      },
    ];
  },
};

export default nextConfig;
