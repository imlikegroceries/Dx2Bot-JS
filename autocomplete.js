const {readFile} = require('node:fs/promises');

module.exports = {
    async demonAuto(interaction) {
        const input = interaction.options.getFocused(true);
        const choices = await (await readFile('./names/demon.txt', {encoding: 'utf-8'})).split('\n').slice(0, -1);
        let filtered = choices.filter(d => d.toLowerCase().startsWith(input.value.toLowerCase()));
        if(filtered.length > 25) filtered = filtered.slice(0, 25);
        await interaction.respond(filtered.map(d => ({name: d, value: d})));
    },

    async skillAuto(interaction) {
        const input = interaction.options.getFocused(true);
        const choices = await (await readFile('./names/skill.txt', {encoding: 'utf-8'})).split('\n').slice(0, -1);
        let filtered = choices.filter(s => s.toLowerCase().startsWith(input.value.toLowerCase()));
        if(filtered.length > 25) filtered = filtered.slice(0, 25);
        await interaction.respond(filtered.map(s => ({name: s, value: s})));
    },

    async armamentAuto(interaction) {
        const input = interaction.options.getFocused(true);
        const csv = await (await readFile('./names/armament.txt', {encoding: 'utf-8'})).split('\n').slice(0, -1);
        const choices = csv.slice(1).map(row => row[0]);
        let filtered = choices.filter(s => s.toLowerCase().startsWith(input.value.toLowerCase()));
        if(filtered.length > 25) filtered = filtered.slice(0, 25);
        await interaction.respond(filtered.map(s => ({name: s, value: s})));
    }
};