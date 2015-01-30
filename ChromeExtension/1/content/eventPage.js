// Copyright (c) 2015 Tibor Jakab-Barthi. All rights reserved.

console.debug("eventPage.js loaded.");

var myHive = {
    // Properties
    settings: new Settings(),
    status: {},

    // Methods
    alarm: function (alarm) {
        Log.debug("myHive.alarm: ", alarm);

        // alarm can be undefined because onAlarm also gets called from window.setTimeout on old chrome versions.
        if (alarm) {
            if (alarm.name == "refresh") {
                myHive.refresh();
            }
        }
    },

    displayStatus: function (statusReport) {
        Log.debug("myHive.displayStatus: ", statusReport);

        if (statusReport) {
            var text = statusReport.Temperature.Inside;

            chrome.browserAction.setBadgeText({ text: text });
        }
    },

    getData: function (path) {
        Log.debug("myHive.getData: ", path);

        var url = myHive.settings.getApiEndpoint() + path;
        var credential = myHive.settings.getCredential();
        var requestTimeoutSeconds = myHive.settings.getRequestTimeoutSeconds();

        Log.debug("myHive.getData.Ajax.getData: ", { url: url, requestTimeoutSeconds: requestTimeoutSeconds, user: credential.username });

        return Ajax.getData(url, credential, requestTimeoutSeconds);
    },

    getStatus: function () {
        Log.debug("myHive.getStatus.");

        return myHive.getData("Status/Get");
    },

    openOptionsPage: function () {
        Log.debug("myHive.openOptionsPage.");

        var optionsUrl = chrome.extension.getURL('options.html');

        chrome.tabs.query({ url: optionsUrl }, function (tabs) {
            if (tabs.length) {
                chrome.tabs.update(tabs[0].id, { active: true });
            } else {
                chrome.tabs.create({ url: optionsUrl });
            }
        });
    },

    queueTargetTemperature: function (targetTemperature) {
        Log.debug("myHive.queueTargetTemperature: ", targetTemperature);

        var validatedTemperature = myHive.validateTargetTemperature(targetTemperature);

        window.setTimeout(myHive.setTargetTemperature, 3000, validatedTemperature)
    },

    refresh: function () {
        Log.debug("myHive.refresh.");

        myHive.updateStatus({ scheduleRequest: true, showLoadingAnimation: true });
    },

    resetIcon: function (text) {
        Log.debug("myHive.resetIcon: ", text);

        if (!text) {
            text = "?";
        }

        chrome.browserAction.setBadgeText({ text: text });
    },

    scheduleRequest: function () {
        Log.debug("myHive.scheduleRequest.");

        var delayMinutes = myHive.settings.getRefreshInterval();
        delayMinutes = Math.round(delayMinutes);

        Log.debug("Creating alarm for: " + delayMinutes + " minutes.");

        // Use a repeating alarm so that it fires again if there was a problem setting the next alarm.
        chrome.alarms.create("refresh", { periodInMinutes: delayMinutes });
    },

    setTargetTemperature: function (targetTemperature) {
        Log.debug("myHive.setTargetTemperature: ", targetTemperature);

        myHive.getData("Temperature/Target?value=" + targetTemperature).then(myHive.refresh());
    },

    startup: function () {
        Log.debug("myHive.startup.");

        myHive.resetIcon();

        var settings = myHive.settings;

        if (settings === undefined || settings === null) {
            myHive.openOptionsPage();
        } else {
            var credential = settings.getCredential();
            if (credential === undefined || credential === null || credential.username === undefined || credential.username === null || credential.password === undefined || credential.password === null) {
                myHive.openOptionsPage();
            } else {
                myHive.refresh();
            }
        }
    },

    updateStatus: function (params) {
        Log.debug("myHive.updateStatus: ", params);

        params = params || {};

        // Schedule request immediately. We want to be sure to reschedule, even in the case where the extension process shuts down while this request is outstanding.
        if (params.scheduleRequest) {
            myHive.scheduleRequest();
        }

        function stopLoadingAnimation() {
            if (params.showLoadingAnimation) {
                //loadingAnimation.stop();
            }
        }

        if (params.showLoadingAnimation) {
            //loadingAnimation.start();
        }

        var onSuccess = function (statusReport) {
            stopLoadingAnimation();

            myHive.status = statusReport;

            myHive.displayStatus(statusReport);
        };

        var onError = function (error) {
            stopLoadingAnimation();

            myHive.resetIcon();
        };

        myHive.getStatus().then(onSuccess, onError);
    },

    validateTargetTemperature: function (targetTemperature) {
        Log.debug("myHive.validateTargetTemperature: ", targetTemperature);

        var validatedTargetTemperature = new Number(targetTemperature);

        if (validatedTargetTemperature < 0) {
            validatedTargetTemperature = 0;
        } else if (validatedTargetTemperature > 30) {
            validatedTargetTemperature = 30;
        }

        return validatedTargetTemperature;
    },
};

console.debug("myHive created.");

myHive.resetIcon("xx");

chrome.alarms.onAlarm.addListener(function (alarm) {
    console.debug("alarms.onAlarm: ", alarm);

    // alarm can be undefined because onAlarm also gets called from window.setTimeout on old chrome versions.
    if (alarm) {
        myHive.alarm(alarm);
    }
});

chrome.runtime.onInstalled.addListener(function (details) {
    console.debug("runtime.onInstalled: ", details);

    myHive.startup();
});

chrome.runtime.onStartup.addListener(function () {
    console.debug("runtime.onStartup.");

    myHive.startup();
});