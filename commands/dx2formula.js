const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dx2formula')
        .setDescription('Returns the given formula')
        .addSubcommand(subcommand =>
            subcommand.setName('dmg')
                .setDescription('Returns the standard damage formula'))
        .addSubcommand(subcommand => 
            subcommand.setName('acc')
                .setDescription('Returns the standard accuracy formula'))
        .addSubcommand(subcommand => 
            subcommand.setName('buff')
                .setDescription('Returns the buff formula'))
        .addSubcommand(subcommand =>
            subcommand.setName('counter')
                .setDescription('Returns the counter formula'))
        .addSubcommand(subcommand =>
            subcommand.setName('crit')
                .setDescription('Returns the crit chance fomula'))
        .addSubcommand(subcommand =>
            subcommand.setName('heal')
                .setDescription('Returns the heal formula'))
        .addSubcommand(subcommand =>
            subcommand.setName('inf')
                .setDescription('Returns the ailment infliction formula'))
        .addSubcommand(subcommand =>
            subcommand.setName('speed')
                .setDescription('Returns the speed formula'))
        .addSubcommand(subcommand =>
            subcommand.setName('stat')
                .setDescription('Returns the base stat formulas')),
    
    async execute(interaction) {
        const type = interaction.options.getSubcommand();
        var title, formula;
        switch(type) {
            case 'acc':
                title = 'Standard Accuracy Formula';
                formula = "`TEMP ACCURACY = BASE SKILL ACCURACY * (FUNCTION1(USER AGI - ENEMY AGI) + FUNCTION2(USER LUCK - ENEMY LUCK)) * (1 + USER AGI RATIO - ENEMY AGI RATIO)\n" +
                        "FINAL ACCURACY = TEMP ACCURACY + ACC BRANDS + ACC SKILLS - EVASION BRANDS - EVASION SKILLS\n" +
                        "MINIMUM ACCURACY = 100 * BASE SKILL ACCURACY * 0.2\n" + 
                        "There is a minimum hit chance, and it will take either MINIMUM ACCURACY or FINAL ACCURACY depending on what's higher.`";
                break;
            case 'buff':
                title = 'Buff (-kaja/-kunda) Ratios'
                formula = "`Rakukaja = x0.8 damage taken\n" +
                        "Tarunda = x0.8 damage dealt\n" +
                        "Rakukaja + Tarunda (Enemy) = x0.6 damage taken\n" +
                        "Tarukaja = x1.2 damage dealt\n" +
                        "Rakunda = x1.2 damage taken\n" +
                        "Tarukaja + Rakunda (Enemy) = x1.4 damage dealt`";
                break;
            case 'counter':
                title = 'Counter Chance'
                formula = "`Counter Chance is rolled sequentially and separately, starting from the highest tier Counter first (Death Counter>Retaliate>Counter) regardless of slot order.\n" +
                        "100% Counters like Faithful Counter or Zealous Rebel guarantee a counter, but a demon cannot counter more than once per hit`";
                break;
            case 'crit':
                title = 'Crit Chance Formula';
                formula = "`CRIT CHANCE = CRIT LUK VALUE + BASE SKILL CRIT CHANCE + PASSIVE SKILLS/PANEL CRIT CHANCE + CRIT BRANDS - ENEMY CRIT REDUC SKILLS/PANEL + Dx2 CRIT SKILL\n" +
                        "LUCK DIFF = USER LUCK - LUCK`";
                break;
            case 'heal':
                title = 'Healing Formula';
                formula = "`HEALING FORMULA = (MATK * (HEAL POWER * (1 + % HEALING MODIFIERS FROM SKILL LEVELS) / 100) * HEALING_CONST + MIN_HEAL_VAL) * RANDOM_HEA_VAR * (1 + % HEAL MODIFIERS)`";
                break;
            case 'inf':
                title = 'Ailment Infliction Chance Formula';
                formula = "`If the target is currently inflicted with weak, AILMENT CHANCE is 100%, but weak cannot override immunities.\n" +
                        "USER INFLICTION BOOST = AILMENT INFLICT PASSIVES + BRAND AILMENT INFLICT + AILMENT INFLICT FROM SKILL LEVELS + AILMENT INFLICT PANELS\n" +
                        "ENEMY AILMENT RESISTS = AILMENT RESIST PASSIVES + BRAND AILMENT RESISTS + AILMENT RESISTS PANELS + Dx2 AILMENT RESISTS SKILLS + CURRENT AILMENT RESIST BUFFS\n" +
                        "MINIMUM AILMENT CHANCE = floor(SKILL AILMENT RATE * 0.3)\n" +
                        "AILMENT CHANCE = floor(SKILL AILMENT RATE + ((USER LUCK - ENEMY LUCK) * 0.3)) + USER INFLICTION BOOST - ENEMY AILMENT RESISTS\n" +
                        "Some demons may have some innate ailment resistances (likely PvE only), modifying the above AILMENT CHANCE:\n" +
                        "AILMENT CHANCE = floor(AILMENT CHANCE * ((100 - DEMON AILMENT RESISTS) / 100))\n" +
                        "It will use the greater of either MINIMUM AILMENT CHANCE or AILMENT CHANCE to determine the chance of an ailment being successful.`";
                break;
            case 'speed':
                title = 'Battle Speed Formula';
                formula = "`Party battle speed is first calculated at an individual demon level, then at a party level.\n" +
                        "INDIVIDUAL DEMON SPEED = (DEMON AGILITY + SKILL AGILITY + MITAMA AGILITY + SIN INFUSION AGILITY) * ((SKILL SPEED PERCENT + BRAND SPEED PERCENT + PANEL PERCENT) / 100)\n" +
                        "PARTY SPEED TOTAL = INDIVIDUAL DEMON SPEED TOTAL / PARTY COUNT (It's an average)`";
                break;
            case 'stat':
                title = 'Base Stat Formulas';
                formula = "`HP = VIT * 4.7 + LVL * 7.4\n" +
                        "PATK = STR * 2.1 + LVL * 5.6 + 50\n" +
                        "MATK = MAG * 2.1 + LVL * 5.6 + 50\n" +
                        "PDEF = VIT * 1.1 + STR * 0.5 + LVL * 5.6 + 50\n" +
                        "MDEF = VIT * 1.1 + MAG * 0.5 + LVL * 5.6 + 50`";
                break;
            default:
                title = 'Standard Damage Formula';
                formula = "`DAMAGE BOOSTS = 0 + BOOSTS FROM PASSIVES + BOOSTS FROM SKILL LEVELS + BOOSTS FROM Dx2 SKILLS\n" +
                        "CHARGE_CONC MODIFIER = 0 + CHARGE/CONC VALUE + CHARGE/CONC INCREASE FROM Dx2 SKILLS\n" +
                        "CRIT MODIFIER = 1 OR 1.5 IF A CRIT OCCURS\n" +
                        "TEMP STAT VALUE = USER ATK * SKILL ATK COEFF + USER OTHER STAT VALUE * SKILL OTHER STAT COEEF\n" +
                        "STAT VALUE = max(TEMP STAT VALUE - (ENEMY DEF * 0.5), 0) * (1 + USER ATK RATIO - ENEMY DEF RATIO)\n" +
                        "MIN STAT VALUE = TEMP STAT VALUE * 0.25\n" +
                        "FINAL STAT VALUE = max(STAT VALUE, MIN STAT VALUE)\n" +
                        "DAMAGE VARIANCE RATIO = random value between 0.95 and 1.05\n" +
                        "RESISTANCE MODIFIER:\n" +
                        "1.5 if hitting a weakness,\n" +
                        "0.7 if hitting a resist,\n" +
                        "0 for Null,\n" +
                        "1 otherwise\n\n" +
                        "FINAL DAMAGE = FINAL STAT VALUE * BASE SKILL POWER * CRIT MODIFIER * RESISTANCE MODIFIER * 0.4 * DAMAGE VARIANCE RATIO * ((100 + DAMAGE BOOSTS)/100) * ((100 + CHARGE_CONC MODIFIER)/100)`";
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(formula);
        
        if(type == 'acc') {
            embed.addFields(
                {name: 'FUNCTION1(DIFF_AGI):',
                value: "`102 if DIFF_AGI >= 256\n" +
                        "100 if DIFF_AGI >= 40\n" +
                        "98 if DIFF_AGI >= 30\n" +
                        "96 if DIFF_AGI >= 20\n" +
                        "94 if DIFF_AGI >= 10\n" +
                        "92 if DIFF_AGI >= 0\n" +
                        "88 if DIFF_AGI >= -20\n" +
                        "84 if DIFF_AGI >= -40\n" +
                        "80 if DIFF_AGI >= -60\n" +
                        "76 if DIFF_AGI < -60`",
                inline: true},
                {name: 'FUNCTION2(DIFF_LUCK)',
                value: "`13 if DIFF_LUK >= 256\n" +
                        "11 if DIFF_LUK >= 30\n" +
                        "9 if DIFF_LUK >= 20\n" +
                        "7 if DIFF_LUK >= 10\n" +
                        "5 if DIFF_LUK >= 0\n" +
                        "0 if DIFF_LUK >= -30\n" +
                        "-5 if DIFF_LUK < -30`",
                inline: true});
        }
        if(type == 'crit') {
            embed.addFields(
                {name: 'CRIT LUK DIFF',
                value: "`20 if LUCK DIFF >= 30\n" +
                        "15 if LUCK DIFF >= 20\n" +
                        "10 if LUCK DIFF >= 10\n" +
                        "0 if LUCK DIFF >= 0\n" +
                        "-10 if LUCK DIFF < 0`"}
            );
        }
        embed.setURL('https://dx2wiki.com/index.php/Formulas');

        await interaction.reply({embeds: [embed]});
    }
}