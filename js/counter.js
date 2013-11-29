if(!window.hasPluginTimeTracker){
	//this variable verify if alredy has time tracker, because some pages have duplicate the import
window.hasPluginTimeTracker = true;
(function($){
	$(document).ready(function(){
		//get description to change only redmine pages
		var metaDesc = $('meta[name=description]').attr("content");
		if(metaDesc && metaDesc.toLowerCase() == "redmine"){
			//get element where set the time hours
			var $timeInput = $("#time_entry_hours");
			if($timeInput.length){

				//id and button to start and stop
				var idStartStop = "time-tracker-btn", $stopStart;
				//id and element clock
				var idClock = "time-tracker-clk", $clock;
				//id and button to reset
				var idReset = "time-tracker-rst", $reset;
				//id and button to submit
				var idSubmit = "issue-form";

				//var to store the function responsible for atualize clock
				var hasTimeSaved = false;
				//var like a static object when time is defined
				var timeObject;
				//task number of this url
				var numberTask = getNumberFromTaskUrlTimeTracker(window.location.href);

				//has time-tracker? case no, insert a html to start/stop timer, and show the time
				if(!$("#time-tracker-cnt").length){
					//this html is so simple and insert mustache to render they in all pages aren't a good idea
					$timeInput.parent().append('<div id="time-tracker-cnt"><div id="'+idClock+'" class="clk">'+EnumTimeTrackerMessages.CLOCK+'</div><a id="'+idStartStop+'" class="'+EnumTimeTrackerState.START_CLASS+'">'+EnumTimeTrackerState.START+'</a><a id="'+idReset+'" class="'+EnumTimeTrackerState.RESET_CLASS+'">'+EnumTimeTrackerState.RESET+'</a></div>');
				}
				//atualize variables DOM reference
				$stopStart = $("#"+idStartStop);
				$clock = $('#'+idClock);
				$reset = $('#'+idReset);

				//when initialize
				timerFunction = setInterval(function(){
					dataFromBackground("getTaskTime", { 'taskNumber' : numberTask, 'notification' : false }, function(data){
						if(data.initialized){
							hasTimeSaved = true;
							var task = new TimeTrackerObject(data.task);
							atualizeClock(task);
							//atualize button
							if(task.started){
								setButtonStarted();
							}else{
								setButtonStoped();
							}
						}else{
							hasTimeSaved = false;
							setButtonStoped();
							atualizeClock(null);
						}
					});
				}, 500);

				//EVENTS
				$(document).on("click", "#"+idStartStop, function(e){
					e.preventDefault();
					//garantee a stop/start button exists
					if($stopStart.length < 1){
						$stopStart = $("#"+idStartStop);
					}
					if(isStarted()){
						stopTime();
					}else{
						startTime();
					}
				});

				$(document).on("click", "#"+idReset, function(e){
					e.preventDefault();
					resetTime();
				});

				$(document).on("submit", "#"+idSubmit, function(e){
					dataFromBackground("submitTaskTime", {
						task: window.location.href
					});
				});

				function setButtonStoped(){
					if($stopStart){
						$stopStart.html(EnumTimeTrackerState.START);
						$stopStart.attr("data-started", false);
						$stopStart.attr("class", EnumTimeTrackerState.START_CLASS);
					}
				}

				function setButtonStarted(){
					if($stopStart){
						$stopStart.html(EnumTimeTrackerState.STOP);
						$stopStart.attr("class", EnumTimeTrackerState.STOP_CLASS);
						$stopStart.attr("data-started", true);
					}
				}

				//method to initialize the time when the button is clicked
				function startTime(){				
					setButtonStarted();
					console.log(hasTimeSaved, $stopStart)
					if(hasTimeSaved){
						dataFromBackground("startTaskTime", { 'taskNumber' : numberTask });
					}else{
						var newTask = new TimeTrackerObject({ taskUrl : window.location.href });
						dataFromBackground("initializeTaskTime", { 'task' : newTask });
					}
				}

				//method to stop the time when the button is clicked
				function stopTime(){
					setButtonStoped();
					dataFromBackground("stopTaskTime", { 'taskNumber' : numberTask });
				}

				function resetTime(){
					if($clock && $stopStart){
						var resp = confirm(EnumTimeTrackerMessages.RESET);
						if(resp==true){
							stopTime();
							$clock.html(EnumTimeTrackerMessages.CLOCK);
							$timeInput.val("");
							dataFromBackground("eraseTaskTime", { 'taskNumber' : numberTask });
						}
					}
				}

				function atualizeClock(task){
					var s = task == null ? 0 : task.time;

					if(s == 0){
						$timeInput.val("");
					}else{
						var hoursFormatted = (s/3600);//.toFixed(4);
						$timeInput.val(hoursFormatted);
					}
					//atualize clock
					if($clock){
						$clock.html(secondsToHmsTimeTracker(s));
					}
				}

				function isStarted(){
					var isStarted = $stopStart.attr("data-started");
					if(!isStarted || isStarted == "false"){
						return false;
					}else{
						return true;
					}
				}


				function dataFromBackground(method, data, callback){
					chrome.extension.sendRequest({redmine: method, data: data}, function(response) {					
						if (callback && typeof(callback) === "function") {
							callback.call(this, response);
						}
					});
				}	

				
			}
		}
	});
})(jQuery);
}