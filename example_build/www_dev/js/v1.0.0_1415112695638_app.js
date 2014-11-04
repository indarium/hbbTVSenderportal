var Loader = {

    isLoading: false,
    count: 0,
    maxCount: 5,
    speed: 1000,
    manualAnimationTimeout : null,
    loader_obj: document.getElementById('loader'),

    show: function() {
        if(this.isLoading == false){
            this.isLoading = true;
            this.start_animate();
        }
        this.loader_obj.style.display = 'block';
    },

    hide: function() {
        this.loader_obj.style.display = 'none';
        this.count = 0;
        this.isLoading = false;
        this.stop_animate();
    },

    start_animate: function() {
        if(this.count < this.maxCount-1) {
            this.count++;
            this.loader_obj.className = 'pos'+this.count;
        } else {
            this.count = 0;
            this.loader_obj.className = '';
        }
        if(this.isLoading == true){
            this.manualAnimationTimeout = window.setTimeout("App.views.loader.start_animate()", this.speed);
        }
    },
    
    stop_animate: function() {
        this.isLoading = false;
        window.clearTimeout(this.manualAnimationTimeout);
        this.manualAnimationTimeout = null;
        this.count = 0;
    }
};var Views = {
    station: null,
    stationLogo: null,
    stationLogoWrapper: null,
    channelBroadcastInfoWrapper: null,
    channelBroadcastInfo: null,
    loader: null,
    console: null,
    version_info: null,
    progressBar: null,
    player: null,
    showPlayerWrapper: null,
    showInfo: null,
    showLogo: null,
    showTitle: null,
    showDescription: null,
    showingBroadcastInfo: false,
    state: 'playing',
    hd_on: false,
    qualityCanBeSwitched: false,
}



Views.init = function(_xhr){
    this.console = document.getElementById('Console');
    this.version_info = document.getElementById('version_info');

    if(false){
        this.console.style.display = 'block';
        this.version_info.style.display = 'block';
    }
        

    this.loader = Loader;
    this.stationLogo = document.getElementById('stationLogo');
    this.stationLogoWrapper = document.getElementById('stationLogoWrapper');
    this.channelBroadcastInfo = document.getElementById('channelBroadcastInfo');
    this.channelBroadcastInfoWrapper = document.getElementById('channelBroadcastInfoWrapper');
    this.controlBar = document.getElementById('controlBar');
    this.blueButtonLabel = document.getElementById('blueButtonLabel');
    this.greenButtonLabel = document.getElementById('greenButtonLabel');

    this.player = Player.init();

    this.showPlayerWrapper = document.getElementById('showPlayerWrapper');
    this.showInfo = document.getElementById('showInfo');
    this.showLogo = document.getElementById('showLogo');
    this.showTitle = document.getElementById('showTitle');
    this.showDescription = document.getElementById('showDescription');

    this.rewindButton = document.getElementById('rewindButton');
    this.playPauseButton = document.getElementById('playPauseButton');
    
    this.forwardButton = document.getElementById('forwardButton');
    
    this.state = document.getElementById('playerControls').className;
    return this;
};

Views.initWithStation = function(_station){
    this.station = _station;
    this.currentSelection = this.playPauseButton;
    this.selectButton(this.playPauseButton);
    if(_station.stationLogoDisplay){
        this.stationLogo.src = _station.stationLogoUrl;
        this.stationLogoWrapper.style.display = 'block';
    }
    this.player.setAndPlayStation(_station);
    

    if(_station.showLogoUrl != ""){
        this.showLogo.src = _station.showLogoUrl;
        this.showLogo.style.display = 'block';
    }
    else{
        this.showLogo.style.display = 'none';
    }

    this.channelBroadcastInfo.innerHTML = _station.channelBroadcastInfo;
    document.getElementById('channelLogo').src = _station.stationLogoUrl;
    document.getElementById('showInfoButtonWrapper').style.display = 'block';

    if(_station.showVideoHDUrl && _station.showVideoHDUrl != ''){
        this.qualityCanBeSwitched = true;
        document.getElementById('hdsdButtonWrapper').style.display = 'block';
    }
    
    this.showTitle.innerHTML = _station.showTitle;
    this.showDescription.innerHTML = _station.showSubtitle;

    Util.preloadImages(['img/bg_mabb2.jpg'],[]); // preloading so we can see background image immediatelly
};

