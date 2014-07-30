(function($){
	$(document).ready(function(){

		var EnumStartStop = {
			PLAY : 'play',
			PAUSE : 'pause'
		}
		var interval = 500, renderInterval, taskNameSize = 18;

		$(window).unload(function(){
			clearInterval(renderInterval);
		});

		//show remove view of task
		$(document).on("click", ".time-tracker-list-name", function(e){
			e.preventDefault();
			var $this = $(this),
				dataid = $this.attr("data-id");
			renderInfoTaskTime(dataid);
		});

		$(document).on("click", ".bt-time-tracker-save", function(e){
			e.preventDefault();
			dataFromBackground("getConfiguration", null, function(config){
				var showNotification = $("#showNotification").is(':checked'),
					timeNotification = $("#timeNotification").val(),
					domainAPI = $("#domainAPI").val(),
					username = $("#username").val();
				config.isShowNotification = showNotification;
				if(timeNotification){
					config.timeToCloseNotifications = timeNotification;
				}
				if(domainAPI){
					config.domainAPI = domainAPI;
				}
				if(username){
					config.username = username;
				}
				console.log(config)
				dataFromBackground("setConfiguration", { configs : config });
			});
			renderListTaskTimes();
		});

		
		$(document).on("click", ".bt-time-tracker-clear-all-times", function(e){
			e.preventDefault();
			var resp = confirm(EnumTimeTrackerMessages.RESET_ALL);
			if(resp==true){
				dataFromBackground("clearAllTaskTimes", null);
			}
		});
		$(document).on("click", ".time-tracker-popup-erase-time", function(e){
			e.preventDefault();
			var $this = $(this),
				$delArea = $this.closest('.time-tracker-erase-area'),
				vel = 300;
			$delArea.fadeOut(function(){
				$delArea.html('<a class="bt bt-gray pull-right time-tracker-erase-time-no">Cancel</a><a class="bt bt-red pull-right time-tracker-erase-time-yes">Clear</a>');
				$delArea.fadeIn(vel);
			});
		});
		$(document).on("click", ".time-tracker-erase-time-yes", function(e){
			e.preventDefault();
			var $eraseArea = $(this).closest('.time-tracker-erase-area');
			if($eraseArea){
				var dataid = $eraseArea.attr("data-id");
				dataFromBackground("eraseTaskTime", { taskNumber : dataid });
				renderListTaskTimes();
			}
		});
		$(document).on("click", ".time-tracker-erase-time-no", function(e){
			e.preventDefault();
			var $eraseArea = $(this).closest('.time-tracker-erase-area');
			if($eraseArea){
				var dataid = $eraseArea.attr("data-id");
				if(dataid){
					renderInfoTaskTime(dataid);
				}
			}
		});

		$(document).on("click", ".time-tracker-icon-lock", function(e){
			e.preventDefault();
			var $this = $(this);
			var dataid = $this.closest("li").attr("data-id");
			var toLock = $this.find("i").attr("data-locked") == "true" ? false : true;

			dataFromBackground("changeTaskLock", { 'taskNumber' : dataid, 'toLock' : toLock});
			renderListTaskTimes();
		});

		$(document).on("click", ".time-tracker-popup-start-stop", function(e){
			e.preventDefault();
			var $this = $(this);
			var started = $this.attr("data-started");
			var dataid = $this.attr("data-id");

			if(started == false || started == "false"){
				dataFromBackground("startTaskTime", { 'taskNumber' : dataid });
			}else{
				dataFromBackground("stopTaskTime", { 'taskNumber' : dataid });
			}
		});

		$(document).on("click", ".time-tracker-popup-finish", function(e){
			e.preventDefault();
			var $this = $(this);
			var dataid = $this.attr("data-id");

			dataFromBackground("submitTaskTime", { 'taskNumber' : dataid }, function(){
				renderListTaskTimes();
			});
		});

		$(document).on("click", ".time-tracker-popup-config", function(e){
			e.preventDefault();
			renderConfiguration();
		});

		//info-task
		$(document).on("click", ".time-tracker-popup-edit-time", function(e){
			e.preventDefault();
			var $eraseArea = $(this).closest('.time-tracker-erase-area');
			if($eraseArea){
				var dataid = $eraseArea.attr("data-id");
				if(dataid){
					renderEditTaskTime(dataid);
				}
			}
		});
		$(document).on("click", ".bt-time-tracker-edit", function(e){
			e.preventDefault();
			var dataid = $(this).attr("data-id");
			if(dataid){
				//recieve data from view
				var retorno = {},
					errors = false,
					name = $('#taskName').val(),
					time = $('#timeFormatted').val(),
					userId = $('#userId').val(),
					alwaysVisible = $('#alwaysVisible').is(':checked');

				retorno['taskNumber'] = dataid;
				retorno['alwaysVisible'] = alwaysVisible;
				if(userId){
					retorno['userId'] = userId;
				}
				if(name){
					retorno['taskName'] = name;
				}
				if(time){
					patt = /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/g;
					isformatted = patt.test(time);
					if(isformatted){
						retorno['time'] = formattedToSecondsTimeTracker(time);
					}else{
						errors = true;
						alert("Time format is wrong, please fill with HH:MM:SS pattern.");
					}					
				}

				if(!errors){
					dataFromBackground("changeTaskTime", retorno, function(){});
					renderInfoTaskTime(dataid);
				}
			}
		});


		//back to initial view
		$(document).on("click", ".bt-back-init", function(e){
			e.preventDefault();
			renderListTaskTimes();
		});
		$(document).on("click", ".bt-back-to-task", function(e){
			e.preventDefault();
			var dataid = $(this).attr("data-id");
			if(dataid){
				renderInfoTaskTime(dataid);
			}
		});

		//INITIALIZE
		renderListTaskTimes();

		function dataFromBackground(method, data, callback){
			chrome.extension.sendRequest({redmine: method, data: data}, function(response) {					
				if (callback && typeof(callback) === "function") {
					callback.call(this, response);
				}
			});
		}

		//RENDER FUNCTIONS
		function changeRender(html){			
			var $content = $("#time-tracker-cnt");
			var $loader = $("#loader");
			var vel = 200;
			$content.fadeOut(function(){
				$content.html(html);
				$content.fadeIn(vel);
			});
		}
		function renderMustache(path, obj, jqueryObject){
			$.ajax({
	            url: chrome.extension.getURL(path),
	            cache: false,
	            success: function (data) {
	            	html = Mustache.to_html(data, obj);
	            	if(jqueryObject){
	            		jqueryObject.html(html);
	            	}else{
	            		changeRender(html);
	            	}
	            }
	        });
		}

		/*	RENDER TEMPLATES 	*/
		var renderInterval;
		var waitingCallback = false;
		function renderListTaskTimes(){
			dataFromBackground("listTaskTimes", null, function(localst){
				var objectTemplate = {
					tasks: []
				};
				for(var idx in localst){
					var task = parseJSONTimeTracker(localst[idx]);
					task.timeFormatted = secondsToHmsTimeTracker(task.time);
					task.hasName = task.taskName ? true : false;
					if(task.hasName){
						if(task.taskName.length >= taskNameSize){
							task.taskNameMin = task.taskName.substring(0,taskNameSize) + "... ";
						}else{
							task.taskNameMin = task.taskName;
						}
						task.taskName = "Task["+task.taskNumber+"]: " + task.taskName;
					}
					objectTemplate.tasks.push(task);
				}
				renderMustache('../templates/mustache/list-task.mustache', objectTemplate);

				//update informations
				clearInterval(renderInterval);
				renderInterval = setInterval(function(){
					
					$("#task-list > li").each(function(){
						var $this = $(this);
						var dataid = $this.attr("data-id");
						dataFromBackground("getTaskTime", { taskNumber : dataid }, function(obj){
							//update time
							$this.find(".task-time").html(secondsToHmsTimeTracker(obj.task.time));
							//update button
							var $btnStartStop = $this.find(".time-tracker-popup-start-stop");

							var wcb = obj.configs.waitingCallback;
							if(wcb != null && wcb != undefined && wcb != 0){
								$(".time-tracker-btns").addClass("hide");
								$(".time-tracker-loading").removeClass("hide");
							}else{
								$(".time-tracker-btns").removeClass("hide");
								$(".time-tracker-loading").addClass("hide");
							}
							

							if(obj.task.started){
								$btnStartStop.attr("class", "bt bt-stop pull-right time-tracker-popup-start-stop");
								$btnStartStop.attr("data-started", "true");
								$btnStartStop.find("span").attr("class", "glyphicon glyphicon-pause");
							}else{
								$btnStartStop.attr("class", "bt bt-green pull-right time-tracker-popup-start-stop");
								$btnStartStop.attr("data-started", "false");
								$btnStartStop.find("span").attr("class", "glyphicon glyphicon-play");
							}
						});
					});

				},interval);
			});
		}
		function renderInfoTaskTime(dataid){
			dataFromBackground("getTaskTime", { taskNumber : dataid, notification : false }, function(obj){
				var task = obj.task;
				renderMustache('../templates/mustache/info-task.mustache', task);

				
				clearInterval(renderInterval);
				renderInterval = setInterval(function(){
					dataFromBackground("getTaskTime", { taskNumber : dataid, notification : false }, function(newObj){
						task = newObj.task;
						task.started = task.started ? 'Yes' : 'No';
						task.alwaysVisible = task.alwaysVisible ? 'Yes' : 'No';
						task.timeFormatted = secondsToHmsTimeTracker(task.time);
						renderMustache('../templates/mustache/info.mustache', task, $("#task-info"));
					});
				},interval);
			});
		}
		function renderEditTaskTime(dataid){
			dataFromBackground("getTaskTime", { taskNumber : dataid, notification : false }, function(obj){
				var task = obj.task;
				task.timeFormatted = secondsToHmsTimeTracker(task.time);
				console.log(task)
				renderMustache('../templates/mustache/edit-task.mustache', task);
			});
		}
		function renderConfiguration(){
			dataFromBackground("getConfiguration", null, function(config){
				renderMustache('../templates/mustache/config.mustache', config);
			});
		}
	});
})(jQuery);