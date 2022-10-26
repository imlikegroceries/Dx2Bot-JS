const {parse} = require('csv-parse/sync');
const {EmbedBuilder} = require('discord.js');

module.exports = class Skill {
    constructor(args, armament) { //args = array corresponding to a row of the skill csv
        this.armament = armament;
        this.element = args[0];
        this.name = args[1];
        //JP name skipped
        this.cost = args[3];
        this.desc = args[4];
        this.target = args[5];

        if(!armament) { //Normal skill
            this.points = args[6];
            //Obtainability fields [7 ~ 11] are irrelevant
            this.nickname = args[12];
            //Pure numbers besides use limit aren't used
            this.uses = args[20];

        } else { //Armament skill
            this.points = ""; //All arm. skills are innate/unique
            this.nickname = args[14]; //All empty lol
            this.uses = args[15];
            this.desc += "\n" + args[16]; //Skill levels are separate from description for some reason?
        }

        this.names = this.nickname.split(", ");
        this.desc = this.desc.replace(/\\n/g, "\n") + "\n";
        this.element = this.element[0].toUpperCase() + this.element.substring(1);
        if(this.points == "") this.points = '-';
    }

    innateFrom(demons) {
        let res = '';

        for(let demon of demons) {
            if(demon.skill2 == this.name || demon.skill3 == this.name) {
                res += demon.name + ", ";
            }
            if(demon.awakenC == this.name) {
                res += demon.name + " (C), ";
            }
            if(demon.awakenR == this.name) {
                res += demon.name + " (R), ";
            }
            if(demon.awakenP == this.name) {
                res += demon.name + " (P), ";
            }
            if(demon.awakenY == this.name) {
                res += demon.name + " (Y), ";
            }
            if(demon.awakenT == this.name) {
                res += demon.name + " (T), ";
            }
        }

        if(res.length > 0) res = "Innate: " + res.slice(0, -2);
        return res;
    }

    transferFrom(demons) {
        let res = '';

        for(let demon of demons) {
            if(demon.skill1 == this.name) {
                res += demon.name + ", ";
            }
            if(demon.gachaR == this.name) {
                res += demon.name + " (R), ";
            }
            if(demon.gachaP == this.name) {
                res += demon.name + " (P), ";
            }
            if(demon.gachaY == this.name) {
                res += demon.name + " (Y), ";
            }
            if(demon.gachaT == this.name) {
                res += demon.name + " (T), ";
            }

        }

        if(res.length > 0) res = "Transfer: " + res.slice(0, -2);
        return res;
    }

    async writeToDiscord(demons) {
        const innate = this.innateFrom(demons);
        const transfer = this.transferFrom(demons);
        if(innate) this.desc += '\n' + innate;
        if(transfer) this.desc += '\n' + transfer;

        const embed = new EmbedBuilder()
            .setTitle(this.name)
            .setDescription(this.desc)
            .addFields(
                {name: 'Element:', value: this.element, inline: true},
                {name: 'Cost:', value: this.cost, inline: true},
                {name: 'Target:', value: this.target, inline: true},
                {name: 'SP:', value: this.points, inline: true})
            .setURL(`https://dx2wiki.com/index.php/${encodeURI(this.name.replace('[', '(').replace(']', ')').replace('(', '%28').replace(')', '%29'))}`)
            .setColor('Blue');
        if(this.uses) {
            embed.addFields({name: 'Use Limit:', value: this.uses, inline: true});
        }
        console.log(this.names);
        if(this.names[0] && this.names.length > 0) {
            embed.setFooter({text: 'Nicknames: ' + this.names.join(", ")});
        }
        if(['Resist', 'Null', 'Repel', 'Drain'].some(rst => this.name.includes(rst))) {
            embed.setFooter({text: `If you're looking for all demons that ${this.name}, consider using /dx2resist`});
        }

        return embed;
    }

    static async skills() {
        const csv = await fetch('https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT%20Dx2%20Database%20-%20Skills.csv').then(r => r.text());
        const data = parse(csv); //Normal skills
        const csvA = await fetch('https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT%20Dx2%20Database%20-%20Armaments%20Skills.csv').then(r => r.text());
        const data2 = parse(csvA); //Armament skills

        let _skills = [];
        for(let s of data) {
            _skills.push(new Skill(s, false));
        }
        for(let s of data2) {
            _skills.push(new Skill(s, true));
        }

        return _skills;
    }
}