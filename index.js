const fs = require('node:fs');
const path = require('node:path');
const {Client, GatewayIntentBits, Collection} = require('discord.js');
const {token} = require('./config.json');

const client = new Client({intents: [GatewayIntentBits.Guilds]});
client.commands = new Collection();

const commandPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(path.join(commandPath, file));
    client.commands.set(command.data.name, command);
}


client.once('ready', () => {
    console.log('ready');
});

client.on('interactionCreate', async interaction => {
    if(!interaction.isChatInputCommand() && !interaction.isSelectMenu()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);

    if(interaction.isSelectMenu()) {
        if(!interaction.message.interaction.commandName.includes('dx2banner')) return;

        try {
            await interaction.client.commands.get('dx2banner').execSelect(interaction);
        } catch(error) {
            console.error(error);
            await interaction.reply({content: 'Error', ephemeral: true});
        }
        return;
    } else { //Always a slash command
        if(!command) return;
    }


    try {
        await command.execute(interaction);
    } catch(error) {
        console.error(error);
        await interaction.reply({content: 'Error', ephemeral: true});
    }
});

client.login(token);