
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab, c) {
	chrome.tabs.query({
	    "currentWindow": true,
	    "status": "complete",
	    "windowType": "normal",
	    //"active": true
	}, function (tabs) {
	    for (i in tabs) {
	    	var tab = tabs[i];
	    	if(tab && tab.id == tabId){
	    		chrome.tabs.executeScript(tabId, {file: "js/jquery.js"});
				chrome.tabs.executeScript(tabId, {file: "js/counter.js"});
				//chrome.tabs.insertCSS(tabId, {file: "css/topoteste.css"});
	    	}
	    }
	});

});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
	switch(request.redmine){
		case "getStorageAndAcoes":
			sendResponse(null);
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

chrome.commands.onCommand.addListener(function(command) {
  console.log('onCommand event received for message: ', command);
});

//----------------------------------------------------------------------------------------------------------------------------------------------
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