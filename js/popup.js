console.log("popup", jQuery);
(function($){
	//Definição de urls para chamadas ajax
	var domain = "http://localhost:8080/Usabilidade";
	var urls = new Array();
	urls['isLogged'] = domain+"/";

	//Definição de tipos de chamadas ajax
	typeEnum = {
	    POST : "POST",
	    GET : "GET"
	}

	//localStorage.setItem("x", 1);
	//$('#alerts').html(objLogin.erro).fadeIn(300);
	//chrome.extension.sendRequest({useskill: "testFinish"});
	//var objJson = ajax(urls.logout, typeEnum.GET);
	

	//localStorage.setItem("x", 123);
	//console.log(localStorage);

	/*
	//notification
	if (window.webkitNotifications.checkPermission() == 0) {
	    var notification = window.webkitNotifications.createNotification('../images/icon16.png', 'Notification Title', 'Notification content...');
	    console.log(notification)
	    notification.show();
	} else {
	    window.webkitNotifications.requestPermission();
	}
	*/
	


	function getStorage(callback){			
		chrome.extension.sendRequest({useskill: "getStorage"}, function(response) {
			if (callback && typeof(callback) === "function") {
    			callback.call(this, response);
			}
		});
	}

	/*método genérico para realizar ajax*/
	function ajax(caminho, tipo, dados){
		var retorno;
		$.ajax({
			url: caminho,
			cache: false,
			type: tipo,
			async: false,
			data: dados,
			success: function(dados){
				retorno = dados;
			},
			error: function(jqXHR, status, err){
				console.log(jqXHR);
			}
		});
		return retorno;
	}

	/*função para carregar um novo html no conteúdo do popup*/
	function getPage(pagina, callBack){
		var vel = 400;
		var $content = $('#content');

		$content.fadeOut(vel,function(){
			$('#loader').fadeIn(vel, function(){
				$content.load('html/'+pagina+'.html', function(){
					$('#loader').fadeOut(vel, function(){
						$content.fadeIn(vel);
						
						switch(callBack){
							case 'getTestesConvidados':
								getTestesConvidados();
								break;
							default:
								break;
						}
					});
				});
			});
		});
	}

	/*converter json to object*/
	function parseJSON(data) {
    	return window.JSON && window.JSON.parse ? window.JSON.parse( data ) : (new Function("return " + data))(); 
	}
})(jQuery);