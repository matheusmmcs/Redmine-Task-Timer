(function($){
	$(document).ready(function(){

		//funcoes auxiliares
		function stringifyJSON(data){
			return window.JSON && window.JSON.stringify ? window.JSON.stringify(data) : (new Function("return " + data))();
		}
		function parseJSON(data) {
			return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))(); 
		}

		var metaDesc = $('meta[name=description]').attr("content");

		if(true){
		//if(metaDesc && metaDesc.toLowerCase() == "redmine"){

			function TimeObject(data){
				this.task = data ? data.task : undefined;
				this.time = data ? data.time : undefined;
				this.dateBackground = data ? data.dateBackground : undefined;
				this.timeobj = true;

				this.atualize = function(data){
					if(data){
						if(data.task){
							if(!this.task){
								this.task = data.task;
							}
						}
						if(data.time){
							this.time = data.time;
						}
						if(data.dateBackground){
							this.dateBackground = data.dateBackground;
						}
					}
				}

				this.clearDateBackground = function(){
					this.dateBackground = undefined;
				}
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

			var $timeInput = $("#time_entry_hours");		

			if($timeInput.length){
				//configs
				var timerFunction, $clock, $stopStart, $reset, timeObject;

				//has time-tracker? insert a html to start/stop timer, and show the time
				if(!$("#time-tracker-cnt").length){
					$timeInput.parent().append('<div id="time-tracker-cnt"><div id="time-tracker-clk" class="clk">'+EnumMessages.CLOCK+'</div><a id="time-tracker-btn" class="'+EnumState.START_CLASS+'">'+EnumState.START+'</a><a id="time-tracker-rst" class="'+EnumState.RESET_CLASS+'">'+EnumState.RESET+'</a></div>');
					$clock = $('#time-tracker-clk');
				}

				//when initialize, atualiza clock to the previous value
				dataFromBackground("getTaskTime", {task: window.location.href}, function(data){
					console.log("0", data);
					timeObject = new TimeObject(data);
					timeObject.task = window.location.href;
					console.log("1", timeObject);
					if(timeObject.dateBackground){
						timeObject.time = new Date().getTime() - timeObject.dateBackground + timeObject.time;
						timeObject.dateBackground = undefined;
						dataFromBackground("setTaskTime", stringifyJSON(timeObject));
						atualizeClock(timeObject.time);
						startTime();
					}else{
						atualizeClock(timeObject.time);
					}
					
					//initialize a function to persist the time to determinated task
					dataFromBackground("getPersistInterval", null, function(time){
						var interval = setInterval(function(){
							if($timeInput){
								var value = parseFloat($timeInput.val());
								value = value ? (value*3600) : 0;
								if(value != 0){
									console.log("ói", timeObject);
									timeObject.atualize({
										time: value
									});
									dataFromBackground("setTaskTime", stringifyJSON(timeObject));
								}
							}
						}, time);
					});	
				});

				//EVENTS
				//event start when close tab:
				//dateBackground: new Date().getTime()

				$(document).on("click", "#time-tracker-btn", function(e){
					e.preventDefault();
					$stopStart = $(this);
					var isStarted = $stopStart.attr("data-started");
					if(!isStarted || isStarted == "false"){
						startTime();
					}else{
						stopTime();
					}
				});

				$(document).on("click", "#time-tracker-rst", function(e){
					e.preventDefault();
					resetTime();
				});

				$(document).on("submit", "#issue-form", function(e){
					dataFromBackground("removeTaskTime", {
						task: window.location.href
					});
				});

				function startTime(){
					if($stopStart){
						$stopStart.attr("data-started", true);
						//set new value to fild
						var value = parseFloat($timeInput.val());					
						var seconds = value ? (value*3600) : 0;
						atualizeClock(seconds);
						timerFunction = setInterval(function(){
							seconds++;
							atualizeClock(seconds);
						}, 1000);
						//change button
						$stopStart.html(EnumState.STOP);
						$stopStart.attr("class", EnumState.STOP_CLASS);
					}
				}

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