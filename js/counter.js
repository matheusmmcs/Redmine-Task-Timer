if(!window.hasPluginTimeTracker){
	//this variable verify if alredy has time tracker, because some pages have duplicate the import
	window.hasPluginTimeTracker = true;
	(function($1){
		$(document).ready(function(){
			//get description to change only redmine pages
			var metaDesc = $('meta[name=description]').attr("content");
			if(metaDesc && metaDesc.toLowerCase() == "redmine"){

				//get element where set the time hours
				var $timeInput = $("#time_entry_hours");
				var $contentH2 = $("#content h2").eq(0);

				var loc = window.location.href;

				//if has an input to time, modify the page
				if($timeInput.length && loc.indexOf("time_entries") == -1){

					//hide fields if has a sub issues
					var $issueTree = $("#issue_tree");
					var hasIssueTreeForm = $issueTree.find(".list.issues").length > 0 ? true : false;
					if(hasIssueTreeForm){
						//remove buttons and fieldsets to update working time
						$(".icon.icon-time-add").remove();
						$timeInput.closest("fieldset").remove();
					}

					//hide time-add button
					var $timeAddButton = $(".icon.icon-time-add");
					if($timeAddButton.length){
						$timeAddButton.remove();
					}

					//hide fieldset to actualize time
					$timeInput.closest("fieldset").hide();

					//id and button to start and stop
					var idStartStop = "time-tracker-btn", $stopStart;
					//id and element clock
					var idClock = "time-tracker-clk", $clock;
					//id and button to reset
					var idReset = "time-tracker-rst", $reset;
					//id and button to fisinh
					var idFinish = "time-tracker-finish", $finish;
					//id and button to fisinh
					var idSendTime = "time-tracker-send-time", $sendTime;
					
					//id and button to submit
					var idSubmit = "issue-form";

					//var to store the function responsible for atualize clock
					var hasTimeSaved = false, waitingCallback = false;
					//var like a static object when time is defined
					var timeObject;
					//task number of this url
					var numberTask = getNumberFromTaskTimeTracker(loc);

					//has time-tracker? case no, insert a html to start/stop timer, and show the time
					if(!$("#time-tracker-cnt").length){
						//this html is so simple and insert mustache to render they in all pages aren't a good idea
						var floatClass = '';//'time-tracker-right';
						var spanText = '';//'<span>Working time: </span>';

						var html = '<div id="time-tracker-cnt"><div class="'+floatClass+'">'+spanText+'<div id="'+idClock+'" class="clk">'+EnumTimeTrackerMessages.CLOCK+'</div><div id="time-tracker-btns"><a id="'+idStartStop+'" class="'+EnumTimeTrackerState.START_CLASS+'">'+EnumTimeTrackerState.START+'</a><a id="'+idSendTime+'" class="'+EnumTimeTrackerState.SEND_TIME_CLASS+' bt-gray">'+EnumTimeTrackerState.SEND_TIME+'</a><a id="'+idFinish+'" class="'+EnumTimeTrackerState.FINISH_CLASS+' bt-green">'+EnumTimeTrackerState.FINISH+'</a><a id="'+idReset+'" class="'+EnumTimeTrackerState.RESET_CLASS+'">'+EnumTimeTrackerState.RESET+'</a></div><div id="time-tracker-loading" class="hide">Wait...</div></div></div>';
						//$contentH2.append(html);
						$issueTree.before('<div class="working-time"><p><strong>Tempo de Trabalho</strong></p>'+html+'</div><hr/>');
					}
					//atualize variables DOM reference
					$stopStart = $("#"+idStartStop);
					$clock = $('#'+idClock);
					$reset = $('#'+idReset);
					$finish = $('#'+idFinish);
					$sendTime = $('#'+idSendTime);

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

							if(data.configs && data.configs.waitingCallback != waitingCallback){
								waitingCallback = data.configs.waitingCallback;
								if(data.configs.waitingCallback == numberTask){
									$("#time-tracker-btns").addClass("hide");
									$("#time-tracker-loading").removeClass("hide");
								}else{
									$("#time-tracker-btns").removeClass("hide");
									$("#time-tracker-loading").addClass("hide");
								}
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
						var r = confirm("Do you really want reset your time in your plugin?");
						if (r == true) {
						    dataFromBackground("resetTimeTaskTime", { 'taskNumber' : numberTask, 'location' : window.location });
						}
					});

					$(document).on("click", "#"+idFinish, function(e){
						e.preventDefault();
						dataFromBackground("submitTaskTime", { 'taskNumber' : numberTask, 'location' : window.location }, function(data){
							if(data && data.reload){
								window.location.reload();
							}
						});
					});

					$(document).on("click", "#"+idSendTime, function(e){
						e.preventDefault();
						dataFromBackground("sendTimeTaskTime", { 'taskNumber' : numberTask, 'location' : window.location }, function(data){
							if(data && data.reload){
								window.location.reload();
							}
						});
					});

					$(document).on("submit", "#"+idSubmit, function(e){
						//dataFromBackground("submitTaskTime", { 'taskNumber' : numberTask });
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
						//var $userData = $("#loggedas .user");
						//var id = $userData.attr("href").replace("/users/","");

						setButtonStarted();
						console.log(hasTimeSaved, $stopStart)
						if(hasTimeSaved){
							dataFromBackground("startTaskTime", { 'taskNumber' : numberTask, 'location' : window.location }, function(data){
								if(data && data.reload){
									window.location.reload();
								}
							});
						}else{

							var newTask = new TimeTrackerObject({ taskUrl : window.location.href });
							if(newTask.validate()){
								dataFromBackground("initializeTaskTime", { 'task' : newTask, 'location' : window.location }, function(data){
									if(data && data.reload){
										window.location.reload();
									}
								});
							}else{
								console.error("Cant start time, because newTask arent validated!");
							}
						}
					}

					//method to stop the time when the button is clicked
					function stopTime(){
						setButtonStoped();
						dataFromBackground("stopTaskTime", { 'taskNumber' : numberTask, 'location' : window.location }, function(data){
							if(data && data.reload){
								window.location.reload();
							}
						});
					}

					function atualizeClock(task){
						var s = task == null ? 0 : task.time;
						if(s == 0){
							//$timeInput.val("");
						}else{
							var hoursFormatted = (s/3600);//.toFixed(4);
							//$timeInput.val(hoursFormatted);
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
				}else{
					//verify if this is a planning page
					var $versionDate = $("#version_effective_date");
					var $inputDates = $("#version_custom_field_values_80");
					if($versionDate.length){
						
						var calendarioCssUrl = chrome.extension.getURL("css/calendario-redmine.css");
						if(calendarioCssUrl){
							//load calendario css
							$('head').append('<link rel="stylesheet" href="'+calendarioCssUrl+'" type="text/css" />');

							var idElemCalendar = 'calendar';
							var html = '<div id="calender-wrap" class="custom-calendar-wrap">';
							html += '<div id="custom-inner" class="custom-inner">';
							html += '<div class="custom-header clearfix">';
							html += '<nav>';
							html += '<span id="custom-prev" class="custom-prev"></span>';
							html += '<span id="custom-next" class="custom-next"></span>';
							html += '</nav>';
							html += '<h2 class="custom-month"><span id="custom-month-name"></span><span id="custom-month" class="fc-display-none"></span></h2>';
							html += '<h3 id="custom-year" class="custom-year"></h3>';
							html += '</div>';
							html += '<div id="'+idElemCalendar+'" class="fc-calendar-container"></div>';
							html += '</div>';
							html += '</div>';
							$(html).insertBefore($inputDates);
							$inputDates.css('width', 300);

							var $wrapper = $('#custom-inner'),
							$calendar = $('#'+idElemCalendar),
							arraySelected = {},
							cal = $calendar.calendarioRedmine( {
								onDayClick : function( $el, $contentEl, dateProperties ) {
									var m = dateProperties.month;
									dateProperties.month = m < 10 ? '0' + m : m;
									var dateName = dateProperties.day+"/"+ dateProperties.month +"/"+dateProperties.year;
									//change date
									if($el.hasClass("fc-selected")){
										$el.removeClass("fc-selected");
										delete arraySelected[dateName];
									}else{
										$el.addClass("fc-selected");
										arraySelected[dateName] = true;
									}
									//update input dates
									var newDatesValue = "";
									for(var idx in arraySelected){
										newDatesValue += idx + ",";
									}
									if(newDatesValue.length > 0){
										newDatesValue = newDatesValue.replace(/^\s+|\s+$/g, '');
										newDatesValue = newDatesValue.substring(0, newDatesValue.length - 1);
									}
									$inputDates.val(newDatesValue);


									if( $contentEl.length > 0 ) {
										showEvents( $contentEl, dateProperties );
									}

								},
								caldata : {},
								displayWeekAbbr : true
							} ),
							$monthname = $('#custom-month-name').html(cal.getMonthName()),
							$month = $('#custom-month').html(cal.getMonth()),
							$year = $('#custom-year').html(cal.getYear());

							$('#custom-next').on('click', function() {
								cal.gotoNextMonth(updateMonthYear);
							});
							$('#custom-prev').on('click', function() {
								cal.gotoPreviousMonth(updateMonthYear);
							});

							function updateMonthYear() {
								var month = cal.getMonth();
								var year = cal.getYear();
								var $days = $(".fc-date");
								$monthname.html(cal.getMonthName());
								$month.html(month);
								$year.html(year);

								//re-render selected
								$days.each(function(){
									for(var data in arraySelected){
										var match = /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})$/i.exec(data);
										if(match){
											var mDay = match[1];
											var mMonth = match[2];
											var mYear = match[3];
											var valueDay = $(this).html();//value of element
											if(mDay == valueDay && mMonth == month && mYear == year){
												$(this).parent().addClass("fc-selected");
											}
										}
									}
								});
							}

							function updateCalendarByText() {
								var valueDates = $inputDates.html();
								var indexes = valueDates.split(",");
								for(var i in indexes){
									if(indexes[i]){
										arraySelected[indexes[i]] = true;
									}
								}
								updateMonthYear();
							}

							updateCalendarByText();
						}
					}
				}
			}
		});
	})(jQuery);
}