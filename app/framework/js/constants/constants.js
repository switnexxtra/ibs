define([], function() {
  "use strict";
  var CONSTANTS = {
    host: "fcubs",
    appBaseURL: "/digx",
    appDefaultVersion: "v1",
    RTL_LOCALES: ["ar", "he"],
    imageResourcePath: "/images",
    brandPath: "",
    userSegment: "",
        jsonContext: "",
    module: "",
    region: "",
    bust: "1534400149439",
    currentServerDate: new Date(0),
    timezoneOffset: 0,
    currentEntity: "",
    defaultEntity: "OBDX_BU",
        webHelpPath: "/",
    channel: "IB",
    userSegmentMap: {
      CORP: "corporate",
      RETAIL: "retail",
      CORPADMIN: "corp-admin",
      ADMIN: "admin",
      ANON: "index"
    },
    pages: {
      securePage: "/pages/home.html",
	  secureMobilePage: "/home.html",
      publicPage: "/index.html"
    },
    authenticator: "OBDXAuthenticator"
  };
  return CONSTANTS;
});
