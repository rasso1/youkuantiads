const Cu = Components.utils;

var y = null

function startup(data, reason) {
    Cu.import("chrome://youkuantiads/content/youkuantiads.js");

    if(!y) {
        y = new YoukuAntiADs();
    }
    y.register();
}

function shutdown(data, reason) {
    if(y) {
        y.unregister();
        y = null;
    }
}

function install(data, reason) {
}

function uninstall(data, reason) {
}
