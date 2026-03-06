import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['img.daisyui.com', 'reqres.in'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
