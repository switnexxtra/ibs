/*
	Copyright 2016 Google Inc. All Rights Reserved.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	    http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
(function() {
    'use strict';
    var workerScript = document.currentScript && document.currentScript.dataset.serviceWorker;

    if (workerScript && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register(workerScript).then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    }
})();
