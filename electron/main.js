const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, '../public/icons/icon-512x512.png');
  const fs = require('fs');
  const icon = fs.existsSync(iconPath) ? iconPath : undefined;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true, // Enable web security for webview
    },
    ...(icon && { icon }),
  });

  // Always load from the web server URL (webview mode)
  const webAppUrl = 'http://185.215.244.196:3000';
  mainWindow.loadURL(webAppUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle navigation - allow navigation within the same origin
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const webAppUrlParsed = new URL(webAppUrl);
    
    // Only allow navigation within the same origin (web app domain)
    if (parsedUrl.origin !== webAppUrlParsed.origin) {
      event.preventDefault();
      // Open external URLs in default browser
      require('electron').shell.openExternal(navigationUrl);
    }
  });

  // Handle new window requests (like target="_blank" links)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const webAppUrlParsed = new URL(webAppUrl);
    const urlParsed = new URL(url);
    
    // If it's the same origin, allow it (for same-origin popups)
    if (urlParsed.origin === webAppUrlParsed.origin) {
      return { action: 'allow' };
    }
    
    // Open external URLs in default browser
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create Persian help menu
function createMenu() {
  const template = [
    {
      label: 'فایل',
      submenu: [
        {
          label: 'خروج',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'ویرایش',
      submenu: [
        { label: 'بازگشت', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'بازگشت مجدد', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'برش', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'کپی', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'چسباندن', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'انتخاب همه', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },
    {
      label: 'نمایش',
      submenu: [
        { label: 'بارگذاری مجدد', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'بارگذاری مجدد کامل', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'ابزارهای توسعه‌دهنده', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'بزرگنمایی', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'کوچک‌نمایی', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'اندازه واقعی', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'تمام صفحه', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
    {
      label: 'راهنما',
      submenu: [
        {
          label: 'شروع سریع',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'شروع سریع',
              message: 'راهنمای شروع سریع املاک یار',
              detail: 'به املاک یار خوش آمدید!\n\n' +
                'برای شروع کار:\n\n' +
                '1. اعلان‌ها را فعال کنید\n' +
                '   روی دکمه "فعال‌سازی اعلان‌ها" کلیک کنید\n\n' +
                '2. از قابلیت آفلاین استفاده کنید\n' +
                '   برنامه حتی بدون اینترنت هم کار می‌کند\n\n' +
                '3. از همگام‌سازی پس‌زمینه استفاده کنید\n' +
                '   داده‌ها به صورت خودکار همگام می‌شوند\n\n' +
                'برای اطلاعات بیشتر، سایر بخش‌های راهنما را مطالعه کنید.',
              buttons: ['بستن'],
            });
          },
        },
        {
          label: 'راهنمای استفاده',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'راهنمای استفاده',
              message: 'راهنمای کامل استفاده از املاک یار',
              detail: 'املاک یار یک سیستم مدیریت املاک است که می‌تواند به صورت:\n\n' +
                '📱 اپلیکیشن وب (PWA)\n' +
                '   • قابل نصب روی مرورگر\n' +
                '   • کار آفلاین\n' +
                '   • اعلان‌های فشاری\n\n' +
                '📱 اپلیکیشن اندروید\n' +
                '   • نصب روی گوشی و تبلت\n' +
                '   • دسترسی کامل به ویژگی‌های موبایل\n\n' +
                '💻 اپلیکیشن ویندوز\n' +
                '   • اجرای مستقل روی کامپیوتر\n' +
                '   • بدون نیاز به مرورگر\n\n' +
                'ویژگی‌های اصلی:\n' +
                '• کار آفلاین - بدون نیاز به اینترنت\n' +
                '• اعلان‌های فشاری - اطلاع‌رسانی فوری\n' +
                '• همگام‌سازی پس‌زمینه - به‌روزرسانی خودکار\n' +
                '• رابط کاربری فارسی - کاملاً فارسی و راست‌چین',
              buttons: ['بستن'],
            });
          },
        },
        {
          label: 'کیبورد شورتکات',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'شورتکات‌های صفحه کلید',
              message: 'راهنمای کامل شورتکات‌ها',
              detail: 'شورتکات‌های مفید در املاک یار:\n\n' +
                '🔄 بارگذاری و رفرش:\n' +
                '   Ctrl+R - بارگذاری مجدد صفحه\n' +
                '   Ctrl+Shift+R - بارگذاری مجدد کامل\n\n' +
                '🔍 نمایش:\n' +
                '   F11 - حالت تمام صفحه\n' +
                '   F12 - باز/بسته کردن ابزارهای توسعه‌دهنده\n\n' +
                '🔍 بزرگنمایی:\n' +
                '   Ctrl+Plus (+) - بزرگنمایی\n' +
                '   Ctrl+Minus (-) - کوچک‌نمایی\n' +
                '   Ctrl+0 - بازگشت به اندازه واقعی\n\n' +
                '✂️ ویرایش:\n' +
                '   Ctrl+Z - بازگشت\n' +
                '   Ctrl+Shift+Z - بازگشت مجدد\n' +
                '   Ctrl+X - برش\n' +
                '   Ctrl+C - کپی\n' +
                '   Ctrl+V - چسباندن\n' +
                '   Ctrl+A - انتخاب همه\n\n' +
                '🚪 خروج:\n' +
                '   Ctrl+Q - خروج از برنامه',
              buttons: ['بستن'],
            });
          },
        },
        {
          label: 'ویژگی‌های PWA',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'ویژگی‌های PWA',
              message: 'راهنمای ویژگی‌های Progressive Web App',
              detail: 'املاک یار از تکنولوژی PWA استفاده می‌کند:\n\n' +
                '📦 نصب آسان:\n' +
                '   برنامه را می‌توانید روی دسکتاپ یا موبایل نصب کنید\n\n' +
                '🌐 کار آفلاین:\n' +
                '   حتی بدون اینترنت می‌توانید از برنامه استفاده کنید\n' +
                '   داده‌ها در حافظه محلی ذخیره می‌شوند\n\n' +
                '🔔 اعلان‌های فشاری:\n' +
                '   اطلاع‌رسانی فوری حتی وقتی برنامه باز نیست\n\n' +
                '⚡ عملکرد سریع:\n' +
                '   بارگذاری سریع و تجربه کاربری روان\n\n' +
                '🔄 همگام‌سازی خودکار:\n' +
                '   داده‌ها به صورت خودکار همگام می‌شوند',
              buttons: ['بستن'],
            });
          },
        },
        { type: 'separator' },
        {
          label: 'درباره املاک یار',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'درباره املاک یار',
              message: 'املاک یار - پلتفرم مدیریت املاک',
              detail: 'نسخه: 0.1.0\n\n' +
                'املاک یار یک سیستم جامع مدیریت املاک است که با استفاده از:\n\n' +
                '• Next.js - فریمورک React\n' +
                '• Material-UI - رابط کاربری\n' +
                '• PWA - اپلیکیشن وب پیشرو\n' +
                '• Electron - اپلیکیشن دسکتاپ\n' +
                '• Capacitor - اپلیکیشن موبایل\n\n' +
                'ساخته شده است.\n\n' +
                'این برنامه کاملاً فارسی و راست‌چین است و از تمام ویژگی‌های\n' +
                'مدرن وب برای تجربه کاربری بهتر استفاده می‌کند.',
              buttons: ['بستن'],
            });
          },
        },
        {
          label: 'گزارش مشکل',
          click: () => {
            const { shell } = require('electron');
            shell.openExternal('mailto:support@amlakyar.com?subject=گزارش مشکل&body=لطفاً مشکل خود را شرح دهید:');
          },
        },
        {
          label: 'تماس با پشتیبانی',
          click: () => {
            const { shell } = require('electron');
            shell.openExternal('mailto:support@amlakyar.com?subject=تماس با پشتیبانی');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

