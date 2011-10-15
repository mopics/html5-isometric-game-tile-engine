FrameBasedAnimation = function(args) {
    this.construct(args);
}

FrameBasedAnimation.prototype = {
    META: {
        description: 'basic framework',
        version: 'versie beta:0.0.1',
        state: "beta",
        date: "2010-02-04",
        author: "Robbert Streng"
    },
    ticker: 1,
    frameCount: 1,
    tickCount: 1,
    frameCount: 0,
    frameCountNow: 0,
    framespeed: 20,
    interval: null,
    tickerDiv: null,
    debugDiv: null,
    debugpanel: 1,
    construct: function(args) {
        for (var o in args) {
            this[o] = args[o];
        }
        if (this.debugpanel == 1) {
            this.makeDebugDiv();
            this.makeTickerDiv();
        }
        this.init();
    },
    isPlaying: false,
    myTickerEvent: null,
    init: function() {
        this.debug('start');
        var self = this;
        setInterval(function() {
            self.frameSpeedIndicator();
        },
        1000);
        this.setFrameSpeed(this.framespeed);
    },
    makeTickerDiv: function() {
        this.tickerDiv = document.createElement('div');
        this.tickerDiv.setAttribute('id', 'carouselticker');
        document.body.appendChild(this.tickerDiv);
        this.tickerDiv.innerHTML = "";
    },
    makeDebugDiv: function() {
        this.debugDiv = document.createElement('div');
        this.debugDiv.setAttribute('id', 'carouseldebug');
        document.body.appendChild(this.debugDiv);
        this.debugDiv.innerHTML = "";
    },
    loopFunction: function() {
        this.tickCount++;
        this.frameCount++;
        if (this.debugpanel == 1) {
            this.tickerDiv.innerHTML = "framespeed:" + this.framespeed + "<br/>tick:" + this.tickCount + "<br/>avg:" + this.frameCountNow;
        }
    },
    broadCastTickerEvent: function() {
        this.myTickerEvent.fire("myEvent", {
            message: 'tick'
        })
    },
    about: function() {
        var str = "";
        for (var o in this.META) {
            str += o + "<br/>";
        }
        return str;
    },
    setFrameSpeed: function(speed) {


        this.framespeed = speed;


        if (this.isPlaying) {
            clearInterval(this.interval);
            this.myTickerEvent.unsubscribe(this.loopFunction);
            //this.debug('removing myTickerEvent');
            this.isPlaying = false;
        }


        var self = this;
        //this.debug('creating myTickerEvent');
        //this.debug('playing at framespeed:' + self.framespeed);
        this.myTickerEvent = new CustomEvent("tick");
        this.myTickerEvent.subscribe(function() {
            self.loopFunction();
        });
        this.interval = setInterval(function() {
            self.broadCastTickerEvent();
        },
        1000 / self.framespeed);
        this.isPlaying = true;


    },
    debug: function(message) {
        if (this.debugpanel == 1) {
            this.debugDiv.innerHTML += "<br/>" + message;
        }
    },
    frameSpeedIndicator: function() {
        this.frameCountNow = this.frameCount;
        this.frameCount = 0;
        this.tickCount = 0;
    }
};


CustomEvent = function() {
    this.eventconstuctor(arguments);
}
CustomEvent.prototype = 
{
	eventName: null,
    mEventName: null,
    eventconstuctor: function(args) 
	{


        this.eventName = args[0];

        this.eventActions = new Object();


    },
    subscribe: function(fn) {
        if (!this.eventActions[this.eventName]) {
            this.eventActions[this.eventName] = new Array();
        }
        this.eventActions[this.eventName].push(fn);
    },


    unsubscribe: function(fn) {
        var eventArr = new Array();
        for (var i = 0; i < this.eventActions[this.eventName].length; i++) {
            if (this.eventActions[this.eventName][i] != fn) {
                eventArr.push(this.eventActions[this.eventName][i]);
            }
        }


        this.eventActions[this.eventName] = eventArr;


    },


    fire: function(sender, eventArgs) {
        if (this.eventActions[this.eventName] != null) {
            for (var i = 0; i < this.eventActions[this.eventName].length; i++) {
                this.eventActions[this.eventName][i](sender, eventArgs);
            }
        }
        else {
            alert('There was no function subscribed to the ' + mEventName + ' event!');
        }
    }
}




customHandler = function() {
    document.getElementById("debug").innerHTML += "customTick";


}
customHandler2 = function() {
    document.getElementById("debug").innerHTML += "customTick";
}



