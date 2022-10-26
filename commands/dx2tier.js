const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {parse} = require('csv-parse/sync');
const Demon = require('../demon');
const searchList = require('../searchList');
const {csvLocation} = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');
const { off } = require('node:process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2tier')
        .setDescription('Returns the tierlist information of a demon')
        .addStringOption(option => 
            option.setName('name')
            .setDescription('Name of demon to search')
            .setRequired(true)),

    async execute(interaction) {
        let demons = await Demon.demons();
        const search = interaction.options.get('name').value.trim().replace('*', '☆').toLowerCase();
        const name = await searchList(demons, search, false, true);

        //name will either be the searched Demon, or a string of the error message
        if(typeof name == 'string' || name instanceof String) {
            console.log(name);
            if(name == `Could not find '${search}'`) {
                await interaction.reply(name);
            } else {
                await interaction.reply(name);
            }
            return;
        }
        console.log(`Found ${name.name} in DB`);
    
        //const csv = await fetch(csvLocation).then(r => r.text());
        const csv = fs.readFileSync(path.join(__dirname, '..', csvLocation)).toString();
        const tiers = parse(csv);
        //data is the actual csv data of the searched demon
        const data = tiers.find(demon => demon[0].replace(' ', '') == name.name.replace(' ', ''));
        if(data == undefined) {
            console.log(`Could not find tier data for ${search} (${name.name})`);
            await interaction.reply(`${name.name} is present in Wiki, but has no tier list entry.`);
            return;
        }

        //Archetype strings will either be empty ('' = Any), or like 'PTY'
        const pveArch = (data[1].length > 1) ? data[1].split('').join(', ') : "Any";
        const pvpArch = (data[2].length > 1) ? data[2].split('').join(', ') : "Any";

        let desc = 'Pros: ';
        desc += data[8].replace(/\n/g, "\n* ") + '\n\n'; //replace '\n' that appear in text with actual newlines
        desc += 'Cons: ' + data[9].replace(/\n/g, "\n* ");
        desc += '\n\nNotes: ' + data[10].replace(/\n/g, "\n* ");
        if(desc.length > 1900) { //Arbitrarily set to be safely below 2000 char limit
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

        console.log(`Successfully generated response of tier data of ${search} (${data[0]})`);
        await interaction.reply({embeds: [embed]});
    }
}