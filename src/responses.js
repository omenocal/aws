/* Copyright (C) Crossborders LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Octavio Menocal Cordero <octavio_menocal92@hotmail.es>, June 2016 for Miguel Caballero - Smartek
 */
'use strict';
var responses = (function () {

	return {

		Car : {

			Welcome : {
				ask : "What kind of specifications does your car have?",
				reprompt: "Don't be shy. Tell me. What kind of specifications does your car have?"
			},

			NoRepeatMessage : {
				ask : 		"Sorry, I've got nothing to repeat to you. Who do you want to know what time is coming home?"
			},

			NotUnderstood : {
				ask : "Sorry, I didn't understand some specifications. Can you please try again?",
				reprompt: "May you please repeat the specifications of the car? I didn't hear well."
			},

			Error : {
				tell: "I'm so sorry. There was a problem getting the batteries. Please, try again later."
			},

			Pause : [
				{
					ask : "Ok, take your time",
					reprompt : "Are you ready?"
				},
				{
					ask : "Ok, I keep on waiting",
					reprompt : "Are you done?"
				},
				{
					ask : "Ok, just to confirm you are still there. Take your time.",
					reprompt : "Should we continue?"
				}
			]

		},

		Exit : {

			Cancel : {
				tell : "Ok, feel free to reach out to me to suggest you batteries for your car. <break time=\"1s\"/> Goodbye."
			},

			Stop : {
				tell : "Ok, feel free to reach out to me to suggest you batteries for your car. <break time=\"1s\"/> Goodbye."
			}

		},


		Help : {

			MainMenu : {
				ask : 	"I can tell you the most appropiate battery for your car. Just tell me the model, the brand and the year, " +
						"so I can look for the suggestions I've got in my knowledge. Tell me, what kind of car do you have?"
			}

		}

	};
})();
module.exports = responses;
