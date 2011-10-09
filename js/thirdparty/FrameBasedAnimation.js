/*********************************************************
 *  FrameBasedAnimation 
 *  BASIC FUNCTIONS For animation
 *  
 * 
 * 		EVENT HANDLING
 * 		FRAME MANAGEMENT
 * 		DEBUGGING 	
 * 		FRAME INDICATOR
 *  		
 *  	Version 0.0.1 (c) Robbert Streng 2010
 *
 **********************************************************/
 
	
FrameBasedAnimation = function() { 
	this.init();
	self=this;
}
		
		
		
FrameBasedAnimation.prototype.init = function() {		
		
		this.debugDiv=document.getElementById("debug");
		this.tickerDiv = document.getElementById("ticker");
		this.tickCount=1;
		this.framespeed=100;
		this.interval;
 
		this.isPlaying=false;
		this.myTickerEvent;
		this.frameCount=0;
		this.frameCountNow=0;
		
		this.debug('start');
		setInterval(this.frameSpeedIndicator,1000);
		this.setFrameSpeed(this.framespeed);
	}
	
FrameBasedAnimation.prototype.loopFunction = function(sender,object){
		self.tickCount++;
		self.frameCount++;
		self.tickerDiv.innerHTML ="framespeed:"+self.framespeed+"<br/>tick:"+self.tickCount+"<br/>avg:"+self.frameCountNow;
		
	}
	
FrameBasedAnimation.prototype.frameSpeedIndicator=function() {
		self.frameCountNow=self.frameCount;
		self.frameCount=0;
		self.tickCount=0;
	}
	
FrameBasedAnimation.prototype.broadCastTickerEvent=function() {
		self.myTickerEvent.fire("myEvent", {
			message: 'tick'
		});
	}
	
FrameBasedAnimation.prototype.debug = function(message){
		this.debugDiv.innerHTML += "<br/>"+message;
	}
	
FrameBasedAnimation.prototype.stopPlaying = function() {
		if(this.isPlaying) {
				clearInterval(this.interval);
				this.myTickerEvent.unsubscribe(this.loopFunction);
				this.debug('removing myTickerEvent');
				this.isPlaying=false;
			}
			this.debug('stopPlaying');
	}
	
FrameBasedAnimation.prototype.startPlaying = function() {
		this.setFrameSpeed(this.framespeed);
		this.debug('startPlaying at framespeed:'+this.framespeed);
	}
	
FrameBasedAnimation.prototype.setFrameSpeed= function(speed){
			this.framespeed=speed;
			
			if(this.isPlaying) {
				clearInterval(this.interval);
				this.myTickerEvent.unsubscribe(this.loopFunction);
				this.debug('removing myTickerEvent');
				this.isPlaying=false;
			}
			
				this.debug('creating myTickerEvent');
				this.debug('playing at framespeed:'+this.framespeed);
				this.myTickerEvent = new CustomEvent("tick");
				this.myTickerEvent.subscribe(this.loopFunction);
				this.interval = setInterval(this.broadCastTickerEvent,1000/this.framespeed);
				this.isPlaying=true;
				
	}
	
	
 
	
	
	
	
	
	CustomEvent = function() {
		//name of the event
		this.eventName = arguments[0];
		var mEventName = this.eventName;
	
		//function to call on event fire
		var eventActions = new Object();
	
		//subscribe a function to the event
		this.subscribe = function(fn) {
			if(!eventActions[this.eventName]) {
				eventActions[this.eventName]=new Array();
			}
			eventActions[this.eventName].push(fn);
		};
		
		//unsubscribe a function to the event
		this.unsubscribe = function(fn) {
			var eventArr=new Array();
			for(var i=0;i<eventActions[this.eventName].length;i++) {			
				if(eventActions[this.eventName][i]!=fn) {
					eventArr.push(eventActions[this.eventName][i]);
				}				
			}
		
			eventActions[this.eventName]=eventArr;
		
		};
		
		//fire the event
		this.fire = function(sender, eventArgs) {
			if(eventActions[this.eventName] != null) {	
				for(var i=0;i<eventActions[this.eventName].length;i++) {
					eventActions[this.eventName][i](sender, eventArgs);
				}			
			}
			else {
				alert('There was no function subscribed to the ' + mEventName + ' event!');
			}
		};
	};
	
	
	
	customHandler = function() {
		document.getElementById("debug").innerHTML +="customTick";
		
	}
	customHandler2 = function() {
		document.getElementById("debug").innerHTML +="customTick";
	}
			
	var player = new FrameBasedAnimation();
	
	
	
	//player.myTickerEvent.subscribe(customHandler);
	//player.myTickerEvent.subscribe(customHandler2);
	//player.myTickerEvent.unsubscribe(customHandler2);