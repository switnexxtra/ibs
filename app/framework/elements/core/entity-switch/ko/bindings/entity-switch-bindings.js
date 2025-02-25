define([
  "ojs/ojcore",
  "knockout",
  "jquery",
  "text!../template/entity-switch.html",
  "../../model/entity-switch",
  "ojL10n!resources/nls/entity-switch",
  "framework/js/constants/constants",
  "ojs/ojselectcombobox"
], function (oj, ko, $, template, Model, resourceBundle, Constants) {
  "use strict";
  var vm = function (params) {
    var self = this;
    self.nls = resourceBundle;
    self.entityList = ko.observableArray();
    self.currentEntity = ko.observableArray();
    self.entityListLoaded = ko.observable(false);
    params.rootModel.userInfoPromise.then(function () {
      self.currentEntity.push(Constants.currentEntity);
      if (params.dashboard.userData.userProfile && params.dashboard.userData.userProfile.accessibleEntityDTOs && params.dashboard.userData.userProfile.accessibleEntityDTOs.length) {
        if (params.dashboard.userData.userProfile.accessibleEntityDTOs.length > 1) {
          for (var i = 0; i < params.dashboard.userData.userProfile.accessibleEntityDTOs.length; i++) {
            self.entityList.push({
              text: params.dashboard.userData.userProfile.accessibleEntityDTOs[i].entityName,
              value: params.dashboard.userData.userProfile.accessibleEntityDTOs[i].entityId
            });
          }
          self.entityListLoaded(true);
        }
      } else {
        Model.fetchEntities().then(function (data) {
          if (!Constants.currentEntity) {
            Constants.currentEntity = data.businessUnitDTOs[0].businessUnitCode;
          }
          ko.utils.arrayPushAll(self.entityList, data.businessUnitDTOs.map(function (element) {
            return {
              text: element.businessUnitName,
              value: element.businessUnitCode
            };
          }));
          self.entityListLoaded(true);
        });
      }
    });
    self.currentEntity.subscribe(function (newValue) {
      if (newValue[0] !== Constants.currentEntity) {
        Constants.currentEntity = newValue[0];
        if (params.dashboard.userData.userProfile) {
          Model.fetchUserData().then(function (data) {
            Constants.timezoneOffset = data.userProfile.timeZoneDTO.offset;
            params.rootModel.changeUserSegment(Constants.userSegment, data, params.dashboard.application());
          });
        } else {
          params.rootModel.changeUserSegment(Constants.userSegment, {}, params.dashboard.application());
        }
      }
    });
  };
  return {
    viewModel: vm,
    template: template
  };
});