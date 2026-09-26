# Percussion Loop

Vue 3 percussion sequencer built with Vite.

## Use on iPad without internet

1. Deploy the production build to Vercel and open its stable production URL in Safari while online.
2. In Safari, use **Share → Add to Home Screen**. Open the new Home Screen app while still online and wait for **พร้อมใช้งานออฟไลน์บนอุปกรณ์นี้**.
3. Test it in Airplane Mode: close and reopen the Home Screen app, play a saved loop, and load or save a sequence.

The app precaches its code, local Thai font, and audio samples. The first download and future updates need an internet connection. Updates are offered in the app and can be applied after playback stops.

Safari and the Home Screen app keep separate saved sequences. To move existing loops, use **ส่งออกไฟล์** in Safari, then **นำเข้าไฟล์** in the Home Screen app. Import replaces the loops currently saved in that app; export them first if needed. Keep the backup file in Files because browser data can be removed if website data is cleared. Always use the same production URL, rather than a Vercel preview URL.

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
