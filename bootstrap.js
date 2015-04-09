const Cu = Components.utils;

var y = null

function startup(data, reason) {
    Cu.import("chrome://AntiChinaVideoAds/content/AntiChinaVideoAds.js");

    if(!y) {
        y = new AntiChinaVideoAds();
    }
    y.register();
}

function shutdown(data, reason) {
    if (reason == APP_SHUTDOWN) return;
    if(y) {
        y.unregister();
        y = null;
    }
    Cu.unload("chrome://AntiChinaVideoAds/content/AntiChinaVideoAds.js");
}

function install(data, reason) {
}

function uninstall(data, reason) {
}
