define([
    "ojs/ojcore",
    "knockout",
    "jquery",
    "text!../template/floating-panel.html",
    "ojs/ojanimation"
], function(oj, ko, $, template) {
    "use strict";
    var vm = function(rootParams) {
        var self = this;
        ko.utils.extend(self, rootParams.rootModel);
        self.panelId = rootParams.panelId;
        if (!self.panelId) throw new Error();
        var slideInOptions = $.extend(self.slideInOptions, {
            direction: "top"
        });
        var slideOutOptions = $.extend(self.slideOutOptions, {
            direction: "bottom"
        });

        self.addEvents = function() {
            $("#" + self.panelId).on("openFloatingPanel", function() {
                $("#" + self.panelId + "_parent").fadeIn();
                oj.AnimationUtils.slideIn($("#" + self.panelId)[0], slideInOptions);
                if (self.rippleElement) {
                    oj.AnimationUtils.ripple($("#" + self.rippleElement)[0], self.rippleOptions);
                }
            });
            $("#" + self.panelId).on("closeFloatingPanel", function() {
                $("#" + self.panelId + "_parent").fadeOut();
                oj.AnimationUtils.slideOut($("#" + self.panelId)[0], slideOutOptions);
            });
            $("div[type=\"overlayParent\"]").on("click", function(event) {
                if (event.target.getAttribute("type") === "overlayParent") {
                    $("#" + self.panelId).trigger("closeFloatingPanel");
                }
            });
        };
    };
    return {
        viewModel: vm,
        template: template
    };
});