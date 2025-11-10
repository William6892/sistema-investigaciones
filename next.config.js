/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: false
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

module.exports = nextConfig