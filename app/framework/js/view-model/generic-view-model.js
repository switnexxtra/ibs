define([
    "knockout",
    "jquery",
    "framework/js/constants/constants",
    "baseService",
    "baseModel",
    "baseLogger",
    "text!build.fingerprint",
    "extensions/extension",
    "platform",
    "promise"
], function (ko, $, Constants, BaseService, BaseModel, BaseLogger, BuildFingerPrint, ExtensionOverride, Platform) {
    "use strict";
    var baseModel = BaseModel.getInstance();
    window.console.log = console.log = BaseLogger.info;
    var module = baseModel.QueryParams.get("module"),
        context = baseModel.QueryParams.get("context"),
        queryMap = baseModel.QueryParams.get(),
        modalComponent = ko.observable(false);
    var vm = {
            roles: [],
            getBaseModel: function () {
                return baseModel;
            },
            menuNavigationAvailable: true,
            sessionAvailable: false
        },
        userSegmentMap = {
            "CORPADMIN": "admin",
            "CORP": "corporate",
            "RETAIL": "retail",
            "ANON": "index",
            "ADMIN": "admin"
        },
        isDashboardSet = ko.observable(true),
        roles = ExtensionOverride.customRoles.concat(["CorporateAdminChecker", "CorporateAdminMaker", "Viewer", "Checker", "Maker", "AdminChecker", "AdminMaker", "Administrator", "RetailUser"]);
    Constants.buildFingerPrint = JSON.parse(BuildFingerPrint);
    if (!baseModel.isEmpty(baseModel.QueryParams.get("menuNavigationAvailable"))) {
        vm.menuNavigationAvailable = baseModel.QueryParams.get("menuNavigationAvailable") === "true";
    }
    baseModel.menuNavigationAvailable = false;

    function isMaker(roleList) {
        return roleList.indexOf("Maker") || roleList.indexOf("CorporateAdminMaker") || roleList.indexOf("AdminMaker");
    }

    function computeRole(role, roleList) {
        var extRole = ExtensionOverride.evaluateDashboard(role, roleList);
        if (extRole) {
            return extRole;
        } else if (role === "Viewer") {
            return "viewer";
        } else if (role === "Checker" || role === "CorporateAdminChecker" || role === "AdminChecker") {
            if (!isMaker(roleList)) {
                return "checker";
            } else {
                return "approver";
            }
        } else if (role === "Maker" || role === "CorporateAdminMaker" || role === "AdminMaker") {
            return "maker";
        }
        return "dashboard";
    }

    function computeDashboardRole(module, roles) {
        if (!module) {
            return computeRole(roles[0], roles);
        } else {
            if ($.inArray(module, ["maker", "viewer", "approver"]) > -1 && roles.toString().toLowerCase().indexOf(module) > -1) {
                return module;
            } else {
                return computeRole(roles[0], roles);
            }
        }
    }

    function loadCSS(context) {
        var mainCSS = (Constants.brandPath ? Constants.brandPath + "/" : "") + context + "/css/main" + ((!Constants.brandPath && Constants.buildFingerPrint.timeStamp) ? ("." + Constants.buildFingerPrint.timeStamp) : "");
        var widgetCSS = (Constants.brandPath ? Constants.brandPath + "/" : "") + context + "/css/widgets" + ((!Constants.brandPath && Constants.buildFingerPrint.timeStamp) ? ("." + Constants.buildFingerPrint.timeStamp) : "");
        $("body").addClass("page-is-changing");
        require.undef("css!" + mainCSS);
        require.undef("css!" + widgetCSS);
        $("link[rel=stylesheet][href$=\"" + mainCSS + ".css\"]").remove();
        $("link[rel=stylesheet][href$=\"" + widgetCSS + ".css\"]").remove();
        require(["css!" + mainCSS, "css!" + widgetCSS], function () {
            $("body").removeClass("page-is-changing");
            $("div.cd-logo").removeClass("cd-logo");
        });

    }
    loadCSS("index");

    function getLocalJSON(module, data, dashboardRole, resolve) {
        var landingContext = userSegmentMap[Constants.userSegment] || Constants.jsonContext;
        loadCSS(landingContext);
        baseModel.menuNavigationAvailable = vm.menuNavigationAvailable;
        require(["json!root!framework/json/landings/" + landingContext], function (jsonData) {
            var currentModule = null;
            if (queryMap && queryMap.homeComponent && queryMap.homeModule) {
                currentModule = {
                    homeComponent: queryMap.homeComponent,
                    application: queryMap.homeModule
                };
            } else {
                currentModule = jsonData[module];
                if (currentModule) {
                    jsonData[module].application = module;
                } else if (module === "user-login-configuration") {
                    currentModule = {
                        homeComponent: "configuration-base",
                        application: "user-login-configuration"
                    };
                } else if (module === "system-configuration") {
                    currentModule = {
                        homeComponent: "system-configuration-home",
                        application: "system-configuration"
                    };
                } else if (module === "change-password") {
                    currentModule = {
                        homeComponent: "change-password",
                        application: "change-password"
                    };
                } else {
                    module = dashboardRole || "home";
                    currentModule = jsonData[module];
                    jsonData[module].application = module;
                }
            }
            vm.dashboardRole = dashboardRole;
            resolve({
                currentModule: currentModule,
                vmMetaData: jsonData,
                userData: data
            });
        });
    }

    function computeContext(segment) {
        if (segment === "CORPADMIN") {
            return "corp-admin";
        } else if (segment === "RETAIL") {
            return "retail";
        } else if (segment === "CORP") {
            return "corporate";
        } else if (segment === "ADMIN") {
            return "admin";
        }
        return "index";
    }

    function computeSegment(roles, context) {
        var rolesString = roles.toString().toLowerCase();
        var extUserType = ExtensionOverride.evaluateUserType(roles);
        if (context) {
            return "ANON";
        } else if (extUserType) {
            return extUserType;
        } else if (rolesString.indexOf("corporateadminmaker") > -1 || rolesString.indexOf("corporateadminchecker") > -1) {
            return "CORPADMIN";
        } else if (rolesString.indexOf("retailuser") > -1) {
            return "RETAIL";
        } else if (rolesString.indexOf("corporateuser") > -1) {
            return "CORP";
        } else if (rolesString.indexOf("administrator") > -1) {
            return "ADMIN";
        }
        return "ANON";
    }

    function changeUserSegment(userSegment, userData, module) {
        $(window).off();
        isDashboardSet(false);
        vm.isUserDataSet(false);
        ko.tasks.runEarly();
        var array = roles.filter(function (element) {
            return userData.userProfile && userData.userProfile.roles.indexOf(element) !== -1;
        });
        var dashboardRole = computeDashboardRole(module, array);
        module = module || dashboardRole;
        Constants.userSegment = userSegment;
        Constants.jsonContext = ExtensionOverride.evaluateContext(Constants.userSegment, vm.roles) || computeContext(Constants.userSegment);
        vm.userInfoPromise = new Promise(function (resolve) {
            getLocalJSON(module, userData, dashboardRole, resolve);
            isDashboardSet(true);
        });
    }

    function setConstants(entity, segment, brand, timezoneOffset, jsonContext) {
        Constants.currentEntity = entity || Constants.currentEntity || Constants.defaultEntity;
        Constants.userSegment = segment;
        Constants.brandPath = brand;
        Constants.jsonContext = jsonContext;
        Constants.timezoneOffset = timezoneOffset;
    }

    function onError(jqXHR, resolve, module) {
        var segment = computeSegment([], context);
        var jsonContext = ExtensionOverride.evaluateContext(segment, vm.roles) || computeContext(segment);
        setConstants("", "ANON", null, null, jsonContext);
        if (jqXHR && jqXHR.status === 400) {
            vm.sessionAvailable = true;
            if (jqXHR.responseJSON.message.code === "DIGX_UM_042") {
                module = "change-password";
            } else {
                baseModel.showMessages(jqXHR);
                module = "error";
            }
        }
        module = module || "home";
        getLocalJSON(module, null, module, resolve);
    }

    function systemConfiguration(module, userData, dashboardRole, resolve) {
        BaseService.getInstance().fetch({
            url: "configurations/base/dayoneconfig/properties/SYSTEM_CONFIGURATION"
        }).then(function (data) {
            if (data.configResponseList[0].propertyValue === "false") {
                module = "system-configuration";
            }
            getLocalJSON(module, userData, dashboardRole, resolve);
        });
    }

    function onSuccess(data, resolve) {
        vm.sessionAvailable = true;
        Platform.getInstance().then(function (platform) {
            if (module === "login") {
                var showLogoutPopup = platform("logOutPop", modalComponent);
                if (showLogoutPopup) {
                    return;
                }
                module = null;
            }
            var dashboardRole;
            var array = roles.filter(function (element) {
                return data.userProfile.roles.indexOf(element) !== -1;
            });
            vm.roles = array;
            var segment = computeSegment(data.userProfile.roles, context);
            if (!context) {
                vm.currentRole.push(segment + "~" + array[0]);
            }
            dashboardRole = computeDashboardRole(module, array);
            if (!data.firstLoginFlowDone) {
                module = "user-login-configuration";
            } else {
                module = module || dashboardRole;
            }
            var entity;
            if (!baseModel.isEmpty(baseModel.QueryParams.get("entity"))) {
                entity = baseModel.QueryParams.get("entity");
            } else {
                entity = data.userProfile.homeEntity;
            }
            var jsonContext = ExtensionOverride.evaluateContext(segment, vm.roles) || computeContext(segment);
            setConstants(entity, segment, data.branding, data.userProfile.timeZoneDTO.offset, jsonContext);
            if (Constants.userSegment === "ADMIN" && data.userProfile.roles.indexOf("AuthAdmin") !== -1) {
                systemConfiguration(module, data, dashboardRole, resolve);
            } else {
                getLocalJSON(module, data, dashboardRole, resolve);
            }
        });
    }

    var dashboardPromiseResolve;
    var dashboardPromise = new Promise(function (resolve) {
        dashboardPromiseResolve = resolve;
    });

    function setUserInformation() {
        return new Promise(function (resolve) {
            return dashboardPromise.then(function () {
                return BaseService.getInstance().fetch({
                    url: "me",
                    showMessage: false
                }).then(function (data) {
                    $(document).off("2facancelled", document);
                    if (data.userProfile) {
                        Platform.getInstance().then(function (platform) {
                            platform("postLogin", data.userProfile);
                        });
                    }
                    onSuccess(data, resolve);
                }, function (jqXHR) {
                    onError(jqXHR, resolve, module);
                });
            });
        });
    }

    $(document).on("2facancelled", document, function () {
        $(document).trigger("logout");
    });
    $(document).ready(function () {
        baseModel.registerElement("dashboard", "core");
        baseModel.registerElement("message-box", "core");
        baseModel.registerElement("modal-window");
        ko.utils.extend(vm, {
            dashboardPromiseResolve: dashboardPromiseResolve,
            userInfoPromise: setUserInformation(),
            isUserDataSet: ko.observable(false),
            queryMap: queryMap || null,
            changeUserSegment: changeUserSegment,
            isDashboardSet: isDashboardSet,
            currentRole: ko.observableArray(),
            computeRole: computeRole,
            dashboardRole: null,
            modalLogoutComponent: modalComponent
        });
        $(".message-box").remove();
        ko.applyBindings(vm);
    });
});