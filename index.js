#!/usr/bin/env node

let npm = require('./package.json');
let term = require('terminal-kit').terminal;
let upload = require(process.cwd() + '/sequr/upload');
let program = require('commander');
let request = require('request');
let get_properties = require(process.cwd() + '/sequr/get_properties');
let get_sequr_users = require(process.cwd() + '/sequr/get_users');

let bamboohq = require(process.cwd() + '/bamboohq/index');
let pingboard = require(process.cwd() + '/pingboard/index');

//   _____   ______   _______   _______   _____   _   _    _____    _____
//  / ____| |  ____| |__   __| |__   __| |_   _| | \ | |  / ____|  / ____|
// | (___   | |__       | |       | |      | |   |  \| | | |  __  | (___
//  \___ \  |  __|      | |       | |      | |   | . ` | | | |_ |  \___ \
//  ____) | | |____     | |       | |     _| |_  | |\  | | |__| |  ____) |
// |_____/  |______|    |_|       |_|    |_____| |_| \_|  \_____| |_____/
//

//
//	The CLI options for this app
//
program
	.version(npm.version)
	.option('-d, --david', 'The David');

//
//	Just add an empty line at the end of the help to make the text more clear
//	to the user
//
program.on('--help', function() {
	console.log("");
});

//
//	Pass the user input to the module
//
program.parse(process.argv);

//
//	Easter egg.
//
if(program.david)
{
	console.log('The David');
}

//
//	Listen for key preses
//
term.on('key', function(name, matches, data ) {

	//
	//	1.	If we detect CTR+C we kill the app
	//
	if(name === 'CTRL_C' )
	{
		//
		//	1. 	Lets make a nice user experience and clean the terminal window
		//		before closing the app
		//
		term.clear();

		//
		//	->	Kill the app
		//
		process.exit();
	}

});

//	 __  __              _____   _   _
//	|  \/  |     /\     |_   _| | \ | |
//	| \  / |    /  \      | |   |  \| |
//	| |\/| |   / /\ \     | |   | . ` |
//	| |  | |  / ____ \   _| |_  | |\  |
//	|_|  |_| /_/    \_\ |_____| |_| \_|
//

//
//	Before we start working, we clean the terminal window
//
term.clear();

//
//	The main container that will be passed around in each chain to collect
//	all the data and keep it in one place
//
let container = {}

//
//	Lets make a nice first impression
//
display_the_welcome_message(container)
	.then(function(container) {

		//
		//	Ask the user for the Sequr API Key
		//
		return ask_for_sequr_api_key(container);

	}).then(function(container) {

		//
		//	Using the Sequr API Key, get the list of properties that the user
		//	belongs to
		//
		return get_properties(container);

	}).then(function(container) {

		//
		//	Prepare the Properties to be displayed as a menu selection
		//
		return prepare_the_property_array(container);

	}).then(function(container) {

		//
		//	Use the Properties array to make a drop down menu
		//
		return select_property(container);

	}).then(function(container) {

		//
		//	Based on the selected property
		//
		return get_sequr_users(container);

	}).then(function(container) {

		//
		//	Ask the user which service do they use so we can ask them
		//	later for the right credential
		//
		return which_service_should_we_use(container);

	}).then(function(container) {

		//
		//	Make a nice header based on the user selection
		//
		return make_the_header(container);

	}).then(function(container) {

		//
		//	Load the BambooHR promises
		//
		if(container.selected_service === "BambooHQ")
		{
			//
			//	->	Use this Promises
			//
			return bamboohq(container);
		}

		//
		//	Load the Pingboard promises
		//
		if(container.selected_service === "Pingboard")
		{
			//
			//	->	Use this Promises
			//
			return pingboard(container);
		}

	}).then(function(container) {

		//
		//	Use the service result to upload the photos
		//
		return upload(container);

	}).then(function(container) {

				term("\n\n");

		//
		//	->	Exit the app
		//
		process.exit();

	}).catch(function(error) {

		term("\n\n");

		//
		//	1.	Show the error message
		//
		term.red("\t" + error.message)

		term("\n\n");

		//
		//	->	Exit the app
		//
		process.exit();

	})

