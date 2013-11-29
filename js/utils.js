//OBJECTS
//Object to represent the dispended time
function TimeTrackerObject(data){
	/*		METHODS 		*/
	//change task by taskurl
	this.changeTask = function(taskUrl, taskNumber){
		if(taskUrl){
			this.taskUrl = taskUrl;
			this.taskName = "No-named";
			if(taskNumber){
				this.taskNumber = taskNumber;
			}else{
				var number = getNumberFromTaskUrlTimeTracker(taskUrl);
				if(number){
					this.taskNumber = number;
				}
			}
		}
	}
	//validate the object
	this.validate = function(){
		if(this.taskUrl && this.taskNumber){
			return true;
		}else{
			alert("Ocurred an unexpected error in TimeObject!");
			return false;
		}
	}
	this.atualizeClock = function(){
		var newDate = new Date().getTime();
		if(this.started){
			if(this.dateBackground){
				this.time += Math.round((newDate - this.dateBackground) / 1000);
				this.dateBackground = newDate;
			}
		}else{
			this.dateBackground = newDate;
		}
	}


	/*		INITIALIZE OBJECT 		*/
	if(data){
		this.changeTask(data.taskUrl, data.taskNumber);
	}
	//can be ommited in initialize
	this.started = data && data.started != undefined ? data.started : true;
	this.time = data && data.time != undefined ? data.time : 0;
	this.dateBackground = data && data.dateBackground != undefined ? data.dateBackground : new Date().getTime();
	this.validate();
}

//ENUMS
var EnumTimeTrackerMessages = {
	RESET: "Are you sure that wish to RESET the time?",
	CLOCK: "00:00:00"
}
var EnumTimeTrackerState = {
	START:"Start",
	STOP:"Stop",
	RESET:"Reset",
	START_CLASS:"bt bt-start",
	STOP_CLASS:"bt bt-stop",
	RESET_CLASS:"bt bt-reset"
}

//HELPER FUNCTIONS
function parseJSONTimeTracker(data) {
	return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))(); 
}
function stringifyJSONTimeTracker(data){
	return window.JSON && window.JSON.stringify ? window.JSON.stringify(data) : (new Function("return " + data))();
}
function secondsToHmsTimeTracker(t) {
	if(!t){
		t = 0;
	}
	var t = parseInt(t, 10);
    var h   = Math.floor(t / 3600);
    var m = Math.floor((t - (h * 3600)) / 60);
    var s = t - (h * 3600) - (m * 60);
    h = h < 10 ? "0"+h : h;
    m = m < 10 ? "0"+m : m;
    s = s < 10 ? "0"+s : s;
	return h+':'+m+':'+s;
}
//task number from url
function getNumberFromTaskUrlTimeTracker(url){
	var regex = new RegExp("issues\/([0-9]*)\/?");
	if(regex.test(url)){
		return regex.exec(url)[1];
	}else{
		return null;
	}
}
function changeActualTimeByDateBackgroundTimeTracker(actualTime, dateBackground){
	var newTime = (new Date().getTime() - dateBackground) / 1000; //ms to s
	return newTime + actualTime;
}