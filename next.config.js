
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/jogo',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src * 'self'; frame-ancestors 'self'; default-src 'self';"
          }
        ]
      }
    ]
  },
  images: {
    domains: ['www.retrogames.cc'], // Adicione outros domínios conforme necessário
  }
}

module.exports = nextConfig