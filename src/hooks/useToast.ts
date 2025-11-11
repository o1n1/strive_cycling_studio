// src/hooks/useToast.ts
import { toast } from 'sonner'

export const useToast = () => {
  return {
    exito: (mensaje: string) => {
      toast.success(mensaje, {
        duration: 3000,
        style: {
          background: 'rgba(34, 197, 94, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          color: '#ffffff',
        },
      })
    },

    error: (mensaje: string) => {
      toast.error(mensaje, {
        duration: 4000,
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ffffff',
        },
      })
    },

    info: (mensaje: string) => {
      toast.info(mensaje, {
        duration: 3000,
        style: {
          background: 'rgba(59, 130, 246, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          color: '#ffffff',
        },
      })
    },

    cargando: (mensaje: string) => {
      return toast.loading(mensaje, {
        style: {
          background: 'rgba(234, 179, 8, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          color: '#ffffff',
        },
      })
    },

    promesa: async <T,>(
      promesa: Promise<T>,
      mensajes: {
        cargando: string
        exito: string
        error: string
      }
    ) => {
      return toast.promise(promesa, {
        loading: mensajes.cargando,
        success: mensajes.exito,
        error: mensajes.error,
        style: {
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
        },
      })
    },
  }
}