Views.showUI = function(){
    this.showPlayerWrapper.style.display = 'block';
    if(this.showingBroadcastInfo){
        if(this.station.stationLogoDisplay)
            this.stationLogoWrapper.style.display = 'none';
    }
};
Views.hideUI = function(){
    this.showPlayerWrapper.style.display = 'none';
    if(this.showingBroadcastInfo){
        if(this.station.stationLogoDisplay)
            this.stationLogoWrapper.style.display = 'block';
    }
};
Views.showBroadcastInfo = function(){
    this.showingBroadcastInfo = true;
    this.showInfo.style.display = 'none';
    this.stationLogoWrapper.style.display = 'none';
    this.channelBroadcastInfoWrapper.style.display = 'block';
    this.blueButtonLabel.innerHTML = "Infos zur Sendung";
};
Views.hideBroadcastInfo = function(){
    this.showingBroadcastInfo = false;
    this.showInfo.style.display = 'block';

    if(this.station.stationLogoDisplay)
        this.stationLogoWrapper.style.display = 'block';

    this.channelBroadcastInfoWrapper.style.display = 'none';
    this.blueButtonLabel.innerHTML = "Sendetermine";
};
Views.handleKey = function(_keyCode){
    switch(_keyCode){
        case VK_GREEN:
            this.toggleQuality()
            break;
        case VK_BLUE:
            if(this.showingBroadcastInfo)
                this.hideBroadcastInfo();
            else
               this.showBroadcastInfo(); 
                
            break;
        case VK_STOP:
              App.debug("VK_STOP");
              this.selectButton(this.playPauseButton);
              this.player.stop();
              this.setupStopped();
              break;
        case VK_PAUSE:
              App.debug("VK_PAUSE");
              this.player.pause();
              this.setupPaused();
              break;
        case VK_PLAY:
              App.debug("VK_PLAY");
              this.player.play();
              this.setupPlaying();
              break;
        case VK_FAST_FWD:
              App.debug("VK_FAST_FWD");
              this.player.seek_forward();
              break;
        case VK_REWIND:
              App.debug("VK_REWIND");
              this.player.seek_backward();
              break;
        case VK_PLAY_PAUSE:
              App.debug("VK_PLAY_PAUSE");
              this.player.play_pause();
              break;
        case VK_RIGHT:
            switch(this.currentSelection){
                case this.rewindButton:
                        this.selectButton(this.playPauseButton);
                    break;
                case this.playPauseButton:
                        this.selectButton(this.forwardButton);
                    break;
            }
            break;
        case VK_LEFT:
            switch(this.currentSelection){
                case this.playPauseButton:
                        this.selectButton(this.rewindButton);
                    break;
                case this.forwardButton:
                    this.selectButton(this.playPauseButton);
                    break;
            }
            break;
        case VK_ENTER:
            switch(this.currentSelection){
                case this.rewindButton:
                    this.player.seek_backward();
                    break;
                case this.playPauseButton:
                    switch(this.state){
                        case 'playing':
                            this.setupPaused();
                            this.player.pause();
                            break;
                        case 'stopped':
                        case 'paused':
                            this.setupPlaying();
                            this.player.play();
                            break;
                    }
                    break;
                case this.forwardButton:
                    this.player.seek_forward();
                    break;
            }
            break;
    }

};

Views.selectButton = function(_button){
    this.deselectButton(this.currentSelection);
    _button.className = "button selected";
    this.currentSelection = _button;
};
Views.deselectButton = function(_button){
    this.currentSelection = null;
    _button.className = "button";
};

