const EventEmitter = require('events'); // Event emitter
const Discord = require("discord.js"); // Discord
const colors = require("colors"); // Colored log

module.exports = class bot extends EventEmitter {
	constructor(token, t) { // Bot constructor
		super();
		
		this.client = new Discord.Client();
		this.target = t;
		this.allies = null;
		
		this.client.on("ready", () => {
			console.log("Logged in: ".green + this.client.user.username + '#' + this.client.user.discriminator);
			//this.client.user.setStatus("invisible").catch(console.log);
		});
		
		this.client.login(token).catch((error) => {
			console.log(("Failed to log in: " + token).red);
			console.log(error);
			console.log("Restart the program to try again".red);
		});
	}
	
	ally(a) { // Identify ally bots
		this.allies = a;
		this.client.on("voiceStateUpdate", () => this.guildCheck(this));
		this.client.on("guildCreate", () => this.guildCheck(this));
		this.guildCheck(this); // Initial check for target
	}
	
	newTarget(t) { // Acquire a new target user by ID
		this.target = t;
		this.guildCheck(this);
	}
	
	guildCheck(b) { // Check all guilds for target and correct conditions
		if (b.target && b.allies) {
			var found = false;
			b.client.guilds.cache.tap((guild) => {
				if (guild.members.cache.has(b.target)) {
					const t = guild.members.cache.get(b.target);
					if (t.voice.channel) {
						if (!t.voice.channel.members.some(member => !(b.allies.includes(member.id) || member.id == b.target))) {
							found = true;
							b.emit("targetAcquired", t.voice.channel);
						}
					}
				}
			});
			if (!found) {
				b.client.voice.connections.tap(connection => connection.disconnect()); // Target lost
			}
		}
		else {
			b.client.voice.connections.tap(connection => connection.disconnect()); // Target abandoned
		}
	}
	
	attack(channel) { // Actions to be taken when target is acquired
		return new Promise((resolve, reject) => {
			channel.join().then(resolve).catch(reject);
		});
	}
	
	disconnect() { // Disconnect from Discord
		this.client.voice.connections.tap(connection => connection.disconnect());
		this.client.destroy();
	}
};
