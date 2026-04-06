import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type LanguageCode = 'es' | 'en-US' | 'zh' | 'vi';

interface Translations {
  // Bottom bar
  ordersInQueue: string;
  sort: string;
  sortByTime: string;
  sortByTable: string;
  sortByType: string;
  grid: string;
  horizontal: string;
  stagger: string;

  // Sidebar
  menu: string;
  home: string;
  history: string;
  alerts: string;
  settings: string;
  newOrders: string;
  inProgress: string;
  hideCompleted: string;
  switchToPOS: string;

  // Order card
  products: string;
  hasAllergens: string;
  seen: string;
  done: string;

  // Empty state
  queueClear: string;
  lastOrderServed: string;
  ordersServed: string;
  avgTicketTime: string;
  fastestTicket: string;

  // History
  today: string;
  yesterday: string;
  last7Days: string;
  searchPlaceholder: string;
  noOrdersServed: string;
  recalled: string;

  // Settings
  display: string;
  orders: string;
  hardware: string;
  account: string;
  displayMode: string;
  cardsPerRow: string;
  textSize: string;
  statusColours: string;
  customiseStatusColours: string;
  theme: string;
  light: string;
  dark: string;
  compact: string;
  standard: string;
  large: string;
  categoryFilter: string;
  manageCategories: string;
  revenueCenterFilter: string;
  manageStationFilters: string;
  staggerMode: string;
  configureRelease: string;
  servableModifiers: string;
  showAllergenBadges: string;
  sortDefault: string;
  byTime: string;
  byTable: string;
  byType: string;
  mainPrintingDevice: string;
  soundSettings: string;
  volumeAndAlerts: string;
  connection: string;
  wsAndSync: string;
  deviceName: string;
  language: string;
  devMode: string;
  showFlowSelector: string;
  logOut: string;
  logOutConfirm: string;
  logOutDescription: string;
  cancel: string;
  saveChanges: string;

  // Language modal
  languageRegion: string;
  languageScope: string;
  appInterface: string;
  menuItems: string;
  both: string;
  searchLanguages: string;
  moreLanguages: string;
  regionalFormat: string;
  dateFormat: string;
  timeFormat: string;
}

