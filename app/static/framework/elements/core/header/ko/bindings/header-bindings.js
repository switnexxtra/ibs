/*  This file contains the view model for Header widget
    on the login and post login screen.
*/
define([
  "ojs/ojcore",
  "knockout",
  "jquery",
  "../../model/header",
  "framework/js/constants/constants",
  "framework/js/constants/extensions",
  "text!../template/header-retail.html",
  "text!../template/wallet-header.html",
  "ojL10n!resources/nls/header",
  "platform"
], function (oj, ko, $, HeaderModel, Constants, Extensions, templateDefault, walletTemplate, resourceBundle, Platform) {
  "use strict";
  var vm = function (params) {
      var self = this;
      self.menuNavigationAvailable = params.menuNavigationAvailable;
      self.loadedComponent = params.loadedComponent;
      self.toggleInner = params.toggleInner;
      self.resourceBundle = resourceBundle;
      self.isExternalPayment = self.isExternalPayment ? self.isExternalPayment : null;
      self.module = Constants.module;
      self.userSegment = Constants.userSegment;
      self.unreadmailCount = ko.observable(0);
      self.unreadAlertCount = ko.observable(0);
      self.unreadNotificationCount = ko.observable(0);
      self.totalUnreadNotification = ko.observable(0);
      self.searchKeyword = ko.observableArray();
      self.searchTags = ko.observableArray();
      self.isSearchVisible = ko.observable(false);
      self.loadMiniMailBox = ko.observable(false);
      self.popupComponent = ko.observable(null);
      params.baseModel.registerComponent("search", "common");
      params.baseModel.registerComponent("mini-mailbox", "mailbox");
      params.baseModel.registerComponent("locator", "atm-branch-locator");
      params.baseModel.registerElement(["floating-panel", "help"]);
      params.baseModel.registerElement("modal-window");
      require(["ojs/ojpopup"], function () {
        self.popupComponent("ojPopup");
      });

      var menu, menuPosition, placeholder,
        isAdded;
      self.openMailBox = function () {
        var isOpen = $("#popup1").ojPopup("isOpen");
        if (isOpen) {
          $("#popup1").ojPopup("close", "#mailbox-holder");
        } else {
          self.loadMiniMailBox(false);
          ko.tasks.runEarly();
          $("#popup1_wrapper_layer").show();
          $("#popup1").ojPopup("open", "#mailbox-holder", {
            "my": {
              "horizontal": "right",
              "vertical": "top"
            },
            "at": {
              "horizontal": "end",
              "vertical": "bottom"
            }
          });

          self.loadMiniMailBox(true);
        }
      };

      self.showHeaderMenu = ko.observable(false);
      self.showInformation = function () {
        if (params.dashboard.isHelpAvailable()) {
          $("#informationPopupHeader").trigger("openFloatingPanel");
        }
      };

      self.showSearchBar = function () {
        self.searchKeyword(null);
        self.isSearchVisible(true);
        ko.tasks.runEarly();
        $(".nav-menu .oj-inputsearch-input").focus();
      };

      self.searchKeyword.subscribe(function (newValue) {
        if (newValue) {
          var selectedValue;
          try {
            selectedValue = JSON.parse(newValue);
          } catch (e) {
            return;
          }
          params.menuOptionSelect(selectedValue);
          self.isSearchVisible(false);
        }
      });

      self.login = function () {
        if (Constants.authenticator === "OBDXAuthenticator") {
          params.baseModel.switchPage({
            module: "login"
          }, false);
        } else {
          params.baseModel.switchPage({}, true);
        }
      };

      function flattenMenuArray(array, parent) {
        var result = [];
        array.forEach(function (element) {
          if (Array.isArray(element.submenus)) {
            result = result.concat(flattenMenuArray(element.submenus, element.name));
          } else {
            element.parent = parent;
            result.push(element);
          }
        });

        return result;
      }

      self.logout = function () {
        window.onbeforeunload = null;
        $("#logoutPopup").trigger("openModal");
        $(".page-overlay").removeClass("hide");
        if ($.active === 0) {
          HeaderModel.logOut(function () {
            Platform.getInstance().then(function (platform) {
              platform("logOut", Constants.authenticator);
            });
          }).catch(function () {
            $(".page-overlay").addClass("hide");
          });
        } else {
          setTimeout(self.logout, 100);
        }
      };
      $(document).on("logout", document, function () {
        self.logout();
      });
      var getMailCount = function () {
        HeaderModel.getMailCount().done(function (data) {
          self.unreadmailCount(data.summary.items[0].unReadCount);
          self.unreadAlertCount(data.summary.items[1].unReadCount);
          self.unreadNotificationCount(data.summary.items[2].unReadCount);
          self.totalUnreadNotification(self.unreadmailCount() + self.unreadAlertCount() + self.unreadNotificationCount());
          params.dashboard.totalMailboxCount(self.unreadmailCount() + self.unreadAlertCount() + self.unreadNotificationCount());
        });
      };

      params.rootModel.userInfoPromise.then(function () {
        ko.utils.extend(self, params.rootModel);
        self.userSegment = Constants.userSegment;
        if (params.dashboard.userData.userProfile) {
          getMailCount();
        }

        require.undef("json!menu");
        require(["json!menu", "ojL10n!resources/nls/menu"], function (MenuJSON, MenuLocale) {
          var menus;
          if (MenuJSON.menus[params.baseModel.getDeviceSize()]) {
            menus = MenuJSON.menus[params.baseModel.getDeviceSize()];
          }

          if (!menus) {
            menus = MenuJSON.menus.default;
          }

          var output = flattenMenuArray(menus).map(function (element) {
            if (MenuLocale.menu.groups[element.parent]) {
              return {
                value: JSON.stringify(element),
                label: params.baseModel.format("{type} - {selection}", {
                  type: MenuLocale.menu.groups[element.parent],
                  selection: MenuLocale.menu.groups[element.name]
                })
              };
            } else {
              return {
                value: JSON.stringify(element),
                label: params.baseModel.format("{selection}", {
                  selection: MenuLocale.menu.groups[element.name]
                })
              };
            }
          });
          self.searchTags(output);
        });
        self.showHeaderMenu(true);
      });

      self.showHeaderMenu.subscribe(function (newValue) {
        if (!newValue) {
          getMailCount();
          self.showHeaderMenu(true);
        }
      });

      var setoffset = function () {
        menu = document.querySelector(".fixed-header");
        if (placeholder && isAdded) {
          menu.parentNode.removeChild(placeholder);
          menu.classList.remove("sticky");
        }

        placeholder = document.createElement("div");
        isAdded = false;
      };
      $(window).scroll(function () {
        var y = $(this).scrollTop();
        if (y >= 60) {
          $(".header-container").addClass("shadow");
        } else {
          $(".header-container").removeClass("shadow");
        }

        menuPosition = menu.getBoundingClientRect();
        if (window.pageYOffset >= menuPosition.top && !isAdded) {
          placeholder.style.width = menuPosition.width + "px";
          placeholder.style.height = menuPosition.height + "px";
          menu.classList.add("sticky");
          menu.parentNode.insertBefore(placeholder, menu);
          isAdded = true;
        } else if (window.pageYOffset < menuPosition.top && isAdded) {
          menu.classList.remove("sticky");
          menu.parentNode.removeChild(placeholder);
          isAdded = false;
        }
      });

      self.resetModalComponent = function () {
        params.dashboard.modalComponent("");
      };
      $(document).keyup(function (event) {
        if (event.keyCode === 80 && event.altKey) {
          event.preventDefault();
          $("a[openProfile=\"true\"]")[0].click();
        }
      });

      var resizeHandler = ko.computed(function () {
        if (params.baseModel.large() ^ params.baseModel.medium() ^ params.baseModel.small()) {
          setoffset();
        }
      });

      self.dispose = function () {
        resizeHandler.dispose();
      };

      self.menuHeight = $(window).height() + "px";
    },
    template = templateDefault;
  if (Constants.module === "WALLET" && Constants.userSegment !== "ADMIN") {
    template = walletTemplate;
  }

  return {
    viewModel: vm,
    template: template
  };
});