(function($){
	var elem = document.getElementById("time_entry_hours");
	var hours = 0;
	
	var timer = setInterval(function(){
		hours++;
		$(elem).val((hours/3600).toFixed(3));
	}, 1000);

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
})(jQuery);