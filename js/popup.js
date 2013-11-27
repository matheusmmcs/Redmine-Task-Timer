(function($){
	$(document).ready(function(){

		//Definição de urls para chamadas ajax
		var domain = "http://localhost:8080/Usabilidade";
		var urls = new Array();
		urls['isLogged'] = domain+"/";

		//Definição de tipos de chamadas ajax
		typeEnum = {
		    POST : "POST",
		    GET : "GET"
		}

		var EnumStartStop = {
			PLAY : 'play',
			PAUSE : 'pause'
		}

		//show remove view of task
		$(document).on("click", ".time-tracker-popup-reset", function(e){
			e.preventDefault();
			var $li = $(this).closest("li");
			var dataid = $li.attr("data-id");
			dataFromBackground("getTaskTime", { taskNumber : dataid, notification : false }, function(task){
				renderRemoveTaskTime(task);
			});
		});

		//
		$(document).on("click", ".time-tracker-popup-erase-time", function(e){
			e.preventDefault();
			var dataid = $(this).attr("data-id");
			dataFromBackground("eraseTaskTime", { taskNumber : dataid }, function(tasks){
				renderInitialPage();
			});
		});

		//back to initial view
		$(document).on("click", ".bt-back-init", function(e){
			e.preventDefault();
			renderInitialPage();
		});

		//INITIALIZE
		renderInitialPage();

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
			var vel = 500;
			$content.fadeOut(function(){
				$content.html(html);
				$content.fadeIn(vel);
			});
		}
		function renderMustache(path, obj){
			$.ajax({
	            url: chrome.extension.getURL(path),
	            cache: true,
	            success: function (data) {
	                changeRender(Mustache.render(data, obj));
	            }
	        });
		}

		/*	RENDER TEMPLATES 	*/
		function renderListTaskTimes(localst){
			var objectTemplate = {
				tasks: []
			};
			for(var idx in localst){
				var task = parseJSONTimeTracker(localst[idx]);
				task.hasDateBackground = task.dateBackground ? true : false;
				task.timeFormatted = secondsToHmsTimeTracker(task.time);
				objectTemplate.tasks.push(task);
			}
			renderMustache('../templates/mustache/list-task.html', objectTemplate);
		}
		function renderRemoveTaskTime(task){
			task.hasDateBackground = task.dateBackground ? 'Yes' : 'No';
			task.timeFormatted = secondsToHmsTimeTracker(task.time);
			renderMustache('../templates/mustache/remove-task.html', task);
		}
		function renderInitialPage(){
			dataFromBackground("listTaskTimes", null, function(localst){
				renderListTaskTimes(localst);
			});
		}
	});
})(jQuery);