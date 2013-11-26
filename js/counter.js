(function($){
	$(document).ready(function(){

		//aux functions
		function stringifyJSON(data){
			return window.JSON && window.JSON.stringify ? window.JSON.stringify(data) : (new Function("return " + data))();
		}
		function parseJSON(data) {
			return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))(); 
		}

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
					if(dateBackground != null && dateBackground != undefined){
						this.dateBackground = dateBackground;
					}
				}
				this.atualize = function(time, dateBackground){
					this.atualizeTime(time);
					this.atualizeDateBackground(dateBackground);
				}
				//clear date backbround
				this.clearDateBackground = function(){
					this.dateBackground = undefined;
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

			var EnumMessages = {
				RESET: "Are you sure that wish to RESET the time?",
				CLOCK: "00:00:00"
			}		

			var EnumState = {
				START:"Start",
				STOP:"Stop",
				RESET:"Reset",
				START_CLASS:"bt bt-start",
				STOP_CLASS:"bt bt-stop",
				RESET_CLASS:"bt bt-reset"
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
					$timeInput.parent().append('<div id="time-tracker-cnt"><div id="'+idClock+'" class="clk">'+EnumMessages.CLOCK+'</div><a id="'+idStartStop+'" class="'+EnumState.START_CLASS+'">'+EnumState.START+'</a><a id="'+idReset+'" class="'+EnumState.RESET_CLASS+'">'+EnumState.RESET+'</a></div>');
				}
				//atualize variables DOM reference
				$stopStart = $("#"+idStartStop);
				$clock = $('#'+idClock);
				$reset = $('#'+idReset);

				//when initialize, atualize clock to the previous value
				dataFromBackground("getTaskTime", { 'taskNumber' : numberTask }, function(data){					
					timeObject = data ? new TimeObject(data) : new TimeObject({ taskUrl : window.location.href });

					//if is running in background
					if(timeObject.dateBackground){
						/*
						//TODO
						timeObject.time = new Date().getTime() - timeObject.dateBackground + timeObject.time;
						timeObject.dateBackground = undefined;
						dataFromBackground("setTaskTime", stringifyJSON(timeObject));
						atualizeClock(timeObject.time);
						startTime();
						*/
						atualizeClock(timeObject.time);
					}else{
						atualizeClock(timeObject.time);
					}
					
					//initialize a function to persist the time to determinated task
					dataFromBackground("getPersistInterval", null, function(time){
						var saveInterval = setInterval(function(){
							if($timeInput){
								var valueFromInput = parseFloat($timeInput.val());
								valueFromInput = valueFromInput ? (valueFromInput*3600) : 0;
								if(valueFromInput != 0){
									//send data to background
									var actualDate = new Date();
									timeObject.atualizeTime(valueFromInput);
									timeObject.atualizeDateBackground(actualDate.getTime());
									dataFromBackground("setTaskTime", stringifyJSON(timeObject));
								}
							}
						}, time);
					});
				});

				//EVENTS
				//event start when close tab:
				//dateBackground: new Date().getTime()

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
						$stopStart.html(EnumState.STOP);
						$stopStart.attr("class", EnumState.STOP_CLASS);
						$stopStart.attr("data-started", true);
						//set new value to fild
						var value = parseFloat($timeInput.val());
						var seconds = value ? (value*3600) : 0;
						atualizeClock(seconds);
						timerFunction = setInterval(function(){							
							seconds++;
							atualizeClock(seconds);
						}, 1000);
					}
				}

				//method to stop the time when the button is clicked
				function stopTime(){
					if($stopStart){
						$stopStart.attr("data-started", false);
						clearInterval(timerFunction);
						$stopStart.html(EnumState.START);
						$stopStart.attr("class", EnumState.START_CLASS);
					}
				}

				function resetTime(){
					if($clock && $stopStart){
						var resp = confirm(EnumMessages.RESET);
						if(resp==true){
							stopTime();
							$clock.html(EnumMessages.CLOCK);
							$timeInput.val("");
							timeObject.atualize({
								time: 0
							});
							timeObject.clearDateBackground();
							dataFromBackground("setTaskTime", stringifyJSON(timeObject));
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
						$clock.html(secondsToHms(s));
					}
				}

				function dataFromBackground(method, data, callback){
					chrome.extension.sendRequest({redmine: method, data: data}, function(response) {					
						if (callback && typeof(callback) === "function") {
							callback.call(this, response);
						}
					});
				}	

				function secondsToHms(t) {
					var t = parseInt(t, 10);
				    var h   = Math.floor(t / 3600);
				    var m = Math.floor((t - (h * 3600)) / 60);
				    var s = t - (h * 3600) - (m * 60);
				    h = h < 10 ? "0"+h : h;
				    m = m < 10 ? "0"+m : m;
				    s = s < 10 ? "0"+s : s;
	    			return h+':'+m+':'+s;
				}
			}
		}
	});
})(jQuery);