const {parse} = require('csv-parse/sync');
const {EmbedBuilder} = require('discord.js');

module.exports = class Demon {
    constructor(args) { //pass in an array corresponding to a row of the CSV
        this.name = args[0];
        //jp name (args[1]) is skipped
        this.race = args[2];
        this.grade = args[3];
        this.rarity = args[4];

        //Resistances
        this.rPhys = args[5];
        this.rFire = args[6];
        this.rIce = args[7];
        this.rElec = args[8];
        this.rForce = args[9];
        this.rLight = args[10];
        this.rDark = args[11];

        //6* Stats
        this.hp = args[12];
        this.str = args[13];
        this.mag = args[14];
        this.vit = args[15];
        this.agi = args[16];
        this.luck = args[17];
        //Not always filled in so calculated instead
        this.pAtk = Math.round(this.str * 2.1 + 50 * 5.6 + 50);
        this.pDef = Math.round(this.str * 0.5 + this.vit * 1.1 + 50 * 5.6 + 50);
        this.mAtk = Math.round(this.mag * 2.1 + 50 * 5.6 + 50);
        this.pAtk = Math.round(this.mag * 0.5 + this.vit * 1.1 + 50 * 5.6 + 50);

        //Skills
        this.skill1 = args[18];
        this.skill2 = args[19];
        this.skill3 = args[20];
        
        this.awakenC = args[21];
        this.awakenR = args[22];
        this.awakenT = args[23];
        this.awakenP = args[24];
        this.awakenY = args[25];

        this.gachaR = args[26];
        this.gachaT = args[27];
        this.gachaP = args[28];
        this.gachaY = args[29];

        //Default AI Type
        this.ai = args[30];
        //Stats (31 ~ 34) aren't filled in so are calculated above
        //Awaken mats (35 ~ 53) are skipped lol

        //Panels
        this.p1Desc = args[55];
        this.p2Desc = args[56];
        this.p3Desc = args[57];
        this.p4Desc = args[66];
        this.p1Stat = args[58];
        this.p2Stat = args[59];
        this.p3Stat = args[60];
        this.p4Stat = args[67];

        this.gacha = args[61];
        this.multi = args[63];
        //Event-only (62) is unnecessary and idk what banner-required (64)
        this.negotiation = args[68];
        this.exchangeable = args[69];
        //Not even sure what 70 is for

        //Other Names
        this.alts = args[54];
        this.nickname = args[65];
        this.names = this.nickname.split(", ");
    }

    //Returns all non-neutral resistances
    resists() {
        let res = '';

        if(this.rPhys) res += " | Phys: " + this.capitalize(this.rPhys);
        if(this.rFire) res += " | Fire: " + this.capitalize(this.rFire);
        if(this.rIce) res += " | Ice: " + this.capitalize(this.rIce);
        if(this.rElec) res += " | Elec: " + this.capitalize(this.rElec);
        if(this.rForce) res += " | Force: " + this.capitalize(this.rForce);
        if(this.rLight) res += " | Light: " + this.capitalize(this.rLight);
        if(this.rDark) res += " | Dark: " + this.capitalize(this.rDark);

        if(res.length > 0) res = res.slice(3); //Removes the beginning ' | '

        return res;
    }

    archetypes() {
        let res = '';
        if(this.awakenC) res = "C: " + this.wikiLink(this.awakenC) + "\n";

        let red = `R: ${this.wikiLink(this.awakenR)} / ${this.wikiLink(this.gachaR)}`;
        let yellow = `Y: ${this.wikiLink(this.awakenY)} / ${this.wikiLink(this.gachaY)}`;
        let purple = `P: ${this.wikiLink(this.awakenP)} / ${this.wikiLink(this.gachaP)}`;
        let teal = `T: ${this.wikiLink(this.awakenT)} / ${this.wikiLink(this.gachaT)}`;

        //For all 4 colors: if there's no awaken, string should be empty; if there's no gacha, trim the ' / '
        let archs = [red, yellow, purple, teal].map(x => {
            if(x[4] == "/") return "";
            if(x.endsWith(" / ")) return x.slice(0, -3) + "\n";
            return x + "\n";
        });

        for(let arch of archs) res += arch;
        return res;
    }

    skills() {
        let res = `${this.wikiLink(this.skill1)}\n${this.wikiLink(this.skill2)}\n`;
        if(this.skill3) { //3rd skill doesn't exist on low rarity demons
            res += this.wikiLink(this.skill3);
        }
        return res;
    }

    panels() {
        let res = '';
        if(this.p1Desc && this.p1Stat) res += `1: ${this.p1Desc} ${this.p1Stat}\n`;
        if(this.p2Desc && this.p2Stat) res += `2: ${this.p2Desc} ${this.p2Stat}\n`;
        if(this.p3Desc && this.p3Stat) res += `3: ${this.p3Desc} ${this.p3Stat}\n`;
        if(this.p4Desc && this.p4Stat) res += `4: ${this.p4Desc} ${this.p4Stat}\n`;
        return res;
    }

    wikiLink(name) {
        if(!name) return "";
        return `[${name}](https://dx2wiki.com/index.php/${encodeURI(name.replace('[', '(').replace(']', ')').replace('(', '%28').replace(')', '%29'))})`;
    }

    //Generates the stats with their rankings
    //statArr is those ranknings, which are calculated outside of this function
    //length is the total number of demons
    stats(statArr, length) {
        return `HP: ${this.hp} | Vit: ${this.vit} (${statArr[2]}/${length})\n` +
        `Str: ${this.str} (${statArr[0]}/${length}) | Mag: ${this.mag} (${statArr[1]}/${length})\n` +
        `Agi: ${this.agi} (${statArr[3]}/${length}) | Luck: ${this.luck} (${statArr[4]}/${length})\n`;
    }

    //type is either 'fusion' or 'fission'
    fusionUrl(type) {
        let newName = this.name.replace(/\b A\b/, " [Dimensional]");
        return `https://oceanxdds.github.io/dx2_fusion/?route=${type}&demon=${encodeURI(newName)}#en`;
    }

    avaliability() {
        let res = '';
        if(this.negotiation) {
            res += "Only available via Negotiation";
        } else if(this.exchangeable) {
            res += "Only exchangable via an Exchange";
        } else {
            res += `[Used in Fusion](${this.fusionUrl("fusion")})\n`;
            if(this.multi || !this.gacha) res += `[How to Fuse](${this.fusionUrl("fission")})`;
        }
        return res;
    }

    //Capitalizes the first letter of a string; for resistances
    capitalize(str) {
        if(str.length < 2) return str;
        return str[0].toUpperCase() + str.substring(1);
    }

    //Creates the embed object to be returned for the command
    async writeToDiscord(allDemons = null) {
        //Stats are done in here so they can be ranked (which requires a call to .demons())
        let _demons = allDemons ?? await Demon.demons();
        const nameCheck = x => x.name == this.name;
        const rank = [
            _demons.sort((a, b) => b.str - a.str).findIndex(nameCheck),
            _demons.sort((a, b) => b.mag - a.mag).findIndex(nameCheck),
            _demons.sort((a, b) => b.vit - a.vit).findIndex(nameCheck),
            _demons.sort((a, b) => b.agi - a.agi).findIndex(nameCheck),
            _demons.sort((a, b) => b.luck - a.luck).findIndex(nameCheck)
        ];

        const embed = new EmbedBuilder()
            .setTitle(this.name)
            .addFields(
                {name: "Skills:", value: this.skills(), inline: true},
                {name: "Awaken / Gacha:", value: this.archetypes(), inline: true},
                {name: "Resists:", value: this.resists(), inline: false}
            )  
        if(this.p1Desc) { //If the demon has no panels, then there's shouldn't even be a 'Panels:' section
            embed.addFields({name: "Panels:", value: this.panels(), inline: true});
        }
        embed.addFields({name: "Stats:", value: this.stats(rank, _demons.length) + this.avaliability(), inline: true})
            .setFooter({
                text: `Race: ${this.race} | Grade: ${this.grade} | Rarity: ${this.rarity} | AI: ${this.ai}`
                    + (this.nickname.length > 0 ? " | Nicknames: " + this.nickname : "")
            })
            .setColor('Red')
            .setURL("https://dx2wiki.com/index.php/" + encodeURI(this.name))
            .setThumbnail("https://raw.githubusercontent.com/Alenael/Dx2DB/master/Images/Demons/" + encodeURI(this.name.replace("☆", "")) + ".jpg");  
        return embed;
    }

    //returns an array of every Demon
    static async demons() {
        const csv = await fetch('https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Demons.csv').then(r => r.text());
        const data = parse(csv);

        let _demons = [];
        for(let d of data) {
            _demons.push(new Demon(d));
        }

        return _demons;
    }
}