define([
  "jquery",
  "baseService"
], function ($, BaseService) {
  "use strict";
  var footerModel = function () {
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
        baseService.remove(options);
      },
      getMe = function() {
        var options = {
         url: "me"
        };
        baseService.fetch(options);
      },
	IPdeleteDeferred, IPdelete= function(deferred) {
    var options = {
      url: "loginSecurity",
      version: "cz/v1",
      success: function(data) {
        deferred.resolve(data);
      },
      error: function(data) {
        deferred.reject(data);
      }
    };
    baseService.remove(options);
  },
      logOutDBAuth = function () {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage("logout");
        }
        var options = {
          url: "session",
          success: function () {
            window.location.href = window.location.origin + "/pages/home.html?module=login";
          }
        };
        baseService.remove(options);
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
      fetchPropertyValueDeferred, fetchPropertyValue = function(deferred,propertyId) {
        var options = {
          url: "ManageUserSessions/"+propertyId,
          version: "cz/v1",
          success: function(data) {
            deferred.resolve(data);
          },
          error: function(data) {
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
        logOut(callback);
      },
      logOutDBAuth: function () {
        logOutDBAuth();
      },
      getMe: function () {
        getMe();
      },
      showLoginTime: function () {
        showLoginTimeDeferred = $.Deferred();
        showLoginTime(showLoginTimeDeferred);
        return showLoginTimeDeferred;
      },
	IPdelete: function() {
        IPdeleteDeferred = $.Deferred();
        IPdelete(IPdeleteDeferred);
        return IPdeleteDeferred;
      },
      getMailCount: function () {
        getMailCountDeferred = $.Deferred();
        getMailCount(getMailCountDeferred);
        return getMailCountDeferred;
      },
      fetchPropertyValue: function(propertyId) {
        fetchPropertyValueDeferred = $.Deferred();
        fetchPropertyValue(fetchPropertyValueDeferred,propertyId);
        return fetchPropertyValueDeferred;
      }
    };
  };
  return new footerModel();
});
