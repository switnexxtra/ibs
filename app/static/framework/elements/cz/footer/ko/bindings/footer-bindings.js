define([
  "ojs/ojcore",
  "knockout",
  "jquery",
  "../../model/footer",
  "text!../template/footer.html",
  "ojL10n!resources/nls/footer"
], function(oj, ko, $, footerModel, template, resourceBundle) {
  "use strict";
  var vm = function(rootParams) {
    var self = this;
    ko.utils.extend(self, rootParams);
    self.resourceBundle = resourceBundle;
    self.testtitle = ko.observable();
      self.sessionTimeoutSeconds = ko.observable();
      self.countdownSeconds = ko.observable();
      self.secondsBeforePrompt = ko.observable();
      self.message1 = ko.observable();
      self.message2 = ko.observable();

      if (rootParams.baseModel.QueryParams.get("module") !== "login"
      && rootParams.baseModel.QueryParams.get("module") !== "home"
      && rootParams.baseModel.QueryParams.get("module") !== "forgot-password"
      && rootParams.baseModel.QueryParams.get("module") !== "forgot-userid"
	&& rootParams.baseModel.QueryParams.get("module") !== "change-password"
      && rootParams.baseModel.QueryParams.get("module") !== "origination"
	&& rootParams.baseModel.QueryParams.get("module") !== "user-login-configuration"
      && rootParams.baseModel.QueryParams.get("module") !== "common"
	&& rootParams.baseModel.cordovaDevice()!=="ANDROID"
	&& rootParams.baseModel.cordovaDevice()!=="IOS"
	) {

    footerModel.IPdelete();

		if (rootParams.baseModel.cordovaDevice()!=="ANDROID" && rootParams.baseModel.cordovaDevice()!=="IOS") {
        window.setTimeout(function(){},2000);
        footerModel.fetchPropertyValue("CZ_SESSION_IDLE_TIMEOUT").done(function(data){
            self.sessionTimeoutSeconds(data.manageUserSession.propertyValue);

            footerModel.fetchPropertyValue("CZ_NOTIFICATION_ALERT_DISPLAY_MSG_1").done(function(data2){
                self.message1(data2.manageUserSession.propertyValue);
                });
                footerModel.fetchPropertyValue("CZ_NOTIFICATION_ALERT_DISPLAY_MSG_2").done(function(data3){
                    self.message2(data3.manageUserSession.propertyValue);
                    });

       footerModel.fetchPropertyValue("CZ_NOTIFICATION_POPUP_DISPLAY").done(function(data1){
            self.countdownSeconds(data1.manageUserSession.propertyValue);
            self.secondsBeforePrompt(self.sessionTimeoutSeconds() - self.countdownSeconds());
			footerModel.IPdelete();
            self.SessionManager.start();
            });
        });
      }
      }

      self.SessionManager = function() {
              var displayCountdownIntervalId,
              promptToExtendSessionTimeoutId,
              count = self.countdownSeconds();

                   var endSession = function() {
                      footerModel.logOutDBAuth();
                  };
              var displayCountdown = function() {
                  var countdown = function() {

                      var cd = new Date(count * 1000),
                          minutes = cd.getUTCMinutes(),
                          seconds = cd.getUTCSeconds();
                          self.testtitle(self.message1() + "&nbsp;" +minutes + ":" + seconds+"&nbsp;" + self.message2());
                      if (count === 0) {
                          endSession();
                      }
                      count--;
                  };
                  countdown();
                  displayCountdownIntervalId = window.setInterval(countdown, 1000);
	if(self.testtitle() !== undefined && (self.testtitle().indexOf("undefined", 0))<0){
					rootParams.baseModel.showMessages(null, [self.testtitle],"NOTIFICATION", function() {
					footerModel.getMe();
                  });
				}
              };
        var promptToExtendSession = function() {
            count = self.countdownSeconds();
            displayCountdown();
        };

        var startSessionManager = function() {
            promptToExtendSessionTimeoutId =
                window.setTimeout(promptToExtendSession, self.secondsBeforePrompt() * 1000);
        };

        var refreshSession = function() {
            window.clearInterval(displayCountdownIntervalId);
            window.clearTimeout(promptToExtendSessionTimeoutId);
            startSessionManager();
        };

        // Public Functions
        return {
            start: function() {
                startSessionManager();
            },

            extend: function() {
                refreshSession();
            }
        };

    }();

      window.addEventListener("click", function() {

        if (rootParams.baseModel.QueryParams.get("module") !== "login"
          && rootParams.baseModel.QueryParams.get("module") !== "home"
          && rootParams.baseModel.QueryParams.get("module") !== "forgot-password"
	&& rootParams.baseModel.QueryParams.get("module") !== "change-password"
          && rootParams.baseModel.QueryParams.get("module") !== "forgot-userid"
          && rootParams.baseModel.QueryParams.get("module") !== "origination"
	&& rootParams.baseModel.QueryParams.get("module") !== "user-login-configuration"
          && rootParams.baseModel.QueryParams.get("module") !== "common"
          && rootParams.baseModel.QueryParams.get("module") !== null) {
            self.SessionManager.extend();
          }

        });

    };
    return {
      viewModel: vm,
      template: template
    };
  });