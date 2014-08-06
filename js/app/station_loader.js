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

