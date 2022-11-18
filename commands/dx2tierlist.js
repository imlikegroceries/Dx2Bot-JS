const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('csv-parse/sync');
const {csvLocation} = require('../config.json');
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const lookup = {
    'pve': ['PvE', 3],
    'off': ['PvP Offense', 4],
    'def': ['PvP Defense', 5],
    'prelim': ['Democ Prelim Wave', 6],
    'boss': ['Democ Boss Wave', 7]
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2tierlist')
        .setDescription('Returns all demons ranked 4/5 in a category')
        .addStringOption(option => option
            .setName('list')
            .setDescription('Category to look up')
            .addChoices(
                {name: 'pve', value: 'pve'},
                {name: 'off', value: 'off'},
                {name: 'def', value: 'def'},
                {name: 'prelim', value: 'prelim'},
                {name: 'boss', value: 'boss'})
            .setRequired(true)),

    async execute(interaction) {
        const option = interaction.options.get('list').value;
        const tiers = parse(fs.readFileSync(path.join(__dirname, '..', csvLocation)).toString());
        const rank5 = [], rank4 = [];
    
        const [title, index] = lookup[option];
    
        for(let row of tiers) {
            if(FourStars.some(x => row[0] == x)) continue;
            if(+row[index] == 5) rank5.push(row[0].replace('_', ' '));
            if(+row[index] == 4) rank4.push(row[0].replace('_', ' '));
        }
    
        const embed = new EmbedBuilder()
            .setTitle(title)
            .addFields(
                {name: '5 Rating', value: rank5.join(', ')},
                {name: '4 Rating', value: rank4.join(', ')})
            .setColor(0xFF4444);
    
        console.log(`Found ${rank5.length} demons with 5 rating and ${rank4.length} with 4 rating in ${title}`);

        await interaction.reply({embeds: [embed]});
    }
}

var FourStars = [
    "Abaddon",
    "Abaddon A",
    "Agni",
    "Anubis",
    "Anzu",
    "Attis",
    "Azrael",
    "Beelzebub",
    "Beiji-Weng",
    "Beloved",
    "Bishamonten",
    "Cerberus",
    "Chernobog",
    "Dantalian",
    "Dionysus",
    "Fenrir",
    "Ganesha",
    "Girimekhala",
    "Gucumatz",
    "Gurr",
    "Hanuman",
    "Halloween Jack",
    "Hecatoncheires",
    "Hel",
    "Hell Biker",
    "Helper Frost",
    "Jeanne d.27Arc",
    "Jikokuten",
    "Kama",
    "Kikuri-Hime",
    "King Frost",
    "Kudlak",
    "Loki",
    "Long",
    "Man Eater",
    "Matador",
    "Mishaguji",
    "Nekomata A",
    "Neko Shogun",
    "Nidhoggr",
    "Oberon",
    "Odin",
    "Ongyo-Ki",
    "Orochi",
    "Pallas Athena",
    "Parvati",
    "Pazuzu",
    "Persephone",
    "Prometheus",
    "Rakshasa",
    "Rangda",
    "Sandalphon",
    "Sarasvati",
    "Skadi",
    "Sleipnir",
    "Sphinx",
    "Succubus",
    "Tachikoma",
    "Throne",
    "Titan",
    "Titania",
    "Tlaltecuhtli",
    "Tsukuyomi",
    "White Rider",
    "Wu Kong",
    "Yatagarasu",
    "Ym",
    "Yurlungur",
    "Zhong Kui"
];