const fs = require('node:fs');
const path = require('node:path');
const {Client, GatewayIntentBits, Collection} = require('discord.js');
const {token} = require('./config.json');
const updateBot = require('./updater');
const cron = require('node-cron');

const client = new Client({intents: [GatewayIntentBits.Guilds]});
client.commands = new Collection();

const commandPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(path.join(commandPath, file));
    client.commands.set(command.data.name, command);
}


client.once('ready', () => {
    console.log('Dx2Bot is ready.');
});

//For commands
client.on('interactionCreate', async interaction => {
    if(!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);

    try {
        console.log(`\nExecuting ${interaction.commandName}`);
        await command.execute(interaction);
    } catch(error) {
        console.error(error);
        await interaction.reply({content: 'Error', ephemeral: true});
    }
});

//For select menus (banner calc)
client.on('interactionCreate', async interaction => {
    if(!interaction.isSelectMenu()) return;
    if(!interaction.message.interaction.commandName.includes('dx2banner')) return;

    try {
        await interaction.client.commands.get('dx2banner').execSelect(interaction);
    } catch(error) {
        console.error(error);
        await interaction.reply({content: 'Error', ephemeral: true});
    }
})

client.login(token);

cron.schedule('2 * * * *', updateBot);