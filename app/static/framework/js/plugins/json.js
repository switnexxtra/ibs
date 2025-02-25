define(["module", "framework/js/constants/constants"], function (module, Constants) {
  "use strict";
  var json = {
    load: function (url, req, onLoad, config) {
      if (config && config.isBuild) {
        onLoad();
        return;
      }
      if (url.indexOf("empty:") === 0) {
        onLoad();
        return;
      }
      json.get(url, function (content) {
        if (!content) {
          return;
        }
        var parsedData;
        try {
          parsedData = JSON.parse(content);
          onLoad(parsedData);
        } catch (err) {
          if (onLoad.error) {
            onLoad.error(err);
          } else {
            onLoad();
          }
        }
      }, function (err) {
        if (onLoad.error) {
          onLoad.error(err);
        }
      }, req);
    },
    get: function (url, callback, errback, req) {
      var xhr = new XMLHttpRequest();
      if (url.indexOf("root!") > -1) {
        url = req.toUrl(url.replace("root!", "") + "");
      } else {
        url = req.toUrl(Constants.jsonContext + "/json/" + url);
      }
      url += ".json" + (Constants.buildFingerPrint.timeStamp ? ("?bust=" + Constants.buildFingerPrint.timeStamp) : "");
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Content-type", "text/plain");
      xhr.onreadystatechange = function () {
        var status, err;
        if (xhr.readyState === 4) {
          status = xhr.status || 0;
          if (status > 399 && status < 600) {
            err = new Error(url + " HTTP status: " + status);
            err.xhr = xhr;
            if (errback) {
              errback(err);
            }
          } else {
            callback(xhr.responseText);
          }
        }
      };
      xhr.send(null);
    }
  };
  return json;
});