const {SlashCommandBuilder} = require('discord.js');
const {readWiki} = require('../tierlistReader');
const {readBanners} = require('../bannerCSV');

module.exports = async function updateBot() {
    const tierlist = await readWiki();
    const banner = await readBanners(20);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2update')
        .setDescription('Updates Bot database')
        .setDefaultMemberPermissions('0'),

    async execute(interaction) {
        if(interaction.user.tag != 'boat#8689') {
            await interaction.reply({content: ":face_with_raised_eyebrow:", ephemeral: true});
            return;
        }

        const tierList = await readWiki();
        const banner = await readBanners(20);

        await interaction.reply({content: `${tierList}; Read ${banner} new banner steps`, ephemeral: true});
    }
}