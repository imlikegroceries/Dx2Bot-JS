const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2help')
        .setDescription('Returns information of all bot commands (message only visible to you)'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Dx2 Bot Commands')
            .addFields({
                name: "/dx2demon [name]",
                value: "Returns the information of the demon with the inputted name.\n" +
                    "Can also use nicknames, or search part of the demon's name.\n" +
                    "For instance: 'fly' = Beelzebub*, 'yoshi' = Yoshitsune, 'gongen' = Zaou-Gongen"
            },
            {
                name: "/dx2skill [name]",
                value: "Returns the information of the skill with the inputted name.\n" +
                    "Search functionality is identical to /dx2demon"
            },
            {
                name: "/dx2tier [name]",
                value: "Returns the tier list information, rankings, and suggested archetypes of the demon."
            },
            {
                name: "/dx2resist [resist] [element]",
                value: "Returns all demons who have the inputted resistance, including in Teal awaken skills.\n" +
                    "[resist]: Pick from 'Weak', 'Resist', 'Null', 'Repel', 'Drain'\n" + 
                    "[element]: Pick from 'Phys', 'Fire', 'Ice', 'Force', 'Elec', 'Light', 'Dark'"
            },
            {
                name: "/dx2formula [formula]",
                value: "Returns the specified formula.\n" + 
                    "Options for [formula]:\n" +
                    "'dmg' or empty: Standard damage formula\n" +
                    "'acc': Standard accuracy formula\n" +
                    "'buff': Buff ratios\n" + 
                    "'counter': Counter chance formula\n" +
                    "'crit': Crit chance formula\n" + 
                    "'heal': Healing formula\n" +
                    "'inf': Ailment infliction chance formula\n" +
                    "'speed': Battle speed formula\n" +
                    "'stat': Base stat formulas"
            },
            {
                name: "/dx2banner current",
                value: "Returns all banners currently on and how long each one has left.\n" + 
                    "Banner durations are not live and do not update."
            },
            {
                name: "/dx2banner calc [steps]",
                value: "Returns the probabilities of rolling on a banner the inputted number of times.\n" +
                    "You will be given a dropdown menu of banners (only on-going ones).\n" +
                    "After making a selection, the probabilities of rolling a 5\\*, banner specific demons, and any other 5\\* are listed"
            },
            {
                name: '/ag2 map [floor]',
                value: "Returns the map of the inputted AG2 floor.\n" +
                    "There are no ag2 upload commands as there were in the previous bot."
            },
            {
                name: "/ag2 boss [floor]",
                value: "Returns the information of the boss of the inputted AG2 floot."
            },
            {
                name: "/ag2 spboss [name]",
                value: "Returns the information of the inputted special (one-time) boss.\n" +
                    "Pick from any of the 5 Celestials or 5 Multi-fusion unlock bosses."
            },
            {
                name: "/dx2arm sword [name]",
                value: "Returns the sword armament created with the inputted demon.\n" +
                    "Bot doesn't recognize armament names (e.g. use 'Huang Di' instead of 'Xuanyuan Sword')."
            },
            {
                name: "/dx2arm shield [name]",
                value: "Returns the shield armament created with the inputted demon\n" +
                    "Bot doesn't recognize armament names (e.g. use 'Gogmagog' instead of 'White Cliff')."
            });

        await interaction.reply({embeds: [embed], ephemeral: true});
    }
}