import { LanguageCode } from '../i18n/translations';

export const EXPENSE_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  // Categories
  'Housing & Utilities': {
    en: 'Housing & Utilities',
    ar: 'الإسكان والمرافق',
    fr: 'Logement & Services',
    es: 'Vivienda y Servicios',
    de: 'Wohnen & Nebenkosten',
  },
  'Food & Groceries': {
    en: 'Food & Groceries',
    ar: 'المأكولات والبقالة',
    fr: 'Alimentation & Courses',
    es: 'Alimentos y Compras',
    de: 'Lebensmittel & Einkäufe',
  },
  'Transportation': {
    en: 'Transportation',
    ar: 'النقل والمواصلات',
    fr: 'Transport & Véhicules',
    es: 'Transporte y Movilidad',
    de: 'Transport & Mobilität',
  },
  'Entertainment & Leisure': {
    en: 'Entertainment & Leisure',
    ar: 'الترفيه والأنشطة',
    fr: 'Loisirs & Divertissement',
    es: 'Ocio y Entretenimiento',
    de: 'Unterhaltung & Freizeit',
  },
  'Healthcare & Wellness': {
    en: 'Healthcare & Wellness',
    ar: 'الرعاية الصحية والعافية',
    fr: 'Santé & Bien-être',
    es: 'Salud y Bienestar',
    de: 'Gesundheit & Vorsorge',
  },
  'Investments & Savings Buffer': {
    en: 'Investments & Savings Buffer',
    ar: 'الاستثمارات والاحتياطي المالي',
    fr: 'Investissements & Épargne',
    es: 'Inversiones y Ahorro',
    de: 'Investitionen & Rücklagen',
  },

  // Expense Items
  'Apartment Rent / Mortgage': {
    en: 'Apartment Rent / Mortgage',
    ar: 'إيجار الشقة / القسط العقاري',
    fr: 'Loyer / Prêt Immobilier',
    es: 'Alquiler / Hipoteca',
    de: 'Miete / Hypothek',
  },
  'Electricity & Gas Grid': {
    en: 'Electricity & Gas Grid',
    ar: 'فواتير الكهرباء والغاز',
    fr: 'Électricité & Gaz',
    es: 'Electricidad y Gas',
    de: 'Strom & Gas',
  },
  'Fiber Internet & Mobile': {
    en: 'Fiber Internet & Mobile',
    ar: 'إنترنت فايبر وباقة الجوال',
    fr: 'Internet Fibre & Mobile',
    es: 'Fibra Óptica y Móvil',
    de: 'Glasfaser Internet & Mobilfunk',
  },
  'Supermarket Groceries': {
    en: 'Supermarket Groceries',
    ar: 'مشتريات السوبرماركت والتموين',
    fr: 'Courses Supermarché',
    es: 'Compras de Supermercado',
    de: 'Supermarkt Einkäufe',
  },
  'Restaurants & Dining Out': {
    en: 'Restaurants & Dining Out',
    ar: 'المطاعم والوجبات الخارجية',
    fr: 'Restaurants & Sorties',
    es: 'Restaurantes y Cenas',
    de: 'Restaurants & Auswärtsessen',
  },
  'Vehicle Fuel & EV Charging': {
    en: 'Vehicle Fuel & EV Charging',
    ar: 'وقود السيارة وشحن الكهرباء',
    fr: 'Carburant & Recharge Électrique',
    es: 'Combustible y Carga Eléctrica',
    de: 'Kraftstoff & E-Laden',
  },
  'Auto Insurance & Parking': {
    en: 'Auto Insurance & Parking',
    ar: 'تأمين المركبة والمواقف',
    fr: 'Assurance Auto & Parking',
    es: 'Seguro de Coche y Parking',
    de: 'Kfz-Versicherung & Parken',
  },
  'Public Transit / Rideshare': {
    en: 'Public Transit / Rideshare',
    ar: 'المواصلات العامة وأوبر',
    fr: 'Transports en Commun & VTC',
    es: 'Transporte Público y VTC',
    de: 'Öffentlicher Nahverkehr & Taxi',
  },
  'Streaming & Software Subs': {
    en: 'Streaming & Software Subs',
    ar: 'اشتراكات البث والبرمجيات',
    fr: 'Abonnements Streaming & Logiciels',
    es: 'Suscripciones de Streaming y Software',
    de: 'Streaming & Software Abos',
  },
  'Fitness & Gym Membership': {
    en: 'Fitness & Gym Membership',
    ar: 'اشتراك النادي الرياضي واللياقة',
    fr: 'Abonnement Salle de Sport',
    es: 'Gimnasio y Fitness',
    de: 'Fitnessstudio Mitgliedschaft',
  },
  'Events, Concerts & Weekend Outings': {
    en: 'Events, Concerts & Weekend Outings',
    ar: 'الفعاليات والحفلات والأنشطة',
    fr: 'Événements & Sorties Week-end',
    es: 'Eventos y Salidas de Fin de Semana',
    de: 'Veranstaltungen & Wochenendausflüge',
  },
  'Health Insurance Premium': {
    en: 'Health Insurance Premium',
    ar: 'قسط التأمين الصحي',
    fr: 'Cotisation Assurance Santé',
    es: 'Seguro Médico Privado',
    de: 'Krankenversicherungsbeitrag',
  },
  'Pharmacy & Dental Care': {
    en: 'Pharmacy & Dental Care',
    ar: 'الأدوية والصيدلية وطب الأسنان',
    fr: 'Pharmacie & Soins Dentaires',
    es: 'Farmacia y Cuidados Dentales',
    de: 'Apotheke & Zahnarzt',
  },
  'Emergency Liquidity Fund': {
    en: 'Emergency Liquidity Fund',
    ar: 'صندوق الطوارئ والاحتياطي النقدي',
    fr: 'Fonds d\'Urgence Liquide',
    es: 'Fondo de Emergencia Líquido',
    de: 'Notfall-Liquiditätsreserve',
  },
  'Index Funds / Roth IRA Transfer': {
    en: 'Index Funds / Roth IRA Transfer',
    ar: 'صناديق الاستثمار والمؤشرات',
    fr: 'Fonds Indiciels & Investissement',
    es: 'Fondos Indexados e Inversión',
    de: 'Indexfonds & Sparplan',
  },

  // Inflow items
  'Primary Career Salary': {
    en: 'Primary Career Salary',
    ar: 'الراتب الوظيفي الأساسي',
    fr: 'Salaire Principal',
    es: 'Salario Principal',
    de: 'Hauptgehalt',
  },
  'Consulting & Advisory Retainer': {
    en: 'Consulting & Advisory Retainer',
    ar: 'عوائد الاستشارات والعمل الحر',
    fr: 'Contrat de Conseil & Freelance',
    es: 'Honorarios de Consultoría',
    de: 'Beratungshonorar & Freelance',
  },
  'Dividend & Yield Distribution': {
    en: 'Dividend & Yield Distribution',
    ar: 'توزيعات الأرباح والعوائد الاستثمارية',
    fr: 'Dividendes & Rendements',
    es: 'Dividendos y Rendimientos',
    de: 'Dividenden & Erträge',
  },
};

export function translateItemName(name: string, lang: string = 'en'): string {
  if (!name) return '';
  const item = EXPENSE_TRANSLATIONS[name];
  if (item && (item as any)[lang]) {
    return (item as any)[lang];
  }
  return name;
}
