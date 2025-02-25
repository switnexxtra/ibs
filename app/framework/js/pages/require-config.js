require.config({
    baseUrl: "/",
    waitSeconds: 300,
    paths: {
        "ojs": "framework/js/libs/oraclejet/js/libs/oj/v4.0.0/min",
        "ojtranslations": "framework/js/libs/oraclejet/js/libs/oj/v4.0.0/resources",
        "jquery": "framework/js/libs/jquery/jquery-3.5.1.min",
        "knockout": "framework/js/libs/oraclejet/js/libs/knockout/knockout-3.4.0",
        "knockout-helper": "framework/js/plugins/amd-helper",
        "knockout-mapping": "framework/js/libs/oraclejet/js/libs/knockout/knockout.mapping-latest",
        "text": "framework/js/libs/oraclejet/js/libs/require/text.min",
        "json": "framework/js/plugins/json",
        "jqueryui-amd": "framework/js/libs/oraclejet/js/libs/jquery/jqueryui-amd-1.12.0.min",
        "paperAccordion": "framework/js/pages/accordion",
        "baseService": "framework/js/base-models/service-base",
        "customElements": "framework/js/libs/oraclejet/js/libs/webcomponents/custom-elements.min",
        "abstractBaseModel": "framework/js/base-models/abstract-base-model",
        "baseLogger": "framework/js/base-models/logging-base",
        "baseModel": "framework/js/base-models/ko/base-model",
        "base-model": "framework/js/base-models/base-model",
        "base-models": "framework/js/base-models",
        "worker": "framework/js/base-models/web-worker",
        "promise": "framework/js/libs/oraclejet/js/libs/es6-promise/es6-promise.min",
        "hammerjs": "framework/js/libs/oraclejet/js/libs/hammer/hammer-2.0.8.min",
        "ojdnd": "framework/js/libs/oraclejet/js/libs/dnd-polyfill/dnd-polyfill-1.0.0.min",
        "css": "framework/js/libs/oraclejet/js/libs/require-css/css.min",
        "thirdPartyLibs": "framework/js/libs",
        "ojL10n": "framework/js/libs/oraclejet/js/libs/oj/v4.0.0/ojL10n",
        "platform": "framework/js/base-models/platform"
    },
    shim: {
        "jquery": {
            "exports": "jquery"
        },
        "knockout": {
            "exports": "knockout",
            "deps": ["jquery"]
        },
        "paperAccordion": {
            "exports": "paperAccordion",
            "deps": ["jquery"]
        }
    },
    config: {
        text: {
            useXhr: function () {
                "use strict";
                return true;
            }
        }
    },
    // eslint-disable-next-line no-storage/no-browser-storage
    locale: sessionStorage.getItem("user-locale") || document.getElementsByTagName("html")[0].getAttribute("lang") || "en"
});
define("require-config", [
        "knockout",
        "jquery",
        "knockout-mapping",
        "knockout-helper",
        "baseModel",
        "baseService",
        "text",
        "ojs/ojcore",
        "css"
    ],
    function () {
        "use strict";

    });
require(["platform", "css!framework/js/libs/oraclejet/css/libs/oj/v4.0.0/alta/oj-alta-notag-min"], function (Platform) {
    "use strict";
    Platform.getInstance().then(function () {
        require(["framework/js/view-model/generic-view-model"]);
    });
});