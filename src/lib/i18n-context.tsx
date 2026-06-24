"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

const TRANSLATIONS = {
  es: {
    // Navigation
    nav_principal: 'Principal',
    nav_inteligencia: 'Inteligencia',
    nav_administracion: 'Administración',
    nav_dashboard: 'Dashboard',
    nav_empresas: 'Empresas',
    nav_plantas: 'Plantas',
    nav_prensas: 'Prensas',
    nav_oportunidades: 'Oportunidades',
    nav_reportes: 'Reportes y Análisis',
    nav_analisis: 'Análisis',
    nav_usuarios: 'Usuarios',
    nav_catalogos: 'Catálogos',
    nav_configuracion: 'Configuración',
    nav_cerrar_sesion: 'Cerrar sesión',
    
    // Auth & General
    welcome: 'Bienvenido',
    login_sub: 'Ingresa con tu cuenta corporativa',
    email: 'Correo electrónico',
    password: 'Contraseña',
    login_btn: 'Iniciar sesión',
    loading: 'Cargando plataforma...',
    save: 'Guardar',
    saved: 'Guardado con éxito',
    cancel: 'Cancelar',
    new: 'Nuevo',
    add: 'Agregar',
    edit: 'Editar',
    delete: 'Eliminar',
    search: 'Buscar...',
    actions: 'Acciones',
    status: 'Estado',
    country: 'País',
    city: 'Ciudad',
    completitud: 'Completitud',
    potencial_mes: 'Potencial/mes',
    potencial_anual: 'Potencial anual',
    consultor: 'Consultor',
    no_results: 'No se encontraron resultados',
    
    // Dashboards & Analytics
    dashboard_global: 'Dashboard Global',
    dashboard_sub: 'Vista ejecutiva · Cartera completa de extrusión de aluminio',
    kpi_potencial_total: 'Potencial Total Anual',
    kpi_potencial_captado: 'Potencial Captado',
    kpi_wallet_capture: 'Wallet Capture',
    kpi_oportunidades_activas: 'Oportunidades Activas',
    kpi_empresas: 'Empresas en Cartera',
    kpi_plantas: 'Plantas Mapeadas',
    kpi_prensas: 'Prensas Registradas',
    kpi_captura_prom: 'Captura Promedio',
    dist_pais: 'Distribución por País',
    apps_frecuentes: 'Aplicaciones Más Frecuentes',
    top_oportunidades: 'Top Oportunidades por Empresa',
    
    // Plant / Press Form
    progreso: 'Progreso',
    seccion_1: 'Sección 1 — Datos Generales de la Prensa',
    seccion_2: 'Sección 2 — Corte de Barra (Hot Shear [corte de barra/billet con cizalla] / Hot Saw [corte de barra/billet en caliente])',
    seccion_3: 'Sección 3 — Extrusión de Tocho',
    seccion_4: 'Sección 4 — Sierra de Corte en Caliente + Puller / Jalador',
    seccion_5: 'Sección 5 — Mesa de Tensado (Stretcher)',
    seccion_6: 'Sección 6 — Corte de Perfil en Frío',
    seccion_7: 'Sección 7 — Horno de Envejecimiento',
    seccion_8: 'Sección 8 — Observaciones y Proyectos Nuevos',
    guardar_seccion: 'Guardar Sección',
    finalizar_ficha: 'Guardar Sección y Finalizar Ficha',
  },
  en: {
    // Navigation
    nav_principal: 'Core',
    nav_inteligencia: 'Intelligence',
    nav_administracion: 'Administration',
    nav_dashboard: 'Dashboard',
    nav_empresas: 'Companies',
    nav_plantas: 'Plants',
    nav_prensas: 'Presses',
    nav_oportunidades: 'Opportunities',
    nav_reportes: 'Reports & Analytics',
    nav_analisis: 'Analysis',
    nav_usuarios: 'Users',
    nav_catalogos: 'Catalogs',
    nav_configuracion: 'Configuration',
    nav_cerrar_sesion: 'Log out',
    
    // Auth & General
    welcome: 'Welcome',
    login_sub: 'Log in with your corporate account',
    email: 'Email address',
    password: 'Password',
    login_btn: 'Log in',
    loading: 'Loading platform...',
    save: 'Save',
    saved: 'Saved successfully',
    cancel: 'Cancel',
    new: 'New',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search...',
    actions: 'Actions',
    status: 'Status',
    country: 'Country',
    city: 'City',
    completitud: 'Completeness',
    potencial_mes: 'Potential/month',
    potencial_anual: 'Potential annual',
    consultor: 'Consultant',
    no_results: 'No results found',
    
    // Dashboards & Analytics
    dashboard_global: 'Global Dashboard',
    dashboard_sub: 'Executive view · Global Aluminum Extrusion Portfolio',
    kpi_potencial_total: 'Total Annual Potential',
    kpi_potencial_captado: 'Captured Potential',
    kpi_wallet_capture: 'Wallet Capture',
    kpi_oportunidades_activas: 'Active Opportunities',
    kpi_empresas: 'Portfolio Companies',
    kpi_plantas: 'Mapped Plants',
    kpi_prensas: 'Registered Presses',
    kpi_captura_prom: 'Average Capture',
    dist_pais: 'Distribution by Country',
    apps_frecuentes: 'Most Frequent Applications',
    top_oportunidades: 'Top Opportunities by Company',
    
    // Plant / Press Form
    progreso: 'Progress',
    seccion_1: 'Section 1 — Press General Info',
    seccion_2: 'Section 2 — Bar Cutting (Hot Shear [corte de barra/billet con cizalla] / Hot Saw [corte de barra/billet en caliente])',
    seccion_3: 'Section 3 — Billet Extrusion',
    seccion_4: 'Section 4 — Hot Profile Saw + Puller',
    seccion_5: 'Section 5 — Stretching Table (Stretcher)',
    seccion_6: 'Section 6 — Cold Profile Saw (Room Temp)',
    seccion_7: 'Section 7 — Aging Oven (Thermal Treatment)',
    seccion_8: 'Section 8 — General Observations & New Projects',
    guardar_seccion: 'Save Section',
    finalizar_ficha: 'Save Section & Finish Form',
  }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof TRANSLATIONS.es) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const stored = localStorage.getItem('interlub_lang') as Language;
    if (stored === 'es' || stored === 'en') {
      setTimeout(() => {
        setLanguage(stored);
      }, 0);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'es' ? 'en' : 'es';
      localStorage.setItem('interlub_lang', next);
      return next;
    });
  };

  const t = (key: keyof typeof TRANSLATIONS.es): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['es'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
