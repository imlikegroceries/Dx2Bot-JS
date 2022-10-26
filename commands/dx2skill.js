const {SlashCommandBuilder} = require('discord.js');
const Demon = require('../demon');
const levenshtein = require('js-levenshtein');
const Skill = require('../skill');
const searchList = require('../searchList');
const LEV_DIST = 1;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2skill')
        .setDescription('Returns the information of a skill')
        .addStringOption(option => 
            option.setName('name')
            .setDescription('Name of the skill to search')
            .setRequired(true)),
    
    async execute(interaction) {
        const demons = await Demon.demons();
        const skills = await Skill.skills();
        const search = interaction.options.get('name').value.trim().toLowerCase();

        await interaction.reply(await searchList(skills, search, demons));
    }
}