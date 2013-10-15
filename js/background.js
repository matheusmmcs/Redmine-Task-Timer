//Prototypes
Array.prototype.contains = function(o){
	if(this.indexOf(o)!=-1){
		return true;
	}else{
		return false;
	}
}
Array.prototype.add = function(o){
	if(!this.contains(o)){
		this.push(o);
	}
}
Array.prototype.remove = function(i){
	if(i<this.length){
		this.splice(i,1);
	}
}
Array.prototype.removeElement = function(o){
	if(this.contains(o)){
		var index = this.indexOf(o);
		this.splice(index,1);
	}
}
Array.prototype.removeBetween = function(from, to){
	var dif = to - from + 1;
	if(from>=0 && to<this.length && dif>0){
		this.splice(from,dif);
	}	
}
Array.prototype.toConsole = function(){
	for(var i in this){
		if(new String(this[i]).indexOf("function")==-1){
			console.log("["+i+"]->"+this[i]+";");
		}
	}
}

//GLOBAL VARS (defined in options.html)
var domain = "redmine.infoway-pi.com.br";

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab, c) {
	chrome.tabs.query({
	    "status": "complete",
	    "windowType": "normal",
	    //"currentWindow": true,
	    //"active": true
	}, function (tabs) {
	    for (i in tabs) {
	    	var tab = tabs[i];
	    	if(tab && tab.id == tabId){
	    		//contains the redmine domain
	    		if(tab.url.indexOf(domain)){
	    			chrome.tabs.executeScript(tabId, {file: "js/jquery.js"});
					chrome.tabs.executeScript(tabId, {file: "js/counter.js"});
					//chrome.tabs.insertCSS(tabId, {file: "css/topoteste.css"});
	    		}
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