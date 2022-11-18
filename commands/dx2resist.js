const { EmbedBuilder } = require('@discordjs/builders');
const {SlashCommandBuilder} = require('discord.js');
const Demon = require('../demon');
const resistLookup = {
    'wk': 'Weak',
    'rs': 'Resist',
    'nu': 'Null',
    'rp': 'Repel',
    'ab': 'Drain',
    'ndr': 'NDR'
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
                {name: 'weak', value: 'wk'},
                {name: 'resist', value: 'rs'},
                {name: 'null', value: 'nu'},
                {name: 'repel', value: 'rp'},
                {name: 'drain', value: 'ab'},
                {name: 'ndr', value: 'ndr'}
            ))
        .addStringOption(option => 
            option.setName('elem')
            .setDescription('The element of the resistance')
            .setRequired(true)
            .addChoices(
                {name: 'phys', value: 'Phys'},
                {name: 'fire', value: 'Fire'},
                {name: 'ice', value: 'Ice'},
                {name: 'force', value: 'Force'},
                {name: 'elec', value: 'Elec'},
                {name: 'light', value: 'Light'},
                {name: 'dark', value: 'Dark'}
            )),

    async execute(interaction) {
        const elem = interaction.options.get('elem').value[0].toUpperCase() + interaction.options.get('elem').value.slice(1);
        const resist = interaction.options.get('resist').value;
        const skillName = resistLookup[resist] + ' ' + elem;
        const demons = await Demon.demons();
        const natural = [];
        const tAwaken = [];

        console.log(`Searching for demons who ${skillName}`);

        const resistances = findResists(resist, elem, demons);

        const embed = new EmbedBuilder()
            .setTitle(skillName)
            .setColor(0x4477FF);

        if(resist != 'ndr') {
            embed.addFields(
                    {name: 'Innate', value: resistances.natural.join(', ')});
            if(resistances.tAwaken.length > 0) {
                embed.addFields({name: 'Teal Awaken', value: resistances.tAwaken.join(', ')})
            }

            console.log(`Found ${resistances.natural.length} demons who innate ${skillName} and ${resistances.tAwaken.length} demons who awaken ${skillName}`);
        } else {
            embed.addFields(
                {name: 'Null', value: resistances.nu.join(', ')},
                {name: 'Null (Awaken)', value: resistances.nuAwaken.join(', ')},
                {name: 'Drain', value: resistances.dr.join(', ')},
                {name: 'Drain (Awaken)', value: resistances.drAwaken.join(', ')},
                {name: 'Repel', value: resistances.rp.join(', ')},
                {name: 'Repel (Awaken)', value: resistances.rpAwaken.join(', ')},
            );

            console.log(`Found ${[...Object.values(resistances)].reduce((prev, curr) => [...prev, ...curr], []).length} demons who NDR ${elem}`);
        }


        await interaction.reply({embeds: [embed]});
    }
}

function findResists(resist, elem, demons) {
    const natural = [], tAwaken = [];
    const skillName = resistLookup[resist] + ' ' + elem;

    if(resist == 'ndr') {
        const nu = findResists('nu', elem, demons, true);
        const dr = findResists('ab', elem, demons, true);
        const rp = findResists('rp', elem, demons, true);

        return {nu: nu.natural, nuAwaken: nu.tAwaken, dr: dr.natural, drAwaken: dr.tAwaken, rp: rp.natural, rpAwaken: rp.tAwaken};
    }

    for(let d of demons) {
        let dName = d.name;
        if(d.rarity == '5') dName = `**${d.name}**`;
        
        //Natural resistance or innate transfer resist (like Pallas Athena)
        const dRes = d['r' + elem];
        if(dRes == resist || d.skill1 == skillName)
            natural.push(dName);

        //Teal awaken (including unique ones like Demi/Godlys)
        const teal = d.awakenT;
        if(teal == skillName ||
            (teal == 'Null Elec-Force' && resist == 'nu' && (elem == 'Elec' || elem == 'Force') ||
            (teal == 'Godly Bastion' && resist == 'ab' && (elem == 'Light' || elem == 'Dark'))))
            tAwaken.push(dName);
    }

    natural.sort((a, b) => a.replace('**', '').localeCompare(b.replace('**', '')));
    tAwaken.sort((a, b) => a.replace('**', '').localeCompare(b.replace('**', '')));

    return {natural, tAwaken};
}