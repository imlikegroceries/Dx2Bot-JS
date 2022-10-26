const {SlashCommandBuilder} = require('discord.js');
const {createReadStream} = require('node:fs');
const readline = require('node:readline');
const date = require('date-and-time');
const path = require('node:path');
const {readBanners, parsePage} = require('../bannerCSV');
const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2banner')
        .setDescription('Returns information or probabilities of the current banners')
        .addSubcommand(subcommand =>
            subcommand.setName('current')
                .setDescription('Returns the banners currently ongoing'))
        .addSubcommand(subcommand =>
            subcommand.setName('calc')
                .setDescription("Calculates the odds of pulling a given banner's focus(es)")
                .addIntegerOption(option => 
                    option.setName('steps')
                        .setDescription('The number of steps to simulate')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        const bannerStream = createReadStream(path.join(__dirname, '..', 'Banners.csv'));

        var currents = [];
        const currentBanners = new Map();
        const oldBanners = new Map();
        const rl = readline.createInterface({
            input: bannerStream,
            crlfDelay: Infinity
        });

        for await(const line of rl) {
            const data = line.replace(/"/g, '').split(',');
            const start = data[1];
            const end = data[2];
            if(checkBefore(start) && !checkBefore(end)) {
                currents.push(data);
                if(!currentBanners.has(data[0])) {
                    currentBanners.set(data[0], [...data.slice(1), 1]);
                } else {
                    currentBanners.get(data[0])[3]++;
                }
            } else {
                if(!oldBanners.has(data[0])) {
                    oldBanners.set(data[0], [...data.slice(1), 1]);
                } else {
                    oldBanners.get(data[0])[3]++;
                }
            }
        }

        var banners = [];
        for(let [name, data] of currentBanners.entries()) {
            let obj = {};
            obj.name = name;
            obj.value = `${data[3]} Steps\nDuration: ${data[0].replace('(JST)', '')} ~ ${data[1].replace('(JST)', '')}\n${dateRemainingString(data[1])}`;
            obj.inline = false;
            banners.push(obj);
        }

        if(subcommand == 'current') {
            const embed = new EmbedBuilder()
                .setTitle('Current Banners')
                .addFields(...banners)
                .setFooter({text: 'Date/times listed are all in JST'})
                .setColor(0x6644FF);

            await interaction.reply({embeds: [embed]});
        }
        
        if(subcommand == 'calc') {
            let rows = [];
            for(const [name, data] of currentBanners.entries()) {
                rows.push(
                    {
                        label: name,
                        description: data[3] + ' Step Cycle',
                        value: data[2] + '_' + interaction.options.get('steps').value
                    }
                );
            }

            const selector = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('bannerCDF')
                        .setPlaceholder('Select a banner')
                        .addOptions(rows)
                );
            
            await(interaction.reply({components: [selector], ephemeral: true}));
        }
    },

    //For the select menu interaction
    async execSelect(interaction) {
        const [idStart, steps] = interaction.values[0].split('_');
        console.log(`Calcuting odds on banner ${idStart} rolling ${steps} steps`);
        await interaction.reply(await parsePage(idStart, steps));
    }
}


function dateRemaining(dateString) {
    const gmtDate = dateString.replace('(JST)', ' GMT+0900');
    const d = date.parse(gmtDate, 'MM/DD/YYYY HH:mm [GMT]Z');
    const now = new Date();
    const diff = date.subtract(d, now);
    return diff;
}

//Checks if the input date is before the current time
function checkBefore(dateString) {
    return dateRemaining(dateString).toMilliseconds() < 0;
}

function dateRemainingString(dateString) {
    const diff = dateRemaining(dateString);
    const day = ~~diff.toDays();
    const hour = ~~diff.toHours() % 24;
    const min = ~~diff.toMinutes()% 60;
    let res = `${day} Day`;
    if(day != 1) res += 's';
    res += `, ${hour} Hour`;
    if(hour != 1) res += 's';
    res += `, ${min} Minute`;
    if(min != 1) res += 's';
    return res + ' Remaining';
}