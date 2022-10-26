const url = 'https://d2r-sim.mobile.sega.jp/socialsv/webview/StepGachaRateView.do';
const {JSDOM} = require('jsdom');
const { once } = require('node:events');
const {createWriteStream, writeFileSync} = require('node:fs');
let config = require('./config.json');

async function readBanners(max = 1000) {
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

    return newId;
}

//Weird gap in between Sukuna and Vishnew rerun?