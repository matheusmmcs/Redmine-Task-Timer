(function($){
	$(document).ready(function(){

		//get description to change only redmine pages
		var metaDesc = $('meta[name=description]').attr("content");

		if(metaDesc && metaDesc.toLowerCase() == "redmine"){

			//Object to represent the dispended time
			function TimeObject(data){
				/*		METHODS 		*/
				this.atualizeTime = function(time){
					if(time != null && time != undefined){
						this.time = time;
					}
				}
				this.atualizeDateBackground = function(dateBackground){
					this.dateBackground = dateBackground;
				}
				//change task by taskurl
				this.changeTask = function(taskUrl, taskNumber){
					if(taskUrl){
						this.taskUrl = taskUrl;
						this.taskName = "No-named";
						if(taskNumber){
							this.taskNumber = taskNumber;
						}else{
							var number = getNumberFromTaskUrl(taskUrl);
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


				/*		INITIALIZE OBJECT 		*/
				if(data){
					this.changeTask(data.taskUrl, data.taskNumber);
				}
				//can be ommited in initialize
				this.time = data ? data.time : undefined;
				this.dateBackground = data ? data.dateBackground : undefined;
				this.validate();
			}

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
				var timerFunction;
				//var like a static object when time is defined
				var timeObject;
				//task number of this url
				var numberTask = getNumberFromTaskUrl(window.location.href);

				//has time-tracker? case no, insert a html to start/stop timer, and show the time
				if(!$("#time-tracker-cnt").length){
					$timeInput.parent().append('<div id="time-tracker-cnt"><div id="'+idClock+'" class="clk">'+EnumTimeTrackerMessages.CLOCK+'</div><a id="'+idStartStop+'" class="'+EnumTimeTrackerState.START_CLASS+'">'+EnumTimeTrackerState.START+'</a><a id="'+idReset+'" class="'+EnumTimeTrackerState.RESET_CLASS+'">'+EnumTimeTrackerState.RESET+'</a></div>');
				}
				//atualize variables DOM reference
				$stopStart = $("#"+idStartStop);
				$clock = $('#'+idClock);
				$reset = $('#'+idReset);

				//when initialize, atualize clock to the previous value
				dataFromBackground("getTaskTime", { 'taskNumber' : numberTask, 'notification' : true }, function(data){					
					timeObject = data ? new TimeObject(data) : new TimeObject({ taskUrl : window.location.href });

					//if is running in background
					if(timeObject.dateBackground){
						var newTime = changeActualTimeByDateBackgroundTimeTracker(timeObject.time, timeObject.dateBackground);
						timeObject.dateBackground = undefined;
						dataFromBackground("setTaskTime", stringifyJSONTimeTracker(timeObject));
						atualizeClock(newTime);
						startTime();
					}else{
						atualizeClock(timeObject.time);
					}
				});

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
					dataFromBackground("removeTaskTime", {
						task: window.location.href
					});
				});

				//task number from url
				function getNumberFromTaskUrl(url){
					var regex = new RegExp("issues\/([0-9]*)\/?");
					if(regex.test(url)){
						return regex.exec(url)[1];
					}else{
						return null;
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

				//method to initialize the time when the button is clicked
				function startTime(){
					if($stopStart){
						//change button
						$stopStart.html(EnumTimeTrackerState.STOP);
						$stopStart.attr("class", EnumTimeTrackerState.STOP_CLASS);
						$stopStart.attr("data-started", true);

						//set new value to field
						var value = parseFloat($timeInput.val());
						var seconds = value ? (value*3600) : 0;
						atualizeClock(seconds);
						timerFunction = setInterval(function(){							
							seconds++;
							timeObject.atualizeTime(seconds);
							timeObject.atualizeDateBackground(new Date().getTime());
							atualizeClock(seconds);
							if(timeObject.validate()){
								console.log("setTaskTime: ", timeObject);
								dataFromBackground("setTaskTime", stringifyJSONTimeTracker(timeObject));
							}
						}, 1000);
					}
				}

				//method to stop the time when the button is clicked
				function stopTime(){
					if($stopStart){
						//change button
						$stopStart.html(EnumTimeTrackerState.START);
						$stopStart.attr("data-started", false);
						$stopStart.attr("class", EnumTimeTrackerState.START_CLASS);
						//stop timerfunction and set dateBackground equals null
						clearInterval(timerFunction);
						timeObject.atualizeDateBackground(null);
						dataFromBackground("setTaskTime", stringifyJSONTimeTracker(timeObject));
					}
				}

				function resetTime(){
					if($clock && $stopStart){
						var resp = confirm(EnumTimeTrackerMessages.RESET);
						if(resp==true){
							stopTime();
							$clock.html(EnumTimeTrackerMessages.CLOCK);
							$timeInput.val("");
							timeObject.atualizeTime(0);
							timeObject.atualizeDateBackground(null);
							dataFromBackground("setTaskTime", stringifyJSONTimeTracker(timeObject));
						}
					}
				}

				function atualizeClock(s){
					if(!s){ s = 0; } 
					var hoursFormatted = (s/3600);//.toFixed(4);
					if(s != 0){
						$timeInput.val(hoursFormatted);
					}
					//atualize clock
					if($clock){
						$clock.html(secondsToHmsTimeTracker(s));
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