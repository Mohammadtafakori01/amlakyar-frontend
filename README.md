# Amlakyar Frontend

A Next.js application that can be built as:
- Web PWA (Progressive Web App)
- Android APK (via Capacitor)
- Windows EXE (via Electron)

## Initial Setup

1. Install dependencies:
```bash
npm install
```

2. Add PWA icons to `public/icons/` directory:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png
   
   You can generate these using online tools like [PWA Builder](https://www.pwabuilder.com/imageGenerator)

3. For Android builds, initialize Capacitor (first time only):
```bash
npx cap add android
```

4. For Electron builds, add Windows icon (optional):
   - Create `public/icon.ico` for Windows builds

## Getting Started

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Web

```bash
npm run build
npm start
```

### Build for Android APK

```bash
npm run build:android
```

This will:
1. Build the Next.js app
2. Sync with Capacitor
3. Open Android Studio for building the APK

### Build for Windows EXE

```bash
npm run build:electron
```

This will create a Windows installer in the `dist-electron` directory.

### Build All Platforms

```bash
npm run build:all
```

## Tech Stack

- **Next.js** - React framework with Pages Router
- **Material-UI** - UI component library
- **PWA** - Progressive Web App support with offline capabilities
- **Capacitor** - Native mobile app wrapper
- **Electron** - Desktop app wrapper

