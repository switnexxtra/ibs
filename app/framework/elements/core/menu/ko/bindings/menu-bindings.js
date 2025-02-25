define([
    "ojs/ojcore",
    "knockout",
    "jquery",
    "text!../template/menu.html",
    "../../model/menu",
    "ojL10n!resources/nls/menu",
    "framework/js/constants/constants",
    "platform",
    "ojs/ojnavigationlist",
    "ojs/ojselectcombobox"
], function(oj, ko, $, template, MenuModel, resourceBundle, Constants, Platform) {
    "use strict";
    var vm = function(params) {
        var self = this;
        self.languageOptions = params.languageOptions;
        self.toggleInner = params.toggleInner;
        params.baseModel.registerElement("breadcrumb", "core");
        params.baseModel.registerElement("profile");
        params.baseModel.registerElement("about", "core");
        params.baseModel.registerElement("entity-switch", "core");
        params.baseModel.registerComponent("manage-accounts", "accounts");
        params.baseModel.registerComponent("mailbox-base", "mailbox");
        params.baseModel.registerComponent("alert-list", "mailbox");
        params.baseModel.registerComponent("notification-list", "mailbox");
        self.showRoleSwitcher = ko.observable(false);
        self.showSecuritySettings = ko.observable(false);
        var genericViewModel = null;
        self.userMappedRoles = [{
            segment: "CORPADMIN",
            roles: ["CorporateAdminChecker", "CorporateAdminMaker"]
        }, {
            segment: "CORP",
            roles: ["Viewer", "Checker", "Maker"]
        }, {
            segment: "ADMIN",
            roles: ["AdminChecker", "AdminMaker", "AuthAdmin"]
        }];
        self.listItem = ko.observableArray();
        self.menuLoaded = ko.observable(false);
        self.nls = resourceBundle;
        params.rootModel.userInfoPromise.then(function() {
            require.undef("json!menu");
            MenuModel.getMenu().then(function(data) {
                if (data.menus[params.baseModel.getDeviceSize()]) {
                    self.listItem(data.menus[params.baseModel.getDeviceSize()]);
                }
                if (!self.listItem().length) {
                    self.listItem(data.menus.default);
                }
                if (params.dashboard.userData.userProfile) {
                    Platform.getInstance().then(function(platform) {
                        platform("displaySecurity", params.dashboard.userData.userProfile.userName, self.showSecuritySettings);
                    });
                    self.userMappedRoles = self.userMappedRoles.filter(function(element) {
                        element.roles = element.roles.filter(function(elem) {
                            return params.dashboard.userData.userProfile.roles.indexOf(elem) !== -1;
                        });
                        return element.roles && element.roles.length > 0;
                    });
                    if (self.userMappedRoles.length > 1 || (self.userMappedRoles.length === 1 && self.userMappedRoles[0].roles.length > 1)) {
                        self.showRoleSwitcher(true);
                    }
                }
                self.menuLoaded(true);
            });
        });
        self.switchLanguage = function(event, data) {
            if (data.optionMetadata.trigger === "option_selected") {
                params.baseModel.setLocale(data.value[0]);
            }
        };
        self.getRootContext = function($root) {
            genericViewModel = $root;
        };

        // Keycode for ALT + M
        $(document).keyup(function(event) {
            if (event.keyCode === 77 && event.altKey) {
                event.preventDefault();
                self.toggleInner();
            }
        });

        self.loadPage = function(data) {
            params.dashboard.headerCaption("");
            self.toggleInner();
            params.menuOptionSelect(data);
            self.selectedItem(null);
        };

        function getSelectedNode(node) {
            var path = node.split("~");
            var nodeObj = self.listItem();

            for (var i = 0; i < path.length; i++) {
                for (var j = 0; j < nodeObj.length; j++) {
                    if (nodeObj[j].name === path[i]) {
                        nodeObj = nodeObj[j].submenus || nodeObj[j];
                        break;
                    }
                }
            }
            self.loadPage(nodeObj);
        }
        self.menuItemSelect = function(event, ui) {
            var node = ui.item[0].id;
            getSelectedNode(node);
        };
        self.selectedItem = ko.observable("dashboard");
        self.selectedItem.subscribe(function(newValue) {

            if (newValue !== null) {
                getSelectedNode(newValue);
            }
        });
        self.itemOnly = function(context) {
            if (Constants.userSegment === "ANON") {
                return true;
            } else {
                return context.leaf;
            }
        };
        params.baseModel.registerComponent("manage-accounts", "accounts");
        var subscriptions = params.rootModel.currentRole.subscribe(function(value) {
            if (params.rootModel.isUserDataSet() && value[0]) {
                var segmentRole = value[0].split("~");
                var computedRole = genericViewModel.computeRole(segmentRole[1], params.dashboard.userData.userProfile.roles);
                if (Constants.userSegment !== segmentRole[0]) {
                    params.rootModel.changeUserSegment(segmentRole[0], params.dashboard.userData, computedRole);
                } else {
                    if (params.dashboard.application() !== computedRole) {
                        params.rootModel.dashboardRole = computedRole;
                        params.dashboard.switchModule(computedRole);
                    }
                }
            }
        });
        self.dispose = function() {
            subscriptions.dispose();
        };
    };
    return {
        viewModel: vm,
        template: template
    };
});