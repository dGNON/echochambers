/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use webpack config to disable HMR in production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.hot = false;
    }
    return config;
  },
  
  // Enable experimental typed routes
  experimental: {
    typedRoutes: true
  },
  
  // API rewrites
  async rewrites() {
    const roomsPort = 3031;
    const pluginsPort = 3032;

    return process.env.NODE_ENV === 'development' 
      ? [
          {
            source: '/api/rooms/:path*',
            destination: `http://127.0.0.1:${roomsPort}/api/rooms/:path*`
          },
          {
            source: '/api/plugins/:path*',
            destination: `http://127.0.0.1:${pluginsPort}/api/plugins/:path*`
          }
        ]
      : [];
  }
}

export default nextConfig;
