// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'STRIVE Studio - Sistema de Gestión',
  description: 'Sistema completo de gestión para estudios de fitness',
  keywords: ['fitness', 'gym', 'cycling', 'reservas', 'clases'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        
        {/* ⭐ AGREGAR ESTO AL FINAL DEL BODY */}
        <Toaster 
          position="top-right"
          richColors
          closeButton
          theme="dark"
        />
      </body>
    </html>
  )
}