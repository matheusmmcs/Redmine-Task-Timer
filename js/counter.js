(function($){
	if($('meta[name=description]').attr("content").toLowerCase() == "redmine"){
		var $elem = $("#time_entry_hours");
		var hours = 0;
		
		var timer = setInterval(function(){
			hours++;
			$elem.val((hours/3600).toFixed(3));
		}, 1000);
	}
})(jQuery);

	

	//clearInterval(int)

	//inserir o contador e enviar pro plugin qual tarefa foi iniciada
	/*
	//localStorage.setItem("x", 1);
	chrome.extension.sendRequest({useskill: "getStorage"}, function(response) {
		if (callback && typeof(callback) === "function") {
			callback.call(this, response);
		}
	});
	*/
