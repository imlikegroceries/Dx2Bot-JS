const url = 'https://www.dx2wiki.com/index.php/Tier_List';
const {JSDOM} = require('jsdom');
const {writeFile} = require('node:fs');
const {csvLocation} = require('./config.json');

async function readWiki() {
    //both (4* 5*) tier entries are all contained in <table>s with the .tierlist class
    const tierlists = await JSDOM.fromURL(url).then(r => r.window.document.querySelectorAll(".tierlist tbody"));

    const tierdata = [];
    //5*
    let i = -2;
    var row = [];

    for(let tr of [...tierlists.item(0).children, ...[...tierlists.item(1).children].slice(2)]) {
        switch(i) {
            case 0: //rating
                row.push(tr.firstElementChild.id.replace('.E2.98.86', ' ☆').replace('_', ' ').replace('.28', '(').replace('.29', ')')); //Name
                
                let pveArch = "";
                const pve = tr.children.item(1);
                if(pve.innerHTML.includes("Purple")) pveArch += "P";
                if(pve.innerHTML.includes("Teal")) pveArch += "T";
                if(pve.innerHTML.includes("Yellow")) pveArch += "Y";
                if(pve.innerHTML.includes("Red")) pveArch += "R";
                if(pve.innerHTML.includes("Clear")) pveArch += "C";
                row.push(pveArch);

                let pvpArch = "";
                const pvp = tr.children.item(2);
                if(pvp.innerHTML.includes("Purple")) pvpArch += "P";
                if(pvp.innerHTML.includes("Teal")) pvpArch += "T";
                if(pvp.innerHTML.includes("Yellow")) pvpArch += "Y";
                if(pvp.innerHTML.includes("Red")) pvpArch += "R";
                if(pvp.innerHTML.includes("Clear")) pvpArch += "C";
                row.push(pvpArch);

                row.push(tr.children.item(3).textContent); //PvE rank
                row.push(tr.children.item(4).textContent); //PvP Off. rank
                row.push(tr.children.item(5).textContent); //PvP Def. rank
                row.push(tr.children.item(6).textContent); //Democ Prelim rank
                row.push(tr.children.item(7).textContent); //Democ Boss rank

                break;

            case 1:
                row.push(tr.lastElementChild.textContent.replace(/"/g, "'")); //Pros
                break;

            case 2:
                row.push(tr.lastElementChild.textContent.replace(/"/g, "'")); //Cons
                break;

            case 3:
                row.push(tr.lastElementChild.textContent.replace(/"/g, "'")); //Notes
                break;

            default: //i = 4 is the border/break thingy
                if(row.length > 0) tierdata.push(row);
                row = [];
                break;
        }

        i++;
        i %= 5;
    }

    console.log(`Read ${tierdata.length} entries from the Wiki Tier List`);
    const tierString = tierdata.map(demon => demon.map(data => '"' + data + '"').join(',')).join('\n');

    writeFile(csvLocation, tierString, 'utf-8', (err) => {
        if(err) console.error(err);
        else console.log('Successfully written to ' + csvLocation);
    });

    return `Read ${tierdata.length} entries from Wiki TL`;
}

//readWiki();
module.exports.readWiki = readWiki;