//const Discord = require("discord.js"); // Discord
const colors = require("colors"); // Colored log
const readline = require("readline"); // Console input
const fs = require('fs'); // File output
const bot = require("./bot"); // Discord bot class
var config = require("../config.json"); // Bot configuration

process.chdir(__dirname); // Sync working directory for fs
var bots = config.tokens.map(token => new bot(token, config.target)); // Start all the bots
const ios = readline.createInterface({ // Open console for commands
	input: process.stdin,
	output: process.stdout
});

function update() { // Update config.json
	return new Promise((resolve, reject) => {
		fs.writeFile("../config.json", JSON.stringify(config, null, 4), (error) => {
			if (error) {
				reject(error);
			}
			else {
				resolve();
			}
		});
	});
}

function team_attack(connection) { // Coordinated bot attack when voice chat is joined
	// Do stuff here, e.g. play random noises
}

function init() { // Identify ally bots to each other
	const allies = bots.map(bot => bot.client.user.id);
	bots.forEach((bot) => {
		bot.ally(allies);
		bot.on("targetAcquired", (channel) => {
			bot.attack(channel).then(team_attack).catch(console.log);
		});
		bot.guildCheck(bot);
	});
	console.log("Allies identified; program initiated".green);
}

function target(t) { // Identify a new target
	config.target = t;
	bots.forEach(bot => bot.newTarget(t));
	update().then(() => {
		console.log("Changed target".green);
	}).catch(console.log);
	
}

function exit() { // Wrap everything up
	ios.close();
	console.log("Disconnecting all bots from voice channels".yellow);
	bots.forEach(bot => bot.disconnect());
	throw "Logging off".red;
}

ios.on("line", (line) => { // Handle console commands
	var args = line.trim().split(' '), param = args.slice(1).join(' ');
	switch (args[0].toLowerCase()) {
		default: console.log("Available commands: init, target, exit".white); break; // Invalid command
		case "init": init(); break;
		case "target": target(param); break;
		case "exit": exit(); break;
	}
});
