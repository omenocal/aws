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
    respond = require('./respond');

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
    "BrandIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        getBrand(intent, session, callback);
    },
    "ModelIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        getModel(intent, session, callback);
    },
    "YearIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        getYear(intent, session, callback);
    },
    "CarIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        getBattery(intent, session, callback);
    },
    "BatteryIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        getBatteryDescription(intent, session, callback);
    },
    "AMAZON.PauseIntent": function (intent, session, callback) {
        session.attributes.PAUSED = 1;
        respond.withPlainText(responses.AnimalSounds.Pause, callback);
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
    respond.withPlainText(responses.Car.Welcome, callback);
}


/**
 * Getting brand from users prompt
 */
function getBrand(intent, session, callback) {                
    if(intent.slots.Brand.value) {
        var brand = intent.slots.Brand.value.toLowerCase();

        if (isEmpty(brand)) {
            respond.withPlainText(responses.Car.BrandNotUnderstood, callback);
            return;
        }

        session.attributes.BRAND = brand;
        respond.withPlainText(responses.Car.AskModel, callback);

    } else {
        respond.withPlainText(responses.Car.NotUnderstood, callback);
    }    
}


/**
 * Getting model from users prompt
 */
function getModel(intent, session, callback) {
    if(session.attributes.BRAND === undefined) {
        //  BMW is the only one value which is not recognized by the Brand method
        if(intent.slots.Model.value) {
            var model = intent.slots.Model.value.toLowerCase();
            if(model === 'bmw' || model === 'mw') {
                session.attributes.BRAND = 'bmw';
                respond.withPlainText(responses.Car.AskModel, callback);
                return;
            }
        }

        respond.withPlainText(responses.Car.BrandNotDefinedYet, callback);
        return;
    }

    if(intent.slots.Model.value) {
        var model = intent.slots.Model.value.toLowerCase();

        if (isEmpty(model)) {
            respond.withPlainText(responses.Car.ModelNotUnderstood, callback);
            return;
        }

        session.attributes.MODEL = model;
        respond.withPlainText(responses.Car.AskYear, callback);

    } else {
        respond.withPlainText(responses.Car.ModelNotUnderstood, callback);
    }    
}


/**
 * Getting year from users prompt
 */
function getYear(intent, session, callback) {
    if(session.attributes.BRAND === undefined) {
        respond.withPlainText(responses.Car.BrandNotDefinedYet, callback);
        return;
    }

    if(session.attributes.MODEL === undefined) {
        respond.withPlainText(responses.Car.ModelNotDefinedYet, callback);
        return;
    }

    if(intent.slots.Year.value) {
        var year = intent.slots.Year.value.toLowerCase();

        if (isEmpty(year)) {
            respond.withPlainText(responses.Car.YearNotUnderstood, callback);
            return;
        }

        queryAgainstDataBase(session,
                            session.attributes.BRAND,
                            session.attributes.MODEL,
                            year,
                            callback);

    } else {
        respond.withPlainText(responses.Car.YearNotUnderstood, callback);
    }    
}


/**
 * Getting battery suggestions from DynamoDB depending on filter fields
 */
function getBattery(intent, session, callback) {
    session.attributes.BATTERIES = undefined;
    session.attributes.BRAND = undefined;
    session.attributes.MODEL = undefined;
    session.attributes.YEAR = undefined;
                
    if(intent.slots.Brand.value && intent.slots.Model.value && intent.slots.Year.value) {
        var brand = intent.slots.Brand.value.toLowerCase();
        var model = intent.slots.Model.value.toLowerCase();
        var year = intent.slots.Year.value;

        if (isEmpty(brand) || isEmpty(model) || isEmpty(year)) {
            respond.withPlainText(responses.Car.NotUnderstood, callback);
            return;
        }

        queryAgainstDataBase(session, brand, model, year, callback);

    } else {
        respond.withPlainText(responses.Car.NotUnderstood, callback);
    }
    
}


function queryAgainstDataBase(session, brand, model, year, callback) {
    storageDynamoDB.load(session, brand, model, year, function (item) {
        if(item.length === 0) {
            session.attributes.BATTERIES = undefined;
            session.attributes.BRAND = undefined;
            session.attributes.MODEL = undefined;
            session.attributes.YEAR = undefined;

            respond.withPlainText(responses.Car.NoExist, callback);
            return;
        }

        if(item.length === 1) {
            session.attributes.REPEAT_MESSAGE = "The " + item[0].Title + " battery for a " +
                                                brand + ", " + model + ", " + year + " is " +
                                                item[0].Description + ". What other battery would you like to look for?";

            var speech = {
                ask:        session.attributes.REPEAT_MESSAGE,
                reprompt:   "What other battery would you like to look for?"
            };

            session.attributes.BATTERIES = undefined;
            session.attributes.BRAND = undefined;
            session.attributes.MODEL = undefined;
            session.attributes.YEAR = undefined;
                
            respond.withPlainText(speech, callback);
        } else {
            var askString = "I'm aware of " + item.length + " brands that fit your car specifications. "

            for (var i = 0; i < item.length - 1; i++) {
                askString += item[i].Title + ", ";
            }

            askString += "and " + item[item.length - 1].Title + ". What battery brand do you prefer?";

            session.attributes.REPEAT_MESSAGE = askString;
            session.attributes.BATTERIES = item;
            session.attributes.BRAND = brand;
            session.attributes.MODEL = model;
            session.attributes.YEAR = year;

            var speech = {
                ask: askString,
                reprompt: "What battery brand do you prefer?"
            };

            respond.withPlainText(speech, callback);
        }
            
    });
}


/**
 * Getting battery suggestions from DynamoDB depending on filter fields
 */
function getBatteryDescription(intent, session, callback) {
    if(intent.slots.Battery.value) {
        var battery = intent.slots.Battery.value.toLowerCase();

        if (isEmpty(battery)) {
            var speech = {
                ask:        "Sorry, I don't know that brand. " + session.attributes.REPEAT_MESSAGE,
                reprompt:   "What battery brand do you prefer?"
            };

            respond.withPlainText(speech, callback);
            return;
        }

        for (var i = 0; i < session.attributes.BATTERIES.length; i++) {
            if(session.attributes.BATTERIES[i].Title === battery) {
                session.attributes.REPEAT_MESSAGE = "The " + session.attributes.BATTERIES[i].Title + " battery for a " +
                                                    session.attributes.BRAND + ", " +
                                                    session.attributes.MODEL + ", " +
                                                    session.attributes.YEAR + " is " +
                                                    session.attributes.BATTERIES[i].Description +
                                                    ". What other battery would you like to look for?";

                session.attributes.BATTERIES = undefined;
                session.attributes.BRAND = undefined;
                session.attributes.MODEL = undefined;
                session.attributes.YEAR = undefined;

                var speech = {
                    ask:        session.attributes.REPEAT_MESSAGE,
                    reprompt:   "What other battery would you like to look for?"
                };

                respond.withPlainText(speech, callback);
                return;
            }

        }

    } else {
        var speech = {
            ask:        "Sorry, I don't know that brand. " + session.attributes.REPEAT_MESSAGE,
            reprompt:   "What battery brand do you prefer?"
        };

        respond.withPlainText(speech, callback);
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
        respond.withPlainText(responses.Car.NoRepeatMessage, callback);
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
            respond.withPlainText(responses.Car.Pause, callback);
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
