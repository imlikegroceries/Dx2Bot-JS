const url = 'https://d2r-sim.mobile.sega.jp/socialsv/webview/StepGachaRateView.do';
const { EmbedBuilder } = require('@discordjs/builders');
const {JSDOM} = require('jsdom');
const { once } = require('node:events');
const {createWriteStream, writeFileSync} = require('node:fs');
let config = require('./config.json');

module.exports = {
    async readBanners(max = 1000) {
        const writable = createWriteStream('./Banners.csv', {encoding: 'utf-8', flags: 'a'});

        var i;
        for(i = 0; i <= max; i++) {
            var document;
            try {
                document = await JSDOM.fromURL(`${url}?gacha_id=${config.bannerId + i}&lang=1`).then(r => r.window.document);
            } catch(e) {
                console.log('Invalid return found, breaking loop early');
                break;
            }

            if(document.body.childElementCount == 0) {
                //Empty response = invalid ID
                console.log('Empty return found, breaking loop early')
                break;
            }

            const title = document.getElementById("hed-main").firstElementChild.textContent;
            const date = document.querySelectorAll('.datail-txt')[1].textContent.split('\n').filter(x => x.length > 0);
            const start = date[0].replace("Starts: ", '');
            const end = date[1].replace("Ends: ", '');

            const chunk = [title, start, end, +config.bannerId + i].map(x => `"${x}"`).join(',') + '\n';
            console.log(chunk);

            if(!writable.write(chunk)) {
                await once(writable, 'drain');
            }
        }

        const newId = +config.bannerId + i;
        config.bannerId = newId;
        writeFileSync('./config.json', JSON.stringify(config));
        writable.end();

        return i;
    },

    async parsePage(id, numSteps) {
        //Try to establish document
        var document;
        try {
            document = await JSDOM.fromURL(`${url}?gacha_id=${id}&lang=1`).then(r => r.window.document);
        } catch(e) {
            console.log('Error when parsing document');
            console.error(e);
            return;
        }

        const name = document.getElementById("hed-main").firstElementChild.textContent; //Banner name
        const steps = [...document.querySelectorAll('.acBox')]; //The expandable step tables
        const maxSteps = steps.length; //The amount of those tables
        const probabilities = new Map(); //Name: Probability pairs

        for(let i = 0; i < numSteps; i++) {
            const stepProb = await parseStep(steps[i % maxSteps]);
            stepProb.forEach((v, k, m) => {
                if(!probabilities.has(k)) probabilities.set(k, +v);
                else probabilities.set(k, +probabilities.get(k) * v);
            });
        }
        
        probabilities.set("Any other 5☆", probabilities.get("Fafnir(81)"));
        probabilities.delete("Fafnir(81)");
        console.log(probabilities);

        const embed = new EmbedBuilder()
            .setTitle('Probability of Rolling in ' + numSteps + ' Step' + ((numSteps != 1) ? 's' : '') + '\nOn ' + name)
            .setFields([...probabilities.entries()].map(d => {
                return {name: d[0], value: ~~((1 - d[1]) * 10000) / 100 + '%'}
            }))
            .setFooter({text: 'Be wary of cycle limits because the bot \ndoes not have that information'})
            .setColor('Purple');

        return {embeds: [embed]};
    }
}

