define(["baseService"], function(BaseService) {
    "use strict";
    var DashboardModel = function() {
        var baseService = BaseService.getInstance(),
            params;
        return {
            fetchDetails: function(urlParams) {
                var options = {
                    url: urlParams
                };
                return baseService.fetch(options);
            },
            fetchModules: function(moduleName) {
                params = {
                    "moduleName": moduleName
                };
                var options = {
                    url: "dashboard/{moduleName}"
                };
                return baseService.fetchJSON(options, params);
            },
            fetchCustomModules: function(module) {
                var options = {
                    url: "dashboards" + module,
                    showMessage: false
                };
                return baseService.fetch(options);
            },
            fetchAccessPolicy: function(pageName) {
                params = {
                    "moduleName": pageName
                };
                var options = {
                    url: "authorization?type=ui&page={moduleName}",
                    showMessage: false
                };
                return baseService.fetch(options, params);
            },
            fetchAvailableLocale: function() {
                var options = {
                    url: "enumerations/locale"
                };
                return baseService.fetch(options);
            },
            getDashboardDesignModel: function() {
                var dashboardDesignObj = {
                    "name": null,
                    "layout": {
                        "large": {
                            "topPanel": []
                        },
                        "medium": {
                            "topPanel": []
                        },
                        "small": {
                            "topPanel": []
                        }
                    }
                };
                return dashboardDesignObj;
            }
        };
    };
    return new DashboardModel();
});
