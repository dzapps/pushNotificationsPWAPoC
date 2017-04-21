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
    return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    console.log('[Service Worker] Fetch', event.request.url);
   
    var dataUrl = 'assets/data/';
    if (event.request.url.indexOf(dataUrl) > -1) {
    // Put data handler code here
        event.respondWith(
          fetch(event.request)
            .then(function(response) {
              return caches.open(dataCacheName).then(function(cache) {
                cache.put(event.request, response.clone());
                console.log('[ServiceWorker] Fetched&Cached Data');
                return response;
              });
            }).catch(function() {
                console.log('[ServiceWorker] Cached Data');
                return caches.match(event.request);
            })
        );
    } else {
        event.respondWith(
            fetch(event.request).catch(function() {
                return caches.match(event.request);
            })
        );
    }

});

/********************** PUSH NOTIFICATIONS *********************************** */

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    var str = event.data.text()

    var title = 'Garages';
    var data;
    var options = {
        body: str,
        icon: 'assets/icon/favicon.ico',
        badge: 'assets/icon/favicon.ico',
        vibrate: [200, 100, 200, 100, 200, 100, 200]
    };

    if (isJson(str)) {
        var pushData = JSON.parse(str);
        if (pushData.body) {
            options.body = pushData.body;
            if (pushData.data) {
                options.actions = [
                    { action: 'reply', title: 'Reply to ' + pushData.data }
                ];
                options.data = pushData.data;
            }
        }
        if (pushData.title) {
            title = pushData.title;
        }
        /*if (pushData.data) {
            options.data = pushData.data;
        }*/
    }



    /*const title = 'Garages';
    const options = {
        body: event.data.text(),
        icon: 'assets/icon/favicon.ico',
        badge: 'assets/icon/favicon.ico',
        actions: [
            {action: 'dismiss', title: 'Dismiss'},
            {action: 'reply', title: 'Reply'}
        ]
    };*/

    //event.waitUntil(
    self.registration.showNotification(title, options);
    //);
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');
    var senderId = event.notification.data;

    event.notification.close();

    if (event.action === 'dismiss') {
        console.log(event.action);
    } else if (event.action === 'reply') {
        console.log(event.action);
        //var userId = localStorage.getItem('userId');
        //var msg = userId ? 'Hi Back ' + userId + '!!!!!' : 'Hi Back!!!!';

        var msg = 'Hi Back!!!!';

        var body = '{ "userIds": ["chrome curro edu"], "data": "' + msg + '" }';
        if (senderId) {
            body = '{ "userIds": ["' + senderId + '"], "data": "' + msg + '" }';
        }


        fetch('https://pushnotificationspwapoc.herokuapp.com/api/push', {
                method: 'post',
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: body
            })
            //.then(json)
            .then(function(data) {
                console.log('Request succeeded with JSON response', data);
            })
            .catch(function(error) {
                console.log('Request failed', error);
            });




    } else {
        //event.waitUntil(
        clients.openWindow('https://txirinedu.github.io/pushNotificationsPWAPoC/');
        //);
    }


});
