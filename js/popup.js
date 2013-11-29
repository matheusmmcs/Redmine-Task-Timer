(function($){
	$(document).ready(function(){

		var EnumStartStop = {
			PLAY : 'play',
			PAUSE : 'pause'
		}

		//show remove view of task
		$(document).on("click", ".time-tracker-popup-task-info", function(e){
			e.preventDefault();
			var $this = $(this);
			var dataid = $this.attr("data-id");			
			dataFromBackground("getTaskTime", { taskNumber : dataid, notification : false }, function(obj){
				renderInfoTaskTime(obj.task);
			});
		});

		//
		$(document).on("click", ".time-tracker-popup-erase-time", function(e){
			e.preventDefault();
			var resp = confirm(EnumTimeTrackerMessages.RESET);
			if(resp==true){
				var dataid = $(this).attr("data-id");
				dataFromBackground("eraseTaskTime", { taskNumber : dataid });
				renderListTaskTimes();
			}
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


		//back to initial view
		$(document).on("click", ".bt-back-init", function(e){
			e.preventDefault();
			renderListTaskTimes();
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
			var vel = 300;
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
	            	changeRender(html);
	            }
	        });
		}

		/*	RENDER TEMPLATES 	*/
		var renderInterval;
		function renderListTaskTimes(){
			dataFromBackground("listTaskTimes", null, function(localst){
				var objectTemplate = {
					tasks: []
				};
				for(var idx in localst){
					var task = parseJSONTimeTracker(localst[idx]);
					task.timeFormatted = secondsToHmsTimeTracker(task.time);
					objectTemplate.tasks.push(task);
				}
				console.log(objectTemplate);
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

				},500);
			});
		}
		function renderInfoTaskTime(task){
			console.log(task)
			task.started = task.started ? 'Yes' : 'No';
			task.timeFormatted = secondsToHmsTimeTracker(task.time);
			renderMustache('../templates/mustache/info-task.mustache', task);
		}
	});
})(jQuery);