Views.setupPlaying = function(){
    App.showUI(false);
    this.state = 'playing';
    this.selectButton(this.playPauseButton);
    document.getElementById('playerControls').className = "playing";
    document.getElementById('big_pause_button').className = "";
    
    // lets see if we are resuming the video
    if(this.showingBroadcastInfo){
        document.getElementById('app').className = "loading";
        App.videoIsLoading = true;
        this.hideBroadcastInfo();
    }
    else{
        document.getElementById('app').className = "";
    }
    
};
Views.setupPaused = function(){
    App.showUI(false);
    this.state = 'paused';
    this.selectButton(this.playPauseButton);
    document.getElementById('playerControls').className = "paused";
    document.getElementById('big_pause_button').className = "paused";
    document.getElementById('app').className = "";

};
Views.setupStopped = function(){
    App.showUI(false);
    App.hideLoader();
    this.state = 'stopped';
    this.selectButton(this.playPauseButton);
    document.getElementById('playerControls').className = "stopped";
    document.getElementById('big_pause_button').className = "";
    document.getElementById('app').className = "stopped";
    this.showBroadcastInfo();
    App.showUI(true);
};

Views.setupError = function(_isAPIError){
    this.state = 'failed';
    App.hideLoader();
    if(_isAPIError){
        App.views.showTitle.innerHTML = "Die Sendung konnte nicht geladen werden.";
        App.views.showDescription.innerHTML = "Bitte versuchen Sie es sp&auml;ter noch einmal.";
        App.views.showLogo.style.display = 'none';
    }
    document.getElementById('app').className = "stopped";
    document.getElementById('playerControls').className = "failed";
    
    App.showUI(true);
};

Views.toggleQuality = function(){
    //var lastPosition = this.player.video.playPosition;
    var lastPosition = this.player.currentTime-2;
    App.debug('toggleQuality: '+lastPosition);
    if(!this.qualityCanBeSwitched)
        return;
    this.selectButton(this.playPauseButton);
    this.player.stop();
    App.videoIsLoading = true;
    if(this.hd_on){
        this.player.playVideoURL(this.station.showVideoSDUrl,lastPosition);
        this.hd_on = false;
        this.greenButtonLabel.className = "hd_off";
    }
    else{
        this.hd_on = true;
        this.greenButtonLabel.className = "hd_on";
        this.player.playVideoURL(this.station.showVideoHDUrl,lastPosition);
    }
    if(this.player.canSeekImmediatelly)
        this.player.seek_if_needed();
};



 var Player = {
    progressBar: null,
    video: null,
    playing: false,
    duration: 0,
    currentPlayTimeInterval: null,
    currentTime: 0,
    seekPosition: 0,
    canSeekImmediatelly: true,
}

Player.init = function(){
    this.video = document.getElementById('video');
    this.progressBar = document.getElementById('playerProgressBar');
    if(navigator.userAgent.indexOf("Maple") > -1)
        this.canSeekImmediatelly = false;
    return this;
};

Player.playVideoURL = function(_url,_seekPosition){
    this.video.onPlayStateChange = Util.bind(this, this.playStateChanged);
    if(typeof _seekPosition != 'undefined')
        this.seekPosition = _seekPosition;
    else{
        this.seekPosition = 0;
    }
    App.debug("Playing URL: "+_url);
    //this.video.data = "http://itv.ard.de/video/timecode.php/video.mp4";
    //this.video.type = "video/mp4";
    if(!App.inDevelopmentBrowser)
        this.video.data = _url;
    else{
        //HTML5 Player
        this.video.src = _url;
        this.video.type = "video/mp4";
    }

    this.play();
    this.playing = true;
};

Player.play = function(){
    App.debug("Player play");
    this.video.play(1);
    this.playing = true;
};

Player.pause = function(){
    App.debug("Player pause");
    if(!App.inDevelopmentBrowser)
        this.video.play(0);
    else{
        //HTML5 Player
        this.video.pause();
    }
    this.playing = false;
};
Player.play_pause = function(){
    App.debug("Player play_pause");
    if(this.playing){
        this.pause();
    }
    else{
        this.play();
    }
        
};

