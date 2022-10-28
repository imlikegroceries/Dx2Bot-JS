
const {readWiki} = require('./tierlistReader');
const {readBanners} = require('./bannerCSV');

module.exports = async function updateBot() {
    const tierList = await readWiki();
    const banner = await readBanners(20);

    console.log(new Date());
    console.log({tierList, banner});
    return {tierList, banner};
}