/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      // Agregar dominio de Supabase Storage cuando se use
      'abcdefghijk.supabase.co', // Reemplazar con tu proyecto
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

module.exports = nextConfig