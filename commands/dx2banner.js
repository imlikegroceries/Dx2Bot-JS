const {SlashCommandBuilder} = require('discord.js');
const {createReadStream} = require('node:fs');
const readline = require('node:readline');
const date = require('date-and-time');
const path = require('node:path');
const {readBanners, parsePage} = require('../bannerCSV');
const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('@discordjs/builders');
const searchList = require('../searchList');
const Demon = require('../demon');

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
                        .setMaxValue(100))
                .addIntegerOption(option => 
                    option.setName('start')
                        .setDescription('The step to start simulating from (default = 1)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(10)))
        .addSubcommand(subcommand =>
            subcommand.setName('history')
                .setDescription('Finds the last 25 banners the searched demon appeared on')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of demon to search for')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addBooleanOption(option =>
                    option.setName('new-to-old')
                        .setDescription('Sets chronological ordering (default is oldest to newest)')
                        .setRequired(false))),

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
                const key = data[0] + ';' + start;
                if(!oldBanners.has(key)) {
                    oldBanners.set(key, [...data.slice(1), 1]);
                } else {
                    oldBanners.get(key)[3]++;
                }
            }
        }

        var banners = [];
        for(let [name, data] of currentBanners.entries()) {
            let obj = {};
            obj.name = name;
            obj.value = `${data[3]} Steps\nFrom: <t:${getDate(data[0]) / 1000}>\nTo: <t:${getDate(data[1]) / 1000}>\nEnds <t:${getDate(data[1]) / 1000}:R>`;
            obj.inline = false;
            banners.push(obj);
        }

        if(subcommand == 'current') {
            const embed = new EmbedBuilder()
                .setTitle('Current Banners')
                .addFields(...banners)
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
                        value: `${data[2]}_${interaction.options.get('steps').value}_${interaction.options.getInteger('start') ?? 1}`
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

        if(subcommand == 'history') {
            await interaction.deferReply();

            const query = interaction.options.get('name').value.trim().replace('*', '☆').toLowerCase();
            const demon = await searchList(await Demon.demons(), query, false, true);
            let dName = demon.name;
            if(['Shiva A', 'Nekomata A', 'Cu Chulainn A', 'Garuda A', 'Quetzalcoatl A', 'Lakshmi A', 'Abaddon A', 'Susano-o A', 'Surt A', 'Thor A', 'Cerberus A', 'Vishnu A', 'Odin A'].includes(dName)) {
                dName = 'Dimensional';
            }
            if(dName == 'Beelzebub☆') {
                dName = 'Beelzebub (Human)';
            }

            if(typeof demon == 'string' || demon instanceof String) {
                await interaction.editReply(demon);
                return;
            }

            let count = 0;
            let rows = [];
            let entries = [...oldBanners.entries()];
            if(interaction.options.getBoolean('new-to-old')) entries.reverse();

            for(let [name, data] of entries) {
                const page = await fetch(`https://d2r-sim.mobile.sega.jp/socialsv/webview/StepGachaRateView.do?gacha_id=${data[2]}&lang=1`).then(r => r.text());
                
                if(page.includes(dName)) {
                    rows.push({
                        name: name.split(';')[0],
                        value: `${data[3]} Steps\nFrom: <t:${getDate(data[0]) / 1000}>\nTo: <t:${getDate(data[1]) / 1000}>\nEnded <t:${getDate(data[1]) / 1000}:R>`
                    });
                    count++;
                    console.log(data[2]);
                }

                if(count >= 25) break;
            }

            if(dName == 'Dimensional') dName += 's';
            const embed = new EmbedBuilder()
                .setTitle((count < 25 ? 'All ' : '') + 'Previous Banners that include ' + dName)
                .setFields(...rows)
                .setColor(0x6644FF);
            if(count >= 25) embed.setFooter({text: 'More banners exist but have been truncated due to the embed limit'});
            if(dName == 'Dimensionals') embed.setDescription('Because there is no universal way of differentiating all dimenionsals from their usual counterparts, ' + demon.name + ' has been converted into searching for all dimensnionals.');

            await interaction.editReply({embeds: [embed]});
        }
    },

    //For the select menu interaction
    async execSelect(interaction) {
        const [idStart, steps, start] = interaction.values[0].split('_');
        console.log(`Calcuting odds on banner ${idStart} rolling ${steps} steps from step ${start}`);
        await interaction.deferReply();
        await interaction.editReply(await parsePage(idStart, steps, start));
    }
}

function getDate(dateString) {
    const gmtDate = dateString.replace('(JST)', ' GMT+0900');
    const d = date.parse(gmtDate, 'MM/DD/YYYY HH:mm [GMT]Z');
    return d;
}

function dateRemaining(dateString) {
    const d = getDate(dateString);
    const now = new Date();
    const diff = date.subtract(d, now);
    return diff;
}

//Checks if the input date is before the current time
function checkBefore(dateString) {
    return dateRemaining(dateString).toMilliseconds() < 0;
}