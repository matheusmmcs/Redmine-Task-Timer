
//GLOBAL VARS (defined in options.html)
var timeToPersist = 1000;

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
	chrome.tabs.query({
	    "status": "complete",
	    "windowType": "normal"
	}, function (tabs) {
	    for (i in tabs) {
	    	var tab = tabs[i];
	    	if(tab && tab.id == tabId){
    			chrome.tabs.executeScript(tabId, {file: "js/jquery.js"});
				chrome.tabs.executeScript(tabId, {file: "js/counter.js"});
				chrome.tabs.insertCSS(tabId, {file: "css/time-tracker.css"});
	    	}
	    }
	});

});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
	switch(request.redmine){
		//receber, alterar e remover os tempos do usuario
		case "getPersistTime":
			sendResponse(timeToPersist);
			break;
		case "setTaskTime":
			console.log("setTaskTime", request.data.task, request.data.time);
			localStorage.setItem(request.data.task, request.data.time);
			break;
		case "getTaskTime":
			var value = localStorage.getItem(request.data.task);
			value = value ? value : 0;
			sendResponse(value);
			if(value != 0){
				showNotification("That task has an previous time persisted: \nTime: "+secondsToHms(value));
			}
			break;
		case "removeTaskTime":
			localStorage.removeItem(request.data.task);
			break;
		case "listTaskTimes":
			sendResponse(localStorage);
			/*
			for (var i = 0; i < localStorage.length; i++){
				console.log(i, localStorage.key(i), localStorage.getItem(localStorage.key(i)));
			}
			*/
			break;
	}
});

//OMNIBOX
var suggestions = {
	settings : /settings|options|preferencias|opcoes/gi,
}

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
	var sugestoes = new Array(), sug;
	//iterar sobre sugestoes
	for(var x in suggestions){
		sug = new String(suggestions[x]).replace(/\/gi|\/|\|/g," ");
		if(sug.indexOf(text)!=-1){
			sugestoes.push({content: x, description: text + " - " + x})
		}
	}
	suggest(sugestoes);
});

chrome.omnibox.onInputEntered.addListener(function(text) {
	omniboxEnteredFunction(text);
});

function omniboxEnteredFunction(text){
	var search = text.toLowerCase().replace(/\s/,"");
	if(suggestions.settings.test(text)){
		openPage('templates/omnibox/options.html');
		suggestions.settings.test(text);
	}
}

function openPage(page) {
    var options_url = chrome.extension.getURL(page);
    chrome.tabs.query({
        url: options_url,
    }, function(tabs) {
        if (tabs.length)
            chrome.tabs.update(tabs[0].id, {active:true});
        else
            chrome.tabs.create({url:options_url});
    });
}

//NOTIFICATION
function showNotification(title, message){
	if (window.webkitNotifications.checkPermission() == 0) {
	    var notification = window.webkitNotifications.createNotification('../images/icon16.png', title, message);
	    notification.show();
	} else {
	    window.webkitNotifications.requestPermission();
	}
}


//----------------------------------------------------------------------------------------------------------------------------------------------

function secondsToHms(t) {
	var t = parseInt(t, 10);
    var h   = Math.floor(t / 3600);
    var m = Math.floor((t - (h * 3600)) / 60);
    var s = t - (h * 3600) - (m * 60);
    h = h < 10 ? "0"+h : h;
    m = m < 10 ? "0"+m : m;
    s = s < 10 ? "0"+s : s;
	return h+':'+m+':'+s;
}
/*método genérico para realizar ajax*/
/*
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
function parseJSON(data) {
	return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))(); 
}
function stringfyJSON(data){
	return window.JSON && window.JSON.stringify ? window.JSON.stringify(data) : (new Function("return " + data))();
}
*/