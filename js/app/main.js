window.JST = window.JST || {};

var App = {
    manager: null,
    console: null,
    stationInfo: null,
    views: null,
    showing: true,
    uiHideTimeoutID: null,
    showLogger: @ENABLE_DEBUG_MODE@,
    videoIsLoading: true,
    uiIsShowing: true,
    inDevelopmentBrowser: false,
};

App.init = function(){
    
    if(document.URL.indexOf(".html") > 0){
      App.inDevelopmentBrowser = true;
      App.setupDevelopmentBrowser();
    }

    var appmgrObject = document.getElementById('appmgr');
    var stationID = App.getRequestedStation();
    App.trackAppStart(stationID);
    App.views = Views.init();
    App.showLoader();
    App.debug("URL: "+document.domain);
    App.debug("UserAgent: "+navigator.userAgent);
    App.registerKeyEventListener();


        

    App.loadStationInfo(stationID, App.stationInfoLoadedCallback,App.stationInfoLoadedFailedCallback);
    
    if(!App.inDevelopmentBrowser && appmgrObject.getOwnerApplication)
        App.manager = appmgrObject.getOwnerApplication(document);
    if(App.manager){
        App.manager.show && App.manager.show();
        App.manager.activate && App.manager.activate();
    }
    if(!App.inDevelopmentBrowser)
      App.setKeyset();
};

App.trackAppStart = function(_stationID){

    var tracker = new TrackingFactory().createTracker({
      type: 'ga',
      accountString: 'UA-53314857-1',
      anonymizedIP: true
    });
    try {
      tracker.trackEvent({
        category: _stationID,
        label: 'User Agent',
        action: Util.regEscape(
          navigator.userAgent,
          [
            { regEx: /\(/g, value: '%28' },
            { regEx: /\)/g, value: '%29' },
          ]
        )
      });
    } catch(e) {
      App.debug(e);
    }
};

App.startUIHideTimeout = function(){
    clearTimeout(this.uiHideTimeoutID);
    this.uiHideTimeoutID = setTimeout(Util.bind(this,App.hideUI),UI_HIDE_TIMEOUT);
};
App.hideUI = function(){
    this.uiIsShowing = false;
    this.uiHideTimeoutID = null;
    this.views.hideUI();
};
App.showUI = function(_keepShowing){
    if(this.uiHideTimeoutID){
      clearTimeout(this.uiHideTimeoutID);
      this.uiHideTimeoutID = null;
    } 
    this.uiIsShowing = true;
    this.views.showUI();
    if(!_keepShowing && !App.videoIsLoading){
      this.startUIHideTimeout();
    }
};
App.stationInfoLoadedCallback = function(_xhr){
    App.stationInfo = JSON.parse(_xhr.responseText);
    if(App.stationInfo.status == true)
      App.views.initWithStation(App.stationInfo);
    else
      App.stationInfoLoadedFailedCallback(_xhr);
};
App.stationInfoLoadedFailedCallback = function(_xhr){
    App.debug("ERROR Loading stationInfo");
    App.views.setupError(true);
};
App.getRequestedStation = function(){
    // TOOD: this only works if stationID is the first GET Parameter
    return window.location.search.substr(1).split("&")[0].split("=")[1];
};
App.debug = function(_message){
    if(App.views.console){
        App.views.console.innerHTML += "<br/>" + _message;
    }
};

App.setKeyset=function() {
  var remoteControlKeys = App.manager.privateData.keyset
  var mask = remoteControlKeys.RED 
           + remoteControlKeys.BLUE 
           + remoteControlKeys.GREEN
           + remoteControlKeys.NAVIGATION
           + remoteControlKeys.VCR
           + remoteControlKeys.NUMERIC;

  // for HbbTV 0.5:
  try {
    var elemcfg = document.getElementById('oipfcfg');
    elemcfg.keyset.value = mask;
  } catch (e) {
    //App.debug("HbbTV 0.5 keyset error");
  }
  try {
    var elemcfg = document.getElementById('oipfcfg');
    elemcfg.keyset.setValue(mask);
  } catch (e) {
    //App.debug("keyset error");
  }
  // for HbbTV 1.0:
  try {
    App.manager.privateData.keyset.setValue(mask);
    App.manager.privateData.keyset.value = mask;
  } catch (e) {
    //App.debug("HbbTV 1.0 keyset error");
  }
}

