const {SlashCommandBuilder} = require('discord.js');
const {parse} = require('csv-parse/sync');
const Demon = require('../demon');
const searchList = require('../searchList');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2arm')
        .setDescription('Returns the information of an armament')
        .addSubcommand(subcommand => 
            subcommand.setName('sword')
                .setDescription('Information of a sword')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the demon')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('shield')
                .setDescription('Information of a shield')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the demon')
                        .setRequired(true))),
    
    async execute(interaction) {
        const type = interaction.options.getSubcommand();
        const search = interaction.options.get('name').value.trim().toLowerCase();
        const demons = await Demon.demons();
        var csv;
        var url;
        const demon = await searchList(demons, search, false, true);

        if(typeof demon == 'string' || demon instanceof String) {
            await interaction.reply(demon);
            return;
        }

        console.log(`Looking for the ${type} of ${demon.name}`);

        if(type == 'sword') {
            url = "https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Swords.csv";
        } else if(type == 'shield') {
            url = "https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Shields.csv";
        } else {
            await interaction.reply('Invalid armament type');
            return;
        }

        const data = await fetch(url).then(r => r.text());
        csv = parse(data);

        const arm = csv.find(row => row[0] == demon.name);
        console.log(`Found ${type} of ${demon.name}: ${arm[0]}`);

        await interaction.reply('Sup');
    }
}