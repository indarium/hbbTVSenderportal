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
    this.video.data = _url;
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
    this.video.play(0);
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
    this.seek(skip_to);
};

Player.seek_backward= function(){
    App.debug("Player seek_backward");
    var skip_to = this.currentTime - SEEKING_TIME;
    if(skip_to < 0){
        skip_to = 0;
    }
    this.seek(skip_to);
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
};