Player.stop = function(){
    App.debug("Player stop");
    this.video.stop();
    this.timeupdate(0);
    // this.seek(this.duration-1);
    // this.pause();
    this.stopPlayPostionInterval();
    this.playing = false;
};

Player.seek = function(_seconds){
    App.debug("Player seek");
    this.video.seek(_seconds*1000);
};

Player.seek_forward = function(){
    App.debug("Player seek_forward");
    var skip_to = this.currentTime + SEEKING_TIME;
    if(skip_to > this.duration){
        skip_to = this.duration-1;
    }
    if(!App.inDevelopmentBrowser){
        this.seek(skip_to);
    }
    else{
        this.video.currentTime = skip_to;
    }
    

};

Player.seek_backward= function(){
    App.debug("Player seek_backward");
    var skip_to = this.currentTime - SEEKING_TIME;
    if(skip_to < 0){
        skip_to = 0;
    }
    if(!App.inDevelopmentBrowser){
        this.seek(skip_to);
    }
    else{
        this.video.currentTime = skip_to;
    }
};


Player.timeupdate = function(_time) {
    //App.debug("timeupdate: _time: "+Math.floor(_time/1000));
    var percent = 0;
    this.currentTime = Math.floor(_time/1000);
    if(this.duration > 0 && _time > 0){
       percent = ((100*this.currentTime)/this.duration);
    }
    this.progressBar.style.width = percent + "%";
};

Player.durationupdate = function(_time) {
    App.debug("Player durationupdate: _time: "+_time);
    this.duration = Math.floor(_time/1000);
};

Player.ended = function(){
    App.debug("Player ended");
    this.playing = false;
    this.video.stop();
    this.stopPlayPostionInterval();
    App.views.setupStopped();
};

Player.error = function(){
    App.debug("Player error");
};

Player.setAndPlayStation = function(_station){
    this.progressBar.style.backgroundColor = _station.stationMainColor;
    this.playVideoURL(_station.showVideoSDUrl);
};

Player.startPlayPostionInterval = function() {
    App.debug("Player startPlayPostionInterval");
    if (this.currentPlayTimeInterval) {
        clearInterval(this.currentPlayTimeInterval);
    }

    this.currentPlayTimeInterval = setInterval(function() {
        Player.timeupdate(Player.video.playPosition);
    }, 200);
};

Player.stopPlayPostionInterval = function() {
    App.debug("Player stopPlayPostionInterval");
    if (this && this.currentPlayTimeInterval) {
        clearInterval(this.currentPlayTimeInterval);
        this.currentPlayTimeInterval = null;
    }
};

Player.buffering_started = function() {
    App.debug("Player buffering_started");
    App.showLoader();
};
Player.buffering_completed = function() {
    App.debug("Player buffering_completed");
    App.hideLoader();
};
Player.seek_if_needed = function(){
    App.debug("Player seek_if_needed");
    if(this.seekPosition > 5){
        App.debug("Player do seekPosition: "+this.seekPosition);
        this.seek(this.seekPosition);
        this.seekPosition = 0;
        App.debug("Player done seekPosition: "+this.seekPosition);
    }
}
Player.playStateChanged = function() {
    //App.debug("Player playStateChanged");
    switch (this.video.playState) {
        case 5: // finished
            App.debug("Player state: ended");
            this.ended();
            break;
        case 6: // error
            App.debug("Player state: error");
            this.error();
            break;
        case 0: // stopped
            App.debug("Player state: stopped");
            break;
        case 1: // playing
            App.debug("Player state: playing");
            this.durationupdate(this.video.playTime);
            this.buffering_completed();
            this.startPlayPostionInterval();
            App.views.setupPlaying();
            if(!this.canSeekImmediatelly)
                setTimeout(Util.bind(this,this.seek_if_needed),500);
            break; 
        case 2: // paused
            App.debug("Player state: paused");
            App.views.setupPaused();
            break;
        case 3: // connecting
            App.debug("Player state: connecting");
            break;
        case 4: // buffering
            App.debug("Player state: buffering");
            this.buffering_started();
            break;
        default: // do nothing
            App.debug("Player no state matched!!!");
            break;
    }
};window.JST = window.JST || {};

