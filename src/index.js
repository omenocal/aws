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
        getModel(intent.slots.Model.value, session, callback);
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
        respond.withPlainText(responses.Car.Pause, callback);
    },
    "AMAZON.ResumeIntent": function (intent, session, callback) {
        session.attributes.PAUSED = undefined;
        getRepeatMessage(session, callback);
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
    session.attributes.REPEAT_MESSAGE = responses.Car.Welcome.ask;
    respond.withPlainText(responses.Car.Welcome, callback);
}


/**
 * Getting brand from users prompt
 */
function getBrand(intent, session, callback) {
    if(intent.slots.Brand.value) {
        var brand = intent.slots.Brand.value.toLowerCase();

        if (isEmpty(brand)) {
            session.attributes.REPEAT_MESSAGE = responses.Car.BrandNotUnderstood.ask;
            respond.withPlainText(responses.Car.BrandNotUnderstood, callback);
            return;
        }

        session.attributes.BRAND = brand;
        session.attributes.REPEAT_MESSAGE = responses.Car.AskModel.ask;
        respond.withPlainText(responses.Car.AskModel, callback);

    } else {
        session.attributes.REPEAT_MESSAGE = responses.Car.NotUnderstood.ask;
        respond.withPlainText(responses.Car.NotUnderstood, callback);
    }    
}


/**
 * Getting model from users prompt
 */
function getModel(modelValue, session, callback) {
    if(session.attributes.BRAND === undefined) {
        //  BMW is the only one value which is not recognized by the Brand method
        if(modelValue) {
            var model = modelValue.toLowerCase();
            if(model === 'bmw' || model === 'mw') {
                session.attributes.BRAND = 'bmw';
                session.attributes.REPEAT_MESSAGE = responses.Car.AskModel.ask;
                respond.withPlainText(responses.Car.AskModel, callback);
                return;
            } else if(model === 'mg' || model === 'gmc' || model === 'vw') {
                session.attributes.BRAND = model;
                session.attributes.REPEAT_MESSAGE = responses.Car.AskModel.ask;
                respond.withPlainText(responses.Car.AskModel, callback);
                return;
            }
        }

        session.attributes.REPEAT_MESSAGE = responses.Car.BrandNotDefinedYet.ask;
        respond.withPlainText(responses.Car.BrandNotDefinedYet, callback);
        return;
    }

    if(modelValue) {
        var model = modelValue.toLowerCase();

        if (isEmpty(model)) {
            session.attributes.REPEAT_MESSAGE = responses.Car.ModelNotUnderstood.ask;
            respond.withPlainText(responses.Car.ModelNotUnderstood, callback);
            return;
        }

        if(model === '200 6cc') {
            model = '206 cc';
        } else if(model === '350 z ta') {
            model = '350z ta';
        } else if(model === '350 z touring tm') {
            model = '350z touring tm';
        } else if(model === 'corola') {
            model = 'corolla';
        } else if(model === 'rav 4') {
            model = 'rav4';
        } else if(model === 'accord 6cil') {
            model = 'accord 6 cil';
        } else if(model === 'xc 60') {
            model = 'XC60';
        } else if(model === 'xc 80') {
            model = 'XC80';
        } else if(model === 'xc 90') {
            model = 'XC90';
        } else if(model === 'city fortwo') {
            model = 'city for 2';
        } else if(model === 'city forfour') {
            model = 'city for 4';
        } else if(model === 'i 30') {
            model = 'i30';
        } else if(model === 'q 45') {
            model = 'q45';
        }

        session.attributes.MODEL = model;
        session.attributes.REPEAT_MESSAGE = responses.Car.AskYear.ask;
        respond.withPlainText(responses.Car.AskYear, callback);

    } else {
        session.attributes.REPEAT_MESSAGE = responses.Car.ModelNotUnderstood.ask;
        respond.withPlainText(responses.Car.ModelNotUnderstood, callback);
    }    
}


/**
 * Getting year from users prompt
 */
