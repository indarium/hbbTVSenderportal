var Views = {
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

    if(@ENABLE_DEBUG_MODE@){
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

    if(_station.showVideoHDUrl != ''){
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
        App.views.showDescription.innerHTML = "Bitte versuchen Sie es später noch einmal.";
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



 