/* Copyright (C) Crossborders LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Octavio Menocal Cordero <octavio_menocal92@hotmail.es>, June 2016 for Miguel Caballero - Smartek
 */
'use strict';
var _ = require('lodash'),
    ssml = require("ssml"),
	AlexaSkill = require('./AlexaSkill');

var respond = (function () {

	return {
		
		/*
		 * Respond with SSML speech 
		 */
		withSSML : function (responsesItem, response) {

			// Setup speech parameters
			var output = this.responseObject(responsesItem, AlexaSkill.speechOutputType.SSML);

			// Check if we should tell or ask the response
			if(output.has.tell) {
				output.initial.speech = '<speak>'+ output.item.tell + '</speak>';

				// send it to Alexa
				response.tell(output.initial);

			} else if (output.has.ask) {
				output.initial.speech = '<speak>'+ output.item.ask + '</speak>';

				// Look for the optional reprompt of the response
				if(output.has.reprompt) {
					output.reprompt.speech = output.item.reprompt;
				} else {
					output.reprompt = null;
				}

				// send it to Alexa
				response.ask(output.initial, output.reprompt);
			} else {
				console.log("doesn't seem to be a compatible response item");
			}

		},
		
		/*
		 * Respond with plain text speech 
		 */
		withPlainText : function (responsesItem, response) {

			// Setup speech parameters
			var output = this.responseObject(responsesItem, AlexaSkill.speechOutputType.PLAIN_TEXT);

			// Check if we should tell or ask the response
			if(output.has.tell) {
				output.initial.speech = output.item.tell;

				// send it to Alexa
				response.tell(output.initial);

			} else if (output.has.ask) {
				output.initial.speech = output.item.ask;

				// Look for the optional reprompt of the response
				if(output.has.reprompt) {
					output.reprompt.speech = output.item.reprompt;
				} else {
					output.reprompt = null;
				}

				// send it to Alexa
				response.ask(output.initial, output.reprompt);
			} else {
				console.log("doesn't seem to be a compatible response item");
			}

		},
		
		/*
		 * Respond with Audio (using SSML)
		 */
		withAudio : function (responsesItem, audio, response) {

			// Setup speech parameters
			var output = this.responseObject(responsesItem, AlexaSkill.speechOutputType.SSML),
					ssmlDoc = new ssml();

			// Check if we should tell or ask the response
			if(output.has.tell) {
				if(output.has.tellBeforeAudio) {
					ssmlDoc.say(output.item.tell.beforeAudio);
				}
				ssmlDoc.audio(audio);
				if(output.has.tellAfterAudio) {
					ssmlDoc.say(output.item.tell.afterAudio);
				}
				output.initial.speech = ssmlDoc.toString( { minimal: true } );

				// send it to Alexa
				response.tell(output.initial);

			} else if (output.has.ask) {
				if(output.has.beforeAudio) {
					ssmlDoc.say(output.item.ask.beforeAudio);
				}
				ssmlDoc.audio(audio);
				if(output.has.afterAudio) {
					ssmlDoc.say(output.item.ask.afterAudio);
				}
				output.initial.speech = ssmlDoc.toString( { minimal: true } );

				// Look for the optional reprompt of the response
				if(output.has.reprompt) {
					output.reprompt.speech = output.item.reprompt;
				} else {
					output.reprompt = null;
				}

				// send it to Alexa
				response.ask(output.initial, output.reprompt);
			} else {
				console.log("doesn't seem to be a compatible audio response item");
			}

		},

		/* 
		 * Initialize the response object that will be passed to the response 
		 */
		responseObject : function (responsesItem, type) {
			// If responsesItem has multiple options get random sample
			var selectedResponse = ( _.isArray(responsesItem) ) ? _.sample(responsesItem) : responsesItem;
			console.log("response: ", selectedResponse);

			return {
				initial: {
					speech: null,
					type: type
				},
				reprompt: {
					speech: null,
			        type: AlexaSkill.speechOutputType.PLAIN_TEXT
			    },
			    has: {
			      	tell: _.has(selectedResponse, 'tell'),
			      	ask: _.has(selectedResponse, 'ask'),
			      	reprompt: _.has(selectedResponse, 'reprompt'),
			      	beforeAudio: _.has(selectedResponse, 'ask.beforeAudio'),
			      	tellBeforeAudio: _.has(selectedResponse, 'tell.beforeAudio'),
			      	afterAudio: _.has(selectedResponse, 'ask.afterAudio'),
			      	tellAfterAudio: _.has(selectedResponse, 'tell.afterAudio'),
			    },
				item: selectedResponse,
			};
		}
		
	};
})();
module.exports = respond;