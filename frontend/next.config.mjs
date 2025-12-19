/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['konva', 'react-konva'],
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    return config
  },
  images: {
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
