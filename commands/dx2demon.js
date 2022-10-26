const {SlashCommandBuilder} = require('discord.js');
const levenshtein = require('js-levenshtein');
const Demon = require('../demon');
const LEV_DIST = 1;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2demon')
        .setDescription('Returns the general information of a demon')
        .addStringOption(option => 
            option.setName('name')
            .setDescription('The name of the demon to search')
            .setRequired(true)),

    async execute(interaction) {
        const demons = await Demon.demons();
        const search = interaction.options.get('name').value.trim().replace('*', '☆').toLowerCase();

        var demon = demons.find(d => d.name.toLowerCase() == search);
        if(demon == undefined) { //Exact match was not found
            demon = demons.find(d => d.names[0] && d.names.some(n => n.toLowerCase() == search));

            if(demon == undefined) { //Nickname not found either
                //Try finding similar demons w/ levenshtein dist.
                let similarDemons = [];
                for(let d of demons) {
                    let levDist = levenshtein(d.name.toLowerCase(), search);
                    if(levDist <= LEV_DIST) similarDemons.push(d.name);
                }

                if(similarDemons.length == 0) { //No similar demons found
                    //Try demons that start with the query
                    let startsWith = [];
                    for(let d of demons) {
                        if(d.name.toLowerCase().startsWith(search)) startsWith.push(d.name);
                    }

                    if(startsWith.length == 1) { //Return the singular demon found
                        demon = demons.find(d => d.name.toLowerCase() == startsWith[0].toLowerCase());
                    } else if(startsWith.length > 1) {
                        await interaction.reply(`Could not find '${search}'. Did you mean: ${startsWith.join(", ")}?`);
                        return;
                    } else {
                        await interaction.reply(`Could not find ${search}.`);
                        return;
                    }

                } else if(similarDemons.length == 1) { //Return the singular similar demon found
                    demon = demons.find(d => d.name.toLowerCase() == similarDemons[0].toLowerCase());
                } else { //Multiple similar demons found
                    await interaction.reply(`Could not find '${search}'. Did you mean: ${similarDemons.join(", ")}?`);
                    return;
                }
            }
        }

        await interaction.reply({embeds: [await demon.writeToDiscord()]});
    }
}