var App = {
    manager: null,
    console: null,
    stationInfo: null,
    views: null,
    showing: true,
    uiHideTimeoutID: null,
    showLogger: false,
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
var StationLoader = {
};

App.loadStationInfo = function(_stationID,_succesCallback,_errorCallback){
    var xhr = new XMLHttpRequest();
    App.debug("xhr: created");
    //xhr.open('POST', 'http://hbbtvplugin.apiary.io/api/v1/show/current');
    xhr.open('POST', API_URL);
    xhr.setRequestHeader("Content-Type", "application/json");
    //xhr.setRequestHeader("Content-Type", "text/plain");
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            
            if (xhr.status == 200) {
                App.debug("xhr loaded successfully");
                if (typeof _succesCallback !== "undefined")
                        _succesCallback(xhr);
                // else
                //     alert('Status: '+this.status+'\nHeaders: '+JSON.stringify(this.getAllResponseHeaders())+'\nBody: '+this.responseText);
            }
            else {
                App.debug("xhr failed with code: " + xhr.status);
                if (typeof _errorCallback !== "undefined")
                    _errorCallback(xhr);
                else
                    App.debug("LoadError");
            }
        }
        else{
            App.debug("xhr.readyState: "+xhr.readyState);
        }
    };
    App.debug("Loading Station: "+_stationID);
    xhr.send("{ \n    \"apiKey\" : \""+API_KEY+"\",\n    \"stationId\" : \""+_stationID+"\",\n    \"channelId\" : \"SAT\"\n}");
};

/*
    json2.js
    2014-02-04

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());if (typeof(KeyEvent)!='undefined') {
  if (typeof(KeyEvent.VK_LEFT)!='undefined') {
    var VK_LEFT = KeyEvent.VK_LEFT;
    var VK_UP = KeyEvent.VK_UP;
    var VK_RIGHT = KeyEvent.VK_RIGHT;
    var VK_DOWN = KeyEvent.VK_DOWN;
  }
  if (typeof(KeyEvent.VK_ENTER)!='undefined') {
    var VK_ENTER = KeyEvent.VK_ENTER;
  }
  if (typeof(KeyEvent.VK_RED)!='undefined') {
    var VK_RED = KeyEvent.VK_RED;
    var VK_GREEN = KeyEvent.VK_GREEN;
    var VK_YELLOW = KeyEvent.VK_YELLOW;
    var VK_BLUE = KeyEvent.VK_BLUE;
  }
  if (typeof(KeyEvent.VK_PLAY)!='undefined') {
    var VK_PLAY = KeyEvent.VK_PLAY;
    var VK_PAUSE = KeyEvent.VK_PAUSE;
    var VK_STOP = KeyEvent.VK_STOP;
  }
  if (typeof(KeyEvent.VK_PLAY_PAUSE)!='undefined') {
    var VK_PLAY_PAUSE = KeyEvent.VK_PLAY_PAUSE;
  }else{
    var VK_PLAY_PAUSE = NaN;
  }
  if (typeof(KeyEvent.VK_FAST_FWD)!='undefined') {
    var VK_FAST_FWD = KeyEvent.VK_FAST_FWD;
    var VK_REWIND = KeyEvent.VK_REWIND;
  }
  if (typeof(KeyEvent.VK_BACK)!='undefined') {
    var VK_BACK = KeyEvent.VK_BACK;
  }
  if (typeof(KeyEvent.VK_0)!='undefined') {
    var VK_0 = KeyEvent.VK_0;
    var VK_1 = KeyEvent.VK_1;
    var VK_2 = KeyEvent.VK_2;
    var VK_3 = KeyEvent.VK_3;
    var VK_4 = KeyEvent.VK_4;
    var VK_5 = KeyEvent.VK_5;
    var VK_6 = KeyEvent.VK_6;
    var VK_7 = KeyEvent.VK_7;
    var VK_8 = KeyEvent.VK_8;
    var VK_9 = KeyEvent.VK_9;
  }
}
if (typeof(VK_LEFT)=='undefined') {
  var VK_LEFT = 0x25;
  var VK_UP = 0x26;
  var VK_RIGHT = 0x27;
  var VK_DOWN = 0x28;
}
if (typeof(VK_ENTER)=='undefined') {
  var VK_ENTER = 0x0d;
}
if (typeof(VK_RED)=='undefined') {
  var VK_RED = 0x74;
  var VK_GREEN = 0x75;
  var VK_YELLOW = 0x76;
  var VK_BLUE = 0x77;
}
if (typeof(VK_PLAY)=='undefined') {
  var VK_PLAY = 0x50;
  var VK_PAUSE = 0x51;
  var VK_STOP = 0x53;
}
if (typeof(VK_FAST_FWD)=='undefined') {
  var VK_FAST_FWD = 0x46;
  var VK_REWIND = 0x52;
}
if (typeof(VK_BACK)=='undefined') {
  var VK_BACK = 0xa6;
}
if (typeof(VK_0)=='undefined') {
  var VK_0 = 0x30;
  var VK_1 = 0x31;
  var VK_2 = 0x32;
  var VK_3 = 0x33;
  var VK_4 = 0x34;
  var VK_5 = 0x35;
  var VK_6 = 0x36;
  var VK_7 = 0x37;
  var VK_8 = 0x38;
  var VK_9 = 0x39;
}

var Util = {};
Util.bind = function(scope, fn, arguments) {
  return function() {
      fn.apply(scope, arguments);
  };
};

/*
* Preloads a given amount of image URLs.
* Uses given array reference to store.
* @param
*      urlArr: Array of image URLs to preload
*      imageArrayRef: Array reference to store to
*/
Util.preloadImages = function(urlArr, imageArrayRef) {
  var prelImgsLength = imageArrayRef.length;
  for (i = 0; i < urlArr.length; i++) {
      imageArrayRef[prelImgsLength+i] = document.createElement("img");
      imageArrayRef[prelImgsLength+i].src = urlArr[i];
  }
};

