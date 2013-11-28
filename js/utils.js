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
function changeActualTimeByDateBackgroundTimeTracker(actualTime, dateBackground){
	var newTime = (new Date().getTime() - dateBackground) / 1000; //ms to s
	return newTime + actualTime;
}

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