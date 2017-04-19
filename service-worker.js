var dataCacheName = 'garagesData-v3';
var cacheName = 'garagesPWA-final-3';
var filesToCache = [
    '/pushNotificationsPWAPoC/',
    '/pushNotificationsPWAPoC/index.html',
    '/pushNotificationsPWAPoC/build/main.css',
    '/pushNotificationsPWAPoC/build/polyfills.js',
    '/pushNotificationsPWAPoC/build/main.js',
    '/pushNotificationsPWAPoC/manifest.json',
    '/pushNotificationsPWAPoC/assets/icon/favicon.ico',
    '/pushNotificationsPWAPoC/assets/icon/icon_144.png',
    '/pushNotificationsPWAPoC/assets/icon/icon_640.png',
    '/pushNotificationsPWAPoC/assets/fonts/ionicons.ttf?v=3.0.0-alpha.3',
    '/pushNotificationsPWAPoC/assets/fonts/ionicons.woff?v=3.0.0-alpha.3',
    '/pushNotificationsPWAPoC/assets/fonts/ionicons.woff2?v=3.0.0-alpha.3',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
    '/pushNotificationsPWAPoC/assets/fonts/ionicons.woff2?v=3.0.0-alpha.3'

];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    // e.waitUntil(
    caches.open(cacheName).then(function(cache) {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(filesToCache);
    });
    //);
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    //e.waitUntil(
    caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
        // );
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

self.addEventListener('fetch', function(event) {
    console.log('[Service Worker] Fetch', event.request.url);
    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request);
        })
    );

});

/********************** PUSH NOTIFICATIONS *********************************** */
self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Garages';
    const options = {
        body: event.data.text(),
        icon: 'assets/icon/favicon.ico',
        badge: 'assets/icon/favicon.ico',
        actions: [  
            {action: 'dismiss', title: 'Dismiss'},  
            {action: 'reply', title: 'Reply'}
        ]  
    };

    //event.waitUntil(
    self.registration.showNotification(title, options);
    //);
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();
    
    if (event.action === 'dismiss') {  
        console.log(event.action); 
      }  
      else if (event.action === 'reply') {  
        console.log(event.action);
          
          fetch('https://pushnotificationspwapoc.herokuapp.com/api/push', {  
            method: 'post',  
            headers: {  
              "Content-type": "application/json; charset=UTF-8"  
            },  
            body: '{ "userIds": ["chrome curro edu"], "data": "Hi Back!!!!" }'  
          })
          //.then(json)  
          .then(function (data) {  
            console.log('Request succeeded with JSON response', data);  
          })  
          .catch(function (error) {  
            console.log('Request failed', error);  
          });
          
          
          
          
      }  
      else {  
        //event.waitUntil(
        clients.openWindow('https://txirinedu.github.io/pushNotificationsPWAPoC/');
        //); 
      } 

    
});
