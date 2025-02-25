define([
  "knockout",
  "jquery",
  "ojs/ojcore",
  "../../model/dashboard",
  "text!../template/dashboard.html",
  "framework/js/constants/constants",
  "ojL10n!resources/nls/dashboard",
  "framework/js/base-models/ko/formatters"
], function (
  ko,
  $,
  oj,
  DashboardModel,
  template,
  Constants,
  locale,
  Formatters
) {
  "use strict";

  /**
   * View Model for Dashboard component of the base components. It is used to render the 4 panel dashboard along with managing other components loading, history management and context management.
   * @class dashboard
   * @version Revision: 31277
   * @property {Object} applicationName - Stores the name of the application for the JSON layout fetching purposes and component registering purposes.
   * @property {Object} applicationUrl - Stores the URL of the service to be hit the first time dashboard is rendered.
   * @property {Object} module - Stores the module information from the layout JSON.
   * @property {Object} layout - Stores the viewport specific layout object fecthed from the layout JSON.
   * @property {Array} contexts - Stores the contexts of the application components in an array.
   * @property {boolean} renderComponent - Stores the flag if the component is ready to be rendered or not.
   * @property {boolean} renderModuleData - Stores the flag representing if the module data has been successfully fetched or not.
   * @property {Object} userData - Stores the userData fetched from the parties/me service.
   * @property {Object} initialViewPort - Stores the initialViewPort size of the device when the page is being rendered.
   * @property {boolean} dashboard - Stores the boolean to maintain state of the dashboard. If true, it represents the dashbaord view, else non-dashboard component.
   * @property {boolean} backAllowed - Stores the boolean to maintain if the on-screen back button should be displayed.
   * @property {boolean} loadComponent - Stores the value for the new non-dashboard component to load via @function loadComponent()
   * @property {boolean} data - Stores the context being passed to the non-dashboard components.
   */
  var vm = function (rootParams) {
    var self = this;

    rootParams.baseModel.setFormatter(new Formatters());
    Object.seal(rootParams.baseModel);

    var genericViewModel = rootParams.rootModel;

    self.userData = {};

    /**
     * Defining the variables for the whole component.
     */
    self.constants = Constants;
    self.locale = locale;
    self.layout = ko.observable();

    var paramContexts = {};

    self.renderModuleData = ko.observable(false);
    self.dataToBePassed = ko.observable();

    var initialViewPort = rootParams.baseModel.getDeviceSize();

    self.isDashboard = ko.observable(true);
    self.backAllowed = ko.observable(false);
    self.isConfirmScreenVisited = ko.observable(false);
    self.breadcrumbs = ko.observableArray();
    self.isHelpAvailable = ko.observable(false);
    self.modalComponent = ko.observable();
    self.languageOptions = ko.observableArray();

    self.loadedComponent = ko.observable().extend({
      notify: "always"
    });

    self.headerName = ko.observable();
    self.warningsDismissed = false;
    self.headerCaption = ko.observable();
    self.application = ko.observable();
    self.totalMailboxCount = ko.observable(0);

    self.pageTitle = ko.pureComputed(function () {
      return rootParams.baseModel.format("{txn_name} - {bankName}", {
        txn_name: self.headerName() || self.locale.bankName,
        bankName: self.locale.bankName
      });
    });

    self.data = {};

    var module = null,
      dashboardJSON = {},
      prvsPage = null,
      prvsModule = null,
      previousState = null;

    self.helpComponent = {
      componentName: ko.observable(),
      params: ko.observable()
    };

    var currentModule,
      vmMetaData,
      componentsWithStates = {
        "manage-accounts": "applicationType"
      };
    /**
        Registering some common components which are used in all applications.
        */

    function registerRequiredComponents(registerElement) {
      registerElement(["responsive-img", "page-section", "row"]);
      registerElement("menu", "core");
      registerElement("offline-notification", "core");
      registerElement("error", "core");
      registerElement("header", "core");
      registerElement("footer", "cz");
      registerElement("docked-menu", "core");
      registerElement("dashboard-heading", "core");
    }

    registerRequiredComponents(rootParams.baseModel.registerElement);

    rootParams.baseModel.registerComponent(
      "change-password",
      "change-password"
    );

    function startLoader(time) {
      $("body").addClass("page-is-changing");

      setTimeout(function () {
        $("body").removeClass("page-is-changing");
      }, time || 1000);
    }

    function computeState(state) {
      if (state) {
        return "~~" + state;
      }

      return "";
    }

    /**
     * The function being used to manage history and pushes the new component stages into the web browser history object.
     * @param  {String} componentToAdd The name of the component to come.
     * @function maintainHistory
     *
     */
    function maintainHistory(fragment, isModule, params) {
      var shortUrl = window.location.origin + window.location.pathname,
        newUrl;

      if (isModule) {
        newUrl = shortUrl + "?module=" + fragment;
      } else {
        shortUrl += "?module=" + rootParams.baseModel.QueryParams.get("module");
        newUrl = shortUrl + "&page=" + fragment;

        if (Object.keys(componentsWithStates).indexOf(fragment) > -1) {
          newUrl += "&state=" + params[componentsWithStates[fragment]];
        }
      }

      if (newUrl !== shortUrl) {
        history.pushState(null, null, newUrl);
      }

      return true;
    }

    function resetVM() {
      if (!rootParams.baseModel.large()) {
        $("#informationPopupHeader").trigger("closeFloatingPanel");
      }
      self.helpComponent.componentName(void 0);
      self.isHelpAvailable(false);
      self.headerName(void 0);
      self.headerCaption(void 0);
      startLoader();
      $("#generic-authentication").remove();
      $("div.main-content").show();
      window.scrollTo(0, 0);
    }

    function goToDashBoard() {
      self.switchModule();
    }

    /**
     * The function which registers the component once the panel object is passed to it. It traverses the panel object and registers the components accordingly.
     * @param  {Object} panel The panel to be registered.
     * @function registerDashBoardComponent
     *
     */
    function registerDashBoardComponent(panel) {
      if (panel) {
        for (var j = 0; j < panel.length; j++) {
          if (panel[j].children) {
            for (var k = 0; k < panel[j].children.length; k++) {
              rootParams.baseModel.registerComponent(
                panel[j].children[k].id,
                "widgets/" + (panel[j].children[k].module || module.name)
              );
            }
          } else {
            rootParams.baseModel.registerComponent(
              panel[j].id,
              "widgets/" + (panel[j].module || module.name)
            );
          }
        }
      }
    }

    /**
     * The function to register the panels across the 4 panels.
     * @param  {Object} panel The panel to be registered.
     * @function registerPanels
     *
     */
    function registerPanels() {
      registerDashBoardComponent(self.layout().topPanel);
      registerDashBoardComponent(self.layout().leftPanel);
      registerDashBoardComponent(self.layout().rightPanel);
      registerDashBoardComponent(self.layout().middlePanel);
    }

    /**
     * The function used to set the layout of the page depending on the viewport of the page.
     * Uses the layout JSON to update the self.layout() variable which contains the layout for the current viewport.
     * @function setLayout
     *
     */
    function setLayout() {
      if (module.layout[rootParams.baseModel.getDeviceSize()]) {
        self.layout(module.layout[rootParams.baseModel.getDeviceSize()]);
      } else {
        self.layout(module.layout.default);
      }

      registerPanels();
    }

    function setModulesData(data) {
      module = data;
      setLayout();
      self.headerName(self.locale.headers[module.titleName]);
      self.headerCaption(self.locale.headers[module.titleCaption]);
      self.renderModuleData(true);
      self.isDashboard(true);
    }

    function requestDashboardPromise() {
      return new Promise(function (resolve) {
        if (self.dashboardRequestPromise) {
          resolve(Promise.resolve(self.dashboardRequestPromise));
        } else {
          genericViewModel.userInfoPromise.then(function () {
            resolve(Promise.resolve(self.dashboardRequestPromise));
          });
        }
      });
    }
    /**
     * The model function called to fetch the details of the user and sets it in self.userData() variable.
     * @function fetchAccessPolicy
     */

    function loadDashboard() {
      return new Promise(function (resolve) {
        if (!ko.utils.unwrapObservable(currentModule.applicationUrl)) {
          resolve();
        } else {
          /**
           * The model function called to fetch the user specified URL as defined in the currentModule.applicationUrl() and sets it in self.dataToBePassed().
           * @function fetchDetails
           */
          DashboardModel.fetchDetails(currentModule.applicationUrl)
            .then(function (data) {
              self.dataToBePassed(data);
              resolve(data);
            })
            .catch(function () {
              resolve();
            });
        }

        if (!currentModule.homeComponent) {
          /**
           * The model function called to fetch the JSON file for layout purposes.
           * @param  {Object} self.applicationName The name of the application for which it searches the json/dashboard/{self.applicationName()}.json file.
           * @function fetchModules
           */
          if (!dashboardJSON[currentModule.application]) {
            require.undef("json!dashboard/" + currentModule.application);

            DashboardModel.fetchModules(currentModule.application).then(
              function (data) {
                dashboardJSON[currentModule.application] = data;
                setModulesData(data);
              }
            );
          } else {
            setModulesData(dashboardJSON[currentModule.application]);
          }
        } else {
          self.data = self;

          rootParams.baseModel.registerComponent(
            currentModule.homeComponent,
            currentModule.application
          );

          self.renderModuleData(true);
          self.loadedComponent(currentModule.homeComponent);
          self.isDashboard(false);
        }
      });
    }

    /**
     * This function checks if protected resources are being accessed for DB Authenticator setup and redirects to login page for the same.
     * @function dbAuthenticator
     * @returns {void}
     */
    function dbAuthenticator(redirectURL) {
      if (Constants.authenticator === "OBDXAuthenticator") {
        if (!self.userData.userProfile) {
          if (window.cordova) {
            if (window.location.pathname.includes(Constants.pages.secureMobilePage)) {
              rootParams.baseModel.switchPage({
                module: "login",
                redirect_url: encodeURIComponent(redirectURL),
                menuNavigationAvailable: genericViewModel.queryMap ? genericViewModel.queryMap.menuNavigationAvailable : genericViewModel.menuNavigationAvailable
              }, false);
            }
          } else {
            if (window.location.pathname === Constants.pages.securePage) {
              rootParams.baseModel.switchPage({
                module: "login",
                redirect_url: encodeURIComponent(redirectURL),
                menuNavigationAvailable: genericViewModel.queryMap ? genericViewModel.queryMap.menuNavigationAvailable : genericViewModel.menuNavigationAvailable
              }, false);
            }
          }
        }
      }
    }

    self.mainContentLoaded = function () {
      genericViewModel.dashboardPromiseResolve();
    };

    /**
     * This function is used to navigate away from dashboard to any non-dashboard component specified by @param componentName.
     * This function also maintains the history and manages component context inside self.data.
     * @function loadComponent
     *
     * @param  {String} componentName The name of the component being loaded.
     * @param  {Object} params        The params being passed to the component.
     * @param  {Object} context       The context being passed to the component.
     */
    self.loadComponent = function (componentName, params, context) {
      dbAuthenticator();

      if (
        performance.memory &&
        performance.memory.usedJsHeapSize / 1024 / 1024 > 50
      ) {
        rootParams.baseModel.showMessages(
          null,
          ["total_JS_heap_size_exceeded_the_limit"],
          "ERROR"
        );
      }

      self.isConfirmScreenVisited(false);
      $(window).off("hashchange");
      rootParams.baseModel.runAxe();
      params = params || {};

      if (params === context) {
        context = null;
      }

      self.breadcrumbs.push({
        label: componentName,
        type: "component"
      });

      paramContexts[
        componentName +
        computeState(params[componentsWithStates[componentName]])
      ] = params;

      self.data = context || {};
      self.data.params = params;
      if (params.dateObj) {
        self.data.fromDate = params.dateObj.fromDate;
        self.data.toDate = params.dateObj.toDate;
      }
      previousState = params;
      maintainHistory(componentName, false, params);
      prvsPage = rootParams.baseModel.QueryParams.get("page");
      prvsModule = rootParams.baseModel.QueryParams.get("module");
      self.loadedComponent(componentName);
      resetVM();
      self.helpComponent.params(null);
      self.helpComponent.componentName(componentName);
      self.isDashboard(false);
      self.backAllowed(true);
    };

    self.switchModule = function (module) {
      dbAuthenticator();
      module = vmMetaData[module] ? module : genericViewModel.dashboardRole;

      self.breadcrumbs.remove(function (item) {
        return item.type !== "home";
      });

      $(window).off("hashchange");
      self.isConfirmScreenVisited(false);
      maintainHistory(module, true);
      prvsModule = rootParams.baseModel.QueryParams.get("module");
      currentModule = vmMetaData[module];
      currentModule.application = module;
      self.application(currentModule.application);
      self.renderModuleData(false);
      self.layout(null);

      history.replaceState({}, {},
        window.location.origin + window.location.pathname + "?module=" + module
      );

      resetVM();
      self.dashboardRequestPromise = loadDashboard();
    };

    /**
     * This function refreshes the DOM nodes and header values and implements the on-screen back button functionality.
     * @function hideDetails
     *
     */
    self.hideDetails = function () {
      self.helpComponent.componentName(void 0);
      self.isHelpAvailable(false);
      history.back();
    };

    self.openDashBoard = function (confirmMsg) {
      if (!genericViewModel.menuNavigationAvailable) {
        return;
      }

      if (confirmMsg) {
        var currentTime = Date.now();

        $(".confirm-dialog").remove();

        var parent = document.createElement("div");

        parent.setAttribute("class", "confirm-dialog");

        parent.setAttribute(
          "data-bind",
          "component :  {name: \"confirm-dialog\", params:{rootModel: $data}}"
        );

        rootParams.baseModel.registerElement("confirm-dialog", "core");
        rootParams.baseModel.registerElement("modal-window");
        parent.id = currentTime;
        document.body.appendChild(parent);

        var confirmBoxContext = {
          onYes: goToDashBoard,
          registerElement: rootParams.baseModel.registerElement
        };

        ko.applyBindings(
          confirmBoxContext,
          document.getElementById(currentTime)
        );
      } else {
        goToDashBoard();
      }
    };

    self.getDashboardContext = function () {
      return Object.seal({
        isDashboard: self.isDashboard,
        isHelpAvailable: self.isHelpAvailable,
        headerName: self.headerName,
        headerCaption: self.headerCaption,
        application: self.application,
        helpComponent: self.helpComponent,
        loadComponent: self.loadComponent,
        switchModule: self.switchModule,
        hideDetails: self.hideDetails,
        openDashBoard: self.openDashBoard,
        userData: self.userData,
        getDashboardPromise: requestDashboardPromise,
        modalComponent: self.modalComponent,
        dataToBePassed: self.dataToBePassed,
        isConfirmScreenVisited: self.isConfirmScreenVisited,
        backAllowed: self.backAllowed,
        resetModalComponent: self.resetModalComponent,
        totalMailboxCount: self.totalMailboxCount
      });
    };

    self.menuOptionSelect = function (data) {
      if (data.name === "DASHBOARD") {
        return self.switchModule();
      }

      if (data.type && data.type === "MODULE") {
        return self.switchModule(data.resource);
      } else if (data.type && data.type === "PAGE") {
        rootParams.baseModel.switchPage(
          data.location.args,
          data.location.isSecure
        );

        return false;
      } else if (data.type && data.type === "FUNCTION") {
        rootParams.baseModel[data.functionName](data.params);
      } else if (data.type && data.type === "MODAL") {
        rootParams.baseModel.registerComponent(data.name, data.module);
        self.modalComponent(data.name);
      } else if (data.applicationType) {
        self.loadComponent("manage-accounts", {
          applicationType: data.applicationType,
          defaultTab: data.name,
          moduleURL: data.moduleURL,
          jsonData: data
        });
      } else {
        rootParams.baseModel.registerComponent(data.name, data.module);

        self.loadComponent(data.name, {
          type: data.type,
          jsonData: data
        });
      }
    };

    /**
     * The function used to set the appropriate context for the components and manages the page to be loaded on pressing the browser back button.
     * @function parseUrl
     *
     */
    var parseUrl = function () {
      if (self.isConfirmScreenVisited()) {
        return self.switchModule(currentModule.application);
      }

      $("#generic-authentication").remove();
      $("div.main-content").show();
      self.headerName(void 0);
      self.headerCaption(void 0);

      var currModule = rootParams.baseModel.QueryParams.get("module");

      if (prvsModule === currModule) {
        var currPage = rootParams.baseModel.QueryParams.get("page");

        if (currPage === "confirm-screen") {
          return self.switchModule(currentModule.application);
        }

        self.data.params =
          paramContexts[
            currPage +
            computeState(rootParams.baseModel.QueryParams.get("state"))
          ];

        self.data.previousState = previousState;

        if (
          prvsPage !== currPage ||
          Object.keys(componentsWithStates).indexOf(currPage) > -1
        ) {
          if (currPage) {
            self.backAllowed(true);
            self.loadedComponent(currPage);
            self.backAllowed(true);
          } else {
            self.backAllowed(false);

            if (!currentModule.homeComponent) {
              self.headerName(self.locale.headers[module.titleName]);
              self.headerCaption(self.locale.headers[module.titleCaption]);
              setLayout();
              self.isDashboard(true);
            } else {
              if (!self.data) {
                self.data = self;
              }

              self.loadedComponent(currentModule.homeComponent);
            }

            rootParams.baseModel.setwebhelpID(
              currentModule.application + "-dashboard"
            );
          }

          prvsPage = currPage;
        }
      } else {
        self.switchModule(currModule);
        prvsModule = currModule;
      }
    };

    /**
     * Listen to URL changes caused by back/forward button
     * using the popstate event. Call parseUrl trigger the update.
     */
    window.onpopstate = parseUrl;

    var resizeHandler = ko.computed(function () {
      if (
        rootParams.baseModel.large() ^
        rootParams.baseModel.medium() ^
        rootParams.baseModel.small()
      ) {
        if (initialViewPort !== rootParams.baseModel.getDeviceSize()) {
          initialViewPort = rootParams.baseModel.getDeviceSize();

          if (self.isDashboard() && module) {
            setLayout();
          }
        }
      }
    });

    self.toggleInner = function () {
      require(["ojs/ojoffcanvas"], function () {
        oj.OffcanvasUtils.toggle({
          selector: "#innerDrawer",
          content: ".oj-web-applayout-page",
          modality: "modal",
          displayMode: "push",
          edge: "start"
        });

        $(".mobileMenu").ojNavigationList("refresh");
      });
    };

    $(".back-top").hide();

    $(window).scroll(function () {
      if ($(this).scrollTop() > 100) {
        $(".back-top").fadeIn();
      } else {
        $(".back-top").fadeOut();
      }
    });

    $(".back-top a").click(function () {
      $("body,html").animate({
          scrollTop: 0
        },
        600
      );

      return false;
    });

    genericViewModel.userInfoPromise.then(function (data) {
      currentModule = data.currentModule;
      vmMetaData = data.vmMetaData;
      self.application(currentModule.application);
      $.extend(self.userData, data.userData);
      dbAuthenticator(window.location.search);

      history.replaceState({}, {},
        window.location.origin +
        window.location.pathname +
        "?module=" +
        currentModule.application
      );

      rootParams.baseModel.setwebhelpID(
        currentModule.application + "-dashboard"
      );

      genericViewModel.isUserDataSet(true);
      self.dashboardRequestPromise = loadDashboard();

      DashboardModel.fetchAvailableLocale().then(function (data) {
        self.languageOptions(data.enumRepresentations[0].data);
      });
    });

    self.resetModalComponent = function () {
      self.modalComponent(null);
    };

    self.dispose = function () {
      resizeHandler.dispose();
    };

    self.dismissWarnings = function () {
      $("#warning-container").fadeOut("slow");
      self.warningsDismissed = true;
    };
  };

  return {
    viewModel: vm,
    template: template
  };
});