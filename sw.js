// KESUNKA Service Worker
// アプリシェル（HTML/manifest/アイコン）をキャッシュし、オフラインでも起動できるようにする。
// 学習データ自体はlocalStorageに保存されるため、ここではキャッシュ対象にしない。
//
// 【キャッシュ方針】
// リクエストの種類で戦略を分ける。どちらもCACHE_NAMEを手で上げなくても
// 更新が届くようにしてあるため、HTMLやアイコンを更新したあとに
// この値を変更する必要はない（v1.0.7までは変更が必須だった）。
//
//   ページ遷移（HTML）  … ネットワーク優先。取得できたらそれを表示しつつ
//                         キャッシュも更新する。オフライン時のみキャッシュを使う。
//                         → HTMLを更新すれば、次に開いた時点で必ず新しくなる。
//
//   それ以外（アイコン・manifest）
//                       … キャッシュ優先で即座に表示しつつ、裏でネットワークから
//                         取り直してキャッシュを更新する（stale-while-revalidate）。
//                         → アイコンを差し替えると、次に開いた時点で新しくなる。
//
// CACHE_NAMEを変更するのは、キャッシュを全部捨ててやり直したいときだけでよい。
// activateイベントで「名前が変わった古いキャッシュ」を破棄する仕組みは残してある。

const CACHE_NAME = 'kesunka-cache-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/apple-touch-icon.png',
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

// 取得できたレスポンスをキャッシュへ保存する（成功したもののみ）。
function putInCache(request, response) {
  if (!response || !response.ok) return;
  const clone = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // 同一オリジン以外（FirebaseのSDKやFirestoreへの通信）は素通しし、
  // サービスワーカーで一切キャッシュしない。
  if (new URL(request.url).origin !== self.location.origin) return;

  // ページ遷移（HTML）はネットワーク優先。
  // 失敗したらキャッシュ、それも無ければキャッシュ済みindex.htmlへフォールバック。
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // それ以外はキャッシュ優先。同時に裏で取り直してキャッシュを更新する。
  event.respondWith(
    caches.match(request).then((cached) => {
      const fromNetwork = fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() => cached);

      return cached || fromNetwork;
    })
  );
});
