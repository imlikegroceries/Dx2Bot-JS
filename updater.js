
const { readWiki } = require('./tierlistReader');
const { readBanners } = require('./bannerCSV');
const {parse} = require('csv-parse');
const { createWriteStream } = require('node:fs');
const { once, EventEmitter } = require('node:events');

module.exports = async function updateBot() {
    const tierList = await readWiki();
    const banner = await readBanners(20);
    const demons = await demonNames();
    const skills = await skillNames();
    const armaments = await armNames();

    console.log(new Date());
    console.log({ tierList, banner, demons, skills, armaments });
    return { tierList, banner, demons, skills, armaments };
}

async function demonNames() {
    let i = 0;
    const data = await fetch('https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Demons.csv').then(r => r.text());
    const file = createWriteStream('./names/demon.txt');
    const ee = new EventEmitter();

    parse(data)
        .on('readable', function() {
            let record = this.read();
            while( (record = this.read()) != null) {
                file.write(record[0] + "\n");
                i++;
            }
        })
        .on('end', () => {
            console.log(`Recorded ${i} demons`);
            ee.emit('return', i);
        });

    return once(ee, 'return').then(([r]) => r);
}

async function skillNames() {
    let i = 0;
    const data = await fetch('https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Skills.csv').then(r => r.text());
    const data2 = await fetch('https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Armaments Skills.csv').then(r => r.text());
    const file = createWriteStream('./names/skill.txt');
    const ee = new EventEmitter();

    parse(data)
        .on('readable', function() {
            let record = this.read();
            while( (record = this.read()) != null) {
                file.write(record[1] + "\n");
                i++;
            }
        });

    parse(data2)
        .on('readable', function() {
            let record = this.read();
            while((record = this.read()) != null) {
                file.write(record[1] + "\n");
                i++;
            }
        })
        .on('end', () => ee.emit('return', i));

    return once(ee, 'return').then(([r]) => r);
}

async function armNames() {
    let i = 0;
    const data = await fetch('https://raw.githubusercontent.com/Alenael/Dx2DB/master/csv/SMT Dx2 Database - Swords.csv').then(r => r.text());
    const file = createWriteStream('./names/armament.txt');
    const ee = new EventEmitter();

    parse(data)
        .on('readable', function() {
            let record = this.read();
            while((record = this.read()) != null) {
                file.write(record[0] + '\n');
                i++;
            }
        })
        .on('end', () => ee.emit('return', i));

    return once(ee, 'return').then(([r]) => r);
}