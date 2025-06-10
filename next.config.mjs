/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  // GitHub Pages specific configuration
  basePath: process.env.GITHUB_ACTIONS ? '/Happy-Birthday-Varsha' : '',
  assetPrefix: process.env.GITHUB_ACTIONS ? '/Happy-Birthday-Varsha/' : '',
}

export default nextConfig
