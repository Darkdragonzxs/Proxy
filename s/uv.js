importScripts('/s/u/bundle.js');
importScripts('/s/u/config.js');
importScripts('/s/u/sw.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', (event) => event.respondWith(sw.fetch(event)));
