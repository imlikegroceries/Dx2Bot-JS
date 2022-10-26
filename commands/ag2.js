const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fsPromises = require('node:fs/promises');
const {join} = require('node:path');
const spboss = {
    'chl': ['Celestial Huang Long', 48],
    'cfh': ['Celestial Feng Huang', 8],
    'cbh': ['Celestial Baihu', 16],
    'cgx': ['Celestial Gui Xian', 27],
    'cl': ['Celestial Long', 38],
    'mfp': ['Parvati', 7],
    'mfc': ['Cybele', 19],
    'mfk': ['Kartikeya', 26],
    'mhns': ['Neko Shogun', 36],
    'mfl': ['Lucifuge', 49]
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ag2')
        .setDescription('Returns AG2 maps and bosses')
        .addSubcommand(subcommand =>
            subcommand.setName('map')
                .setDescription('Returns the map of a given AG2 floor')
                .addIntegerOption(option =>
                    option.setName('floor')
                        .setDescription('AG2 floor number')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(50)))
        .addSubcommand(subcommand =>
            subcommand.setName('boss')
                .setDescription('Returns the boss of a given AG2 floor')
                .addIntegerOption(option =>
                    option.setName('floor')
                        .setDescription('AG2 floor number')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(50)))
        /*
        .addSubcommand(subcommand =>
            subcommand.setName('spboss')
                .setDescription('Returns the given unique (one-time) AG2 boss')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the boss')
                        .setRequired(true)
                        .addChoices(
                            ...Object.entries(spboss).map(pair => { return {name: pair[1][0], value: pair[0]} })
                        )))*/,

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const embed = new EmbedBuilder();
        var png, jpg;
        var dir = subcommand, picType; //T = png; F = false

        if(subcommand == 'map') {
            const floor = interaction.options.get('floor').value;
            png = floor + '.png';
            jpg = floor + '.jpg';
            embed.setTitle("Map of AG2 Floor " + floor)
            .setURL(`https://dx2wiki.com/index.php/Hollow_World/Floors_${~~((floor - 1) / 10) * 10 + 1}-${~~((floor - 1) / 10) * 10 + 10}#Floor_${floor}`);
        
        } else if(subcommand == 'boss') {
            const floor = interaction.options.get('floor').value;
            png = 'SPOILER_' + floor + '.png';
            jpg = 'SPOILER_' + floor + '.jpg';
            embed.setTitle("Boss of AG2 Floor " + floor)
            .setURL(`https://dx2wiki.com/index.php/Hollow_World/Floors_${~~((floor - 1) / 10) * 10 + 1}-${~~((floor - 1) / 10) * 10 + 10}#Boss_${floor}`);
       
        } else if(subcommand == 'spboss') {
            dir = 'boss';
            const name = interaction.options.get('name').value;
            var boss = spboss[name][0], floor = spboss[name][1];
            png = 'SPOILER_' + encodeURI(boss) + '.png';
            jpg = 'SPOILER_' + encodeURI(boss) + '.jpg';
            if(!boss.includes('Celestial')) boss += ' Multifusion Boss';
            embed.setTitle(boss + " (F" + floor + ")")
            .setURL(`https://dx2wiki.com/index.php/${encodeURI(boss)}`);
        }

        var img = `./${dir}/`;
        try{
            await fsPromises.stat(join(__dirname, '..', dir, png));
            picType = true;
        } catch(e) {
            console.log('No png');
            picType = false;
        }
        try {
            await fsPromises.stat(join(__dirname, '..', dir, jpg));
            picType = false;
        } catch(e) {
            console.log('No jpg');
            picType = true;
        }

        if(picType) {
            embed.setImage('attachment://' + png);
            img += png;
        } else {
            embed.setImage('attachment://' + jpg);
            img += jpg;
        }

        if(subcommand == 'map') {
            await interaction.reply({embeds: [embed], files: [img]});
        } else { //Because spoilers aren't allowed in embeds for some reason :(
            const hyperlink = `[${embed.data.title}](${embed.data.url})`;
            await interaction.reply({content: hyperlink, files: [img]});
        }
    }
}