//  _____    _____     ____    __  __   _____    _____   ______    _____
// |  __ \  |  __ \   / __ \  |  \/  | |_   _|  / ____| |  ____|  / ____|
// | |__) | | |__) | | |  | | | \  / |   | |   | (___   | |__    | (___
// |  ___/  |  _  /  | |  | | | |\/| |   | |    \___ \  |  __|    \___ \
// | |      | | \ \  | |__| | | |  | |  _| |_   ____) | | |____   ____) |
// |_|      |_|  \_\  \____/  |_|  |_| |_____| |_____/  |______| |_____/
//

//
//	Draw on the screen a nice welcome message to show our user how
//	cool we are :)
//
function display_the_welcome_message(container)
{
	return new Promise(function(resolve, reject) {

		term("\n");

		//
		//	1.	Set the options that will draw the banner
		//
		let options = {
			flashStyle: term.brightWhite,
			style: term.brightCyan,
			delay: 20
		}

		//
		//	2.	The text to be displayed on the screen
		//
		let text = "\tStarting Sequr Importer";

		//
		//	3.	Draw the text
		//
		term.slowTyping(text, options, function() {

			term("\n");

			//
			//	->	Move to the next step once the animation finishes drawing
			//
			return resolve(container);

		});


	});
}

//
//	Ask the user for the API Key of Sequr
//
function ask_for_sequr_api_key(container)
{
	return new Promise(function(resolve, reject) {

		term("\n");

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tPlease past the Sequr API Key: ");

		//
		//	2.	Listen for the user input
		//
		term.inputField({}, function(error, api_key) {

			term("\n");

			term.yellow("\tLoading...");

			//
			//	1.	Save the URL
			//
			container.sequr_api_key = api_key;

			//
			//	-> Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Convert the properties that we received from Sequr in a simple array to
//	be used to draw the menu for the user to use to select a property.
//
//	This way we can show the user the name of the property and then actually
//	get the ID from his or her selection
//
function prepare_the_property_array(container)
{
	return new Promise(function(resolve, reject) {

		//
		//	1.	A temporary array
		//
		let tmp_array = [];

		//
		//	2.	Loop over the properties to just grab the name
		//
		container.properties.forEach(function(data) {

			//
			//	1.	Grab just the name
			//
			tmp_array.push(data.name);

		})

		//
		//	3.	Save the Properties for the next promise
		//
		container.items = tmp_array

		//
		//	->	Move to the next chain
		//
		return resolve(container);

	});
}

//
//	Display a drop down menu with a list of all the Properties for the given
//	user.
//
function select_property(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Draw the menu with one tab to the left to so the UI stay
		//		consistent
		//
		let options = {
			leftPadding: "\t"
		}

		//
		//	2.	Tell the user what we want from hi or her
		//
		term.yellow("\tSelect The Property ");

		term('\n');

		//
		//	3.	Draw the drop down menu
		//
		term.singleColumnMenu(container.items, options, function(error, res) {

			term("\n");

			term.yellow("\tLoading...");

			//
			//	1.	Get the Property name based on the user selection
			//
			let selected_property = container.properties[res.selectedIndex];

			//
			//	2.	Save the selection for other promises to use. It will
			//		be used in API calls
			//
			container.selected_property = selected_property;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Display a drop down menu with a list of all the Services that we support
//
function which_service_should_we_use(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Draw the menu with one tab to the left to so the UI stay
		//		consistent
		//
		let options = {
			leftPadding: "\t"
		}

		//
		//	2.	This are the services that we support at this moment
		//
		let services = [
			'BambooHQ',
			'Pingboard'
		]

		//
		//	3.	Tell the user what we want from hi or her
		//
		term.yellow("\tSelect The Service ");

		term('\n');

		//
		//	4.	Draw the drop down menu
		//
		term.singleColumnMenu(services, options, function(error, response) {

			//
			//	1.	Get the Service name based on the user selection
			//
			let selected_service = services[response.selectedIndex]

			//
			//	2.	Save the selection for other promises to use. It will
			//		be used in API calls
			//
			container.selected_service = selected_service;

			//
			//	->	Move to the next chain
			//
			return resolve(container);

		});

	});
}

//
//	Clear everything and show a nice header to let the user know where or she
//	are
//
function make_the_header(container)
{
	return new Promise(function(resolve, reject) {

		term.clear();

		term("\n");

		//
		//	1.	Ask input from the user
		//
		term.yellow("\tService: " + container.selected_service);

		term("\n");

		//
		//	-> Move to the next chain
		//
		return resolve(container);

	});
}