const {SlashCommandBuilder} = require('discord.js');
const {createReadStream} = require('node:fs');
const readline = require('node:readline');
const date = require('date-and-time');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2banner')
        .setDescription('Returns information or probabilities of the current banners')
        .addSubcommand(subcommand =>
            subcommand.setName('current')
                .setDescription('Returns the banners currently ongoing')),

    async execute(interaction) {
        const bannerStream = createReadStream(path.join(__dirname, '..', 'Banners.csv'));

        var currents = [];
        const rl = readline.createInterface({
            input: bannerStream,
            crlfDelay: Infinity
        });

        for await(const line of rl) {
            const start = line.split('","')[1];
            const end = line.split('","')[2];
            if(checkBefore(start) && !checkBefore(end)) {
                currents.push(line);
            }
        }

        console.log(currents);
        await interaction.reply('zamn');
    }
}

//Checks if the input date is before the current time
function checkBefore(dateString) {
    const gmtDate = dateString.replace('(JST)', ' GMT+0900');
    const d = date.parse(gmtDate, 'MM/DD/YYYY HH:mm [GMT]Z');
    const now = new Date();
    const diff = date.subtract(now, d);
    return diff.toMilliseconds() > 0;
}