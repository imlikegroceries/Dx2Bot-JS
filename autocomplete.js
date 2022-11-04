const Demon = require('./demon');
const Skill = require('./skill');
const {parse} = require('csv-parse/sync');

module.exports = {
    async demonAuto(interaction) {
        const input = interaction.options.getFocused(true);
        const choices = await Demon.demons();
        let filtered = choices.filter(d => d.name.toLowerCase().startsWith(input.value));
        if(filtered.length > 25) filtered = filtered.filter(d => d.rarity == '5');
        if(filtered.length > 25) filtered = filtered.slice(0, 25);
        filtered = filtered.map(d => d.name);
        await interaction.respond(filtered.map(d => ({name: d, value: d})));
    },

    async skillAuto(interaction) {
        const input = interaction.options.getFocused(true);
        const choices = await (await Skill.skills()).map(s => s.name);
        let filtered = choices.filter(s => s.toLowerCase().startsWith(input.value));
        if(filtered.length > 25) filtered = filtered.slice(0, 25);
        await interaction.respond(filtered.map(s => ({name: s, value: s})));
    },

    async armamentAuto(interaction) {
        const input = interaction.options.getFocused(true);
        const csv = parse(await fetch('https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Swords.csv').then(r => r.text()));
        const choices = csv.slice(1).map(row => row[0]);
        let filtered = choices.filter(s => s.toLowerCase().startsWith(input.value));
        if(filtered.length > 25) filtered = filtered.slice(0, 25);
        await interaction.respond(filtered.map(s => ({name: s, value: s})));
    }
}