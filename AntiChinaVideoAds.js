const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils

var EXPORTED_SYMBOLS = ["AntiChinaVideoAds"];

Cu.import("resource://gre/modules/NetUtil.jsm");

function AntiChinaVideoAds() {};
AntiChinaVideoAds.prototype = {
    SITES: {
        'youku_loader': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/loader.swf',
            're': /http:\/\/static\.youku\.com(\/v[\d\.]+)?\/v\/swf\/loaders?\.swf/i
        },
        'youku_player': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/player.swf',
            're': /http:\/\/static\.youku\.com(\/v[\d\.]+)?\/v\/swf\/q?player[^\.]*\.swf/i
        },
        'iqiyi': {
            'player0': 'chrome://AntiChinaVideoAds/content/swf/iqiyi_out.swf',
            'player1': 'chrome://AntiChinaVideoAds/content/swf/iqiyi5.swf',
            'player2': 'chrome://AntiChinaVideoAds/content/swf/iqiyi_out.swf',
            're': /https?:\/\/www\.iqiyi\.com\/(player\/\d+\/Player|common\/flashplayer\/\d+\/(Main|Coop|Share|Enjoy)?Player_?.+)\.swf/i
        },
        'tudou': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/tudou.swf',
            're': /http:\/\/js\.tudouui\.com\/.*portalplayer[^\.]*\.swf/i
        },
        'tudou_olc': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/olc_8.swf',
            're': /http:\/\/js\.tudouui\.com\/.*olc[^\.]*\.swf/i
        },
        'tudou_sp': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/sp.swf',
            're': /http:\/\/js\.tudouui\.com\/.*\/socialplayer[^\.]*\.swf/i
        },
		'letv': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/letv.swf',
            're': /http:\/\/.*letv[\w]*\.com\/(hz|.*?\/((?!(Live|seed|Disk))(S(?!SDK)[\w]{2,3})?(?!Live)[\w]{4}|swf))Player\.swf/i
	    },
        'letv_live': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/letvlive.swf',
            're': /http:\/\/.*letv[\w]*\.com\/p\/\d+\/\d+\/\d+\/newplayer\/LivePlayer\.swf/i
        },
        'letvskin': {
            'player': 'http://player.letvcdn.com/p/201407/24/15/newplayer/1/SSLetvPlayer.swf',
            're': /http:\/\/.*letv[\w]*\.com\/p\/\d+\/\d+\/(?!15)\d*\/newplayer\/\d+\/S?SLetvPlayer\.swf/i
        },
        'pptv': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/pptv.swf',
            're': /http:\/\/player.pplive.cn\/ikan\/.*\/player4player2\.swf/i
        },
		'pplive': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/pptvLive.swf',
            're': /http:\/\/player.pplive.cn\/live\/.*\/player4live2\.swf/i
        },
		'sohu': {
           'player': 'chrome://AntiChinaVideoAds/content/swf/sohulive.swf',
           're': /http:\/\/tv\.sohu\.com\/upload\/swf\/(?!(ap|56)).*\d+\/(main|PlayerShell)\.swf/i
        },
        'sohu_liv': {
           'player': 'chrome://AntiChinaVideoAds/content/swf/sohulive.swf',
           're': /http:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?(\/test)?\/(testplayer|player|webplayer)\/(main|main\d|playershell)\.swf/i
        },
		'pps': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/iqiyi_out.swf',
            're': /http:\/\/www\.iqiyi\.com\/player\/cupid\/.*\/pps[\w]+.swf/i
        },
		'ppsiqiyi': {
            'player': 'chrome://AntiChinaVideoAds/content/swf/iqiyi_out.swf',
            're': /http:\/\/www\.iqiyi\.com\/common\/flashplayer\/\d+\/PPSMainPlayer.*\.swf/i
		},	
		'ppslive': {
            'player': 'http://www.iqiyi.com/player/20140613210124/livePlayer.swf',
            're': /http:\/\/www\.iqiyi\.com\/common\/flashplayer\/\d+\/am.*\.swf/i
		}
		}
    },
	FILTERS: {
	    'qq': {
            'player': 'http://livep.l.qq.com/livemsg',
            're': /http:\/\/livew\.l\.qq\.com\/livemsg\?/i
        }
	},
	DOMAINS: {
    'iqiyi': {
      'host': 'http://www.iqiyi.com/',
      're': /http:\/\/.*\.qiyi\.com/i
      },
	'youku': {
      'host': 'http://www.youku.com/',
      're': /http:\/\/.*\.youku\.com/i
      }
    },
    os: Cc['@mozilla.org/observer-service;1']
            .getService(Ci.nsIObserverService),
    init: function() {
        var site = this.SITES['iqiyi'];
        site['preHandle'] = function(aSubject) {
            var wnd = this.getWindowForRequest(aSubject);
            if(wnd) {
                site['cond'] = [
                    !/(^((?!baidu|61|178).)*\.iqiyi\.com|pps\.tv)/i.test(wnd.self.location.host),
                    wnd.self.document.querySelector('span[data-flashplayerparam-flashurl]'),
                    true
                ];
                if(!site['cond']) return;
                
                for(var i = 0; i < site['cond'].length; i++) {
                    if(site['cond'][i]) {
                        if(site['player'] != site['player' + i]) {
                            site['player'] = site['player' + i];
                            site['storageStream'] = site['storageStream' + i] ? site['storageStream' + i] : null;
                            site['count'] = site['count' + i] ? site['count' + i] : null;
                        }
                        break;
                    }
                }
            }
        };
        site['callback'] = function() {
            if(!site['cond']) return;

            for(var i = 0; i < site['cond'].length; i++) {
                if(site['player' + i] == site['player']) {
                    site['storageStream' + i] = site['storageStream'];
                    site['count' + i] = site['count'];
                    break;
                }
            }
        };
    },
    // getPlayer, get modified player
    getPlayer: function(site, callback) {
        NetUtil.asyncFetch(site['player'], function(inputStream, status) {
            var binaryOutputStream = Cc['@mozilla.org/binaryoutputstream;1']
                                        .createInstance(Ci['nsIBinaryOutputStream']);
            var storageStream = Cc['@mozilla.org/storagestream;1']
                                    .createInstance(Ci['nsIStorageStream']);
            var count = inputStream.available();
            var data = NetUtil.readInputStreamToString(inputStream, count);

            storageStream.init(512, count, null);
            binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
            binaryOutputStream.writeBytes(data, count);

            site['storageStream'] = storageStream;
            site['count'] = count;

            if(typeof callback === 'function') {
                callback();
            }
        });
    },
    getWindowForRequest: function(request){
        if(request instanceof Ci.nsIRequest){
            try{
                if(request.notificationCallbacks){
                    return request.notificationCallbacks
                                .getInterface(Ci.nsILoadContext)
                                .associatedWindow;
                }
            } catch(e) {}
            try{
                if(request.loadGroup && request.loadGroup.notificationCallbacks){
                    return request.loadGroup.notificationCallbacks
                                .getInterface(Ci.nsILoadContext)
                                .associatedWindow;
                }
            } catch(e) {}
        }
        return null;
    },
    observe: function(aSubject, aTopic, aData) {
	    if (aTopic == "http-on-modify-request") {
    var httpReferer = aSubject.QueryInterface(Ci.nsIHttpChannel);
    for (var i in this.DOMAINS) {
      var domain = this.DOMAINS[i];
        try {
        var URL = httpReferer.originalURI.spec;
          if (domain['re'].test(URL)) {
            httpReferer.setRequestHeader('Referer', domain['host'], false);
          }
        } catch (e) {}
      }
    }
	
        if(aTopic != 'http-on-examine-response') return;

        var http = aSubject.QueryInterface(Ci.nsIHttpChannel);
				
        var aVisitor = new HttpHeaderVisitor();
        http.visitResponseHeaders(aVisitor);
        if (!aVisitor.isFlash()) return;
        
        for(var i in this.SITES) {
            var site = this.SITES[i];
            if(site['re'].test(http.URI.spec)) {
                var fn = this, args = Array.prototype.slice.call(arguments);

                if(typeof site['preHandle'] === 'function')
                    site['preHandle'].apply(fn, args);

                if(!site['storageStream'] || !site['count']) {
                    http.suspend();
                    this.getPlayer(site, function() {
                        http.resume();
                        if(typeof site['callback'] === 'function')
                            site['callback'].apply(fn, args);
                    });
                }

                var newListener = new TrackingListener();
                aSubject.QueryInterface(Ci.nsITraceableChannel);
                newListener.originalListener = aSubject.setNewListener(newListener);
                newListener.site = site;

                break;
            }
        }
    },
    QueryInterface: function(aIID) {
        if(aIID.equals(Ci.nsISupports) || aIID.equals(Ci.nsIObserver))
            return this;

        return Cr.NS_ERROR_NO_INTERFACE;
    },
    register: function() {
        this.init();
        this.os.addObserver(this, 'http-on-examine-response', false);
		this.os.addObserver(this, "http-on-modify-request", false);
    },
    unregister: function() {
        this.os.removeObserver(this, 'http-on-examine-response', false);
		this.os.removeObserver(this, "http-on-modify-request", false);
    }
};

// TrackingListener, redirect youku player to modified player
function TrackingListener() {
    this.originalListener = null;
    this.site = null;
}
TrackingListener.prototype = {
    onStartRequest: function(request, context) {
        this.originalListener.onStartRequest(request, context);
    },
    onStopRequest: function(request, context) {
        this.originalListener.onStopRequest(request, context, Cr.NS_OK);
    },
    onDataAvailable: function(request, context) {
        this.originalListener.onDataAvailable(request, context, this.site['storageStream'].newInputStream(0), 0, this.site['count']);
    }
};

function HttpHeaderVisitor() {
    this._isFlash = false;
}
HttpHeaderVisitor.prototype = {
    visitHeader: function(aHeader, aValue) {
        if (aHeader.indexOf("Content-Type") !== -1) {
            if (aValue.indexOf("application/x-shockwave-flash") !== -1) {
                this._isFlash = true;
            }
        }
    },
    isFlash: function() {
        return this._isFlash;
    }
};
