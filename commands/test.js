const {SlashCommandBuilder} = require('discord.js');
const Demon = require('../demon');
const URL = "https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Demons.csv";
const config = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');
const {parsePage} = require('../bannerCSV');
const searchList = require('../searchList');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('testing but again'),
    async execute(interaction) {
        const demons = await Demon.demons();
        const d = await searchList(demons, 'hl', false, true);
        console.log(d);
        console.log(d.test());

        await interaction.reply(encodeURI('Huang Long'));
    }
}