const {SlashCommandBuilder} = require('discord.js');
const Demon = require('../demon');
const URL = "https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Demons.csv";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('testing but again'),
    async execute(interaction) {
        const x = await Demon.demons();
        //const d = ["Name","Name JP","Race","Grade","Rarity","Phys","Fire","Ice","Elec","Force","Light","Dark","6★ HP","6★ Strength","6★ Magic","6★ Vitality","6★ Agility","6★ Luck","Skill 1","Skill 2","Skill 3","Clear Awaken","Red Awaken","Yellow Awaken","Purple Awaken","Teal Awaken","Red Gacha","Yellow Gacha","Purple Gacha","Teal Gacha","Type","PATK","PDEF","MATK","MDEF","S Light","M Light","L Light","S Lawful","M Lawful","L Lawful","S Neutral","M Neutral","L Neutral","S Dark","M Dark","L Dark","S Chaotic","M Chaotic","L Chaotic","S Witch","L Witch","S Soul","L Soul","Alternate Name","Panel 1","Panel 2","Panel 3","Panel 1 Stats","Panel 2 Stats","Panel 3 Stats","Gacha","Event","Multi-Fusion","Banner Required","Nickname","Panel 4","Panel 4 Stats","Negotiation","Exchangeable","Class"];
        await interaction.reply({embeds: [await x[200].writeToDiscord()]});
    }
}