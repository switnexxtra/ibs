define([
  "jquery",
  "baseService"
], function ($, BaseService) {
  "use strict";
  var headerModel = function () {
    var baseService = BaseService.getInstance(),
      logOut = function (callback) {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage("logout");
        }
        var options = {
          url: "session",
          success: function () {
            callback();
          }
        };
        return baseService.remove(options);
      },
      showLoginTimeDeferred, showLoginTime = function (deferred) {
        var options = {
          url: "me",
          success: function (data) {
            deferred.resolve(data);
          },
          error: function (data) {
            deferred.reject(data);
          }
        };
        baseService.fetch(options);
      },
      getMailCountDeferred, getMailCount = function (deferred) {
        var options = {
          url: "mailbox/count?msgFlag=T",
          selfLoader: true,
          success: function (data) {
            deferred.resolve(data);
          }
        };
        baseService.fetch(options);
      };
    return {
      logOut: function (callback) {
        return logOut(callback);
      },
      showLoginTime: function () {
        showLoginTimeDeferred = $.Deferred();
        showLoginTime(showLoginTimeDeferred);
        return showLoginTimeDeferred;
      },
      getMailCount: function () {
        getMailCountDeferred = $.Deferred();
        getMailCount(getMailCountDeferred);
        return getMailCountDeferred;
      }
    };
  };
  return new headerModel();
});
