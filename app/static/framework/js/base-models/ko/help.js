/**
 * This file lists all the methods needed for invoking web help.
 * @requires jquery
 * @requires knockout
 */
define([
        "knockout",
        "jquery",
        "platform",
        "framework/js/constants/constants"
    ],
    function (ko, $, Platform, Constants) {
        /**
         * This file lists all the methods needed for invoking web help.
         * @class
         * @param {Object} parentContext The instance of [baseModel]{@linkcode BaseKOModel} for framework utility functions.
         * @alias Help
         * @memberof module:baseModel
         */
        "use strict";
        var HelpModel = function (parentContext) {
            /**
             * Assign <code>this</code> to <code>self</code>.
             * @member {Object}
             */
            var self = this;

            /**
             * Object to store the data of the web help configuration JSON.
             * @member {Object}
             */
            var jsonData = {};
            ko.utils.extend(self, parentContext);

            /**
             * The variable to hold the id for which web help needs to be opened.
             * @instance
             * @memberof Help
             * @alias webhelpID
             * @type {Observable.<String>}
             */
            self.webhelpID = ko.observable("");

            /**
             * In order to show webhelp on pressing the <code>F1</code> key, we have to modify (override) the default behavior of the <code>F1</code>
             * key. This function does that and calls a custom function [openWebHelpWindow]{@linkcode Help#openWebHelpWindow} which can be used to display custom
             * web help. Call to this function is implicit which follows the function definition.
             * @function showWebHelp
             * @memberof Help
             * @inner
             * @returns {void}
             */
            self.showWebHelp = function () {
                if ("onhelp" in window)
                    window.onhelp = function () {
                        self.openWebHelpWindow();
                        return false;
                    };
                else {
                    var cancelKeyPress;
                    document.onkeydown = function (evt) {
                        cancelKeyPress = (evt.keyCode === 112);
                        if (cancelKeyPress) {
                            self.openWebHelpWindow();
                            return false;
                        }
                    };
                    document.onkeypress = function () {
                        if (cancelKeyPress)
                            return false;
                    };
                }
            };

            /**
             * This function is used to parse the [webhelpID]{@linkcode Help#webhelpID} and thus determine and open the location of webhelp page using that.
             * @function parseLocationById
             * @memberof Help
             * @inner
             * @param {String} location  - This string contains the location of page the user is on and requesting the webhelp for.
             * @param {String} currentModule - This string contains the module for which the component exists.
             * @param {String} webhelpID  - This string contains the webhelpID of page the user is on and requesting the webhelp for.
             * @returns {void}
             */
            var parseLocationById = function (location, currentModule, webhelpID) {
                location += jsonData[currentModule][webhelpID];
                window.open(location, "_blank");
            };
            /**
             * This function handles the custom logic to display the user-defined webhelp depending on the type of device being used.
             * @function resolveBrowser
             * @memberof Help
             * @instance
             * @returns {void}
             */
            self.resolveBrowser = function (locationURL, target) {
                Platform.getInstance().then(function (platform) {
                    var serverType = platform("getServerType"),
                        serverUrl = platform("getServerURL");

                    if (serverType) {
                        if (self.cordovaDevice() === "IOS") {
                            return window.cordova.InAppBrowser.open(platform("getServerURL", true) + "/" + locationURL, target);
                        }

                        return window.open(serverUrl + locationURL, "_blank");

                    }

                    var win = window.open("");

                    window.oldOpen = window.open;

                    // reassignment function
                    window.open = function (url) {
                        win.location = url;
                        window.open = window.oldOpen;
                        win.focus();
                    };

                    return window.open(locationURL);

                });
            };
            /**
             * This function handles the custom logic to display the user-defined webhelp on pressing <code>F1</code> key.
             * @function openWebHelpWindow
             * @memberof Help
             * @instance
             * @returns {void}
             */
            self.openWebHelpWindow = function () {
                var location = Constants.webHelpPath + "webhelp/Content/obdx/";

                var currentModule = self.QueryParams.get("module");
                if (currentModule && !jsonData[currentModule]) {
                   window.open("https://www.bsp.com.pg/media/ge2bjkiw/bsp-internet-banking_faq_260423.pdf");
                } else {
                    parseLocationById(location, currentModule, self.webhelpID());
                }
            };

            /**
             * This function sets the [webhelpID]{@linkcode Help#webhelpID} variable of the base-model from the components' [webhelpID]{@linkcode Help#webhelpID} defined inside the component
             * @function setwebhelpID
             * @memberof Help
             * @instance
             * @param {String} webhelpID  - This string contains the webhelpID of page the user is on and requesting the webhelp for.
             * @returns {void}
             */
            self.setwebhelpID = function (webhelpID) {
                this.webhelpID(webhelpID);
            };

            /**
             * Call to the showWebHelp function.
             */
            self.showWebHelp();
        };
        return HelpModel;
    });