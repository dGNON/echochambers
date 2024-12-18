/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use webpack config to disable HMR in production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.hot = false;
    }
    return config;
  },
  
  // API rewrites
  async rewrites() {
    return process.env.NODE_ENV === 'development' 
      ? [
          {
            source: '/api/:path*',
            destination: 'http://localhost:3001/api/:path*',
          },
        ]
      : [];
  },
}

export default nextConfig;
