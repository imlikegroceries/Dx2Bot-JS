const {SlashCommandBuilder} = require('discord.js');
const levenshtein = require('js-levenshtein');
const Demon = require('../demon');
const searchList = require('../searchList');
const LEV_DIST = 1;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2demon')
        .setDescription('Returns the information of a demon')
        .addStringOption(option => 
            option.setName('name')
            .setDescription('The name of the demon to search')
            .setRequired(true)),

    async execute(interaction) {
        const demons = await Demon.demons();
        const search = interaction.options.get('name').value.trim().replace('*', '☆').toLowerCase();

        await interaction.reply(await searchList(demons, search));
    }
}