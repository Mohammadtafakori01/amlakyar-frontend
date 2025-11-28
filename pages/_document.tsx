import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fa" dir="rtl">
      <Head>
        <meta charSet="utf-8" />
        <meta name="application-name" content="املاک یار" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="املاک یار" />
        <meta name="description" content="املاک یار - سیستم مدیریت املاک" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1976d2" />
        
        {/* IranYekan Font */}
        {process.env.ELECTRON === 'true' ? (
          <>
            <link rel="preload" href="./fonts/IRANYEKANREGULAR(FANUM).TTF" as="font" />
            <link rel="preload" href="./fonts/IRANYEKANMEDIUM.TTF" as="font" />
            <link rel="preload" href="./fonts/IRANYEKANBOLD.TTF" as="font" />
            {/* eslint-disable-next-line @next/next/no-css-tags */}
            <link rel="stylesheet" href="./fonts/fonts.css" />
          </>
        ) : (
          <>
            <link rel="preload" href="/fonts/IRANYEKANREGULAR(FANUM).TTF" as="font" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/IRANYEKANMEDIUM.TTF" as="font" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/IRANYEKANBOLD.TTF" as="font" crossOrigin="anonymous" />
            {/* eslint-disable-next-line @next/next/no-css-tags */}
            <link rel="stylesheet" href="/fonts/fonts.css" />
          </>
        )}
        
        {process.env.ELECTRON === 'true' ? (
          <>
            <link rel="apple-touch-icon" href="./icons/icon-512x512.png" />
            <link rel="manifest" href="./manifest.json" />
            <link rel="shortcut icon" href="./logo.png" />
            <link rel="icon" href="./logo.png" type="image/png" />
          </>
        ) : (
          <>
            <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="shortcut icon" href="/logo.png" />
            <link rel="icon" href="/logo.png" type="image/png" />
          </>
        )}
        
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

