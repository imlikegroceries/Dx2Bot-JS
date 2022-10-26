const {SlashCommandBuilder} = require('discord.js');
const Demon = require('../demon');
const URL = "https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Demons.csv";
const config = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('testing but again'),
    async execute(interaction) {
        const csv = await fs.readFile(path.join(__dirname, '..', config.csvLocation), (err, buf) => {
            if(err) console.error(err);
            else console.log(buf.toString());
        });
    }
}