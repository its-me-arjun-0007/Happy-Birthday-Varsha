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
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/Happy-Birthday-Varsha' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Happy-Birthday-Varsha/' : '',
}

export default nextConfig
