'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'en' | 'ar';

interface I18nCtx {
  lang: Lang;
  t: (key: string) => string;
  tStatus: (s: string) => string;
  tSeverity: (s: string) => string;
  tDay: (d: string) => string;
  tMonth: (m: string) => string;
  tFuel: (f: string) => string;
  tCarStatus: (s: string) => string;
  tPriority: (p: string) => string;
  tDept: (d: string) => string;
  tMachine: (m: string) => string;
  tShift: (s: string) => string;
  tNum: (n: number | string) => string;
  setLang: (l: Lang) => void;
  isRTL: boolean;
}

const Ctx = createContext<I18nCtx>({
  lang: 'en', t: k => k, tStatus: s => s, tSeverity: s => s,
  tDay: d => d, tMonth: m => m, tFuel: f => f, tCarStatus: s => s,
  tPriority: p => p, tDept: d => d, tMachine: m => m, tShift: s => s,
  tNum: n => String(n), setLang: () => {}, isRTL: false,
});

/* ─── Arabic dictionary ─── */
const AR: Record<string, string> = {
  /* nav */
  'nav.dashboard': 'لوحة التحكم',
  'nav.employees': 'الموظفون',
  'nav.departments': 'الأقسام',
  'nav.attendance': 'الحضور',
  'nav.payroll': 'الرواتب',
  'nav.production': 'الإنتاج',
  'nav.machines': 'الآلات',
  'nav.maintenance': 'الصيانة',
  'nav.inventory': 'المخزون',
  'nav.suppliers': 'الموردون',
  'nav.orders': 'الطلبات',
  'nav.customers': 'العملاء',
  'nav.cars': 'المركبات',
  'nav.defects': 'العيوب',
  'nav.quality': 'مراقبة الجودة',
  'nav.finance': 'المالية',
  'nav.analytics': 'التحليلات',
  'nav.reports': 'التقارير',
  'nav.notifications': 'الإشعارات',
  'nav.settings': 'الإعدادات',
  /* groups */
  'groups.people': 'الأفراد',
  'groups.factory': 'المصنع',
  'groups.supply': 'سلسلة التوريد',
  'groups.quality': 'الجودة',
  'groups.insights': 'التحليلات',
  'groups.system': 'النظام',
  /* common */
  'common.search': 'بحث في كل شيء...',
  'common.save': 'حفظ',
  'common.cancel': 'إلغاء',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.add': 'إضافة',
  'common.actions': 'إجراءات',
  'common.status': 'الحالة',
  'common.name': 'الاسم',
  'common.date': 'التاريخ',
  'common.today': 'اليوم',
  'common.saveChanges': 'حفظ التغييرات',
  'common.markAllRead': 'تعيين الكل كمقروء',
  'common.required': 'هذا الحقل مطلوب',
  'common.addEmployee': 'إضافة موظف',
  'common.addCustomer': 'إضافة عميل',
  'common.addSupplier': 'إضافة مورد',
  'common.addMachine': 'إضافة آلة',
  'common.addDepartment': 'إضافة قسم',
  'common.addItem': 'إضافة عنصر',
  'common.createOrder': 'إنشاء طلب',
  'common.scheduleMaintenance': 'جدولة صيانة',
  'common.reportDefect': 'الإبلاغ عن عيب',
  'common.newInspection': 'فحص جديد',
  'common.generate': 'إنشاء تقرير',
  'common.exportPayroll': 'تصدير كشف الرواتب',
  'common.updatePassword': 'تحديث كلمة المرور',
  'common.total': 'الإجمالي',
  /* dashboard */
  'dashboard.title': 'لوحة التحكم',
  'dashboard.subtitle': 'ملخص عمليات المصنع',
  'dashboard.totalEmployees': 'إجمالي الموظفين',
  'dashboard.activeMachines': 'الآلات النشطة',
  'dashboard.productionToday': 'إنتاج اليوم',
  'dashboard.inventoryAlerts': 'تنبيهات المخزون',
  'dashboard.defectRate': 'معدل العيوب',
  'dashboard.revenue': 'الإيرادات',
  'dashboard.pendingOrders': 'الطلبات المعلقة',
  'dashboard.attendanceRate': 'معدل الحضور',
  'dashboard.active': 'نشط',
  'dashboard.runningNow': 'تعمل الآن',
  'dashboard.unitsProduced': 'وحدة منتجة',
  'dashboard.itemsNeedAttention': 'تحتاج انتباهاً',
  'dashboard.thisWeek': 'هذا الأسبوع',
  'dashboard.thisMonth': 'هذا الشهر',
  'dashboard.inProgress': 'قيد التنفيذ',
  'dashboard.monthlyProduction': 'الإنتاج الشهري',
  'dashboard.dailyOutput': 'الإنتاج اليومي',
  'dashboard.targetVsActual': 'المستهدف مقابل الفعلي',
  'dashboard.recentOrders': 'الطلبات الأخيرة',
  'dashboard.todayAtt': 'حضور اليوم',
  'dashboard.vsLastMonth': 'مقارنة بالشهر الماضي',
  'dashboard.expenseBreakdown': 'تفاصيل المصروفات',
  /* employees */
  'employees.title': 'الموظفون',
  'employees.active': 'نشط',
  'employees.onLeave': 'في إجازة',
  'employees.morningShift': 'الوردية الصباحية',
  'employees.avgPerformance': 'متوسط الأداء',
  'employees.performanceVsAttendance': 'الأداء مقابل الحضور',
  'employees.byDepartment': 'حسب القسم',
  'employees.allDepartments': 'جميع الأقسام',
  'employees.searchPlaceholder': 'بحث بالاسم أو الدور...',
  'employees.results': 'نتيجة',
  'employees.role': 'الوظيفة',
  'employees.department': 'القسم',
  'employees.attendance': 'الحضور',
  'employees.performance': 'الأداء',
  'employees.salary': 'الراتب',
  'employees.form.title': 'إضافة موظف جديد',
  'employees.form.editTitle': 'تعديل موظف',
  'employees.form.fullName': 'الاسم الكامل',
  'employees.form.email': 'البريد الإلكتروني',
  'employees.form.phone': 'الهاتف',
  'employees.form.role': 'الوظيفة',
  'employees.form.department': 'القسم',
  'employees.form.shift': 'الوردية',
  'employees.form.salary': 'الراتب',
  'employees.form.status': 'الحالة',
  /* departments */
  'departments.title': 'الأقسام',
  'departments.subtitle': 'إدارة أقسام المصنع',
  'departments.headcount': 'عدد الموظفين',
  'departments.avgPerf': 'متوسط الأداء',
  'departments.avgSalary': 'متوسط الراتب',
  'departments.form.title': 'إضافة قسم',
  'departments.form.name': 'اسم القسم',
  'departments.form.manager': 'المدير',
  'departments.form.description': 'الوصف',
  /* attendance */
  'attendance.title': 'الحضور',
  'attendance.today': 'حضور اليوم',
  'attendance.present': 'حاضر',
  'attendance.late': 'متأخر',
  'attendance.absent': 'غائب',
  'attendance.onTime': 'في الوقت',
  'attendance.rate': 'معدل الحضور',
  'attendance.weekly': 'الحضور الأسبوعي',
  /* payroll */
  'payroll.title': 'الرواتب',
  'payroll.subtitle': 'إدارة رواتب الموظفين والمدفوعات',
  'payroll.payslips': 'كشوف الرواتب',
  'payroll.totalNetPay': 'إجمالي صافي الرواتب',
  'payroll.totalBonuses': 'إجمالي المكافآت',
  'payroll.totalDeductions': 'إجمالي الخصومات',
  'payroll.baseSalary': 'الراتب الأساسي',
  'payroll.netPay': 'صافي الراتب',
  'payroll.netPayByEmployee': 'صافي الراتب للموظف',
  'payroll.payBreakdown': 'تفاصيل الراتب',
  'payroll.month': 'الشهر',
  'payroll.bonus': 'المكافأة',
  'payroll.overtime': 'العمل الإضافي',
  'payroll.deductions': 'الخصومات',
  /* inventory */
  'inventory.title': 'المخزون',
  'inventory.form.minStock': 'الحد الأدنى للمخزون',
  'inventory.form.location': 'الموقع',
  'inventory.form.supplier': 'المورد',
  'inventory.form.price': 'السعر',
  'inventory.form.unit': 'الوحدة',
  'inventory.form.quantity': 'الكمية',
  'inventory.form.category': 'الفئة',
  'inventory.form.name': 'اسم العنصر',
  'inventory.form.editTitle': 'تعديل عنصر',
  'inventory.subtitle': 'إدارة المخزون ومستويات المواد',
  'inventory.form.title': 'إضافة عنصر',
  'inventory.totalItems': 'إجمالي العناصر',
  'inventory.totalValue': 'إجمالي القيمة',
  'inventory.totalVal': 'إجمالي القيمة',
  'inventory.lowStock': 'مخزون منخفض',
  'inventory.outOfStock': 'نفد المخزون',
  'inventory.byCategory': 'حسب الفئة',
  'inventory.stockLevels': 'مستويات المخزون',
  'inventory.itemName': 'اسم العنصر',
  'inventory.category': 'الفئة',
  'inventory.quantity': 'الكمية',
  'inventory.unitPrice': 'سعر الوحدة',
  'inventory.minStock': 'الحد الأدنى',
  'inventory.location': 'الموقع',
  'inventory.supplier': 'المورد',
  'inventory.lastRestocked': 'آخر تعبئة',
  'inventory.searchPlaceholder': 'بحث في المخزون...',
  'inventory.form.itemName': 'اسم العنصر',
  /* orders */
  'orders.title': 'الطلبات',
  'orders.form.priority': 'الأولوية',
  'orders.form.quantity': 'الكمية',
  'orders.form.product': 'المنتج',
  'orders.form.customer': 'العميل',
  'orders.form.editTitle': 'تعديل طلب',
  'orders.subtitle': 'إدارة طلبات العملاء والشحن',
  'orders.form.title': 'إضافة طلب',
  'orders.totalOrders': 'إجمالي الطلبات',
  'orders.totalValue': 'إجمالي القيمة',
  'orders.pending': 'معلق',
  'orders.inProduction': 'قيد الإنتاج',
  'orders.activeProgress': 'نشط / قيد التنفيذ',
  'orders.completedShipped': 'مكتمل / مشحون',
  'orders.allOrders': 'جميع الطلبات',
  'orders.orderId': 'رقم الطلب',
  'orders.customer': 'العميل',
  'orders.product': 'المنتج',
  'orders.priority': 'الأولوية',
  'orders.progress': 'التقدم',
  'orders.ordersByStatus': 'الطلبات حسب الحالة',
  'orders.form.deliveryDate': 'تاريخ التسليم',
  'orders.form.notes': 'ملاحظات',
  /* customers */
  'customers.title': 'العملاء',
  'customers.form.type': 'النوع',
  'customers.form.status': 'الحالة',
  'customers.form.country': 'الدولة',
  'customers.form.phone': 'رقم الهاتف',
  'customers.form.email': 'البريد الإلكتروني',
  'customers.form.contact': 'جهة الاتصال',
  'customers.form.name': 'اسم العميل',
  'customers.form.editTitle': 'تعديل عميل',
  'customers.contact': 'جهة الاتصال',
  'customers.subtitle': 'إدارة قاعدة العملاء والطلبات',
  'customers.form.title': 'إضافة عميل',
  'customers.totalCustomers': 'إجمالي العملاء',
  'customers.totalOrders': 'إجمالي الطلبات',
  'customers.totalRevenue': 'إجمالي الإيرادات',
  'customers.totalSpent': 'إجمالي الإنفاق',
  'customers.avgSatisfaction': 'متوسط الرضا',
  'customers.allCustomers': 'جميع العملاء',
  'customers.topCustomers': 'أفضل العملاء',
  'customers.revenueByCustomer': 'الإيرادات حسب العميل',
  'customers.lastOrder': 'آخر طلب',
  /* suppliers */
  'suppliers.title': 'الموردون',
  'suppliers.status': 'الحالة',
  'suppliers.country': 'الدولة',
  'suppliers.rating': 'التقييم',
  'suppliers.category': 'الفئة',
  'suppliers.contact': 'جهة الاتصال',
  'suppliers.form.status': 'الحالة',
  'suppliers.form.country': 'الدولة',
  'suppliers.form.category': 'الفئة',
  'suppliers.form.phone': 'رقم الهاتف',
  'suppliers.form.email': 'البريد الإلكتروني',
  'suppliers.form.contact': 'جهة الاتصال',
  'suppliers.form.name': 'اسم الشركة',
  'suppliers.form.editTitle': 'تعديل مورد',
  'suppliers.subtitle': 'إدارة الموردين وعقود التوريد',
  'suppliers.form.title': 'إضافة مورد',
  'suppliers.activeSuppliers': 'الموردون النشطون',
  'suppliers.underReview': 'قيد المراجعة',
  'suppliers.avgRating': 'متوسط التقييم',
  'suppliers.onTime': 'في الوقت المحدد',
  'suppliers.onTimeDelivery': 'التسليم في الوقت',
  'suppliers.totalOrders': 'إجمالي الطلبات',
  'suppliers.totalOrd': 'إجمالي الطلبات',
  'suppliers.allSuppliers': 'جميع الموردين',
  'suppliers.topByRating': 'الأفضل تقييماً',
  /* machines */
  'machines.title': 'الآلات',
  'machines.form.title': 'إضافة آلة',
  'machines.form.editTitle': 'تعديل آلة',
  'machines.avgUtilization': 'متوسط الاستخدام',
  'machines.inMaintenance': 'قيد الصيانة',
  'machines.underPerforming': 'أداء ضعيف',
  'machines.assignedTo': 'مسؤول الآلة',
  'machines.nextMaintenance': 'الصيانة القادمة',
  'machines.utilizationChart': 'مخطط الاستخدام',
  'machines.statusOverview': 'نظرة عامة على الحالة',
  'machines.form.machineName': 'اسم الآلة',
  'machines.form.assignTo': 'تعيين إلى',
  /* maintenance */
  'maintenance.title': 'الصيانة',
  'maintenance.totalJobs': 'إجمالي الأعمال',
  'maintenance.scheduled': 'مجدولة',
  'maintenance.inProgress': 'قيد التنفيذ',
  'maintenance.hours': 'الساعات',
  'maintenance.estHours': 'الساعات المقدرة',
  'maintenance.technician': 'الفني',
  'maintenance.priority': 'الأولوية',
  'maintenance.hoursByMachine': 'ساعات حسب الآلة',
  'maintenance.form.title': 'جدولة صيانة',
  'maintenance.form.machine': 'الآلة',
  'maintenance.form.type': 'نوع الصيانة',
  'maintenance.form.description': 'وصف العمل',
  'maintenance.form.technician': 'الفني',
  'maintenance.form.priority': 'الأولوية',
  'maintenance.form.date': 'التاريخ المجدول',
  'maintenance.form.hours': 'الساعات المقدرة',
  /* defects */
  'defects.title': 'العيوب',
  'defects.form.description': 'الوصف',
  'defects.form.inspector': 'المفتش',
  'defects.form.line': 'خط الإنتاج',
  'defects.form.severity': 'الخطورة',
  'defects.form.count': 'العدد',
  'defects.form.part': 'القطعة',
  'defects.form.type': 'نوع العيب',
  'defects.form.editTitle': 'تعديل العيب',
  'defects.inspector': 'المفتش',
  'defects.line': 'خط الإنتاج',
  'defects.severity': 'الخطورة',
  'defects.count': 'العدد',
  'defects.part': 'القطعة',
  'defects.type': 'نوع العيب',
  'defects.subtitle': 'تتبع عيوب الجودة والتفتيش',
  'defects.form.title': 'إضافة عيب',
  'defects.totalDefects': 'إجمالي العيوب',
  'defects.criticalIssues': 'مشكلات حرجة',
  'defects.byType': 'حسب النوع',
  'defects.bySeverity': 'حسب الخطورة',
  'defects.statusBreakdown': 'توزيع الحالة',
  'defects.defectLog': 'سجل العيوب',
  /* finance */
  'finance.title': 'المالية',
  'finance.revenue': 'الإيرادات',
  'finance.expenses': 'المصروفات',
  'finance.profit': 'الأرباح',
  'finance.profitMargin': 'هامش الربح',
  'finance.monthly': 'الشهري',
  'finance.expenseBreakdown': 'تفاصيل المصروفات',
  'finance.transactions': 'المعاملات',
  /* production */
  'production.title': 'الإنتاج',
  'production.dailyOutput': 'الإنتاج اليومي',
  'production.weeklyOutput': 'الإنتاج الأسبوعي',
  'production.efficiency': 'الكفاءة',
  'production.lines': 'خطوط الإنتاج',
  /* quality */
  'quality.title': 'مراقبة الجودة',
  'quality.subtitle': 'نتائج فحص وضمان الجودة',
  'quality.inspections': 'الفحوصات',
  'quality.passRate': 'معدل النجاح',
  'quality.failed': 'فشل',
  /* analytics */
  'analytics.title': 'التحليلات',
  /* reports */
  'reports.title': 'التقارير',
  'reports.subtitle': 'تحميل وإنشاء تقارير المصنع',
  'reports.totalReports': 'إجمالي التقارير',
  'reports.pdfReports': 'تقارير PDF',
  'reports.excelReports': 'تقارير Excel',
  'reports.generatedMonth': 'تم إنشاؤه هذا الشهر',
  'reports.download': 'تحميل',
  'reports.generate': 'إنشاء تقرير',
  'reports.view': 'عرض',
  'reports.lastGenerated': 'آخر إنشاء',
  'reports.fileSize': 'حجم الملف',
  'reports.downloading': 'جارٍ التحميل...',
  /* notifications */
  'notifications.title': 'الإشعارات',
  'notifications.allRead': 'تم قراءة الكل',
  'notifications.types.error': 'خطأ',
  'notifications.types.warning': 'تحذير',
  'notifications.types.success': 'نجاح',
  'notifications.types.info': 'معلومة',
  /* settings */
  'settings.title': 'الإعدادات',
  'settings.notifItems.maintenanceDesc': 'تذكير بمواعيد الصيانة القادمة',
  'settings.notifItems.maintenance': 'الصيانة المجدولة',
  'settings.subtitle': 'إدارة تفضيلات النظام',
  'settings.general': 'عام',
  'settings.appearance': 'المظهر',
  'settings.security': 'الأمان',
  'settings.language': 'اللغة',
  'settings.location': 'الموقع',
  'settings.generalSettings': 'الإعدادات العامة',
  'settings.factoryName': 'اسم المصنع',
  'settings.factoryId': 'معرف المصنع',
  'settings.managerEmail': 'بريد المدير',
  'settings.contactPhone': 'رقم الهاتف',
  'settings.themeMode': 'وضع الثيم',
  'settings.lightMode': 'الوضع المضيء',
  'settings.darkMode': 'الوضع المظلم',
  'settings.interfaceLang': 'لغة الواجهة',
  'settings.brandColors': 'ألوان العلامة',
  'settings.notificationPrefs': 'تفضيلات الإشعارات',
  'settings.notifItems.lowStock': 'تنبيه المخزون المنخفض',
  'settings.notifItems.lowStockDesc': 'إشعار عند انخفاض مستوى المخزون',
  'settings.notifItems.machineFailure': 'عطل في الآلة',
  'settings.notifItems.machineFailureDesc': 'إشعار فوري عند توقف الآلة',
  'settings.notifItems.attendance': 'تقرير الحضور',
  'settings.notifItems.attendanceDesc': 'ملخص يومي للحضور والغياب',
  'settings.notifItems.orderUpdates': 'تحديثات الطلبات',
  'settings.notifItems.orderUpdatesDesc': 'تغييرات حالة الطلبات',
  'settings.notifItems.qualityAlerts': 'تنبيهات الجودة',
  'settings.notifItems.qualityAlertsDesc': 'مشاكل الجودة والعيوب',
  'settings.currentPassword': 'كلمة المرور الحالية',
  'settings.newPassword': 'كلمة المرور الجديدة',
  'settings.confirmPassword': 'تأكيد كلمة المرور',
  /* toast */
  'toast.added': 'تمت الإضافة بنجاح',
  'toast.updated': 'تم التحديث بنجاح',
  'toast.deleted': 'تم الحذف بنجاح',
  'toast.saved': 'تم الحفظ بنجاح',
  'toast.error': 'حدث خطأ',
};

