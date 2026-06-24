import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format percentage
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

// Status colors
export const statusColors = {
  cliente_activo: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  prospecto: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  ex_cliente: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  completa: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  en_progreso: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  pendiente: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  activa: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  inactiva: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  en_mantenimiento: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  lubricada_interlub: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  lubricada_competencia: 'bg-red-500/15 text-red-400 border-red-500/30',
  sin_lubricar: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  desconocido: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

export const statusLabels: Record<string, string> = {
  cliente_activo: 'Cliente Activo',
  prospecto: 'Prospecto',
  ex_cliente: 'Ex-cliente',
  completa: 'Completa',
  en_progreso: 'En Progreso',
  pendiente: 'Pendiente',
  activa: 'Activa',
  inactiva: 'Inactiva',
  en_mantenimiento: 'En Mantenimiento',
  lubricada_interlub: 'Interlub',
  lubricada_competencia: 'Competencia',
  sin_lubricar: 'Sin lubricar',
  desconocido: 'Desconocido',
  direccion: 'Dirección',
  coordinador: 'Coordinador',
  consultor: 'Consultor',
  sin_cubrir: 'Sin cubrir',
  con_competencia: 'Con competencia',
  parcialmente_cubierta: 'Parcialmente cubierta',
  equipo_ro3: 'Oportunidad RO3',
}
