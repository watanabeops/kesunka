// KESUNKA Service Worker
// アプリシェル（HTML/manifest/アイコン）をキャッシュし、オフラインでも起動できるようにする。
// 学習データ自体はlocalStorageに保存されるため、ここではキャッシュ対象にしない。
//
// 【アップデート時の注意】
// index.html等の中身を更新したときは、このCACHE_NAMEの値も必ず変更すること。
// 値を変えないと、インストール済みの端末はキャッシュ優先の仕組みにより
// 古いバージョンを表示し続けてしまう（activateイベントで「名前が変わった
// 古いキャッシュ」だけを破棄する仕組みのため）。

const CACHE_NAME = 'kesunka-cache-v1.0.4';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// キャッシュ優先、なければネットワーク取得（成功したら次回用にキャッシュへ保存）。
// ネットワークも失敗した場合はキャッシュ済みindex.htmlへフォールバック。
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
