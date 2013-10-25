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

		//show remove view of task
		$(document).on("click", ".time-tracker-popup-reset", function(e){
			e.preventDefault();
			var $li = $(this).closest("li");
			var dataid = $li.attr("data-id");
			var datasrc = $li.attr("data-src");
			changeRender(renderRemoveTaskTime(dataid, datasrc));
		});

		//
		$(document).on("click", ".bt-stop-time", function(e){
			e.preventDefault();
			var dataid = $(this).attr("data-id");
			
			//
			renderInitialPage();
		});

		//back to initial view
		$(document).on("click", ".bt-back-init", function(e){
			e.preventDefault();
			renderInitialPage();
		});

		//INITIALIZE
		renderInitialPage();

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
			var string = '<h1>Started Tasks</h1><ul class="list"><hr/>';
			for(var idx in localst){
				var regex =/\d*$/gi;
				var regArray = regex.exec(idx);
				string += '<li data-id="'+regArray[0]+'" data-src="'+idx+'"><a href="'+idx+'" title="'+idx+'" target="_blank">Task:  '+regArray[0]+'</a><a class="bt bt-stop pull-right time-tracker-popup-reset"><span class="glyphicon glyphicon-trash"></span></a><a href="'+idx+'" title="'+idx+'" target="_blank" class="bt bt-reset pull-right"><span class="glyphicon glyphicon-folder-open"></span></a></li>';
			}
			string += "</ul>";
			return string;
		}

		function renderRemoveTaskTime(taskId, datasrc){
			var string = '<h1><a href="'+datasrc+'" title="'+datasrc+'" target="_blank">Task '+taskId+'</a></h1><hr/><div class="actions"><a data-id="'+taskId+'" class="bt bt-stop bt-stop-time">Clear Time</a><a class="bt bt-reset bt-back-init">Cancel</a></div>';
			return string;
		}

		function renderInitialPage(){
			dataFromBackground("listTaskTimes", null, function(localst){
				changeRender(renderListTaskTimes(localst));
			});
		}

	});
})(jQuery);