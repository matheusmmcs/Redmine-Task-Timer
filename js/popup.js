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

		$(document).on("click", ".time-tracker-popup-reset", function(e){
			e.preventDefault();
			var dataid = $(this).closest("li").attr("data-id");
			changeRender(renderRemoveTaskTime(dataid));
		});

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
			var vel = 500;
			//
			$content.fadeOut(function(){
				$content.html(html);
				$content.fadeIn(vel);
			});
		}

		function renderListTaskTimes(localst){
			var string = '<h1>Started Tasks</h1><ul class="list">';
			for(var idx in localst){
				var regex =/\d*$/gi;
				var regArray = regex.exec(idx);
				string += '<li data-id="'+regArray[0]+'"><a href="'+idx+'" title="'+idx+'" target="_blank">Task:  '+regArray[0]+'</a><a class="bt bt-stop pull-right time-tracker-popup-reset"><span class="glyphicon glyphicon-trash"></span></a><a href="'+idx+'" title="'+idx+'" target="_blank" class="bt bt-reset pull-right"><span class="glyphicon glyphicon-folder-open"></span></a></li>';
			}
			string += "</ul>";
			return string;
		}

		function renderRemoveTaskTime(taskId){
			var string = '<h1>Task '+taskId+'</h1><a class="bt bt-stop width-50p pull-right">Clear Time</a><a class="bt bt-reset width-50p pull-right">Cancel</a>';			
			return string;
		}

	});
})(jQuery);