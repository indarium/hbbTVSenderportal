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
};