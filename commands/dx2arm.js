const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
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
        var url, thumbStart;
        if(type == 'sword') {
            url = "https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Swords.csv";
            thumbStart = "https://raw.githubusercontent.com/Alenael/Dx2DB/master/Images/Swords/";
        } else if(type == 'shield') {
            url = "https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Shields.csv";
            thumbStart = "https://raw.githubusercontent.com/Alenael/Dx2DB/master/Images/Shields/";
        } else {
            await interaction.reply('Invalid armament type');
            return;
        }

        const search = interaction.options.get('name').value.trim().toLowerCase();
        const data = await fetch(url).then(r => r.text());
        const _demons = await Demon.demons();

        const csv = parse(data);
        const csvNames = csv.map(row => row[0]);
        const demons = _demons.filter(d => csvNames.includes(d.name));

        const demon = await searchList(demons, search, false, true);

        if(typeof demon == 'string' || demon instanceof String) {
            await interaction.reply(demon);
            return;
        }

        console.log(`Looking for the ${type} of ${demon.name}`);

        const arm = csv.find(row => row[0] == demon.name);
        console.log(`Found ${type} of ${demon.name}: ${arm[1]}`);

        const shieldOffset = (type == 'shield') ? 7 : 0;
        var p1, p2, p3;
        
        var embed = new EmbedBuilder()
            .setTitle(arm[1]) //Armament name
            .addFields(
                {name: 'Demon:', value: arm[0], inline: true},
                {name: 'Skills:', value: arm[4 + shieldOffset] + '\n' + arm[5 + shieldOffset] + '\n' + arm[6 + shieldOffset], inline: true},
                {name: arm[2] + ':', value: arm[3], inline: false}); //Talent + effect

        if(arm[11 + shieldOffset]) p1 = `1: ${arm[11 + shieldOffset]} ${arm[14 + shieldOffset]}\n`; //p1
        if(arm[12 + shieldOffset]) p2 = `2: ${arm[12 + shieldOffset]} ${arm[15 + shieldOffset]}\n`; //p2
        if(arm[13 + shieldOffset]) p3 = `3: ${arm[13 + shieldOffset]} ${arm[16 + shieldOffset]}\n`; //p3
        if(p1 && p2 && p3) {
            embed.addFields({name: 'Panels:', value: p1 + p2 + p3, inline: true});
        }

        var footer = '';
        if(type == 'shield') {
            let resist = '';
            if(arm[4]) resist += ' | Phys: ' + arm[4][0].toUpperCase() + arm[4][1];
            if(arm[5]) resist += ' | Fire: ' + arm[5][0].toUpperCase() + arm[5][1];
            if(arm[6]) resist += ' | Ice: ' + arm[6][0].toUpperCase() + arm[6][1];
            if(arm[7]) resist += ' | Elec: ' + arm[7][0].toUpperCase() + arm[7][1];
            if(arm[8]) resist += ' | Force: ' + arm[8][0].toUpperCase() + arm[8][1];
            if(arm[9]) resist += ' | Light: ' + arm[9][0].toUpperCase() + arm[9][1];
            if(arm[10]) resist += ' | Dark: ' + arm[10][0].toUpperCase() + arm[10][1];
            if(resist.length > 0) resist = resist.slice(3);
            embed.addFields({name: 'Resists:', value: resist, inline: false});

            footer = `Reduce ${arm[15]} | HP% ${arm[14]} | PDef: ${arm[16]} | MDef: ${arm[17]}`;
        } else {
            footer = `Increase ${arm[8]} | ${arm[7]} | Acc: ${arm[9]} | Crit: ${arm[10]}`;
        }
        embed.setFooter({text: footer})
            .setURL("https://dx2wiki.com/index.php/" + encodeURI(arm[0]))
            .setThumbnail(thumbStart + encodeURI(arm[1]) + ".jpg")
            .setColor(0xFF4444);

        await interaction.reply({embeds: [embed]});
    }
}