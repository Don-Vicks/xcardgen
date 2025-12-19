import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['konva', 'react-konva'],
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    return config
  },
  images: {
    qualities: [100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
