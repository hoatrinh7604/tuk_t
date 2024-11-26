const cacheName = "Cat Lucky-CatLucky-1.0.2.6";
const contentToCache = [
    "Build/WebGL.loader.js",
    "Build/WebGL.framework.js.unityweb",
    "Build/WebGL.data.unityweb",
    "Build/WebGL.wasm.unityweb",
    "TemplateData/style.css",
    "index.js",
	"index.html",
    "load-sdk.js",
];

self.addEventListener("install", function (e) {
  console.log("[Service Worker] Install cacheName=" + cacheName);
  //self.skipWaiting();  // Activate worker immediately
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== cacheName;
          })
          .map((name) => {
            console.log("[Service Worker] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );

  e.waitUntil(
    (async function () {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all: app shell and content");
      await cache.addAll(contentToCache);
	  console.log('Caching completed during install.');
	  self.skipWaiting();  // Activate worker immediately
    })()
  );
  
});

self.addEventListener('activate', event => {
	const currentCaches = [cacheName];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => {
		console.log('Service Worker is fully activated.');
		})
  );
  
  self.clients.claim(); // Take control of all pages immediately
});

self.addEventListener("fetch", function (event) {
	if (event.request.method !== 'GET') {
		console.log(`[Service Worker] Skip caching resource: ${event.request.url}`);
        // Skip caching for non-GET requests
        return;
    }
  
  // Only cache if it is game content data
  if (!isStaticResource(event.request))
  {
	  return null;
  }
  
  //new
  if (event.request.method === 'POST') {
    // Always fetch from the network for POST requests
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Return the response directly from the network
          return response;
        })
        .catch(error => {
          // Handle network errors (e.g., show an error page)
          return new Response('Network error occurred', {
            status: 500,
            statusText: 'Network Error'
          });
        })
    );
  } else {
    // Handle other types of requests (GET, PUT, etc.) as needed
    event.respondWith(
    (async function () {
      let response = await caches.match(event.request);
      console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
      if (response) {
        return response;
      }

      response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
      cache.put(event.request, response.clone());
      return response;
    })()
  );
  }
});

// Listening for messages from the client
self.addEventListener('message', function(event) {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});

// Helper function to check if the request is for static resources
function isStaticResource(request) {
  return contentToCache.some((resource) => request.url.includes(resource));
}
// Inform clients about the new version
// Notify all controlled clients when caching is complete
// self.addEventListener('activate', event => {
    // event.waitUntil(
        // self.clients.claim().then(() => {
            // return self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
                // clients.forEach(client => {
                    // client.postMessage('serviceWorkerReady'); // Notify main thread
                // });
            // });
        // })
    // );
// });

// Notify main thread when caching is done
self.addEventListener('message', event => {
    if (event.data === 'isCachingComplete') {
        console.log('Caching complete. Sending confirmation to client.');
        event.source.postMessage('cachingComplete');
    }
});
