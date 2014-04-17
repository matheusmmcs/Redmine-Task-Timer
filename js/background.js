
//GLOBAL VARS (defined in options.html)
var CONFIGS = {
	verifyRedmineUrl: true,
	isShowNotification: true,
	timeToCloseNotifications: 4000
}

var idTask = 'taskNumber';

var EnumButtons = {
	PROGRESS: {
		buttons : [
			{ title: "Start", iconUrl: "http://redmine.infoway-pi.com.br/images/add.png" },
			{ title: "Send Email", iconUrl: "http://redmine.infoway-pi.com.br/images/add.png"}
		],
		actions : function(){
			chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
				//as all notifications have the same id, just use button index
				if(buttonIndex == 0){
					//alert("CALL");
				}
				if(buttonIndex == 1){
					//alert("EMAIL");
				}
			})
		}
	},
	SUBMIT: null,
	CLEAN: null,
	INITIALIZE: null
}

//store all changes in objects
var mapChangeElements = {};

//when atualize tabs
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
	chrome.tabs.query({
	    "status": "complete",
	    "windowType": "normal"
	}, function (tabs) {
	    for (i in tabs) {
	    	var tab = tabs[i];
	    	if(tab && tab.id == tabId){
	    		//verify if the page has redmine name to insert plugin
	    		if(CONFIGS.verifyRedmineUrl && tab.url.toLowerCase().indexOf("redmine") != -1){
	    			chrome.tabs.executeScript(tabId, {file: "js/jquery.calendario.redmine.js"});
	    			chrome.tabs.executeScript(tabId, {file: "js/utils.js"});
					chrome.tabs.executeScript(tabId, {file: "js/counter.js"});
					chrome.tabs.insertCSS(tabId, {file: "css/time-tracker.css"});					
	    		}
	    	}
	    }
	});

});

//when a extension send request
chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
	switch(request.redmine){
		case "initializeTaskTime":
			var task = request.data['task'];
			console.log("initializeTaskTime", task);
			if(task && task[idTask] != null && task[idTask] != undefined){
				var taskLoaded = loadTaskTime(task[idTask]);
				//garantee of no previous task has stored
				if(!taskLoaded){
					//garantee when initialized, its is started
					task.started = true;
					saveTaskTime(task[idTask], task);
					showNotification("Task initialized", "The task ["+task[idTask]+"] has been initialized!", EnumButtons.INITIALIZE);
				}
			}
			break;
		case "getTaskTime":
			var task = loadTaskTime(request.data[idTask]);
			//if hasnt task, whe need initialize a new task
			if(task){
				sendResponse({
					initialized: true,
					task: task
				});
				if(request.data['notification']){
					showNotification("Task Progress", "This task already has "+secondsToHmsTimeTracker(task.time)+" hours.", EnumButtons.SUBMIT);
				}
			}else{
				sendResponse({
					initialized: false
				});
			}
			break;
		case "startTaskTime":
			var id = request.data[idTask];
			var task = loadTaskTime(id);
			console.log("startTaskTime", task);
			if(task){
				task.started = true;
				saveTaskTime(id, task);
			}
			//showNotification("Task Erase", "This task time has been erased!", EnumButtons.CLEAN);
			break;
		case "stopTaskTime":
			var id = request.data[idTask];
			var task = loadTaskTime(id);
			console.log("stopTaskTime", task);
			if(task){
				task.started = false;
				task.dateBackground = undefined;
				saveTaskTime(id, task);				
			}
			//showNotification("Task Erase", "This task time has been erased!", EnumButtons.CLEAN);
			break;
		case "eraseTaskTime":
			eraseTaskTime(request.data[idTask]);
			sendResponse(true);
			break;
		case "submitTaskTime":
			localStorage.removeItem(request.data[idTask]);
			showNotification("Submit Task Time", "The task time ["+request.data[idTask]+"] has been submitted!", EnumButtons.SUBMIT);
			break;
		case "listTaskTimes":
			sendResponse(localStorage);
			break;
		case "getConfiguration":
			sendResponse(CONFIGS);
			break;
		case "setConfiguration":
			var newConfigs = request.data["configs"];
			console.log(newConfigs)
			CONFIGS = newConfigs;
			break;
		case "clearAllTaskTimes":
			//localStorage.clear();
			for(var id in localStorage){
				eraseTaskTime(id);
			}
			showNotification("Task Erase", "All task times has been erased!", EnumButtons.CLEAN);			
			break;
		case "changeTaskTime":
			var taskchange = request.data,
				id = taskchange[idTask];
			mapChangeElements[id] = taskchange;
			break;
		case "changeTaskLock":
			var id = request.data[idTask], toLock = request.data["toLock"];
			var task = loadTaskTime(id);
			if(task){
				task.alwaysVisible = toLock;
				saveTaskTime(id, task);
			}
			break;
	}
});

//START/STOP/CONTINUE LOGIC
function eraseTaskTime(id){
	var task = loadTaskTime(id);
	if(task.alwaysVisible){
		task.resetTime();
		saveTaskTime(id, task);
	}else{
		localStorage.removeItem(id);
		showNotification("Task Erase", "The task time ["+id+"] has been erased!", EnumButtons.CLEAN);
	}
}

var timerFunction = setInterval(function(){	
	var hasStarted = false;
	for(var id in localStorage){
		var task = loadTaskTime(id);
		//as the update time occurs every second, there is a map containing the elements and their changes
		if(task && task.taskNumber){
			var changes = mapChangeElements[id];
			if(changes){
				task.change(changes);
				saveTaskTime(id, task);
				delete mapChangeElements[id];
			}else{
				task.atualizeClock();
				saveTaskTime(id, task);
			}
			hasStarted = hasStarted || task.started;
		}
	}
	setIcon(hasStarted);
},1000);

function saveTaskTime(id, task){
	localStorage.setItem(id, stringifyJSONTimeTracker(task));
}
function loadTaskTime(id){
	var task = localStorage.getItem(id);
	if(task){
		task = new TimeTrackerObject(parseJSONTimeTracker(task));
	}else{
		task = null;
	}
	return task;
}

function setIcon(hasTimeRunning){
	var path;
	if(hasTimeRunning){
		path = "images/icon16-running.png";
	}else{
		path = "images/icon16.png";
	}
	chrome.browserAction.setIcon({
        path: path
    });
}

//NOTIFICATION
function showNotification(title, message, btns){
	if(CONFIGS.isShowNotification){
		title = title ? title : " ";
		message = message ? message : " ";
		//if havent btns, buttons or actions, do the simple
		if(!btns || !btns.buttons || !btns.actions){
			btns = {
				buttons: undefined,
				actions: function(){}
			}
		}
		chrome.notifications.create("redmineTimeTracker", {   
				type: 'basic', 
				iconUrl: '../images/icon48.png',
				title: title, 
				message: message,
				priority: 0,
				buttons: btns.buttons
			},
			function(newId) {
				setTimeout(function(){
					chrome.notifications.clear(newId, function(){});
				}, CONFIGS.timeToCloseNotifications);
			}
		);
		if( typeof(btns.actions) === "function" ){
			btns.actions();
		}
	}
}

//OMNIBOX
/*
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
*/


//----------------------------------------------------------------------------------------------------------------------------------------------


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