Util.regEscape = function(s, arr) {
  var result = s, o;

    for( var i=0, l=arr.length; i<l; i++ ) {
      o = arr[i];
      if( o.regEx && o.value ) {
        result = result.replace(o.regEx, o.value);
      }
    }

    return result;
};
/*!
  * klass: a classical JS OOP façade
  * https://github.com/ded/klass
  * License MIT (c) Dustin Diaz & Jacob Thornton 2012
  */
!function(e,t,n){typeof define=="function"?define(n):typeof module!="undefined"?module.exports=n():t[e]=n()}("klass",this,function(){function s(e){return f.call(o(e)?e:function(){},e,1)}function o(e){return typeof e===n}function u(e,t,n){return function(){var r=this.supr;this.supr=n[i][e];var s={}.fabricatedUndefined,o=s;try{o=t.apply(this,arguments)}finally{this.supr=r}return o}}function a(e,t,n){for(var s in t)t.hasOwnProperty(s)&&(e[s]=o(t[s])&&o(n[i][s])&&r.test(t[s])?u(s,t[s],n):t[s])}function f(e,t){function n(){}function c(){this.initialize?this.initialize.apply(this,arguments):(t||u&&r.apply(this,arguments),f.apply(this,arguments))}n[i]=this[i];var r=this,s=new n,u=o(e),f=u?e:this,l=u?{}:e;return c.methods=function(e){return a(s,e,r),c[i]=s,this},c.methods.call(c,l).prototype.constructor=c,c.extend=arguments.callee,c[i].implement=c.statics=function(e,t){return e=typeof e=="string"?function(){var n={};return n[e]=t,n}():e,a(this,e,r),this},c}var e=this,t=e.klass,n="function",r=/xyz/.test(function(){xyz})?/\bsupr\b/:/.*/,i="prototype";return s.noConflict=function(){return e.klass=t,this},s})/*
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
});window.JST['progress_bar'] = '<div class="progress_bar_position buffer_progress"></div><div class="progress_bar_position current_progress"></div>';
