console.log("popup", jQuery);
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

		//INITIALIZE
		dataFromBackground("listTaskTimes", null, function(localst){
			changeRender(renderListTaskTimes(localst));
		});

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
			//
			$content.addClass("hide");
			$loader.removeClass("hide");
			//
			$content.html(html).removeClass("hide");
			$loader.addClass("hide");
		}

		function renderListTaskTimes(localst){
			var string = "<ul>";
			for(var idx in localst){
				string += '<li><a href="'+idx+'" target="_blank">'+idx+'</a></li>';
			}
			string += "</ul>";
			return string;
		}
	});
})(jQuery);