const translations: Record<LanguageCode, Translations> = {
  'en-US': {
    ordersInQueue: 'Orders in Queue',
    sort: 'Sort',
    sortByTime: 'By Time',
    sortByTable: 'By Table',
    sortByType: 'By Type',
    grid: 'Grid',
    horizontal: 'Horizontal',
    stagger: 'Stagger',
    menu: 'Menu',
    home: 'Home',
    history: 'History',
    alerts: 'Alerts',
    settings: 'Settings',
    newOrders: 'New Orders',
    inProgress: 'In Progress',
    hideCompleted: 'Hide Completed',
    switchToPOS: 'Switch to POS',
    products: 'products',
    hasAllergens: 'has allergens',
    seen: 'SEEN',
    done: 'DONE',
    queueClear: 'Queue is clear, great work!',
    lastOrderServed: 'Last order served at 2:34 PM - 48 orders completed today',
    ordersServed: 'Orders Served',
    avgTicketTime: 'Avg Ticket Time',
    fastestTicket: 'Fastest Ticket',
    today: 'Today',
    yesterday: 'Yesterday',
    last7Days: 'Last 7 Days',
    searchPlaceholder: 'Search order, table, server...',
    noOrdersServed: 'No orders served yet today',
    recalled: 'recalled and added to queue',
    display: 'DISPLAY',
    orders: 'ORDERS',
    hardware: 'HARDWARE',
    account: 'ACCOUNT',
    displayMode: 'Display Mode',
    cardsPerRow: 'Cards Per Row',
    textSize: 'Text Size',
    statusColours: 'Status Colours',
    customiseStatusColours: 'Customise order status colours',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    compact: 'Compact',
    standard: 'Standard',
    large: 'Large',
    categoryFilter: 'Category Filter',
    manageCategories: 'Manage active categories',
    revenueCenterFilter: 'Revenue Center Filter',
    manageStationFilters: 'Manage station filters',
    staggerMode: 'Stagger Mode',
    configureRelease: 'Configure release schedule',
    servableModifiers: 'Servable Modifiers',
    showAllergenBadges: 'Show Allergen Badges',
    sortDefault: 'Sort Default',
    byTime: 'By Time',
    byTable: 'By Table',
    byType: 'By Type',
    mainPrintingDevice: 'Main Printing Device',
    soundSettings: 'Sound Settings',
    volumeAndAlerts: 'Volume and alert sounds',
    connection: 'Connection',
    wsAndSync: 'WebSocket and sync settings',
    deviceName: 'Device Name',
    language: 'Language',
    devMode: 'Dev Mode',
    showFlowSelector: 'Show flow selector on login',
    logOut: 'LOG OUT',
    logOutConfirm: 'Log Out?',
    logOutDescription: 'You will be returned to the sign-in screen. Any unsaved settings will be lost.',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    languageRegion: 'Language & Region',
    languageScope: 'Language Scope',
    appInterface: 'App Interface',
    menuItems: 'Menu Items',
    both: 'Both',
    searchLanguages: 'Search languages...',
    moreLanguages: 'More languages coming soon',
    regionalFormat: 'Regional Format',
    dateFormat: 'Date Format',
    timeFormat: 'Time Format',
  },
  es: {
    ordersInQueue: 'Pedidos en cola',
    sort: 'Ordenar',
    sortByTime: 'Por tiempo',
    sortByTable: 'Por mesa',
    sortByType: 'Por tipo',
    grid: 'Cuadricula',
    horizontal: 'Horizontal',
    stagger: 'Escalonado',
    menu: 'Menu',
    home: 'Inicio',
    history: 'Historial',
    alerts: 'Alertas',
    settings: 'Ajustes',
    newOrders: 'Nuevos pedidos',
    inProgress: 'En progreso',
    hideCompleted: 'Ocultar completados',
    switchToPOS: 'Cambiar a POS',
    products: 'productos',
    hasAllergens: 'tiene alergenos',
    seen: 'VISTO',
    done: 'LISTO',
    queueClear: 'Cola vacia, buen trabajo!',
    lastOrderServed: 'Ultimo pedido servido a las 2:34 PM - 48 pedidos completados hoy',
    ordersServed: 'Pedidos servidos',
    avgTicketTime: 'Tiempo promedio',
    fastestTicket: 'Mas rapido',
    today: 'Hoy',
    yesterday: 'Ayer',
    last7Days: 'Ultimos 7 dias',
    searchPlaceholder: 'Buscar pedido, mesa, mesero...',
    noOrdersServed: 'Sin pedidos servidos hoy',
    recalled: 'recuperado y agregado a la cola',
    display: 'PANTALLA',
    orders: 'PEDIDOS',
    hardware: 'HARDWARE',
    account: 'CUENTA',
    displayMode: 'Modo de pantalla',
    cardsPerRow: 'Tarjetas por fila',
    textSize: 'Tamano de texto',
    statusColours: 'Colores de estado',
    customiseStatusColours: 'Personalizar colores de estado',
    theme: 'Tema',
    light: 'Claro',
    dark: 'Oscuro',
    compact: 'Compacto',
    standard: 'Estandar',
    large: 'Grande',
    categoryFilter: 'Filtro de categoria',
    manageCategories: 'Gestionar categorias activas',
    revenueCenterFilter: 'Filtro de centro de ingresos',
    manageStationFilters: 'Gestionar filtros de estacion',
    staggerMode: 'Modo escalonado',
    configureRelease: 'Configurar calendario de lanzamiento',
    servableModifiers: 'Modificadores servibles',
    showAllergenBadges: 'Mostrar insignias de alergenos',
    sortDefault: 'Orden predeterminado',
    byTime: 'Por tiempo',
    byTable: 'Por mesa',
    byType: 'Por tipo',
    mainPrintingDevice: 'Impresora principal',
    soundSettings: 'Ajustes de sonido',
    volumeAndAlerts: 'Volumen y alertas de sonido',
    connection: 'Conexion',
    wsAndSync: 'Configuracion de WebSocket y sincronizacion',
    deviceName: 'Nombre del dispositivo',
    language: 'Idioma',
    devMode: 'Modo desarrollo',
    showFlowSelector: 'Mostrar selector de flujo al iniciar',
    logOut: 'CERRAR SESION',
    logOutConfirm: 'Cerrar sesion?',
    logOutDescription: 'Volvera a la pantalla de inicio de sesion. Los ajustes no guardados se perderan.',
    cancel: 'Cancelar',
    saveChanges: 'Guardar cambios',
    languageRegion: 'Idioma y region',
    languageScope: 'Alcance del idioma',
    appInterface: 'Interfaz de la app',
    menuItems: 'Elementos del menu',
    both: 'Ambos',
    searchLanguages: 'Buscar idiomas...',
    moreLanguages: 'Mas idiomas proximamente',
    regionalFormat: 'Formato regional',
    dateFormat: 'Formato de fecha',
    timeFormat: 'Formato de hora',
  },
  zh: {
    ordersInQueue: '排队订单',
    sort: '排序',
    sortByTime: '按时间',
    sortByTable: '按桌号',
    sortByType: '按类型',
    grid: '网格',
    horizontal: '水平',
    stagger: '交错',
    menu: '菜单',
    home: '首页',
    history: '历史',
    alerts: '提醒',
    settings: '设置',
    newOrders: '新订单',
    inProgress: '进行中',
    hideCompleted: '隐藏已完成',
    switchToPOS: '切换到POS',
    products: '产品',
    hasAllergens: '含过敏原',
    seen: '已查看',
    done: '完成',
    queueClear: '队列已清空，干得好！',
    lastOrderServed: '最后一单于下午2:34送出 - 今天已完成48单',
    ordersServed: '已送出订单',
    avgTicketTime: '平均出餐时间',
    fastestTicket: '最快出餐',
    today: '今天',
    yesterday: '昨天',
    last7Days: '最近7天',
    searchPlaceholder: '搜索订单、桌号、服务员...',
    noOrdersServed: '今天还没有送出订单',
    recalled: '已召回并加入队列',
    display: '显示',
    orders: '订单',
    hardware: '硬件',
    account: '账户',
    displayMode: '显示模式',
    cardsPerRow: '每行卡片数',
    textSize: '文字大小',
    statusColours: '状态颜色',
    customiseStatusColours: '自定义订单状态颜色',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    compact: '紧凑',
    standard: '标准',
    large: '大号',
    categoryFilter: '类别筛选',
    manageCategories: '管理活跃类别',
    revenueCenterFilter: '营收中心筛选',
    manageStationFilters: '管理站点筛选',
    staggerMode: '交错模式',
    configureRelease: '配置发布计划',
    servableModifiers: '可服务修改',
    showAllergenBadges: '显示过敏原标签',
    sortDefault: '默认排序',
    byTime: '按时间',
    byTable: '按桌号',
    byType: '按类型',
    mainPrintingDevice: '主打印设备',
    soundSettings: '声音设置',
    volumeAndAlerts: '音量和提醒声音',
    connection: '连接',
    wsAndSync: 'WebSocket和同步设置',
    deviceName: '设备名称',
    language: '语言',
    devMode: '开发模式',
    showFlowSelector: '登录时显示流程选择器',
    logOut: '退出登录',
    logOutConfirm: '退出登录？',
    logOutDescription: '您将返回登录界面。未保存的设置将丢失。',
    cancel: '取消',
    saveChanges: '保存更改',
    languageRegion: '语言和地区',
    languageScope: '语言范围',
    appInterface: '应用界面',
    menuItems: '菜单项目',
    both: '全部',
    searchLanguages: '搜索语言...',
    moreLanguages: '更多语言即将推出',
    regionalFormat: '地区格式',
    dateFormat: '日期格式',
    timeFormat: '时间格式',
  },
  vi: {
    ordersInQueue: 'Don hang trong hang doi',
    sort: 'Sap xep',
    sortByTime: 'Theo thoi gian',
    sortByTable: 'Theo ban',
    sortByType: 'Theo loai',
    grid: 'Luoi',
    horizontal: 'Ngang',
    stagger: 'So le',
    menu: 'Menu',
    home: 'Trang chu',
    history: 'Lich su',
    alerts: 'Thong bao',
    settings: 'Cai dat',
    newOrders: 'Don moi',
    inProgress: 'Dang lam',
    hideCompleted: 'An da hoan thanh',
    switchToPOS: 'Chuyen sang POS',
    products: 'san pham',
    hasAllergens: 'co di ung',
    seen: 'DA XEM',
    done: 'XONG',
    queueClear: 'Hang doi trong, lam tot lam!',
    lastOrderServed: 'Don cuoi phuc vu luc 2:34 PM - 48 don hoan thanh hom nay',
    ordersServed: 'Don da phuc vu',
    avgTicketTime: 'Thoi gian TB',
    fastestTicket: 'Nhanh nhat',
    today: 'Hom nay',
    yesterday: 'Hom qua',
    last7Days: '7 ngay qua',
    searchPlaceholder: 'Tim don, ban, nhan vien...',
    noOrdersServed: 'Chua co don nao duoc phuc vu hom nay',
    recalled: 'da thu hoi va them vao hang doi',
    display: 'HIEN THI',
    orders: 'DON HANG',
    hardware: 'PHAN CUNG',
    account: 'TAI KHOAN',
    displayMode: 'Che do hien thi',
    cardsPerRow: 'The moi hang',
    textSize: 'Co chu',
    statusColours: 'Mau trang thai',
    customiseStatusColours: 'Tuy chinh mau trang thai don hang',
    theme: 'Giao dien',
    light: 'Sang',
    dark: 'Toi',
    compact: 'Gon',
    standard: 'Tieu chuan',
    large: 'Lon',
    categoryFilter: 'Loc danh muc',
    manageCategories: 'Quan ly danh muc hoat dong',
    revenueCenterFilter: 'Loc trung tam doanh thu',
    manageStationFilters: 'Quan ly bo loc tram',
    staggerMode: 'Che do so le',
    configureRelease: 'Cau hinh lich phat hanh',
    servableModifiers: 'Tuy chinh phuc vu',
    showAllergenBadges: 'Hien thi huy hieu di ung',
    sortDefault: 'Sap xep mac dinh',
    byTime: 'Theo thoi gian',
    byTable: 'Theo ban',
    byType: 'Theo loai',
    mainPrintingDevice: 'May in chinh',
    soundSettings: 'Cai dat am thanh',
    volumeAndAlerts: 'Am luong va am thanh canh bao',
    connection: 'Ket noi',
    wsAndSync: 'Cai dat WebSocket va dong bo',
    deviceName: 'Ten thiet bi',
    language: 'Ngon ngu',
    devMode: 'Che do nha phat trien',
    showFlowSelector: 'Hien thi chon luong khi dang nhap',
    logOut: 'DANG XUAT',
    logOutConfirm: 'Dang xuat?',
    logOutDescription: 'Ban se tro ve man hinh dang nhap. Cac cai dat chua luu se bi mat.',
    cancel: 'Huy',
    saveChanges: 'Luu thay doi',
    languageRegion: 'Ngon ngu & Khu vuc',
    languageScope: 'Pham vi ngon ngu',
    appInterface: 'Giao dien ung dung',
    menuItems: 'Muc menu',
    both: 'Ca hai',
    searchLanguages: 'Tim ngon ngu...',
    moreLanguages: 'Them ngon ngu sap ra mat',
    regionalFormat: 'Dinh dang khu vuc',
    dateFormat: 'Dinh dang ngay',
    timeFormat: 'Dinh dang gio',
  },
};

const languageNames: Record<LanguageCode, string> = {
  'en-US': 'English (US)',
  es: 'Español',
  zh: '中文简体',
  vi: 'Tiếng Việt',
};

const languageFlags: Record<LanguageCode, string> = {
  'en-US': '🇺🇸',
  es: '🇪🇸',
  zh: '🇨🇳',
  vi: '🇻🇳',
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  languageName: string;
  languageFlag: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('posai-language');
    return (saved as LanguageCode) || 'es';
  });

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('posai-language', lang);
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    languageName: languageNames[language],
    languageFlag: languageFlags[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
