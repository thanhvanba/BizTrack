export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    console.log('PWA auto registered by vite-plugin-pwa')
  }
}