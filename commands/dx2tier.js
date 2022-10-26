const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {parse} = require('csv-parse/sync');
const Demon = require('../demon');
const searchList = require('../searchList');
const {csvLocation} = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2tier')
        .setDescription('Returns the tierlist information of a demon')
        .addStringOption(option => 
            option.setName('name')
            .setDescription('Name of Demon to search')
            .setRequired(true)),

    async execute(interaction) {
        let demons = await Demon.demons();
        const search = interaction.options.get('name').value.trim().replace('*', '☆').toLowerCase();
        const name = await searchList(demons, search, false, true);

        //name will either be the searched Demon, or a string of the error message
        if(name instanceof String) {
            if(name == `Could not find '${search}'`) {
                await interaction.reply(name + `\nIts tier data may need to be added to the Wiki first.`);
            } else {
                await interaction.reply(name);
            }
            return;
        }

        //const csv = await fetch(csvLocation).then(r => r.text());
        const csv = fs.readFileSync(path.join(__dirname, '..', csvLocation)).toString();
        const tiers = parse(csv);
        const data = tiers.find(demon => demon[0] == name.name);
        console.log(name);
        console.log(data);
        
        const pveArch = (data[1].length > 1) ? data[1].split('').join(', ') : "Any";
        const pvpArch = (data[2].length > 1) ? data[2].split('').join(', ') : "Any";
        let desc = 'Pros:';
        desc += data[8].replace(/\n/g, "\n* ") + '\n\n';
        desc += 'Cons:' + data[9].replace(/\n/g, "\n* ");
        desc += '\n\nNotes:' + data[10].replace(/\n/g, "\n* ");
        if(desc.length > 1900) {
            desc = desc.slice(0, 1900) + " ...\nEntry too long, continue reading on the Wiki.";
        }

        const embed = new EmbedBuilder()
            .setTitle(data[0]) //Name
            .setDescription(desc) //Pros + Cons
            .addFields(
                {name: "PvE Archetype(s)", value: pveArch, inline: true},
                {name: "PvP Archetype(s)", value: pvpArch, inline: true},
                {name: "PvE Rating", value: data[3], inline: true},
                {name: "PvP Offense Rating", value: data[4], inline: true},
                {name: "PvP Defense Rating", value: data[5], inline: true},
                {name: "Democ Prelim Rating", value: data[6], inline: true},
                {name: "Democ Boss Rating", value: data[7], inline: true})
            .setColor('Red')
            .setURL("https://dx2wiki.com/index.php/" + encodeURI(name.name))
            .setThumbnail("https://raw.githubusercontent.com/Alenael/Dx2DB/master/Images/Demons/" + encodeURI(name.name.replace("☆", "")) + ".jpg");  

        await interaction.reply({embeds: [embed]});
    }
}