//Calculates the odds (of not pulling demon) going through a single step (10-pull)
async function parseStep(acBox) {
    const summonRegex = /(\d{1,2})\D+(\d{1,2})?/g;
    //Drop rate according to rarity table
    const ratio = [...acBox.querySelector('.detail-ratio').querySelectorAll('table tbody tr')];
    //Drop rate per demon table
    const demon = acBox.querySelector('.detail-rate');

    const rateDist = ratio[0];
    if(!ratio[1].textContent.includes('5')) return;
    //Rates of 5*s in general
    const fiveRate1 = +ratio[1].children.item(1).textContent.replace('%', '') / 100;
    const fiveRate2 = +ratio[1].children.item(2).textContent.replace('%', '') / 100;

    //Searches for the two numbers that appear in the text (ex: Summons 1 to 7)
    //The number of summons using the first (left) percentage
    const firstRate = [...rateDist.children.item(1).textContent.matchAll(summonRegex)][0].slice(1);
    const secndRate = [...rateDist.children.item(2).textContent.matchAll(summonRegex)][0].slice(1);
    if(secndRate[1] == undefined) secndRate[1] = '10';

    //The big table of all the 5*s and their individual odds
    const rates = [...demon.querySelector('.table-rateStup tbody').children].slice(3);
    const probabilities = new Map();
    probabilities.set("Any 5☆ (excluding guarantees)", 1);
    //Iterates through every demon in the big table
    for(const d of rates) {
        //The row of said big table
        const stats = [...d.children].map(x => x.textContent);
        stats[2] = (+stats[2].replace('%', '') / 100);
        stats[3] = (+stats[3].replace('%', '') / 100);
        //If they are in the regular/abs pool, skip (except fafnir to get the standard 5* probability)
        if(regularPool.includes(stats[1]) && stats[1] != 'Fafnir(81)') continue;

        if(!probabilities.has(stats[1])) probabilities.set(stats[1], 1);
        //Calculate 10 rolls, using the appropriate probability for the i-th roll
        for(let i = 1; i <= 10; i++) {
            if(+firstRate[0] <= i && i <= +firstRate[1]) {
                probabilities.set(stats[1], probabilities.get(stats[1]) * (1 - stats[2]));
            } else {
                probabilities.set(stats[1], probabilities.get(stats[1]) * (1 - stats[3]));
            }
        }
    }

    for(let i = 1; i <= 10; i++) {
        if(+firstRate[0] <= i && i <= +firstRate[1]) {
            probabilities.set("Any 5☆ (excluding guarantees)", probabilities.get("Any 5☆ (excluding guarantees)") * (1 - fiveRate1));
        } else if(+secndRate[0] <= i && i <= +secndRate[1] && fiveRate2 != 1) {
            probabilities.set("Any 5☆ (excluding guarantees)", probabilities.get("Any 5☆ (excluding guarantees)") * (1 - fiveRate2));
        }
    }

    return probabilities;
}

//Weird gap in between Sukuna and Vishnew rerun?


const regularPool = [
    "Erlkonig(84)",
    "Hresvelgr(84)",
    "Fafnir(81)",
    "Vasuki(86)",
    "Gogmagog(80)",
    "Mot(91)",
    "Ixtab(84)",
    "Nergal(82)",
    "Orcus(80)",
    "Black Frost(81)",
    "Huang Long(88)",
    "Quetzalcoatl(80)",
    "Garuda(80)",
    "Huang Di(88)",
    "Yoshitsune(97)",
    "Siegfried(83)",
    "Rama(86)",
    "Guan Yu(85)",
    "Tokisada(92)",
    "Alice(89)",
    "Trumpeter(94)",
    "Mother Harlot(95)",
    "Daisoujou(81)",
    "Red Rider(80)",
    "Black Rider(82)",
    "Pale Rider(84)",
    "Lucifer(98)",
    "Mara(90)",
    "Tzitzimitl(80)",
    "Surt(83)",
    "Seth(84)",
    "Lilith(80)",
    "Samael(84)",
    "Flauros(82)",
    "Ananta(83)",
    "Marici(90)",
    "Thor(83)",
    "Asherah(83)",
    "Zaou-Gongen(85)",
    "Shiva(93)",
    "Susano-o(82)",
    "Frost Ace(80)",
    "Cu Chulainn(81)",
    "Barong(84)",
    "Amaterasu(82)",
    "Vishnu(97)",
    "Baal(86)",
    "Ishtar(82)",
    "Izanami(89)",
    "Anat(84)",
    "Lakshmi(85)",
    "Mastema(83)",
    "Michael(90)",
    "Metatron(99)"
]