/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://13.233.129.226/:path*', // Proxy to your backend
      },
    ];
  },
};

export default nextConfig;
