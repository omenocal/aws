/* Copyright (C) Crossborders LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Octavio Menocal Cordero <octavio_menocal92@hotmail.es>, June 2016 for Miguel Caballero - Smartek

 /**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.04c6d965-01d7-46cb-917b-060e834384ef";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill'),
    storageDynamoDB = require('./storageDynamoDB'),
    responses = require('./responses'),
    respond = require('./respond'),
    https = require('https');

/**
 * SmartBic is a child of AlexaSkill.
 */
var SmartBic = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
SmartBic.prototype = Object.create(AlexaSkill.prototype);
SmartBic.prototype.constructor = SmartBic;

SmartBic.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("SmartBic onSessionStarted requestId: " + sessionStartedRequest.requestId + 
                ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

SmartBic.prototype.eventHandlers.onLaunch = function (launchRequest, session, callback) {
    console.log("SmartBic onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeMessage(session, callback);
};

SmartBic.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("SmartBic onSessionEnded requestId: " + sessionEndedRequest.requestId + 
                ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

SmartBic.prototype.intentHandlers = {

    "WelcomeIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        getWelcomeMessage(session, callback);
    },
    "CarIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        getBattery(intent, session, callback);
    },
    "AMAZON.PauseIntent": function (intent, session, callback) {
        session.attributes.PAUSED = 1;
        respond.withPlainText(responses.Simulation.Pause, callback);
    },
    "AMAZON.ResumeIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        getWelcomeMessage(session, callback);
    },
    "AMAZON.RepeatIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        getRepeatMessage(session, callback);
    },
    "AMAZON.YesIntent": function (intent, session, callback) {
        manageYesNoAnswer(session, callback, "yes");
    },
    "AMAZON.NoIntent": function (intent, session, callback) {
        manageYesNoAnswer(session, callback, "no");
    },
    "AMAZON.HelpIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        respond.withPlainText(responses.Help.MainMenu, callback);
    },
    "AMAZON.StopIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        respond.withSSML(responses.Exit.Stop, callback);
    },
    "AMAZON.CancelIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        respond.withSSML(responses.Exit.Cancel, callback);
    }
};


/**
 * Getting welcome message
 */
function getWelcomeMessage(session, callback) {
    respond.withPlainText(responses.ComingHome.Welcome, callback);
}


/**
 * Getting battery suggestions from DynamoDB depending on filter fields
 */
function getBattery(intent, session, callback) {
    if(intent.slots.Brand.value && intent.slots.Model.value && intent.slots.Year.value) {
        var brand = intent.slots.Brand.value.toLowerCase();
        var model = intent.slots.Model.value.toLowerCase();
        var year = intent.slots.Year.value;

        if (isEmpty(brand) && isEmpty(model) && isEmpty(year)) {
            respond.withPlainText(responses.Word.NotUnderstood, callback);
            return;
        }

        var askString;
        var repromptString;
        var isSSML = 0;

        // TODO Query database to find suggestions who match these parameters

        speech = {
            ask: askString,
            reprompt: repromptString
        };

        if(isSSML === 1) {
            respond.withSSML(speech, callback);
        } else {
            respond.withPlainText(speech, callback);
        }
    } else {
        respond.withPlainText(responses.Word.NotUnderstood, callback);
    }
    
}

/**
 * Handle repeat message
 */
function getRepeatMessage(session, callback) {
    if(session.attributes.REPEAT_MESSAGE) {
        var speech = {
            ask :   session.attributes.REPEAT_MESSAGE
        };
        respond.withSSML(speech, callback);
    } else {
        respond.withPlainText(responses.ComingHome.NoRepeatMessage, callback);
    }
}


/**
 * Evaluate wether the user want another conversion or not and prepares the speech to reply to the user.
 */
function manageYesNoAnswer(session, callback, answerOption) {
    if(session.attributes.PAUSED) {
        if(answerOption === 'yes') {
            session.attributes.PAUSED = undefined;
            getWelcomeMessage(session, callback);
        } else {
            respond.withPlainText(responses.Simulation.Pause, callback);
        }
    } else {
        getWelcomeMessage(session, callback);
    }
}

function isEmpty(value) {
    return (typeof value === 'undefined') || value === null || (typeof value === 'string' && value.trim().length === 0) || (typeof value === 'object' && Object.keys(value).length === 0);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var smartBic = new SmartBic();
    smartBic.execute(event, context);
};
