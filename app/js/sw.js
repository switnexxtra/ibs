(function (self) {
  'use strict';

  importScripts('/framework/js/workers/sw-toolbox.js');

  self.toolbox.options.debug = false;

  self.toolbox.router.get(/\/(home|index)\.html/, self.toolbox.networkOnly, {
    cache: {
      name: 'pages'
    }
  });

  self.toolbox.router.get('/', self.toolbox.networkFirst, {
    cache: {
      name: 'pages'
    }
  });

  self.toolbox.router.get(/\.json/, self.toolbox.cacheFirst, {
    cache: {
      name: 'json'
    }
  });

  self.toolbox.router.get('build.fingerprint', self.toolbox.networkOnly, {
    cache: {
      name: 'pages'
    }
  });

  self.toolbox.router.get(/\/digx\/v1\//, self.toolbox.networkOnly, {
    cache: {
      name: 'services',
      maxAgeSeconds: 300,
      maxEntries: 50
    }
  });

  self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', function (event) {
    event.waitUntil(Promise.all([caches.delete('services'), caches.delete('components'), self.clients.claim()]));
  });

  self.addEventListener('message', function (event) {
    if (event.data === 'logout') {
      caches.delete('services');
    }
  });

})(self);