App.registerKeyEventListener=function() {

  App.debug("registerKeyEventListener");

  document.addEventListener("keydown", function(e) {
    
    App.debug(e.keyCode);
    switch(e.keyCode){
        case VK_RED:
             App.debug("VK_RED");
             App.exit();
             break;
        // case VK_YELLOW:
        //     App.goToPortal('http://application.ses-ps.com/Senderportal-BB-MV/index.html');
        //     //App.goToPortal('http://itv.mit-xperts.com/hbbtvtest/');
        //     break;
        case VK_GREEN:
        case VK_BLUE:
        case VK_STOP:
        case VK_PAUSE:
        case VK_PLAY:
        case VK_FAST_FWD:
        case VK_REWIND:
        case VK_PLAY_PAUSE:
            App.showUI(false);
            App.views.handleKey(e.keyCode);
            break;
        case VK_LEFT:
        case VK_RIGHT:
        case VK_ENTER:
              if(App.uiIsShowing){
                App.showUI(false);
                App.views.handleKey(e.keyCode);
              }
              else
                App.showUI(false);
              break;
        case VK_0:

              if (this.showLogger) {
                this.showLogger = false;
                App.views.console.style.display = 'none';
                App.views.version_info.style.display = 'none';

              }else{
                this.showLogger = true;
                App.views.console.style.display = 'block';
                App.views.version_info.style.display = 'block';
              }
              break;
        case VK_9:
          App.views.player.video.seek(App.views.player.duration*1000 -2*1000);
        case VK_1:
            App.views.player.seek_if_needed();
            break;
        default:
          App.showUI(false);
          break;

    }
    e.preventDefault();
    return true;
  }, false);
};
App.goToPortal = function(_link){
  try{
    if(App.manager.createApplication(_link,false)){
      App.manager.destroyApplication();
    }
  }catch(e){
      App.debug('Error: '+e);
      document.location.href=_link;
      return e;
  }
  return true;
};
App.setupDevelopmentBrowser = function(){
    var video_object = document.getElementById("video");
    var html5_video = document.createElement("video");
    html5_video.setAttribute("id", "video");
    html5_video.addEventListener("canplay",function(){
          App.views.player.buffering_completed();
          App.views.setupPlaying();
    }, false);
    html5_video.addEventListener("loadstart",function(){
          App.views.player.buffering_started();
    }, false);
    html5_video.addEventListener("ended",function(){
          App.views.player.ended();
    }, false);
    html5_video.addEventListener("error",function(){
          App.views.player.error();
    }, false);
    html5_video.addEventListener("timeupdate",function(_event){
          App.views.player.timeupdate(_event.target.currentTime*1000);
    }, false);
    html5_video.addEventListener("durationchange",function(_event){
          App.views.player.durationupdate(_event.target.duration*1000);
    }, false);
    video_object.parentNode.replaceChild(html5_video, video_object);
    html5_video.style.width = "1280px";
    html5_video.style.height = "720px";
    VK_BLUE = 66; // match 'B'
    VK_GREEN = 71; // match 'G'
};
App.showLoader = function(){
    App.views.loader.show();
};
App.hideLoader = function(){
    if(this.videoIsLoading){
      App.startUIHideTimeout();
      this.videoIsLoading = false;
      document.getElementById('app').className = 'loaded';
    }
    App.views.loader.hide();
};
App.exit = function(){
    try {
        if(App.manager){
            App.manager.destroyApplication && App.manager.destroyApplication();
        }
      } catch (e) {
        App.debug('Cannot destroy application');
        window.location = "http://application.ses-ps.com/Senderportal-BB-MV/index.html";
      }
};
