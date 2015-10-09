// Chrome automatically creates a background.html page for this to execute.
// This can access the inspected page via executeScript
//
// Can use:
// chrome.tabs.*
// chrome.extension.*

var isInjected = false;

chrome.extension.onConnect.addListener(function (port) {

  if (isInjected) {
    return;
  }

  isInjected = true;

  var injectScript = function (tabId, changes, tabObject) {
    if (changes.status == "complete") {
      chrome.tabs.executeScript(tabId, {
        file: 'inserted-script.js'
      });
    }
  };

  chrome.tabs.onUpdated.addListener(injectScript);

    var extensionListener = function (message, sender, sendResponse) {

        if(message.tabId && message.content) {

                //Evaluate script in inspectedPage
                if(message.action === 'code') {
                    chrome.tabs.executeScript(message.tabId, {code: message.content});

                //Attach script to inspectedPage
                } else if(message.action === 'script') {
                    chrome.tabs.executeScript(message.tabId, {file: message.content});

                //Pass message to inspectedPage
                } else {
                    chrome.tabs.sendMessage(message.tabId, message, sendResponse);
                }

        // This accepts messages from the inspectedPage and
        // sends them to the panel
        } else {
            port.postMessage(message);
        }
        sendResponse(message);
    }

    // Listens to messages sent from the panel
    chrome.extension.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function(port) {
        chrome.extension.onMessage.removeListener(extensionListener);
        chrome.tabs.onUpdated.removeListener(injectScript);
    });

    // port.onMessage.addListener(function (message) {
    //     port.postMessage(message);
    // });

});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    return true;
});