/* ─── English dictionary ─── */
const EN: Record<string, string> = {
  /* nav */
  /* groups */
  /* common */
  /* dashboard */
  'dashboard.productionToday': "Today's Production",
  'dashboard.todayAtt': "Today's Attendance",
  /* employees */
  /* departments */
  /* attendance */
  'attendance.today': "Today's Attendance",
  /* payroll */
  /* inventory */









  /* orders */







  /* customers */
  /* suppliers */










  /* machines */
  /* maintenance */
  'maintenance.subtitle': 'Maintenance schedules and records',
  /* defects */
  /* finance */
  /* production */
  /* quality */
  /* analytics */
  /* reports */
  /* notifications */
  /* settings */
  /* toast */
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ms_lang') as Lang;
      if (saved === 'ar' || saved === 'en') setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('ms_lang', l); } catch {}
    document.documentElement.dir  = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  };

  const dict = lang === 'ar' ? AR : EN;
  const t = (key: string) => dict[key] ?? EN[key] ?? key;

  const tStatus = (s: string) => lang === 'en' ? s.replace(/-/g, ' ') : ({
    active: 'نشط', inactive: 'غير نشط', 'on-leave': 'في إجازة',
    running: 'تعمل', idle: 'متوقفة', maintenance: 'صيانة',
    'under-performing': 'أداء ضعيف', available: 'متاح',
    'low-stock': 'مخزون منخفض', 'out-of-stock': 'نفد المخزون',
    pending: 'معلق', 'in-production': 'قيد الإنتاج',
    'quality-check': 'فحص جودة', shipped: 'مشحون',
    completed: 'مكتمل', cancelled: 'ملغي',
    paid: 'مدفوع', review: 'مراجعة', open: 'مفتوح',
    investigating: 'قيد التحقيق', resolved: 'محلول',
    scheduled: 'مجدول', 'in-progress': 'جاري', overdue: 'متأخر',
  }[s] ?? s.replace(/-/g, ' '));

  const tSeverity = (s: string) => lang === 'en' ? s : ({ minor: 'بسيط', major: 'كبير', critical: 'حرج' }[s] ?? s);

  const tDay = (d: string) => lang === 'en' ? d : ({
    Mon: 'الإثنين', Tue: 'الثلاثاء', Wed: 'الأربعاء',
    Thu: 'الخميس', Fri: 'الجمعة', Sat: 'السبت', Sun: 'الأحد',
  }[d] ?? d);

  const tMonth = (m: string) => lang === 'en' ? m : ({
    Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل',
    May: 'مايو', Jun: 'يونيو', Jul: 'يوليو', Aug: 'أغسطس',
    Sep: 'سبتمبر', Oct: 'أكتوبر', Nov: 'نوفمبر', Dec: 'ديسمبر',
    'Jan 26': 'يناير ٢٦', 'Feb 26': 'فبراير ٢٦', 'Mar 26': 'مارس ٢٦',
    'Apr 26': 'أبريل ٢٦', 'May 26': 'مايو ٢٦', 'Jun 26': 'يونيو ٢٦',
    'Jul 26': 'يوليو ٢٦',
  }[m] ?? m);

  const tFuel = (f: string) => lang === 'en' ? f : ({
    Gasoline: 'بنزين', Electric: 'كهربائي', Hybrid: 'هجين',
    'Plug-in Hybrid': 'هجين قابل للشحن', 'Mild Hybrid': 'هجين خفيف',
  }[f] ?? f);

  const tCarStatus = (s: string) => lang === 'en' ? s.replace(/_/g, ' ') : ({
    in_production: 'قيد الإنتاج', quality_check: 'فحص الجودة',
    completed: 'مكتمل', shipped: 'تم الشحن', pending: 'معلق',
  }[s] ?? s.replace(/_/g, ' '));

  const tPriority = (p: string) => lang === 'en' ? p : ({
    high: 'عالي', medium: 'متوسط', low: 'منخفض', critical: 'حرج',
  }[p] ?? p);

  const tDept = (d: string) => lang === 'en' ? d : ({
    Production: 'الإنتاج', 'Quality Control': 'مراقبة الجودة',
    Maintenance: 'الصيانة', Inventory: 'المخزون',
    HR: 'الموارد البشرية', Finance: 'المالية',
    Sales: 'المبيعات', Engineering: 'الهندسة',
  }[d] ?? d);

  const tMachine = (m: string) => lang === 'en' ? m : ({
    'CNC Milling': 'تفريز CNC', 'CNC Lathe': 'مخرطة CNC',
    'Welding Robot': 'روبوت لحام', 'Hydraulic Press': 'مكبس هيدروليكي',
    'Injection Molder': 'قوالب حقن', 'Grinding Machine': 'آلة طحن',
    'Drilling Press': 'آلة حفر', 'Punching Machine': 'آلة ثقب',
    'Cutting Machine': 'آلة قطع', 'Assembly Robot': 'روبوت تجميع',
  }[m] ?? m);

  const tShift = (s: string) => lang === 'en' ? s : ({
    morning: 'صباحية', evening: 'مسائية', night: 'ليلية',
  }[s] ?? s);

  const toArabicNumerals = (n: string) =>
    n.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

  const tNum = (n: number | string) =>
    lang === 'ar' ? toArabicNumerals(String(n)) : String(n);

  return (
    <Ctx.Provider value={{ lang, t, tStatus, tSeverity, tDay, tMonth, tFuel, tCarStatus, tPriority, tDept, tMachine, tShift, tNum, setLang, isRTL: lang === 'ar' }}>
      {children}
    </Ctx.Provider>
  );
}

export const useI18n = () => useContext(Ctx);