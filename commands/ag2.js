const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ag2')
        .setDescription('Returns AG2 maps and bosses')
        .addSubcommand(subcommand =>
            subcommand.setName('map')
                .setDescription('Returns the map of a given AG2 floor')
                .addNumberOption(option =>
                    option.setName('floor')
                        .setDescription('AG2 floor number')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('boss')
                .setDescription('Returns the boss of a given AG2 floor')
                .addNumberOption(option =>
                    option.setName('floor')
                        .setDescription('AG2 floor number')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('spboss')
                .setDescription('Returns the given unique (one-time) AG2 boss')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the boss')
                        .setRequired(true)
                        .addChoices(
                            {name: 'Celestial Huang Long', value: 'chl'},
                            {name: 'Celestial Long', value: 'cl'},
                            {name: 'Celestial Gui Xian', value: 'cgx'},
                            {name: 'Celestial Baihu', value: 'cbh'},
                            {name: 'Celestial Feng Huang', value: 'cfh'},
                            {name: 'Parvati', value: 'mfp'},
                            {name: 'Cybele', value: 'mfc'},
                            {name: 'Neko Shogun', value: 'mhns'},
                            {name: 'Lucifuge', value: 'mfl'}
                        ))),

    async execute(interaction) {
        console.log(interaction);

        await interaction.reply('To do later lol');
    }
}