function getYear(intent, session, callback) {
    if(session.attributes.BRAND === undefined) {
        session.attributes.REPEAT_MESSAGE = responses.Car.BrandNotDefinedYet.ask;
        respond.withPlainText(responses.Car.BrandNotDefinedYet, callback);
        return;
    }

    if(session.attributes.MODEL === undefined) {
        //  Models 528 and 535 are not added the i in Brand BMW
        if(intent.slots.Year.value) {
            var model = intent.slots.Year.value.toLowerCase();
            if(model === '528' || model === '535') {
                session.attributes.MODEL = model + 'i';
                session.attributes.REPEAT_MESSAGE = responses.Car.AskYear.ask;
                respond.withPlainText(responses.Car.AskYear, callback);
                return;
            }
        }

        session.attributes.REPEAT_MESSAGE = responses.Car.ModelNotDefinedYet.ask;
        respond.withPlainText(responses.Car.ModelNotDefinedYet, callback);
        return;
    }

    if(intent.slots.Year.value) {
        var year = intent.slots.Year.value.toLowerCase();

        if (isEmpty(year)) {
            session.attributes.REPEAT_MESSAGE = responses.Car.YearNotUnderstood.ask;
            respond.withPlainText(responses.Car.YearNotUnderstood, callback);
            return;
        }

        queryAgainstDataBase(session,
                            session.attributes.BRAND,
                            session.attributes.MODEL,
                            year,
                            callback);

    } else {
        session.attributes.REPEAT_MESSAGE = responses.Car.YearNotUnderstood.ask;
        respond.withPlainText(responses.Car.YearNotUnderstood, callback);
    }    
}


/**
 * Getting battery suggestions from DynamoDB depending on filter fields
 */
function getBattery(intent, session, callback) {
    if(intent.slots.Model.value && intent.slots.Year.value &&
        intent.slots.Model.value === '5I' && intent.slots.Year.value === '128') {
        getModel('528i', session, callback);
        return;
    }

    session.attributes.BATTERIES = undefined;
    session.attributes.BRAND = undefined;
    session.attributes.MODEL = undefined;
    session.attributes.YEAR = undefined;

    if(intent.slots.Brand.value && intent.slots.Model.value && intent.slots.Year.value) {
        var brand = intent.slots.Brand.value.toLowerCase();
        var model = intent.slots.Model.value.toLowerCase();
        var year = intent.slots.Year.value;

        if (isEmpty(brand) || isEmpty(model) || isEmpty(year)) {
            session.attributes.REPEAT_MESSAGE = responses.Car.NotUnderstood.ask;
            respond.withPlainText(responses.Car.NotUnderstood, callback);
            return;
        }

        queryAgainstDataBase(session, brand, model, year, callback);

    } else {
        session.attributes.REPEAT_MESSAGE = responses.Car.NotUnderstood.ask;
        respond.withPlainText(responses.Car.NotUnderstood, callback);
    }
    
}


function queryAgainstDataBase(session, brand, model, year, callback) {
    storageDynamoDB.load(session, brand, model, year, function (itemArray) {
        session.attributes.BATTERIES = undefined;
        session.attributes.BRAND = undefined;
        session.attributes.MODEL = undefined;
        session.attributes.YEAR = undefined;

        if(itemArray === undefined) {
            session.attributes.REPEAT_MESSAGE = responses.Car.NoExist.ask;
            respond.withPlainText(responses.Car.NoExist, callback);
            return;
        }

        var item = itemArray.Battery;
        if(item.length === 1) {
            session.attributes.REPEAT_MESSAGE = "The " + item[0].Title + " battery for a " +
                                                brand + ", " + model + ", " + year + " is " +
                                                item[0].Description + ". What other battery would you like to look for?";

            var speech = {
                ask:        session.attributes.REPEAT_MESSAGE,
                reprompt:   "What other battery would you like to look for?"
            };

            respond.withPlainText(speech, callback);
        } else {
            var askString = "There are " + item.length + " brands that fit your car specifications: " +
                            brand + ", " + model + ", " + year + ". They are ";

            for (var i = 0; i < item.length - 1; i++) {
                askString += item[i].Title + " " + item[i].Description + ". ";
            }

            askString += "And " + item[item.length - 1].Title + " " + item[item.length - 1].Description +
                         ". What other battery would you like to look for?";

            session.attributes.REPEAT_MESSAGE = askString;

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
            getRepeatMessage(session, callback);
        } else {
            session.attributes.REPEAT_MESSAGE = responses.Car.Pause.ask;
            respond.withPlainText(responses.Car.Pause, callback);
        }
    } else {
        getRepeatMessage(session, callback);
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
