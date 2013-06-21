var controls_extension = null; //Extension that is used to control the player
var youtube_pattern = "(http://)?(www)?\.?youtube.com/watch\?.";

var enabled_tab = -1; //Currently active youtube tab
var active_tabs = []; //All youtube tabs

function setButtonExtensionID() {
	if(controls_extension == null) {
		chrome.management.getAll(function(extensions) {
			for(var i=0; i<extensions.length; i++)
				if(extensions[i].name == "Youtube Button")
					controls_extension = extensions[i].id
		});
	}
}

function activateRemote(tabId, changeInfo, tab) {
	var youtube_match = tab.url.match(youtube_pattern);
	
	if(youtube_match != null) {
		chrome.pageAction.show(tabId);
		if(active_tabs.indexOf(tabId) == -1)
			active_tabs.push(tabId);	
		//If this tab was enabled, and this a refresh, make sure its still activated
		if(enabled_tab == tabId) {
			chrome.pageAction.setIcon({tabId: tabId, path: "on_remote.png"});
			chrome.runtime.sendMessage(controls_extension, {tab_id: -1}); 
			chrome.runtime.sendMessage(controls_extension, {tab_id: enabled_tab}); 
		}	
	}
}

function removeRemote(tabId) {
	active_tabs.splice(active_tabs.indexOf(tabId), 1);
	if(enabled_tab == tabId) {
		chrome.pageAction.setIcon({tabId: tabId, path: "off_remote.png"});
		enabled_tab = -1;
		chrome.runtime.sendMessage(controls_extension, {tab_id: enabled_tab}); 
	}
}

function toggleRemote(tab) {	
	//Make sure the Button extension is installed
	setButtonExtensionID();
	if(controls_extension == null) {
		alert('Cannot turn on Remote because the "Youtube Button" extension is not installed.');
		return;
	}

	if (enabled_tab == tab.id) {
		chrome.pageAction.setIcon({tabId: tab.id, path: "off_remote.png"});
		enabled_tab = -1;
	} else {
		enabled_tab = tab.id;
		chrome.pageAction.setIcon({tabId: tab.id, path: "on_remote.png"});
	}
	
	for(var i=0; i<active_tabs.length; i++)
		if(active_tabs[i] != enabled_tab)
			chrome.pageAction.setIcon({tabId: active_tabs[i], path: "off_remote.png"});
			
	//Update controls hook
	chrome.runtime.sendMessage(controls_extension, {tab_id: enabled_tab}); 
}

chrome.tabs.onRemoved.addListener(removeRemote);
chrome.tabs.onUpdated.addListener(activateRemote);
chrome.pageAction.onClicked.addListener(toggleRemote);