/*
 * Tracking Factory Class
 */
var TrackingFactory = klass({
    initialize: function(){
        //
    },
    createTracker: function(_options) {
        this.trackerType = (_options.type ? _options.type : '');
        switch (this.trackerType) {
            case 'ga' :
                if (typeof _options.accountString == 'undefined' || _options.accountString == '') {
                    return new NoTracker(_options, "There is no account string given for google analytics!");
                }
                return new GATracker(_options);
            default   :
                return new NoTracker(_options, "No tracker type specified!");
        }
    }
});

/*
 * Empty Tracker Class
 * 
 * Provides all necessary public methods to avoid not handled JavaScript errors in using apps
 */
var NoTracker = klass({
    initialize: function(_options, _message) {
        // App.debug("--------- TRACKER -----------------------------------------");
        // App.debug("Failed to initialize any specific tracker!");
        // App.debug("INFO: " + _message);
        // App.debug("-- Possible options:");
        // App.debug("---- Google Analytics:");
        // App.debug("------ (mandatory) type: 'ga'");
        // App.debug("------ (mandatory) accountString: 'UA-xxxxxxxx-x'");
        // App.debug("-- Given options:");
        for (option in _options) {
            // App.debug("-- " + option + ": " + _options[option]);
        }
        // App.debug("-----------------------------------------------------------");
    },
    // track page request
    trackPage: function(_pageURL) {
        // App.debug("WARNING: tracker is not set up!");
    },
    // track event
    trackEvent: function(_eventCategory, _eventAction, _eventLabel) {
        // App.debug("WARNING: tracker is not set up!");
    }
});

/*
 * Google Analytics Tracker Class
 * 
 * For possible parameters, see:
 * https://developers.google.com/analytics/resources/articles/gaTrackingTroubleshooting#gifParameters
 */
var GATracker = klass({
    initialize: function(_options) {
        this.accountString  = _options.accountString;
        this.anonymizedIP   = (_options.anonymizedIP ? _options.anonymizedIP : false); 
        this.encoding       = "UTF-8";
        this.version        = "5.3.2";
        this.domainHash     = "1";
        // __utma:
        this.uniqueID       = (Math.floor(Math.random(10)*100000) + '00145214523');
        this.timeFirstVisit = new Date().getTime();
        this.timePrevVisit  = new Date().getTime();
        this.sessionCount   = '15';
        // __utmz:
        this.timeCookieSet  = new Date().getTime();
        this.sessionNo      = '1';
        this.campaignNo     = '1';
        this.campaignSrc    = '(direct)';
        this.campaignName   = '(direct)';
        this.campaignMedium = '(none)';
        
        this.urlBasics     = "https://ssl.google-analytics.com/__utm.gif?" + 
            "utmac=" + this.accountString + "&" + 
            //"utmdt=" + this.pageTitle + "&" + 
            "utmcs=" + this.encoding + "&" + 
            "utmwv=" + this.version +
            (this.anonymizedIP ? "&aip=1" : "");
    },
    // builds a fake ga cookie (utmcc)
    // __utma : [Domain hash].[Unique ID].[Timestamp first visited the site].[Timestamp previous visit].[Timestamp current visit].[Number of sessions started]
    // __utmz : [Domain Hash].[Timestamp when cookie was set].[Session number].[Campaign number].utmcsr=[Campaign source]|utmccn=[Campaign name]|utmcmd=[Campaign medium]
    getCookieString: function() {
        var utma = "__utma%3D" + this.domainHash + "." + 
            this.uniqueID + "." + this.timeFirstVisit + "." + 
            this.timePrevVisit + "." + (new Date().getTime()) + "." + this.sessionCount + "%3B%2B";
        
        var utmz = "__utmz%3D" + this.domainHash + "." + 
            this.timeCookieSet + "." + this.sessionNo + "." + this.campaignNo + "." + 
            "utmcsr%3D" + this.campaignSrc + "%7Cutmccn%3D" + this.campaignName + 
            "%7Cutmccn%3D" + this.campaignMedium + "%3B";
        
        return "&utmcc=" + utma + utmz;
    },
    // builds a string with all parameters to use
    // in a tracking call (event or page tracking parameters not included!)
    // utmn   : Unique ID generated for each GIF request to prevent caching of the GIF image
    // utmhid : A random number used to link the GA GIF request with AdSense
    getTrackingBaseURL: function() {
        var randomId = Math.floor(Math.random(10)*100000);
        var baseURL = this.urlBasics + 
            this.getCookieString() + 
            "&utmn=" + randomId + 
            "&utmhid=" + randomId;
        return baseURL;
    },
    sendTracking: function(_trackingURL) {
        // // App.debug("GATracker.sendTracking to " + _trackingURL);
        var trackingImage = new Image(); 
        trackingImage.src = _trackingURL;
    },
    // getCustomVarString
    // format for a max of 5 custom variables
    // slot must be within 1-5
    // scope must be 1 (visit-level), 2 (session-level) or 3(page-level), default)=3
    // "&utme=8(slot1!name1*slot2!name2)9(slot1!value1*slot2!value2)11(slot1!scope1*2!scope2)";
    // 8,9,11 are constants (like 5 for setting event details)
    // more variables can be added with *, GA default scope is 3 = "page level"
    getCustomVarString: function(_custom_vars) {
        // App.debug("GATracker.getCustomVarString");
        if(_custom_vars){
            var slots_names = "";
            var slots_values = "";
            var slots_scopes = "";
            for (var i = 0; i < _custom_vars.length; i++) {
                var seperator = (i == _custom_vars.length-1 ? '' : '*');
                var slot = _custom_vars[i].slot;
                var name = _custom_vars[i].name;
                var value = _custom_vars[i].value;
                var scope = (_custom_vars[i].scope ? _custom_vars[i].scope : 3);
                slots_names += slot + '!'+ name + seperator;
                slots_values += slot + '!'+ value + seperator;
                slots_scopes += slot + '!'+ scope + seperator;
            };
            return encodeURIComponent("8("+slots_names+")9("+slots_values+")11("+slots_scopes+")");
        }
        return '';
    },
    // track page request
    trackPage: function(_options) {
        var url = (_options.url ? _options.url : 'undefined');
        var title = (_options.title ? _options.title : 'undefined');
        var custom_vars = (_options.custom_vars ? "&utme="+this.getCustomVarString(_options.custom_vars) : '');
        
        var trackingURL = this.getTrackingBaseURL()+ "&utmp=" + url + "&utmdt=" + title + custom_vars;
        this.sendTracking(trackingURL);
    },
    // track event
    trackEvent: function(_options) {
        var category = (_options.category ? _options.category : 'undefined');
        var action = (_options.action ? _options.action : 'undefined');
        var label = (_options.label ? _options.label : false);
        var pageTitle = (_options.pageTitle ? _options.pageTitle : 'Event');
        
        var custom_vars = (_options.custom_vars ? this.getCustomVarString(_options.custom_vars) : '');
        var eventString = "5(" + category + "*" + action + (label ? ("*" + label) : "") + ")";

        var trackingURL = this.getTrackingBaseURL() + "&utmt=event&utme=" + encodeURIComponent(eventString)+custom_vars + "&utmdt=" + pageTitle;
        // with 
        //var trackingURL = this.getTrackingBaseURL() + "&utmt=event" + "&utmdt=" + pageTitle;

        this.sendTracking(trackingURL);
    }
});