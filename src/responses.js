/* Copyright (C) Crossborders LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Octavio Menocal Cordero <octavio_menocal92@hotmail.es>, June 2016 for Miguel Caballero - Smartek
 */
'use strict';
var responses = (function () {

	return {

		Word : {

			AskForStory : {
				ask : "Do you want to build a story together?"
			},

			NotUnderstood : {
				ask : "Sorry, I didn't understand your word. Can you please try again?",
				reprompt: "May you please repeat your word? I didn't hear well."
			},

			Error : {
				tell: "I'm so sorry. There was a problem getting the stories. Please, try again later."
			}

		},

		Exit : {

			Cancel : {
				tell : "Ok, feel free to reach out to me to build awesome stories together. <break time=\"1s\"/> Goodbye."
			},

			Stop : {
				tell : "Ok, feel free to reach out to me to build awesome stories together. <break time=\"1s\"/> Goodbye."
			}

		},


		Help : {

			MainMenu : {
				ask : 	"The skill will randomly select a story every time you start. Each story has many missing words " +
						"that you will have to fill in to hear the completed story. Alexa will ask you for the category " +
						"of word, such as noun, verb, place, part of the body, etc. Respond by saying the first word or " +
						"phrase that seems to fit. Do you want to continue?"
			}

		}

	};
})();
module.exports = responses;
