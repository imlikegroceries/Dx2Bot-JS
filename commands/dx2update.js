const {SlashCommandBuilder} = require('discord.js');
const updateBot = require('../updater');

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

        await interaction.deferReply();

        const {tierList, banner} = await updateBot();

        await interaction.editReply({content: `${tierList}; Read ${banner} new banner steps`, ephemeral: true});
    }
}