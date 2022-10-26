const fs = require('node:fs');
const path = require('node:path');
const {REST, SlashCommandBuilder, Routes} = require('discord.js');
const {appId, guildId, token} = require('./config.json');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

//Gets all (js) files in the /commands subdirectory, each file corresponds to a single command
for(const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

const rest = new REST({version: 10}).setToken(token);
//Registers commands to a single server (of guildId); can make them global somehow
rest.put(Routes.applicationGuildCommands(appId, guildId), {body: commands})
    .then(data => console.log(`Registered ${data.length} commands successfully.`))
    .catch(console.error);