const { EmbedBuilder } = require('@discordjs/builders');
const {SlashCommandBuilder} = require('discord.js');
const Demon = require('../demon');
const resistLookup = {
    'wk': 'Weak',
    'rs': 'Resist',
    'nu': 'Null',
    'rp': 'Repel',
    'ab': 'Drain'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2resist')
        .setDescription('Returns all demons of a specific resistance')
        .addStringOption(option => 
            option.setName('resist')
            .setDescription('The type of resistance')
            .setRequired(true)
            .addChoices(
                {name: 'Weak', value: 'wk'},
                {name: 'Resist', value: 'rs'},
                {name: 'Null', value: 'nu'},
                {name: 'Repel', value: 'rp'},
                {name: 'Drain', value: 'ab'}
            ))
        .addStringOption(option => 
            option.setName('elem')
            .setDescription('The element of the resistance')
            .setRequired(true)
            .addChoices(
                {name: 'Phys', value: 'Phys'},
                {name: 'Fire', value: 'Fire'},
                {name: 'Ice', value: 'Ice'},
                {name: 'Force', value: 'Force'},
                {name: 'Elec', value: 'Elec'},
                {name: 'Light', value: 'Light'},
                {name: 'Dark', value: 'Dark'}
            )),

    async execute(interaction) {
        const elem = interaction.options.get('elem').value[0].toUpperCase() + interaction.options.get('elem').value.slice(1);
        const resist = interaction.options.get('resist').value;
        const skillName = resistLookup[resist] + ' ' + elem;
        const demons = await Demon.demons();
        const natural = [];
        const tAwaken = [];

        console.log(`Searching for demons who ${skillName}`);

        for(let d of demons) {
            //Natural resistance or transfer skill resist (like Pallas Athena)
            const dRes = d["r" + elem];
            if(dRes == resist || d.skil1 == skillName) {
                natural.push(d.name);
            }

            //Teal awaken (including unique ones like Demi or Godlys)
            const teal = d.awakenT;
            if(teal == 'Null Elec-Force' || teal == 'Godly Shield') {
                console.log(elem);
                console.log(d.name);
            }
            if(teal == skillName ||
                (teal == 'Null Elec-Force' && (elem == 'Elec' || elem == 'Force')) ||
                (teal == 'Godly Shield' && (elem == 'Light' || elem == 'Dark'))) {
                
                tAwaken.push(d.name);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(skillName)
            .addFields(
                {name: 'Innate', value: natural.join(', ')});
        if(tAwaken.length > 0) {
            embed.addFields({name: 'Teal Awaken', value: tAwaken.join(', ')});
        }

        console.log(`Found ${natural.length} demons who innate ${skillName}s and ${tAwaken.length} demons who awaken ${skillName}`);

        await interaction.reply({embeds: [embed]});
    }
}