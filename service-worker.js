var dataCacheName = 'garagesData-v1';
var cacheName = 'garagesPWA-final-1';
var filesToCache = [
    '/pushNotificationsPWAPoC/',
    '/pushNotificationsPWAPoC/index.html',
    '/pushNotificationsPWAPoC/build/main.css',
    '/pushNotificationsPWAPoC/build/polyfills.js',
    '/pushNotificationsPWAPoC/build/main.js',
    '/pushNotificationsPWAPoC/manifest.json',
    '/pushNotificationsPWAPoC/assets/icon/favicon.ico',
    '/pushNotificationsPWAPoC/assets/fonts/ionicons.ttf?v=3.0.0-alpha.3',
    '/pushNotificationsPWAPoC/assets/fonts/ionicons.woff?v=3.0.0-alpha.3',
    '/pushNotificationsPWAPoC/assets/fonts/ionicons.woff2?v=3.0.0-alpha.3',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
    '/pushNotificationsPWAPoC/assets/fonts/ionicons.woff2?v=3.0.0-alpha.3'

];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    /*
     * Fixes a corner case in which the app wasn't returning the latest data.
     * You can reproduce the corner case by commenting out the line below and
     * then doing the following steps: 1) load app for first time so that the
     * initial New York City data is shown 2) press the refresh button on the
     * app 3) go offline 4) reload the app. You expect to see the newer NYC
     * data, but you actually see the initial data. This happens because the
     * service worker is not yet activated. The code below essentially lets
     * you activate the service worker faster.
     */
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch', e.request.url);
    var dataUrl = 'localhost:8000';

    if (e.request.url.indexOf(dataUrl) > -1) {
        /*
         * When the request URL contains dataUrl, the app is asking for fresh
         * weather data. In this case, the service worker always goes to the
         * network and then caches the response. This is called the "Cache then
         * network" strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
         */
        e.respondWith(
            caches.open(dataCacheName).then(function(cache) {
                return fetch(e.request).then(function(response) {
                    //cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        /*
         * The app is asking for app shell files. In this scenario the app uses the
         * "Cache, falling back to the network" offline strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
         */
        console.log(e.request.url);
        console.dir(e.request);
        e.respondWith(
            caches.match(e.request).then(function(response) {
                if (response)
                    console.log("[Service Worker] Response returned from cache...");
                return response | fetch(e.request);

                /*if (response) {
                    console.log("[Service Worker] fetch result from cache: ");
                    console.dir(response);
                    return response;
                } else {
                    console.log("[Service Worker] Doing fresh fetch...: ");
                    var res = fetch(e.request);
                    console.log("[Service Worker] fresh fetch result: ");
                    console.dir(res);
                    return res;
                }*/
                //return response || fetch(e.request);
            })
        );
    }
});

/********************** PUSH NOTIFICATIONS *********************************** */
self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Garages';
    const options = {
        body: event.data.text(),
        icon: 'assets/icon/favicon.ico',
        badge: 'assets/icon/favicon.ico'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://txirinedu.github.io/pushNotificationsPWAPoC/')
    );
});