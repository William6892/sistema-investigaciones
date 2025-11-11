/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 🔥 AGREGAR ESTA CONFIGURACIÓN
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Aumenta el límite a 10MB
    },
    responseLimit: '10mb',
  },
  
  // Opcional: Para aumentar límites en desarrollo
  experimental: {
    largePageDataBytes: 10 * 1024 * 1024, // 10MB
  },
}

module.exports = nextConfig;