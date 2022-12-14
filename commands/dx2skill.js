const {SlashCommandBuilder} = require('discord.js');
const Demon = require('../demon');
const Skill = require('../skill');
const searchList = require('../searchList');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2skill')
        .setDescription('Returns the information of a skill')
        .addStringOption(option => 
            option.setName('name')
            .setDescription('Name of the skill to search')
            .setRequired(true)
            .setAutocomplete(true)),
    
    async execute(interaction) {
        const demons = await Demon.demons();
        const skills = await Skill.skills();
        const search = interaction.options.get('name').value.trim().toLowerCase();

        await interaction.reply(await searchList(skills, search, demons));
    }
}