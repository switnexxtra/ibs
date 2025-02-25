define([
  "knockout",
  "jquery",
  "ojs/ojcore",
  "text!../template/message-box.html",
  "ojL10n!resources/nls/generic",
  "ojs/ojbutton"
], function(ko, $, oj, template, locale) {
  "use strict";
  /**
   * This file contains the view model for Error Box
   * @namespace ErrorBox~viewModel
   * @member
   * @implements  [ErrorBox]{@link error-box-bindings}
   * @constructor
   * @property {String} dialogId -To store the dialog number or here ID
   * @property {Boolean} messageType -  To indicate wheter the message has messagetype or not
   * @property {Boolean} messageAvailable -  To indicate wheter the message is available or not
   * @property {Array} messages - Array containing the list of messages.
   * @property {Object} validationTracker - an Object used to keep track of form field validations
   */
  var vm = function(rootParams) {
    var self = this;
    var jqXHR = rootParams.rootModel.response;
    self.locale = locale;
    self.messages = ko.observableArray();
    self.messageType = ko.observable(rootParams.rootModel.type);
    self.messageAvailable = ko.observable(false);
    self.dialogId = rootParams.rootModel.id;
    var errorCodes = [];
    var createMessageObject = function(messageList) {
      for (var i = 0; i < messageList.length; i++) {
        var sameErrorAlreadypresent = $.inArray(messageList[i].errorMessage || messageList[i].detail, errorCodes) > -1;
        if (sameErrorAlreadypresent) {
          continue;
        }
        errorCodes.push(messageList[i].errorMessage || messageList[i].detail);
        if (messageList[i].detail && messageList[i].code !== "DIGX_UM_042") {
          self.messages.push({
            "message": messageList[i].detail,
            "type": messageList[i].type || "ERROR",
            "code": messageList[i].code
          });
        }
        if (messageList[i].errorMessage && messageList[i].code !== "DIGX_UM_042") {
          self.messages.push({
            "message": messageList[i].errorMessage,
            "type": "ERROR",
            "code": messageList[i].code
          });
        }
      }
    };
    /**
     * This function gets called when user clicks on OK button or te close icon.
     * @function closeDialog
     * @memberOf ErrorBox
     **/
    self.closeDialog = function() {
      $("body").css({
        overflow: "visible"
      });
      for (var i = 0; i < self.messages().length; i++) {
        if (self.messages()[i].code === "DIGX_CMN_0015") {
          location.reload();
        }
      }
      if (rootParams.rootModel.onClose) {
        rootParams.rootModel.onClose();
      }
      rootParams.baseModel.messages.remove(function(item) {
          return item.id === self.dialogId;
      });
    };
    var i = 0;
    if (rootParams.rootModel.errors && rootParams.rootModel.errors.length > 0) {
      for (i = 0; i < rootParams.rootModel.errors.length; i++) {
        self.messages.push({
          "message": rootParams.rootModel.errors[i],
          "type": rootParams.rootModel.type,
          "code": rootParams.rootModel.errors[i]
        });
      }
    } else if (jqXHR && jqXHR.getResponseHeader("BATCH_ID")) {
      var response = jqXHR.responseJSON.batchDetailResponseDTOList;
      for (i = 0; i < response.length; i++) {
        var payload = JSON.parse(response[i].responseText);
        if (payload.message) {
          if (payload.message.validationError) {
            createMessageObject(payload.message.validationError);
          } else {
            createMessageObject([payload.message]);
          }
        }
        if (payload.status && payload.status.message) {
          createMessageObject([payload.status.message]);
        }
      }
    } else if (jqXHR && jqXHR.responseJSON) {
      if (jqXHR.responseJSON.message) {
        if (jqXHR.responseJSON.message.validationError) {
          createMessageObject(jqXHR.responseJSON.message.validationError);
        } else {
          createMessageObject([jqXHR.responseJSON.message]);
        }
      }
      if (jqXHR.responseJSON.status && jqXHR.responseJSON.status.message) {
        createMessageObject([jqXHR.responseJSON.status.message]);
      }
    }
    if (self.messages().length > 0) {
      for (i = 0; i < self.messages().length; i++) {
        self.messageType(self.messages()[i].type);
        if (self.messages()[i].type === "ERROR") {
          break;
        }
      }
      self.messageAvailable(true);
    } else {
      rootParams.baseModel.messages.remove(function(item) {
          return item.id === self.dialogId;
      });
    }
    self.showModalWindow = function() {
      $("body").css({
        overflow: "hidden"
      });
      $("#" + self.dialogId + "modalWindow").trigger("openModal", "button");
    };
  };
  return {
    viewModel: vm,
    template: template
  };
});
