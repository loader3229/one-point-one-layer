addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#31aeb0",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent(){
        let eff=new Decimal(0);
        eff=eff.add(layers.e.buyables[11].effect()[1]).add(challengeEffect("h",11));
        if(!hasMilestone("h",17))eff=eff.add(challengeEffect("h",21));
        let muleff = new Decimal(1);
        if(hasMilestone("h",17))muleff=muleff.mul(challengeEffect("h",21));
        let ret=new Decimal(4).add(eff).mul(muleff);
        if(hasMilestone("sp",11)){
            if(hasMilestone("sp",13))eff = eff.add(player.sp.points.add(1).log10());
            ret=new Decimal(10).add(eff).mul(player.points.pow(2).div(50)).mul(muleff);
        }else if(hasMilestone("h",5)){
            let ret2=eff.mul(player.points.pow(2).div(50)).mul(muleff);
            ret=ret.max(ret2);
        }
        return ret;
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        if(inChallenge("h",21))return new Decimal(0);
        mult = new Decimal(1)
        if(hasUpgrade("b",11))mult=mult.mul(upgradeEffect("b",11));
        if(hasUpgrade("g",11))mult=mult.mul(upgradeEffect("g",11));
        if(hasUpgrade("p",21))mult=mult.mul(2);
        if(hasUpgrade("p",23))mult=mult.mul(upgradeEffect("p",23));
        if(hasUpgrade("p",41))mult=mult.mul(upgradeEffect("p",41));
        if(hasUpgrade("b",31))mult=mult.mul(upgradeEffect("b",31));
        if(hasUpgrade("e",12))mult=mult.mul(upgradeEffect("e",12));
        if(hasUpgrade("g",25))mult=mult.mul(upgradeEffect("g",25));
        if(hasUpgrade("t",25))mult=mult.mul(upgradeEffect("t",25));
        if(hasUpgrade("sp",12))mult=mult.mul(upgradeEffect("sp",12));
        mult=mult.mul(layers.t.powerEff());
        mult=mult.mul(layers.s.buyables[12].effect());
        return mult
    },
        gainExp() { // Calculate the exponent on main currency from bonuses
            let exp = new Decimal(1)
            if (hasUpgrade("p", 31)) exp = exp.times(1.05);
            return exp;
        },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
        upgrades: {
            rows: 4,
            cols: 4,
            11: {
                title: "Begin",
                description: "Generate points based on Prestige Points.",
                cost() { return new Decimal(1); },
            },
            12: {
                title: "Prestige Boost",
                description: "Prestige Points boost Point generation.",
                cost() { return new Decimal(1); },
                effect() {
                    let eff = player.p.points.plus(3).pow(0.5);
                    if (hasUpgrade("g", 14)) eff = eff.pow(1.5);
                    if (hasUpgrade("g", 24)) eff = eff.pow(4/3);
                    return eff;
                },
                unlocked() { return hasUpgrade("p", 11) },
                effectDisplay() { return format(tmp.p.upgrades[12].effect)+"x" },
            },
            13: {
                title: "Self-Synergy",
                description: "Points boost their own generation.",
                cost() { return new Decimal(500); },
                effect() { 
                    let eff = player.points.plus(1);
                    if (hasUpgrade("g", 15)) eff = eff.pow(upgradeEffect("g", 15));
                    if (hasUpgrade("p", 33)) eff = eff.pow(upgradeEffect("p", 33));
                    if (hasUpgrade("sp",13)) eff = eff.pow(3);
                    return eff;
                },
                unlocked() { return hasUpgrade("p", 12) },
                effectDisplay() { return format(tmp.p.upgrades[13].effect)+"x" },
            },
            14: {
                title: "Prestigious Intensity",
                description: "<b>Column Leader</b>'s effect is better.",
                cost() { return new Decimal("1e30000"); },
                unlocked() { return hasMilestone("sp", 6) && hasUpgrade("p", 13) },
            },
            21: {
                title: "More Prestige",
                description() { return "Prestige Point gain is doubled." },
                cost() { return new Decimal(10000); },
                unlocked() { return hasUpgrade("p", 13) },
            },
            22: {
                title: "Upgrade Power",
                description: "Point generation is faster based on your Prestige Upgrades bought.",
                cost() { return new Decimal(1e11); },
                effect() {
                    let eff = Decimal.pow(hasUpgrade("p",32)?3:1.5, player.p.upgrades.length);
                    return eff;
                },
                unlocked() { return hasUpgrade("p", 21) },
                effectDisplay() { return format(tmp.p.upgrades[22].effect)+"x" },
            },
            23: {
                title: "Reverse Prestige Boost",
                description: "Prestige Point gain is boosted by your Points.",
                cost() { return new Decimal(1e26); },
                effect() {
                    let eff = player.points.plus(1);
                    if (hasUpgrade("g", 23)) eff = eff.pow(upgradeEffect("g", 23));
                    if (hasUpgrade("p", 33)) eff = eff.pow(upgradeEffect("p", 33));
                    if (hasUpgrade("sp",23)) eff = eff.pow(3);
                    return eff;
                },
                unlocked() { return hasUpgrade("p", 22) },
                effectDisplay() { return format(tmp.p.upgrades[23].effect)+"x" },
            },
            24: {
                title: "Plasmic Energies",
                description: "The Tachoclinal Plasma effect uses a better formula.",
                cost() { return new Decimal("1e40000") },
                unlocked() { return hasUpgrade("p", 14) },
            },
            31: {
                title: "WE NEED MORE PRESTIGE",
                description: "Prestige Point gain is raised to the power of 1.05.",
                cost() { return new Decimal(1e29); },
                unlocked() { return hasUpgrade("p", 23) },
            },
            32: {
                title: "Still Useless",
                description: "<b>Upgrade Power</b> is boosted.",
                cost() { return new Decimal(1e33); },
                unlocked() { return hasUpgrade("p", 31) },
            },
            33: {
                title: "Column Leader",
                description: "Both above upgrades are stronger based on your Total Prestige Points.",
                effect() { return player.p.total.plus(1).log10().plus(1).log10().div(hasUpgrade("p",14)?1:5).plus(1) },
                cost() { return new Decimal(1e53); },
                unlocked() { return hasUpgrade("p", 32) },
                effectDisplay() { return "^"+format(tmp.p.upgrades[33].effect) },
            },
			34: {
				title: "Solar Potential",
				description: "Solarity multiplies the Solarity gain exponent.",
                cost() { return new Decimal("1e102400"); },
                unlocked() { return hasUpgrade("p", 24) },
				effect() { return player.o.points.plus(1).log10().plus(1).log10().plus(1).log10().plus(1) },
				effectDisplay() { return format(tmp.p.upgrades[34].effect)+"x" },
			},
            41: {
                title: "Prestige Recursion",
                description: "Prestige Points boost their own gain.",
                cost() { return new Decimal("1e38000"); },
                unlocked() { return hasMilestone("sp", 6) && hasUpgrade("p", 31) },
                effect() { 
                    let eff = Decimal.pow(10, player.p.points.plus(1).log10().pow(0.6));
                    return eff;
                },
                effectDisplay() { return format(tmp.p.upgrades[41].effect)+"x" },
            },
			42: {
				title: "Spatial Awareness",
				description: "Space Buildings are cheaper.",
                cost() { return new Decimal("1e60000"); },
				unlocked() { return hasUpgrade("p", 41) },
			},
			43: {
				title: "More Discount",
				description: "Boosters are cheaper.",
                cost() { return new Decimal("1e190000"); },
				unlocked() { return hasUpgrade("p", 42) },
			},


        },
    layerShown(){return true},
    
        doReset(resettingLayer) {
            let keep = [];
            if (hasMilestone("t", 1)) keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
        },
        passiveGeneration() { return (hasMilestone("t", 2)?1:0) },
})


addLayer("b", {
        name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#6e64c4",
        requires() { return new Decimal(2) }, // Can be a function that takes requirement increases into account
        resource: "boosters", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["p"],
        exponent() { if(player.h.challenges[12]>=16)return 5/Math.min(player.h.challenges[12],17.8); if(player.h.challenges[12]>=9)return 4.5/Math.min(player.h.challenges[12],14); return 0.5 }, // Prestige currency exponent
        base() { 
            let ret=1.3;
            if(hasUpgrade("b",23))ret-=0.01;
            if(hasMilestone("h",2))ret-=0.02;
            if(hasMilestone("h",20))ret-=0.005;
            if(hasMilestone("sp",8))ret-=0.01;
            if(hasUpgrade("q",33))ret-=0.005;
            if(hasUpgrade("p",43))ret-=0.01;
            return ret;
        },
        gainMult() { 
            let mult = new Decimal(1);
            return mult;
        },
        canBuyMax() { return player.t.unlocked },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
        {key: "b", description: "B: Reset for boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.p.unlocked},
        automate() {},
        autoPrestige() { return hasMilestone("s",1) },
        resetsNothing() { return hasMilestone("s",1) },
        addToBase() {
            let base = new Decimal(0);
            if (hasUpgrade("b", 12)&&!hasMilestone("h",9)) base = base.plus(upgradeEffect("b", 12));
            if (hasUpgrade("b", 13)&&!hasMilestone("h",9)) base = base.plus(upgradeEffect("b", 13));
            if (hasUpgrade("t", 11)&&!hasMilestone("q",34)) base = base.plus(upgradeEffect("t", 11));
            if (hasUpgrade("e", 11)&&!hasUpgrade("e", 14)) base = base.plus(upgradeEffect("e", 11).b);
            if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect()[0]);
            if (hasUpgrade("s",14)&&!hasMilestone("hs",1)) base = base.plus(buyableEffect("s", 13));
            if(!hasMilestone("h",15))base = base.add(challengeEffect("h",12));
            return base;
        },
        effectBase() {
            let base = new Decimal(2);
            
            base = base.plus(tmp.b.addToBase);
            
            if (player.sb.unlocked) base = base.times(tmp.sb.effect);
            if (hasUpgrade("b", 12)&&hasMilestone("h",9)) base = base.times(upgradeEffect("b", 12));
            if (hasUpgrade("b", 13)&&hasMilestone("h",9)) base = base.times(upgradeEffect("b", 13));
            if (hasUpgrade("t", 11)&&hasMilestone("q",34)) base = base.plus(upgradeEffect("t", 11));
            if (hasUpgrade("e", 11)&&hasUpgrade("e", 14)) base = base.times(upgradeEffect("e", 11).b);
            if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
            if (hasMilestone("h",15))base = base.times(challengeEffect("h",12));
            if (player.m.unlocked) base = base.times(buyableEffect("m", 11));
            if (hasUpgrade("s",14)&&hasMilestone("hs",1)) base = base.times(buyableEffect("s", 13));
            return base;
        },
        effect() {
            if(inChallenge("h", 12))return new Decimal(1);
            if (player[this.layer].unlocked)return Decimal.pow(tmp.b.effectBase, player.b.points);
            return new Decimal(1);
        },
        effectDescription() {
            return "which are boosting Point generation by "+format(tmp.b.effect)+"x"+" ("+format(tmp.b.effectBase)+"x each)"
        },
        doReset(resettingLayer) {
            let keep = [];
            if (hasMilestone("t", 3)) keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset("b", keep)
        },
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }},
        upgrades: {
            rows: 3,
            cols: 4,
            11: {
                title: "BP Combo",
                description: "Best Boosters boost Prestige Point gain.",
                cost() { return new Decimal(3) },
                effect() { 
                    let ret = player.b.best.plus(1);
                    if (hasUpgrade("b", 32)) ret = Decimal.pow(1.2, player.b.best).times(ret);
                    if (hasUpgrade("b", 33)) ret = Decimal.pow(2/1.2, player.b.best).times(ret);
                    return ret;
                },
                unlocked() { return player.b.unlocked },
                effectDisplay() { return format(tmp.b.upgrades[11].effect)+"x" },
            },
            12: {
                title: "Cross-Contamination",
                description(){
                    if(hasMilestone("h",9))return "Generators multiplies the Booster effect base.";
                    return "Generators add to the Booster effect base."
                },
                cost() { return new Decimal(12) },
                effect() {
                    let ret = player.g.points.add(1).log10();
                    if(hasMilestone("h",9))ret=ret.add(1);
                    return ret;
                },
                unlocked() { return player.b.unlocked&&player.g.unlocked },
                effectDisplay() { if(hasMilestone("h",9))return format(tmp.b.upgrades[12].effect)+"x";return "+"+format(tmp.b.upgrades[12].effect) },
            },
            13: {
                title: "PB Reversal",
                description(){
                    if(hasMilestone("h",9))return "Total Prestige Points multiplies the Booster effect base."
                    return "Total Prestige Points add to the Booster effect base."
                },
                cost() { return new Decimal(14) },
                effect() { 
                    let ret = player.p.total.add(1).log10().add(1).log10();
                    if(hasMilestone("h",9))ret=ret.add(1);
                    return ret;
                },
                unlocked() { return player.b.unlocked&&player.b.best.gte(7) },
                effectDisplay() { if(hasMilestone("h",9))return format(tmp.b.upgrades[13].effect)+"x";return "+"+format(tmp.b.upgrades[13].effect) },
            },
            21: {
                title: "Generator Power Boost",
                description: "Generator Power effect ^1.28",
                cost() { return new Decimal(17) },
                unlocked() { return hasUpgrade("b", 11) && hasUpgrade("b", 12) },
            },
            22: {
                title: "Generator Power Boost II",
                description: "Generator Power effect ^1.25",
                cost() { return new Decimal(22) },
                unlocked() { return hasUpgrade("b", 21) },
            },
            23: {
                title: "Discount One",
                description: "Boosters are cheaper.",
                cost() { return new Decimal(26) },
                unlocked() { return hasUpgrade("b", 22) },
            },
            31: {
                title: "Worse BP Combo",
                description: "Super Boosters boost Prestige Point gain.",
                cost() { return new Decimal(29) },
                unlocked() { return player.sb.unlocked },
                effect() { 
                    return Decimal.pow(10, player.sb.points.pow(1.5)); 
                },
                effectDisplay() { return format(tmp.b.upgrades[31].effect)+"x" },
            },
            32: {
                title: "Better BP Combo",
                description() { return "<b>BP Combo</b> uses a better formula." },
                cost() { return new Decimal(35) },
                unlocked() { return player.sb.unlocked },
            },
            33: {
                title: "Better BP Combo II",
                description() { return "<b>BP Combo</b> uses a better formula." },
                cost() { return new Decimal(45) },
                unlocked() { return player.sb.unlocked },
            },
        },
})



addLayer("g", {
        name: "generators", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#a3d9a5",
        requires() { return new Decimal(hasUpgrade("g",22)?2.85:3) }, // Can be a function that takes requirement increases into account
        resource: "generators", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["p"],
        exponent() { if(player.h.challenges[12]>=16)return 5/Math.min(player.h.challenges[12],17.8); if(player.h.challenges[12]>=9)return 4.5/Math.min(player.h.challenges[12],14); return 0.5 }, // Prestige currency exponent
        base() { return 1.2 },
        gainMult() { 
            let mult = new Decimal(1);
            return mult;
        },
        canBuyMax() { return player.t.unlocked },
        autoPrestige() { return hasMilestone("s",1) },
        resetsNothing() { return hasMilestone("s",1) },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
        {key: "g", description: "G: Reset for generators", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.b.unlocked},
        automate() {},
        effectBase() {
            let base = new Decimal(2);
            
            if (hasUpgrade("g", 12)) base = base.plus(upgradeEffect("g", 12));
            if (hasUpgrade("g", 13)) base = base.plus(upgradeEffect("g", 13));
            if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).g);
            if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect()[0]);
            if (hasUpgrade("s",14)&&!hasMilestone("hs",1)) base = base.plus(buyableEffect("s", 13));
            
            if (hasUpgrade("s",14)&&hasMilestone("hs",1)) base = base.times(buyableEffect("s", 13));
            if (player.sg.unlocked) base = base.times(tmp.sg.effect);
            if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
            return base;
        },
        effect() {
            if(inChallenge("h", 12))return new Decimal(0);
            if (player[this.layer].unlocked){
                let eff=Decimal.pow(tmp.g.effectBase, player.g.points).mul(player.g.points);
                
                if (hasUpgrade("g", 21)) eff = eff.times(upgradeEffect("g", 21));
                if (hasUpgrade("s", 12)) eff = eff.times(upgradeEffect("s", 12));
                if (hasUpgrade("s", 13)) eff = eff.times(upgradeEffect("s", 13));
                if (hasUpgrade("t", 15)) eff = eff.times(layers.t.powerEff());
            if (player.q.unlocked) eff = eff.times(tmp.q.enEff);
                return eff;
            }
            return new Decimal(0);
        },
        powerEff() {
            if (!player[this.layer].unlocked) return new Decimal(1);
            let ret=softcap(player.g.power.plus(1),new Decimal('1e320'),0.5);
            if(player.m.unlocked)ret=player.g.power.plus(1).pow(0.5);
            if(hasUpgrade("b",21))ret=ret.pow(1.28);
            if(hasUpgrade("b",22))ret=ret.pow(1.25);
            if(hasUpgrade("q",13))ret=ret.pow(1.25);
            return ret;
        },
        effectDescription() {
            return "which are generating "+format(tmp.g.effect)+" Generator Power/sec"
        },
        doReset(resettingLayer) {
            let keep = [];
            if (hasMilestone("s", 0)) keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset("g", keep)
        },
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            power: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }},
        upgrades: {
            rows: 3,
            cols: 5,
            11: {
                title: "GP Combo",
                description: "Best Generators boost Prestige Point gain.",
                cost() { return new Decimal(3) },
                effect() { 
                    let ret = player.g.best.plus(1);
                    return ret;
                },
                unlocked() { return player.g.unlocked },
                effectDisplay() { return format(tmp.g.upgrades[11].effect)+"x" },
            },
            12: {
                title: "I Need More!",
                description: "Boosters add to the Generator base.",
                cost() { return new Decimal(12) },
                effect() { 
                    let ret = player.g.points.add(1).log10();
                    if(hasUpgrade("s",24))ret = ret.mul(upgradeEffect("s",24));
                    return ret;
                },
                unlocked() { return player.b.unlocked&&player.g.unlocked },
                effectDisplay() { return "+"+format(tmp.g.upgrades[12].effect) },
            },
            13: {
                title: "I Need More II",
                description: "Best Prestige Points add to the Generator base.",
                cost() { return new Decimal(14) },
                effect() { 
                    let ret = player.p.best.add(1).log10().add(1).log10();
                    if(hasUpgrade("s",24))ret = ret.mul(upgradeEffect("s",24));
                    return ret;
                },
                unlocked() { return player.g.best.gte(8) },
                effectDisplay() { return "+"+format(tmp.g.upgrades[13].effect) },
            },
            14: {
                title: "Boost the Boost",
                description() { return "<b>Prestige Boost</b> is raised to the power of 1.5." },
                cost() { return new Decimal(17) },
                unlocked() { return player.g.best.gte(10) },
            },
            15: {
                title: "Outer Synergy",
                description: "<b>Self-Synergy</b> is stronger based on your Generators.",
                cost() { return new Decimal(22) },
                effect() { 
                    let eff = player.g.points.pow(hasMilestone("h",8)?0.68:0.5).add(1);
                    return eff;
                },
                unlocked() { return hasUpgrade("g", 13) },
                effectDisplay() { return "^"+format(tmp.g.upgrades[15].effect) },
            },
            21: {
                title: "I Need More III",
                description: "Generator Power boost its own generation.",
                cost() { return new Decimal(24) },
                effect() { 
                    let ret = player.g.power.add(1).log10().add(1);
                    if(hasUpgrade("s",24))ret = ret.pow(upgradeEffect("s",24));
                    return ret;
                },
                unlocked() { return hasUpgrade("g", 15) },
                effectDisplay() { return format(tmp.g.upgrades[21].effect)+"x" },
            },
            22: {
                title: "Discount Two",
                description: "Generators are cheaper.",
                cost() { return new Decimal(27) },
                unlocked() { return hasUpgrade("g", 15) },
            },
            23: {
                title: "Double Reversal",
                description: "<b>Reverse Prestige Boost</b> is stronger based on your Boosters.",
                cost() { return new Decimal(39) },
                effect() { return player.b.points.pow(hasMilestone("h",8)?0.68:0.3).add(1) },
                unlocked() { return hasUpgrade("g", 15)&&player.b.unlocked },
                effectDisplay() { return "^"+format(tmp.g.upgrades[23].effect) },
            },
            24: {
                title: "Boost the Boost Again",
                description: "<b>Prestige Boost</b> is raised to the power of 1.3333.",
                cost() { return new Decimal(44) },
                unlocked() { return hasUpgrade("g", 14)&&(hasUpgrade("g", 21)||hasUpgrade("g", 22)) },
            },
            25: {
                title: "Better GP Combo",
                description: "Generator Power boost Prestige Points.",
                cost() { return new Decimal(49) },
                effect() { 
                    if(player.sp.unlocked)return player.g.power.add(1);
                    let eff = player.g.power.add(1).pow(player.g.power.add(10).log10().div(1000).pow(2).min(1));
                    return eff;
                },
                unlocked() { return hasUpgrade("g", 24)&&hasUpgrade("g",15) },
                effectDisplay() { return format(tmp.g.upgrades[25].effect)+"x" },
            },

        },
        tabFormat: ["main-display",
            "prestige-button",
            "blank",
            ["display-text",
                function() {return 'You have ' + format(player.g.power) + ' Generator Power, which boosts Point generation by '+format(tmp.g.powerEff)+'x'},
                    {}],
            "blank",
            ["display-text",
                function() {return 'Your best Generators is ' + formatWhole(player.g.best) + '<br>You have made a total of '+formatWhole(player.g.total)+" Generators."},
                    {}],
            "blank",
            "milestones", "blank", "blank", "upgrades"],
        update(diff) {
            if (player.g.unlocked) player.g.power = player.g.power.plus(tmp.g.effect.times(diff));
        },
})



addLayer("t", {
        name: "time", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#006609",
        requires() { return new Decimal(4) }, // Can be a function that takes requirement increases into account
        resource: "time capsules", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["b"],
        exponent() { 
            a=0.75;
            if(player.h.challenges[22]>=10.5)a=a*10/Math.min(player.h.challenges[22],16);
            if(hasUpgrade("q",31))a=a/(player.q.buyables[11].add(1).log10().mul(0.01).toNumber()+1);
            return a;
        }, // Prestige currency exponent
        base() { return 1.1 },
        gainMult() { 
            let mult = new Decimal(1);
            return mult;
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
        {key: "t", description: "T: Reset for time capsules", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.g.unlocked},
        automate() {},
        effectBase() {
            let base = new Decimal(2);
            if(hasMilestone("q",12))base = base.plus(1)
            if(hasUpgrade("t",21))base = base.plus(1)
            if(hasUpgrade("t",23))base = base.mul(challengeEffect("h",22));
            else base = base.add(challengeEffect("h",22));
            base = base.mul(tmp.ba.posBuff);
            if (player.m.unlocked) base = base.times(buyableEffect("m", 12));
            if (player.i.buyables[11].gte(1)) base = base.times(buyableEffect("s", 21));
            return base;
        },
        effect() {
            if(inChallenge("h", 22))return new Decimal(0);
            if (player[this.layer].unlocked){
                let gain=Decimal.pow(tmp.t.effectBase,layers.t.effect1()).mul(layers.t.effect1());
                if (player.h.unlocked) gain = gain.mul(layers.h.effect());
                if (hasUpgrade("t",22)) gain = gain.mul(upgradeEffect("t",22));
                gain = gain.mul(tmp.o.solEnEff);
                gain = gain.mul(tmp.t.powerEff2);
                return gain;
            }
            return new Decimal(0);
        },
        effect1() {
            let ret = player[this.layer].points.add(player[this.layer].buyables[11]);
            return ret;
        },
        powerEff() {
            if (!player[this.layer].unlocked) return new Decimal(1);
            let ret=player.t.power.plus(1);
            
            if(hasUpgrade("t",14))ret = ret.pow(1.28)
            if(hasMilestone("hs",3))ret = ret.pow(1.25)
            return ret;
        },
        powerEff2() {
            if (!hasUpgrade("t",24)) return new Decimal(1);
            let ret=player.t.power.plus(1).log10().sqrt().div(2);
            if(hasMilestone("h",21))ret=player.t.power.plus(1).log10().pow(0.6);
            if(hasUpgrade("t",14))ret = ret.mul(1.28)
            if(hasMilestone("hs",3))ret = ret.mul(1.25)
            return Decimal.pow(2,ret);
        },
        effectDescription() {
            return "which are generating "+format(tmp.t.effect)+" Time Energy/sec"
        },
        doReset(resettingLayer) {
            let keep = [];
            if (player.q.unlocked) keep.push("milestones")
            if (hasMilestone("q",4)) keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset("t", keep)
        },
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            power: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }},
        tabFormat: {
            "Main Tab": {
                content:  ["main-display",
            "prestige-button",
                    "resource-display",
            "blank",
            ["display-text",
                function() {return 'You have ' + format(player.t.power) + ' Time Energy, which boosts Point & Prestige Point generation by '+format(tmp.t.powerEff)+'x '+(hasUpgrade("t",24)?("and boosting Time Energy gain by "+format(tmp.t.powerEff2)+'x'):"")},
                    {}],
            "blank",
            "buyables",
             "blank", "upgrades"]
            },
            "Milestones": {
                content: [
                    "main-display",
                    "prestige-button",
                    "resource-display",
                    "blank",
                    "milestones"]
            },
        },
        update(diff) {
            if (player.t.unlocked) player.t.power = player.t.power.plus(tmp.t.effect.times(diff));
            if (hasMilestone("q",8))player.t.buyables[11]=player.t.buyables[11].max(player.b.points.add(1).pow(1/1.5).sub(2).add(0.000001).floor());
        },
        milestones: {
            0: {
                requirementDescription: "1 Time Capsule",
                done() { return player.t.best.gte(1) },
                effectDescription: "You can buy max Boosters/Generators.",
            },
            1: {
                requirementDescription: "2 Time Capsules",
                done() { return player.t.best.gte(2) },
                effectDescription: "Keep Prestige Upgrades.",
            },
            2: {
                requirementDescription: "3 Time Capsules",
                done() { return player.t.best.gte(3) },
                effectDescription: "Gain 100% of prestige points per second.",
            },
            3: {
                requirementDescription: "4 Time Capsules",
                done() { return player.t.best.gte(4) },
                effectDescription: "Keep Booster Upgrades.",
            },
        },
        
    buyables: {
            rows: 1,
            cols: 1,
            11: {
                title: "Extra Time Capsules", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = x.add(3).pow(1.5).sub(1).ceil();
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let extra2 = tmp[this.layer].effect1.sub(player[this.layer].buyables[this.id]).sub(player[this.layer].points);
                    return "You have "+formatWhole(player[this.layer].buyables[this.id])+(extra2.gte(1)?("+"+formatWhole(extra2)):"")+" Extra Time Capsules.\n\
                    Cost for Next Extra Time Capsule: " + format(data.cost) + " Boosters";
                },
                unlocked() { return hasUpgrade("t",12) }, 
                canAfford() {
                    return player.b.points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.b.points = player.b.points.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px'},
            },
    },

        upgrades: {
            rows: 4,
            cols: 5,
            11: {
                title: "Pseudo-Boost",
                description(){
                    if(hasUpgrade("q",34))return "Non-extra Time Capsules multiplies the Booster base.";
                    return "Non-extra Time Capsules add to the Booster base."
                },
                cost() { return new Decimal(8) },
                unlocked() { return player.t.unlocked },
                effect() { 
                    let ret = player.t.points.pow(0.9).add(0.5).plus(hasUpgrade("t", 13)?upgradeEffect("t", 13):0);
                    if(hasUpgrade("q",34))ret=ret.add(1);
                    return ret;
                },
                effectDisplay() { if(hasUpgrade("q",34))return format(tmp.t.upgrades[11].effect)+"x";return "+"+format(tmp.t.upgrades[11].effect) }
            },
            12: {
                title: "Limit Stretcher",
                description: "Unlock Extra Time Capsules.",
                cost() { return new Decimal(11) },
                unlocked() { return player.t.best.gte(2) },
            },
            13: {
                title: "Pseudo-Pseudo-Boost",
                description: "Extra Time Capsules add to the <b>Pseudo-Boost</b>'s effect.",
                cost() { return new Decimal(13) },
                unlocked() { return hasUpgrade("t", 12) },
                effect() { 
                    return player.t.buyables[11].pow(0.95);
                },
                effectDisplay() { return "+"+format(tmp.t.upgrades[13].effect) },
            },
            14: {
                title: "More Time",
                description: "The Time Energy effect is raised to the power of 1.28.",
                cost() { return new Decimal(19) },
                unlocked() { return hasUpgrade("t", 13) },
            },
            15: {
                title: "Time Potency",
                description: "Time Energy affects Generator Power gain.",
                cost() { return new Decimal(20) },
                unlocked() { return hasUpgrade("t", 13) },
            },
            21: {
                title: "Weakened Chains",
                description: "The Time Capsule Base is added by 1.",
                cost() { return new Decimal(21) },
                unlocked() { return hasUpgrade("t", 15) },
            },
            22: {
                title: "Enhanced Time",
                description: "Enhance Points boost Time Energy's generation.",
                cost() { return new Decimal(29) },
                unlocked() { return hasUpgrade("t", 21) },
                effect() { 
                    return player.e.points.plus(1).root(10);
                },
                effectDisplay() { return format(tmp.t.upgrades[22].effect)+"x" },
            },
            23: {
                title: "Hindrance Enhancer",
                description: "The 4th H Challenge's effect is better.",
                cost() { return new Decimal(32) },
                unlocked() { return hasUpgrade("t", 22) },
            },
            24: {
                title: "Time Dilation",
                description: "Unlock a new Time Energy effect.",
                cost() { return new Decimal(40) },
                unlocked() { return hasUpgrade("t", 23) },
            },
            25: {
                title: "Better BP Combo III",
                description: "Booster effect boost Prestige Points.",
                cost() { return new Decimal(66) },
                effect() { 
                    if(player.sp.unlocked)return tmp.b.effect;
                    let eff = tmp.b.effect.add(1).pow(tmp.b.effect.add(10).log10().div(player.m.unlocked?8000:10000).pow(2).min(1));
                    return eff;
                },
                unlocked() { return hasUpgrade("t", 24) },
                effectDisplay() { return format(tmp.t.upgrades[25].effect)+"x" },
            },
        },
        canBuyMax() { return hasMilestone("q",1) },
        autoPrestige() { return hasMilestone("q",5) },
        resetsNothing() { return hasMilestone("q",5) },
})


addLayer("s", {
        name: "space", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#dfdfdf",
        requires() { 
            let ret=new Decimal(5);
            if(player.ss.unlocked)ret=ret.sub(0.25);
            if(hasUpgrade("ss",11))ret=ret.sub(0.25);
            if(player.hs.unlocked)ret=ret.sub(0.25);
            
            
            if(player.s.points.gte(15))ret=ret.min(4.8362118522710054416216354073349);
            if(player.s.points.gte(275))ret=ret.min(4.493359291942686);
            return ret;
        }, // Can be a function that takes requirement increases into account
        resource: "space energy", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["g"],
        exponent() { 
            a=0.75;
            if(player.h.challenges[22]>=10.5)a=a*10/Math.min(player.h.challenges[22],16);
            if(hasUpgrade("q",31))a=a/(player.q.buyables[11].add(1).log10().mul(0.01).toNumber()+1);
            return a;
        }, // Prestige currency exponent
        base() { return 1.1 },
        gainMult() { 
            let mult = new Decimal(1);
            return mult;
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
        {key: "s", description: "S: Reset for space energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.t.unlocked},
        automate() {},
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            power: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }},
        milestones: {
            0: {
                requirementDescription: "2 Space Energy",
                done() { return player.s.best.gte(2) },
                effectDescription: "Keep Generator Upgrades.",
            },
            1: {
                requirementDescription: "4 Space Energy",
                done() { return player.s.best.gte(4)},
                effectDescription: "Autobuy Boosters/Generators, Boosters/Generators resets nothing.",
            },
        },
        doReset(resettingLayer) {
            let keep = [];
            if (player.q.unlocked) keep.push("milestones")
            if (hasMilestone("q",4)) keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset("s", keep)
        },
        
    buyables: {
            rows: 3,
            cols: 5,
            11: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e4,Decimal.pow(x,1.35)).pow(hasUpgrade("p",42)?0.95:1)
                    if(x.eq(0))return new Decimal(0)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(player.s.points.mul(layers.ss.eff1()).add(1),x.add(buyableEffect("s",15)).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1).mul(3));
                    eff = eff.pow(buyableEffect("hs",11));
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 1\n\
                    Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Point gain by "+format(data.effect)+". (Boosted by your Space Energy)";
                },
                unlocked() { return player.g.unlocked }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'120px','width':'120px'},
            },
            12: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e6,Decimal.pow(x,1.35)).pow(hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(player.s.points.mul(layers.ss.eff1()).add(1),x.add(buyableEffect("s",15)).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1).mul(3));
                    eff = eff.pow(buyableEffect("hs",12));
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 2\n\
                    Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Prestige Point gain by "+format(data.effect)+". (Boosted by your Space Energy)";
                },
                unlocked() { return player.g.unlocked }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'120px','width':'120px'},
            },
            13: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e10,Decimal.pow(x,1.35)).pow(hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = player.s.points.mul(layers.ss.eff1()).mul(x.add(buyableEffect("s",15)).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1)).pow(0.4);
                    if(hasMilestone("hs",1))eff = eff.add(1).sqrt();
                    eff = eff.pow(buyableEffect("hs",13));
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 3\n\
                    Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: "+(hasMilestone("hs",1)?"Multiplying":"Adding")+" Booster/Generator Bases by "+format(data.effect)+". (Boosted by your Space Energy)";
                },
                unlocked() { return hasUpgrade("s",14) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'120px','width':'120px'},
            },
            14: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e20,Decimal.pow(x,1.35)).pow(hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = player.s.points.mul(layers.ss.eff1()).mul(x.add(buyableEffect("s",15)).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1)).pow(0.2).add(1);
                    if(hasUpgrade("s",23))eff=eff.pow(2);
                    if(hasUpgrade("q",32))eff=eff.pow(0.1);
                    eff = eff.pow(buyableEffect("hs",14));
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 4\n\
                    Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Subspace "+(hasUpgrade("q",32)?"base":"gain")+" by "+format(data.effect)+". (Boosted by your Space Energy)";
                },
                unlocked() { return hasUpgrade("s",15) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'120px','width':'120px'},
            },
            15: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e50,Decimal.pow(x,1.35)).pow(hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if(!hasUpgrade("s",25))return new Decimal(0);
                    let eff = player.s.points.mul(layers.ss.eff1()).mul(x.add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1)).pow(0.5).div(5);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 5\n\
                    Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Add "+format(data.effect)+" levels to first 4 Space Buildings. (Boosted by your Space Energy)";
                },
                unlocked() { return hasUpgrade("s",25) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'120px','width':'120px'},
            },
            21: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e30,Decimal.pow(x,1.35)).pow(hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if(player.i.buyables[11].lt(1))return new Decimal(0);
                    let eff = player.s.points.mul(layers.ss.eff1()).mul(x.add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1)).pow(0.25).div(100).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 6\n\
                    Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Time Capsule base by "+format(data.effect)+". (Boosted by your Space Energy)";
                },
                unlocked() { return player.i.buyables[11].gte(1) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'120px','width':'120px'},
            },
    },
    upgrades:{
        rows: 2,
        cols: 5,
    
            11: {
                title: "Space X",
                description: "Add a free level to all Space Buildings.",
                cost() { return new Decimal(8) },
                unlocked() { return player[this.layer].unlocked }
            },
            12: {
                title: "Generator Generator",
                description: "Generator Power boosts its own generation.",
                cost() { return new Decimal(9) },
                unlocked() { return hasUpgrade("s", 11) },
                effect() { return player.g.power.add(1).log10().add(1) },
                effectDisplay() { return format(tmp.s.upgrades[12].effect)+"x" },
            },
            13: {
                title: "Shipped Away",
                description: "Space Building 1 Levels boost Generator Power gain.",
                cost() { return new Decimal(11) },
                unlocked() { return hasUpgrade("s", 11) },
                effect() { return Decimal.pow(10, player.s.buyables[11]) },
                effectDisplay() { return format(tmp.s.upgrades[13].effect)+"x" },
            },
            14: {
                title: "Into The Repeated",
                description: "Unlock the <b>Space Building 3</b>.",
                cost() { return new Decimal(12) },
                unlocked() { return hasUpgrade("s", 12)||hasUpgrade("s", 13) }
            },
            15: {
                title: "Four Square",
                description: "Unlock the <b>Space Building 4</b>.",
                cost() { return new Decimal(17) },
                unlocked() { return hasUpgrade("s", 14) },
            },
            21: {
                title: "Spacious",
                description: "All Space Buildings are 8% stronger.",
                cost() { return new Decimal(19) },
                unlocked() { return hasUpgrade("s", 15) },
            },
            22: {
                title: "Spacetime Anomaly",
                description: "Non-extra Time Capsules provide free Space Buildings.",
                cost() { return new Decimal(21) },
                unlocked() { return hasUpgrade("s", 21) },
                effect() { if(hasMilestone("hs",2))return player.t.points.sqrt(); return player.t.points.cbrt().floor() },
                effectDisplay() { if(hasMilestone("hs",2))return "+"+format(tmp.s.upgrades[22].effect); return "+"+formatWhole(tmp.s.upgrades[22].effect) },
            },
            23: {
                title: "Subspace Boost",
                description: "Space Building 4 effect is squared.",
                cost() { return new Decimal(26) },
                unlocked() { return hasUpgrade("s", 21) },
            },
            24: {
                title: "Want More?",
                description: "All three of the <b>I Need More</b> upgrades are stronger based on Space Building 1.",
                cost() { return new Decimal(40) },
                unlocked() { return hasUpgrade("s", 23) },
                effect() {
                    return player.s.buyables[11].sqrt().div(5).plus(1);
                },
                effectDisplay() { return format(tmp.s.upgrades[24].effect.sub(1).times(100))+"% stronger" },
            },
            25: {
                title: "Another One?",
                description: "Unlock the <b>Space Building 5</b>, and autobuy it.",
                cost() { return new Decimal(63) },
                unlocked() { return hasUpgrade("s", 24) },
            },
    },
    
        canBuyMax() { return hasMilestone("q",2) },
        autoPrestige() { return hasMilestone("q",6) },
        resetsNothing() { return hasMilestone("q",6) },
        
        update(diff){
            var pow=player.g.power.pow(hasUpgrade("p",42)?(1/0.95):1);
         if(player.i.buyables[11].gte(1)){
             var target=pow.add(1).log(1e30).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[21])){
                player.s.buyables[21]=target;
            }
         }
         if(hasUpgrade("s",25)){
             var target=pow.add(1).log(1e50).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[15])){
                player.s.buyables[15]=target;
            }
         }
        if(hasMilestone("ss",1)){
            var target=pow.add(1).log(1e20).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[14])){
                player.s.buyables[14]=target;
            }
            
        }
        if(hasMilestone("ss",0)){
            var target=pow.add(1).log(1e10).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[13])){
                player.s.buyables[13]=target;
            }
            
        }
        if(hasMilestone("q",11)){
            var target=pow.add(1).log(1e6).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[12])){
                player.s.buyables[12]=target;
            }
            
        }
         if(hasMilestone("q",10)){
             var target=pow.add(1).log(1e4).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[11])){
                player.s.buyables[11]=target;
            }
         }
        },
});


addLayer("e", {
        name: "enhance", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }},
        color: "#b82fbd",
        requires() {
            if(hasMilestone("h",6))return new Decimal(6).min(Decimal.sub(8.5,player.points.div(4)).max(1));
            return new Decimal(6)
        }, // Can be a function that takes requirement increases into account
        resource: "enhance points", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent(){
            if(hasMilestone("h",6))return new Decimal(30).max(player.points.pow(1.5));
            return 30;
        },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if(hasUpgrade("e",22))mult=mult.mul(buyableEffect("e",11)[2]);
            if(hasUpgrade("e",24))mult=mult.mul(upgradeEffect("e",24));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        branches: ["b","g"],
        
        layerShown(){return player.s.unlocked},
        hotkeys: [
        {key: "e", description: "E: Reset for enhance", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            let keep = []
            if (player.q.unlocked) keep.push("milestones")
            if (hasMilestone("q",4)) keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
    upgrades:{
        rows: 2,
        cols: 5,
            11: {
                title: "Row 2 Synergy",
                description: "Boosters & Generators boost each other.",
                cost() { return new Decimal(10000) },
                unlocked() { return player.e.unlocked },
                effect() { 
                    let exp = 1
                    return {g: player.b.points.add(1).log10().pow(exp), b: player.g.points.add(1).log10().add(hasUpgrade("e",14)?1:0).pow(exp)} 
                },
                effectDisplay() { return "+"+format(tmp.e.upgrades[11].effect.g)+" to Generator base, "+(hasUpgrade("e",14)?"":"+")+format(tmp.e.upgrades[11].effect.b)+(hasUpgrade("e",14)?"x":"")+" to Booster base" },
                formula: "log(x+1)",
            },
            12: {
                title: "Enhanced Prestige",
                description: "Total Enhance Points boost Prestige Point gain.",
                cost() { return new Decimal(40000) },
                unlocked() { return hasUpgrade("e", 11) },
                effect() { 
                    let ret = player.e.total.add(1).pow(1.5) 
                    return ret
                },
                effectDisplay() { return format(tmp.e.upgrades[12].effect)+"x" },
            },
            13: {
                title: "Enhance Plus",
                description: "Get a free Enhancer.",
                cost() { return new Decimal(3e6) },
                unlocked() { return hasUpgrade("e", 11) },
            },
            14: {
                title: "More Multiplications",
                description: "<b>Row 2 Synergy</b> multiply booster base instead of adding.",
                cost() { return new Decimal(1e13) },
                unlocked() { return hasUpgrade("e", 11) },
            },
            21: {
                title: "Enhance Plus Plus",
                description: "Get another two free Enhancers",
                cost() { return new Decimal(3e7) },
                unlocked() { return hasUpgrade("e", 13) },
            },
            22: {
                title: "Enhanced Reversion",
                description: "Enhancer effect is better and add a new effect.",
                cost() { return new Decimal(1e9) },
                unlocked() { return hasUpgrade("e", 13) },
            },
            23: {
                title: "Enter the E-Space",
                description: "Space Energy provides free Enhancers.",
                cost() { return new Decimal(1e17) },
                unlocked() { return hasUpgrade("e", 22) },
                effect() {
                    let eff = player.s.points.div(15);
                    return eff;
                },
                effectDisplay() { return "+"+format(tmp.e.upgrades[23].effect) },
            },
            24: {
                title: "Monstrous Growth",
                description: "Boosters & Generators boost Enhance Point gain.",
                cost() { return new Decimal(1e15) },
                unlocked() { return hasUpgrade("e", 22) },
                effect() { return Decimal.pow(1.1, player.b.points.plus(player.g.points).pow(0.5)) },
                effectDisplay() { return format(tmp.e.upgrades[24].effect)+"x" },
            },
    },
    buyables: {
            rows: 1,
            cols: 1,
            11: {
                title: "Enhancers", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(hasMilestone("h",27)?2:10, x.pow(1.5))
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if(hasUpgrade("e",13))x=x.add(1);
                    if(hasUpgrade("e",21))x=x.add(2);
                    if(hasUpgrade("e",23))x=x.add(upgradeEffect("e",23));
                    if(hasUpgrade("q",22))x=x.add(upgradeEffect("q",22));
                    if(inChallenge("h",31))x=new Decimal(0);
                    let eff = [];
                    eff[0]=x;
                    eff[1]=x;
                    eff[2]=new Decimal(1);
                    if(hasMilestone("m",7)){
                        eff[0]=eff[0].pow(10/9);
                        eff[1]=eff[1].pow(10/9);
                        eff[2]=Decimal.pow(challengeEffect("h",31).mul(buyableEffect("m",22)).mul(2),x);
                    }else if(hasUpgrade("e",22)){
                        eff[0]=eff[0].pow(1.1);
                        eff[1]=eff[1].pow(1.05);
                        eff[2]=Decimal.pow(challengeEffect("h",31).mul(2),x);
                    }
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "You have "+formatWhole(player[this.layer].buyables[this.id])+" Enhancers.\n\
                    They are adding Prestige Point exponent by "+format(data.effect[1])+"\n\
                    They are adding Booster/Generator bases by "+format(data.effect[0])+(hasUpgrade("e",22)?"\n\
                    They are multiplying Enhance Point gain by "+format(data.effect[2]):"")+"\n\
                    Cost for Next Enhancer: " + format(data.cost) + " Enhance Points";
                },
                unlocked() { return true }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px'},
            },
    },passiveGeneration() { return hasMilestone("q",3)?1:0 },
    update(diff){
         if(hasMilestone("q",9)){
                var target=player.e.points.add(1).log(hasMilestone("h",27)?2:10).pow(1/1.5).add(1).floor();
                if(target.gt(player.e.buyables[11])){
                    player.e.buyables[11]=target;
                }
         }
     },
});        



addLayer("sb", {
        name: "super boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SB", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        row: 2,
        color: "#504899",
        requires: new Decimal(24), // Can be a function that takes requirement increases into account
        resource: "super boosters", // Name of prestige currency
        baseResource: "boosters", // Name of resource prestige is based on
        baseAmount() {return player.b.points}, // Get the current amount of baseResource
        roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["b"],
        exponent() { return 1 }, // Prestige currency exponent
        base() { return 1.08 },
        layerShown(){return player.t.unlocked&&player.e.unlocked&&player.s.unlocked},
        effectBase() {
            let base = new Decimal(1.25);
            if(hasMilestone("l",2))base = base.add(buyableEffect("l",11)).sub(1);
            return base
        },
        effect() {
            if (!player[this.layer].unlocked) return new Decimal(1);
            return Decimal.pow(this.effectBase(), player.sb.points).max(0);
        },
        effectDescription() {
            return "which are multiplying the Booster base by "+format(tmp.sb.effect)+"x"+(tmp.nerdMode?("\n ("+format(tmp.sb.effectBase)+"x each)"):"")
        },
        doReset(resettingLayer){ 
            let keep = []
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            first: 0,
            auto: false,
        }},
        hotkeys: [
        {key: "B", description: "Shift+B: Reset for super boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        canBuyMax() { return hasMilestone("q",7) },
        autoPrestige() { return hasMilestone("h",0) },
        resetsNothing() { return hasMilestone("h",0) },
});

addLayer("sg", {
        name: "super generators", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SG", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        row: 2,
        color: "#248239",
        requires(){
            if(hasUpgrade("ss",21))return new Decimal(24);
            return new Decimal(70);
        }, // Can be a function that takes requirement increases into account
        resource: "super generators", // Name of prestige currency
        baseResource: "generators", // Name of resource prestige is based on
        baseAmount() {return player.g.points}, // Get the current amount of baseResource
        roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["g"],
        exponent() { return 1 }, // Prestige currency exponent
        base() { return 1.1 },
        layerShown(){return player.ss.unlocked},
        effectBase() {
            let base = new Decimal(1.05);
            return base
        },
        effect() {
            if (!player[this.layer].unlocked) return new Decimal(1);
            return Decimal.pow(this.effectBase(), player.sg.points).max(0);
        },
        effectDescription() {
            return "which are multiplying the Generator base by "+format(tmp.sg.effect)+"x"+(tmp.nerdMode?("\n ("+format(tmp.sg.effectBase)+"x each)"):"")
        },
        doReset(resettingLayer){ 
            let keep = []
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            first: 0,
            auto: false,
        }},
        hotkeys: [
        {key: "G", description: "Shift+G: Reset for super generators", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        canBuyMax() { return hasUpgrade("ss",21) },
        autoPrestige() { return hasMilestone("ss",1) },
        resetsNothing() { return hasMilestone("ss",1) },
});



addLayer("q", {
        name: "quirks", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            energy: new Decimal(0),
            auto: false,
            first: 0,
            pseudoUpgs: [],
        }},
        color: "#c20282",
        requires(){return new Decimal(hasMilestone("m",4)?1:1e40)}, // Can be a function that takes requirement increases into account
        resource: "quirks", // Name of prestige currency
        baseResource: "generator power", // Name of resource prestige is based on
        baseAmount() {return player.g.power}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(0.1) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if (hasUpgrade("q", 14)) mult = mult.times(upgradeEffect("q", 14).q);

            if(player.m.unlocked)mult = mult.mul(tmp.m.hexEff);
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "q", description: "Q: Reset for quirks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            if(hasMilestone("m",2))keep.push("upgrades");
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.sb.unlocked},
        branches: ["e"],
        enGainMult() {
            let mult = new Decimal(1);
            if (hasUpgrade("q", 11)) mult = mult.times(upgradeEffect("q", 11));
            if (hasUpgrade("q", 21)) mult = mult.times(upgradeEffect("q", 21));
            if (player.o.unlocked) mult = mult.times(buyableEffect("o", 12));
            mult = mult.mul(tmp.ba.negBuff);
            mult = mult.mul(tmp.ps.soulEff);
            return mult;
        },
        enGainExp() {
            let exp = player.q.buyables[11].sub(1);
            if(hasUpgrade("q",23))exp = player.q.buyables[11];
            return exp;
        },
        enEff() {
            if (!player[this.layer].unlocked || inChallenge("h",31)) return new Decimal(1);
            let eff = softcap(player.q.energy,new Decimal(1e120),0.25).plus(1).pow(2);
            if(player.m.unlocked)eff=player.q.energy.plus(1);
            return eff;
        },
        update(diff) {
            if (tmp.q.enGainExp.gte(0)) player.q.energy = player.q.energy.plus(new Decimal(player.timePlayed).times(tmp.q.enGainMult).pow(tmp.q.enGainExp).times(player.q.buyables[11]).times(diff));
         if(hasMilestone("ba",2)){
                var target=player.q.points.add(1).log(2).pow(1/2).add(1).floor();
                if(target.gt(player.q.buyables[11])){
                    player.q.buyables[11]=target;
                }
         }
        },
        tabFormat: {
            "Main Tab": {
                content: [
                    "main-display",
                    "prestige-button",
                    "blank",
                    ["display-text",
                        function() {return 'You have ' + formatWhole(player.g.power)+' Generator Power'},
                            {}],
                    ["display-text",
                        function() {return 'You have ' + formatWhole(player.q.best)+' Best Quirks'},
                            {}],
                    ["display-text",
                        function() {return 'You have ' + formatWhole(player.q.total)+' Total Quirks'},
                            {}],
                    "blank",
                    ["display-text",
                        function() {return 'You have ' + formatWhole(player.q.energy)+' Quirk Energy (generated by Quirk Layers), which multiplies Point and Generator Power gain by ' + format(tmp.q.enEff)},
                            {}],
                    "blank",
                    "buyables", "blank", "blank",
                    "upgrades"]
            },
            "Milestones": {
                content: [
                    "main-display",
                    "prestige-button",
                    "blank",
                    ["display-text",
                        function() {return 'You have ' + formatWhole(player.g.power)+' Generator Power'},
                            {}],
                    "milestones"],
            },
        },
        milestones: {
            0: {
                requirementDescription: "1 Quirk",
                done() { return player.q.best.gte(1)},
                effectDescription: "Keep Row 3 milestones and Row 1-2 upgrades.",
            },
            1: {
                requirementDescription: "2 Quirks",
                done() { return player.q.best.gte(2)},
                effectDescription: "You can buy max Time Capsules.",
            },
            2: {
                requirementDescription: "3 Quirks",
                done() { return player.q.best.gte(3)},
                effectDescription: "You can buy max Space Energy.",
            },
            3: {
                requirementDescription: "10 Quirks",
                done() { return player.q.best.gte(10)},
                effectDescription: "Gain 100% of Enhance Points per second.",
            },
            4: {
                requirementDescription: "100 Quirks",
                done() { return player.q.best.gte(100)},
                effectDescription: "Keep Row 3 Upgrades.",
            },
            5: {
                requirementDescription: "200 Quirks",
                done() { return player.q.best.gte(200)},
                effectDescription: "Autobuy Time Capsules, Time Capsules resets nothing.",
            },
            6: {
                requirementDescription: "300 Quirks",
                done() { return player.q.best.gte(300)},
                effectDescription: "Autobuy Space Energy, Space Energy resets nothing.",
            },
            7: {
                requirementDescription: "400 Quirks",
                done() { return player.q.best.gte(400)},
                effectDescription: "You can buy max Super Boosters.",
            },
            8: {
                requirementDescription: "10000 Quirks",
                done() { return player.q.best.gte(10000)},
                effectDescription: "Autobuy Extra Time Capsules.",
            },
            9: {
                requirementDescription: "20000 Quirks",
                done() { return player.q.best.gte(20000)},
                effectDescription: "Autobuy Enhancers.",
            },
            10: {
                requirementDescription: "30000 Quirks",
                done() { return player.q.best.gte(30000)},
                effectDescription: "Autobuy Space Building 1.",
            },
            11: {
                requirementDescription: "40000 Quirks",
                done() { return player.q.best.gte(40000)},
                effectDescription: "Autobuy Space Building 2.",
            },
            12: {
                requirementDescription: "4000000 Quirks",
                done() { return player.q.best.gte(4000000)},
                effectDescription: "Time Capsules Base +1",
            },
        },
        
        
    buyables: {
            rows: 1,
            cols: 1,
            11: {
                title: "Quirk Layers", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(2, x.pow(2))
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "You have "+format(player[this.layer].buyables[this.id])+" Quirk Layers.<br>"+
                    "They are producing "+format(new Decimal(player.timePlayed).times(tmp.q.enGainMult).pow(tmp.q.enGainExp).times(player.q.buyables[11]))+" Quirk Energy per second.<br>"+
                    "Cost for next Quirk Layer: " + format(data.cost) + " Quirks";
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px'},
                
            },
    },
        upgrades: {
            rows: 4,
            cols: 5,
            11: {
                title: "Quirk Central",
                description: "Total Quirks multiply Quirk Layer base (boosted by Quirk Upgrades bought).",
                cost() { return new Decimal(1e18) },
                unlocked() { return hasMilestone("h", 10) },
                effect() { return player.q.total.plus(1).log10().plus(1).pow(player.q.upgrades.length) },
                effectDisplay() { return format(tmp.q.upgrades[11].effect)+"x" },
            },
            12: {
                title: "Back To Row 2",
                description: "Total Quirks multiply the Booster/Generator bases.",
                cost() { return new Decimal(1e22) },
                unlocked() { return hasUpgrade("q", 11) },
                effect() { return player.q.total.plus(1).log10().plus(1).pow(0.1) },
                effectDisplay() { return format(tmp.q.upgrades[12].effect)+"x" },
            },
            13: {
                title: "Skip the Skip the Second",
                description: "The Generator Power effect is raised to the power of 1.25.",
                cost() { return new Decimal(5e73) },
                unlocked() { return hasUpgrade("q", 11) },
            },
            14: {
                title: "Row 4 Synergy",
                description: "Hindrance Spirit & Quirks boost each other's gain.",
                cost() { return new Decimal(1e90) },
                unlocked() { return hasUpgrade("q", 12)||hasUpgrade("q", 13) },
                effect() { 
                    let q = player.q.points;
                    let h = player.h.points;
                    if(hasUpgrade("q",24))return {
                        h: q.plus(1).root(20),
                        q: h.plus(1).root(40),
                    };
                    return {
                        h: q.plus(1).root(50),
                        q: h.plus(1).root(100),
                    };
                },
                effectDisplay() { return "H: "+format(tmp.q.upgrades[14].effect.h)+"x, Q: "+format(tmp.q.upgrades[14].effect.q)+"x" },
            },
            21: {
                title: "Quirk City",
                description: "Super Boosters multiply each Quirk Layer's production.",
                cost() { return new Decimal(1e280) },
                unlocked() { return hasUpgrade("q", 11)&&hasUpgrade("q", 13) },
                effect() { return Decimal.pow(1.1, player.sb.points) },
                effectDisplay() { return format(tmp.q.upgrades[21].effect)+"x" },
            },
            22: {
                title: "Infinite Possibilities",
                description: "Total Quirks provide free Extra Enhancers.",
                cost() { return new Decimal("1e920") },
                unlocked() { return hasUpgrade("q", 12)&&hasUpgrade("q", 14) },
                effect() { return player.q.total.plus(1).log10().plus(1).log10(); },
                effectDisplay() { return "+"+format(tmp.q.upgrades[22].effect) },
            },
            23: {
                title: "The Waiting Game",
                description: "Add a free Quirk Layer.",
                cost() { return new Decimal("1e1010") },
                unlocked() { return hasUpgrade("q", 13)&&hasUpgrade("q", 21) },
            },
            24: {
                title: "Exponential Madness",
                description: "Effect of <b>Row 4 Synergy</b> are raised ^2.5.",
                cost() { return new Decimal("1e1135") },
                unlocked() { return hasUpgrade("q", 14)&&hasUpgrade("q", 22) },
            },
            31: {
                title: "Scale Softening",
                description: "T/S layer scaling is weaker based on your Quirk Layers.",
                cost() { return new Decimal("1e1460") },
                unlocked() { return hasUpgrade("q", 21)&&hasUpgrade("q", 23) },
            },
			32: {
				title: "Ternary Superspace",
				description: "Space Building 4's effect is changed.",
                cost() { return new Decimal("1e2100") },
				unlocked() { return hasUpgrade("q", 22)&&hasUpgrade("q", 24) },
			},
			33: {
				title: "Discount Three",
				description: "Boosters are cheaper.",
                cost() { return new Decimal("1e2600") },
				unlocked() { return hasUpgrade("q", 32) },
			},
			34: {
				title: "Booster Madness",
				description: "<b>Pseudo Boost</b> Multiplies booster base instead of adding.",
                cost() { return new Decimal("1e4800") },
				unlocked() { return hasUpgrade("q", 33) },
			},

        },
        passiveGeneration() { return hasMilestone("ba",6)?1:0 },
});


addLayer("h", {
        name: "hindrance", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            challenges: {}
        }},
        color: "#a14040",
        requires(){return new Decimal(hasMilestone("m",4)?1:1e15)}, // Can be a function that takes requirement increases into account
        resource: "hindrance spirit", // Name of prestige currency
        baseResource: "time energy", // Name of resource prestige is based on
        baseAmount() {return player.t.power}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(0.25) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if (hasUpgrade("q", 14)) mult = mult.times(upgradeEffect("q", 14).h);

            if(player.m.unlocked)mult = mult.mul(tmp.m.hexEff);
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        branches: ["t"],
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "h", description: "H: Reset for hindrance spirit", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.q.unlocked},
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            keep.push("challenges");
            if (layers[resettingLayer].row > this.row) {
                layerDataReset(this.layer, keep)
            }
        },
        effect() { 
            if(!player.h.unlocked)return new Decimal(1);
            let eff = player.h.points.times(player.points.add(1)).add(1).pow(2);
            return eff;
        },
        effectDescription() {
            return "which are multiplying Point & Time Energy gain by "+format(tmp.h.effect)+" (boosted by Points)"
        },
        milestones: {
            0: {
                requirementDescription: "100 Hindrance Spirit",
                done() { return player.h.best.gte(100)},
                effectDescription: "Autobuy Super Boosters, Super Boosters resets nothing.",
            },
            1: {
                requirementDescription: "500 Hindrance Spirit",
                done() { return player.h.best.gte(500)},
                effectDescription: "Unlock 1st Challenge.",
            },
            2: {
                requirementDescription: "3.9 points in 1st Challenge",
                done() { return player.h.challenges[11]>=3.9},
                effectDescription: "Boosters are cheaper.",
            },
            3: {
                requirementDescription: "4.1 points in 1st Challenge",
                done() { return player.h.challenges[11]>=4.1},
                effectDescription: "Unlock 2nd Challenge.",
            },
            4: {
                requirementDescription: "8.4 points in 2nd Challenge",
                done() { return player.h.challenges[12]>=8.4},
                effectDescription: "1st Challenge Effect is boosted by hindrance spirit.",
            },
            5: {
                requirementDescription: "4.3 points in 1st Challenge",
                done() { return player.h.challenges[11]>=4.3},
                effectDescription: "Prestige point gain exponent is better based on your points.",
            },
            6: {
                requirementDescription: "8.6 points in 2nd Challenge",
                done() { return player.h.challenges[12]>=8.6},
                effectDescription: "Increase Enhance point gain above 10 points.",
            },
            7: {
                requirementDescription: "8.7 points in 2nd Challenge",
                done() { return player.h.challenges[12]>=8.7},
                effectDescription: "Unlock 3rd Challenge.",
            },
            8: {
                requirementDescription: "9.3 points in 3rd Challenge",
                done() { return player.h.challenges[21]>=9.3},
                effectDescription: "<b>Outer Synergy</b> and <b>Double Reversal</b> are better.",
            },
            9: {
                requirementDescription: "8.95 points in 2nd Challenge",
                done() { return player.h.challenges[12]>=8.95},
                effectDescription: "The first row of Booster upgrades multiplying booster base instead of adding.",
            },
            10: {
                requirementDescription: "9.4 points in 3rd Challenge",
                done() { return player.h.challenges[21]>=9.4},
                effectDescription: "Unlock Quirk Upgrades.",
            },
            11: {
                requirementDescription: "9 points in 2nd Challenge",
                done() { return player.h.challenges[12]>=9},
                effectDescription: "Booster/Generators cost scaling is weaker based on highest points in 2nd Challenge.",
            },
            12: {
                requirementDescription: "10 points in 3rd Challenge",
                done() { return player.h.challenges[21]>=10},
                effectDescription: "Unlock 4th Challenge.",
            },
            13: {
                requirementDescription: "10.5 points in 4th Challenge",
                done() { return player.h.challenges[22]>=10.5},
                effectDescription: "Time Capsules/Space Energy cost scaling is weaker based on highest points in 4th Challenge.",
            },
            14: {
                requirementDescription: "5 points in 1st Challenge",
                done() { return player.h.challenges[11]>=5},
                effectDescription: "Point scaling is weaker based on highest points in 1st Challenge.",
            },
            15: {
                requirementDescription: "10.7 points in 2nd Challenge",
                done() { return player.h.challenges[12]>=10.7},
                effectDescription: "2nd Challenge Effect is better.",
            },
            16: {
                requirementDescription: "12 points in 4th Challenge",
                done() { return player.h.challenges[22]>=12},
                effectDescription: "Unlock 5th Challenge.",
            },
            17: {
                requirementDescription: "6 points in 1st Challenge",
                done() { return player.h.challenges[11]>=6},
                effectDescription: "3rd Challenge Effect is better.",
            },
            18: {
                requirementDescription: "14 points in 5th Challenge",
                done() { return player.h.challenges[31]>=14},
                effectDescription: "Unlock 6th Challenge.",
            },
            19: {
                requirementDescription: "15 points in 6th Challenge",
                done() { return player.h.challenges[32]>=15},
                effectDescription: "Unlock 7th Challenge.",
            },
            20: {
                requirementDescription: "13 points in 2nd Challenge",
                done() { return player.h.challenges[12]>=13},
                effectDescription: "Boosters are cheaper.",
            },
            21: {
                requirementDescription: "16 points in 4th Challenge",
                done() { return player.h.challenges[22]>=16},
                effectDescription: "Second Time Energy effect is better.",
            },
            22: {
                requirementDescription: "6.5 points in 7th Challenge",
                done() { return player.h.challenges[41]>=6.5},
                effectDescription: "Unlock 8th Challenge.",
            },
            23: {
                requirementDescription: "17 points in 6th Challenge",
                done() { return player.h.challenges[32]>=17},
                effectDescription: "6th Challenge Effect is better.",
            },
            24: {
                requirementDescription: "8 points in 1st Challenge",
                done() { return player.h.challenges[11]>=8},
                effectDescription: "2nd Challenge Effect is boosted by hindrance spirit.",
            },
            25: {
                requirementDescription: "17.5 points in 6th Challenge",
                done() { return player.h.challenges[32]>=17.5},
                effectDescription: "Solar Energy effect is squared.",
            },
            26: {
                requirementDescription: "16.15 points in 3rd Challenge",
                done() { return player.h.challenges[21]>=16.15},
                effectDescription: "3rd Challenge Effect is boosted by hindrance spirit.",
            },
            27: {
                requirementDescription: "17.2 points in 5th Challenge",
                done() { return player.h.challenges[31]>=17.2},
                effectDescription: "Enhancers are cheaper.",
            },
            28: {
                requirementDescription: "16 points in 2nd Challenge",
                done() { return player.h.challenges[12]>=16},
                effectDescription: "The 9 points in 2nd Challenge milestone effect is better.",
            },
            29: {
                requirementDescription: "15.6 points in 8th Challenge",
                done() { return player.h.challenges[42]>=15.6},
                effectDescription: "Unlock the last (9th) Challenge.",
            },
            30: {
                requirementDescription: "6 points in 9th Challenge",
                done() { return player.h.challenges[51]>=6},
                effectDescription: "6th Challenge Effect is better.",
            },
            31: {
                requirementDescription: "9 points in 1st Challenge",
                done() { return player.h.challenges[11]>=9},
                effectDescription: "1st Challenge add a new reward.",
            },
            32: {
                requirementDescription: "18.5 points in 4th Challenge",
                done() { return player.h.challenges[22]>=18.5},
                effectDescription: "<b>Anti-Timeless</b> effect is better.",
            },
            33: {
                requirementDescription: "19.1 points in 6th Challenge",
                done() { return player.h.challenges[32]>=19.1},
                effectDescription: "6th Challenge Effect is better.",
            },
            34: {
                requirementDescription: "7.8 points in 7th Challenge",
                done() { return player.h.challenges[41]>=6.5},
                effectDescription: "7th Challenge Effect is boosted by hindrance spirit.",
            },
        },
        challenges: {
            rows: 5,
            cols: 2,
            11: {
                name: "Halved Points (1)",
                challengeDescription: "Your points are divided by 2.",
                unlocked() { return hasMilestone("h",1) },
                rewardDescription(){if(player[this.layer].challenges[this.id]>=9)return "Add Prestige and Super Point Exponent based on highest points in this challenge."; return "Add Prestige Exponent based on highest points in this challenge."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]).mul(challengeEffect("h",41)).mul(challengeEffect("h",51));
                    if(hasMilestone("h",4))ret = ret.mul(player.h.points.add(1).log10().add(1).log10().add(1));
                    return ret;
                },
                rewardDisplay(){return "+"+format(challengeEffect("h",this.id))}
            },
            12: {
                name: "Row 2 Disabled (2)",
                challengeDescription: "Boosters/Generators are disabled.",
                unlocked() { return hasMilestone("h",3) },
                rewardDescription(){if(player[this.layer].challenges[this.id]>=10.7)return "Multiply Booster Base based on highest points in this challenge."; return "Add to Booster Base based on highest points in this challenge."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]).mul(challengeEffect("h",42)).mul(challengeEffect("h",51));
                    if(hasMilestone("h",24))ret = ret.mul(player.h.points.add(1).log10().add(1).log10().add(1));
                    if(player[this.layer].challenges[this.id]>=10.7)ret=ret.add(1);
                    return ret;
                },
                rewardDisplay(){if(player[this.layer].challenges[this.id]>=10.7)return format(challengeEffect("h",this.id))+"x";return "+"+format(challengeEffect("h",this.id))}
            },
            21: {
                name: "No Prestige (3)",
                challengeDescription: "You can't gain prestige points.",
                unlocked() { return hasMilestone("h",7) },
                rewardDescription(){if(hasMilestone("h",17))return "Multiply Prestige Exponent based on highest points in this challenge."; return "Add Prestige Exponent based on highest points in this challenge."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]).mul(challengeEffect("h",41)).mul(challengeEffect("h",51));
                    if(hasMilestone("h",26))ret = ret.mul(player.h.points.add(1).log10().add(1).log10().add(1));
                    ret = ret.sqrt();
                    if(hasMilestone("h",17)){
                        ret=new Decimal(player[this.layer].challenges[this.id]).mul(challengeEffect("h",41)).mul(challengeEffect("h",51)).div(15);
                        if(hasMilestone("h",26))ret = ret.mul(player.h.points.add(1).log10().add(1).log10().add(1));
                        return ret.add(1);
                    }
                    return ret;
                },
                rewardDisplay(){if(hasMilestone("h",17))return format(challengeEffect("h",this.id))+"x";return "+"+format(challengeEffect("h",this.id))}
            },
            22: {
                name: "Timeless and Spaceless (4)",
                challengeDescription: "You can't gain Time Energy. Effective Space Energy is 0.",
                unlocked() { return hasMilestone("h",12) },
                rewardDescription(){if(hasUpgrade("t",23))return "Multiply Time Capsule Base based on highest points in this challenge."; return "Add to Time Capsule Base based on highest points in this challenge."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(10).mul(challengeEffect("h",42)).mul(challengeEffect("h",51));
                    if(hasUpgrade("ss",23)){
                        let mxtime=20000;
                        if(player.m.unlocked)mxtime=25000;
                        if(player.ps.unlocked)mxtime=30000;
                        if(player.sp.unlocked)mxtime=35000;
                        if(player.hs.unlocked)mxtime=40000;
                        if(player.l.unlocked)mxtime=45000;
                        if(player.i.unlocked)mxtime=50000;
                        ret=ret.mul(Math.min(player.timePlayed,mxtime)/(hasMilestone("h",32)?50000:100000)+1);
                    }
                    if(hasUpgrade("t",23))ret=ret.add(1);
                    return ret;
                },
                rewardDisplay(){if(hasUpgrade("t",23))return format(challengeEffect("h",this.id))+"x"; return "+"+format(challengeEffect("h",this.id))}
            },
            31: {
                name: "Disabled EQ (5)",
                challengeDescription: "Quirk Energy and Enhancers has no effect.",
                unlocked() { return hasMilestone("h",16) },
                rewardDescription(){return "Multiply 3rd Enhancer effect base based on highest points in this challenge."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(20).mul(challengeEffect("h",41)).mul(challengeEffect("h",51)).add(1);
                    return ret;
                },
                rewardDisplay(){return format(challengeEffect("h",this.id))+"x"}
            },
            32: {
                name: "Black Area (6)",
                challengeDescription: "Solar Power is 0%. Solar Energy and Subspace has no effect.",
                unlocked() { return hasMilestone("h",18) },
                rewardDescription(){return "Multiply Subspace base based on highest points in this challenge."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(hasMilestone("h",33)?5:hasMilestone("h",30)?10:hasMilestone("h",23)?20:50).mul(challengeEffect("h",42)).mul(challengeEffect("h",51)).add(1);
                    return ret;
                },
                rewardDisplay(){return format(challengeEffect("h",this.id))+"x"}
            },
            41: {
                name: "Left Wing (7)",
                challengeDescription: "1st, 3rd, 5th challenges at once.",
                unlocked() { return hasMilestone("h",19) },
                rewardDescription(){return "Effect of 1st, 3rd, 5th challenges are stronger."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(100).mul(challengeEffect("h",51));
                    if(hasMilestone("h",34))ret = ret.mul(player.h.points.add(1).log10().add(1).log10().add(1));
                    ret = ret.add(1);
                    return ret;
                },
                rewardDisplay(){return format(challengeEffect("h",this.id))+"x"},
                countsAs: [11,21,31]
            },
            42: {
                name: "Right Wing (8)",
                challengeDescription: "2nd, 4th, 6th challenges at once.",
                unlocked() { return hasMilestone("h",22) },
                rewardDescription(){return "Effect of 2nd, 4th, 6th challenges are stronger."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(200).mul(challengeEffect("h",51)).add(1);
                    return ret;
                },
                rewardDisplay(){return format(challengeEffect("h",this.id))+"x"},
                countsAs: [12,22,32]
            },
            51: {
                name: "The Reality (9)",
                challengeDescription: "Left Wing and Right Wing at once.",
                unlocked() { return hasMilestone("h",29) },
                rewardDescription(){return "Effect of all previous 8 challenges are stronger."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(100).add(1);
                    return ret;
                },
                rewardDisplay(){return format(challengeEffect("h",this.id))+"x"},
                countsAs: [11,21,31,12,22,32]
            },
        },
        update(diff){
            if(player.h.activeChallenge){
                player.h.challenges[player.h.activeChallenge]=player.points.max(player.h.challenges[player.h.activeChallenge]).toNumber();
            }
        },
        
        tabFormat: {
            "Main Tab": {
                content: [
                    "main-display",
                    "prestige-button",
                    "resource-display",
                    "blank",
                    "challenges"]
            },
            "Milestones": {
                content: [
                    "main-display",
                    "prestige-button",
                    "resource-display",
                    "blank",
                    "milestones"]
            },
        },
        passiveGeneration() { return hasMilestone("ba",5)?1:0 },
});


addLayer("ss", {
        name: "subspace", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SS", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            subspace: new Decimal(0),
        }},
        color: "#e8ffff",
        requires() { return new Decimal(16) }, // Can be a function that takes requirement increases into account
        roundUpCost: true,
        resource: "subspace energy", // Name of prestige currency
        baseResource: "space energy", // Name of resource prestige is based on
        baseAmount() {return player.s.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return 1 }, // Prestige currency exponent
        base() { return 1.1 },
        branches: ["s"],
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "S", description: "Shift+S: Reset for subspace energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.q.unlocked},
        milestones: {
            0: {
                requirementDescription: "1 Subspace Energy",
                done() { return player.ss.best.gte(1)},
                effectDescription: "Autobuy Space Building 3, Space Energy is cheaper.",
            },
            1: {
                requirementDescription: "5 Subspace Energy",
                done() { return player.ss.best.gte(5)},
                unlocked() {return player.sg.unlocked},
                effectDescription: "Autobuy Space Building 4 and Super Generators. Super Generators resets nothing.",
            },
        },
        effBase() {
            let base = new Decimal(2);
            if (hasUpgrade("ss",32)) base=base.add(upgradeEffect("ss", 32));
            if (hasUpgrade("ss", 41)&&hasUpgrade("q",32)) base = base.plus(buyableEffect("o", 21));
            base=base.mul(challengeEffect("h",32));
            base=base.mul(buyableEffect("m",21));
            if (hasUpgrade("ss", 41)&&!hasUpgrade("q",32)) base = base.plus(buyableEffect("o", 21));
            if (hasUpgrade("s",15)&&hasUpgrade("q",32)) base = base.mul(buyableEffect("s", 14));
            if (hasUpgrade("ba",24)) base = base.mul(upgradeEffect("ba", 24));

            return base;
        },
        effect() { 
            if (!player.ss.unlocked) return new Decimal(0);
            let gain = Decimal.pow(tmp.ss.effBase, player.ss.points).mul(player.ss.points);
            if (hasUpgrade("s",15)&&!hasUpgrade("q",32)) gain=gain.mul(buyableEffect("s", 14));
            if (hasUpgrade("ss",13)) gain=gain.mul(upgradeEffect("ss", 13));
            if (hasUpgrade("ba",11)) gain=gain.mul(upgradeEffect("ba", 11));
            if (player.o.unlocked) gain=gain.times(buyableEffect("o", 13));
            if(player.m.unlocked)gain = gain.mul(tmp.m.hexEff);
            return gain;
        },
        effectDescription() {
            return "which are generating "+format(tmp.ss.effect)+" Subspace/sec"
        },
        update(diff) {
            if (player.ss.unlocked) player.ss.subspace = player.ss.subspace.plus(tmp.ss.effect.times(diff));
        },
tabFormat: ["main-display",
            "prestige-button",
            "resource-display",
            "blank",
            ["display-text",
                function() {return 'You have ' + format(player.ss.subspace) + ' Subspace, which are multiplying effective Space Energy by '+format(tmp.ss.eff1)},
                    {}],
            "blank",
            "upgrades",
            "milestones",
        ],
        eff1() { 
            if(inChallenge("h", 22))return new Decimal(0);
            if(inChallenge("h", 32))return new Decimal(1);
            let eff=player.ss.subspace.plus(1).log10().plus(1).log10();
            if(hasUpgrade("ss",12))eff=eff.mul(upgradeEffect("ss",12));
            return eff.add(1);
        },

        doReset(resettingLayer){ 
            let keep = ["milestones"];
            if(hasMilestone("m",2))keep.push("upgrades");
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },

        upgrades: {
            rows: 4,
            cols: 3,
            11: {
                title: "Spatial Awakening",
                description: "Space Energy is cheaper.",
                cost() { return new Decimal(1500) },
                currencyDisplayName: "subspace",
                currencyInternalName: "subspace",
                currencyLayer: "ss",
                unlocked() { return player.ss.unlocked },
            },
            12: {
                title: "Subspatial Awakening",
                description: "Subspace Energy boosts all Subspace effects.",
                cost() { return new Decimal(5000) },
                currencyDisplayName: "subspace",
                currencyInternalName: "subspace",
                currencyLayer: "ss",
                unlocked() { return hasUpgrade("ss", 11) },
                effect() { 
                    let eff = player.ss.points.div(2.5).plus(1).sqrt();
                    return eff;
                },
                effectDisplay() { return format(tmp.ss.upgrades[12].effect.sub(1).times(100))+"% stronger" },
            },
            13: {
                title: "Emissary of Smash",
                description: "Quirks boost Subspace gain.",
                cost() { return new Decimal(50000) },
                currencyDisplayName: "subspace",
                currencyInternalName: "subspace",
                currencyLayer: "ss",
                unlocked() { return hasUpgrade("ss", 11) },
                effect() { return player.q.points.plus(1).log10().div(10).plus(1) },
                effectDisplay() { return format(tmp.ss.upgrades[13].effect)+"x" },
            },
            21: {
                title: "Illegal Upgrade",
                description: "Super Generators are cheaper, you can buy max Super Generators.",
                cost() { return new Decimal(200000) },
                currencyDisplayName: "subspace",
                currencyInternalName: "subspace",
                currencyLayer: "ss",
                unlocked() { return hasUpgrade("ss", 13) },
            },
            22: {
                title: "Underneath The Sun",
                description: "<b>Solar Cores</b> use a better effect formula.",
                cost() { return new Decimal(1e9) },
                currencyDisplayName: "subspace",
                currencyInternalName: "subspace",
                currencyLayer: "ss",
                unlocked() { return hasUpgrade("ss", 21)&&player.o.unlocked },
            },
            23: {
                title: "Anti-Timeless",
                description: "<b>Timeless and Spaceless (4)</b>'s effect increases based on your total time playing this game.",
                cost() { return new Decimal(1e13) },
                currencyDisplayName: "subspace",
                currencyInternalName: "subspace",
                currencyLayer: "ss",
                unlocked() { return hasUpgrade("ss", 21)&&player.o.unlocked },
            },
            31: {
                title: "No More Progress",
                description: "Space Energy provides free Space Buildings.",
                cost() { return new Decimal(1e14) },
                currencyDisplayName: "subspace",
                currencyInternalName: "subspace",
                currencyLayer: "ss",
                unlocked() { return hasUpgrade("ss", 22)||hasUpgrade("ss", 23) },
                effect() { return player.s.points.div(10).cbrt() },
                effectDisplay() { return "+"+format(tmp.ss.upgrades[31].effect) },
            },
            32: {
                title: "Beyond Infinity",
                description: "Add to the Subspace Energy base based on your Quirk Layers.",
                cost() { return new Decimal(1e25) },
                currencyDisplayName: "subspace",
                currencyInternalName: "subspace",
                currencyLayer: "ss",
                unlocked() { return hasUpgrade("ss", 31) },
                effect() { return player.q.buyables[11].add(1).log10() },
                effectDisplay() { return "+"+format(tmp.ss.upgrades[32].effect) },
            },
            33: {
                title: "Timeless Solarity",
                description: "Solar Cores boost Solar Power.",
                cost() { return new Decimal(1e35) },
                currencyDisplayName: "subspace",
                currencyInternalName: "subspace",
                currencyLayer: "ss",
                unlocked() { return hasUpgrade("ss", 23)&&hasUpgrade("ss", 31) },
                effect() { return softcap(player.o.buyables[11].plus(1).log10().div(10),new Decimal(1.2),new Decimal(0.25)) },
                effectDisplay() { return "+"+format(tmp.ss.upgrades[33].effect.times(100))+"%" },
            },
            41: {
                title: "More Sun",
                description: "Unlock Coronal Waves.",
                cost() { return new Decimal(1e50) },
                currencyDisplayName: "subspace",
                currencyInternalName: "subspace",
                currencyLayer: "ss",
                unlocked() { return hasUpgrade("ss", 33) },
            },
        },
        canBuyMax() { return hasMilestone("ba",1) },
        autoPrestige() { return hasMilestone("m",1) },
        resetsNothing() { return hasMilestone("m",1) },
});


addLayer("o", {
    name: "solarity", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "O", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            energy: new Decimal(0),
            first: 0,
        }},
        roundUpCost: true,
        color: "#ffcd00",
        nodeStyle() {return {
            "background": ((((player.o.unlocked||canReset("o"))))?("radial-gradient(#ffcd00, #ff4300)"):"#bf8f8f") ,
        }},
        componentStyles: {
            "prestige-button"() {return { "background": (canReset("o"))?("radial-gradient(#ffcd00, #ff4300)"):"#bf8f8f" }},
        },
        requires() { 
            let req = new Decimal(20);
            return req;
        },
        resource: "solarity", // Name of prestige currency
        baseResource: "super boosters", // Name of resource prestige is based on
        baseAmount() {return player.sb.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { 
            let exp = new Decimal(15);
            if(hasUpgrade("p",34))exp = exp.mul(upgradeEffect("p",34));
            return exp;
        }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = buyableEffect("o", 11);
            if(hasUpgrade("ba",14))mult = mult.mul(upgradeEffect("ba",14));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1);
        },
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "o", description: "O: Reset for solarity", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            let keep = [];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.sg.unlocked },
        branches: ["sb", "t"],
        effect() { 
            return new Decimal(1).sub(Decimal.pow(0.95,player.o.points.add(1).log10().cbrt())).mul(0.1);
        },
        effect2() { 
            return player.o.points;
        },
        solEnGain() { 
            let gain = player.t.power.max(1).pow(tmp.o.effect);
            if(gain.gte("1e50"))gain = Decimal.pow(10,gain.log10().mul(50).sqrt());
            gain = gain.mul(tmp.o.effect2);
            if(player.m.unlocked)gain = gain.mul(tmp.m.hexEff);
            return gain;
        },
        effectDescription() { return "which are generating "+format(tmp.o.solEnGain)+" Solar Energy every second." },

        update(diff) {
            player.o.energy = player.o.energy.plus(tmp.o.solEnGain.times(diff));
            if(hasMilestone("ba",3))player.o.buyables[11] = player.o.buyables[11].plus(tmp.o.buyables[11].gain.times(diff));
            if(hasMilestone("m",3))player.o.buyables[12] = player.o.buyables[12].plus(tmp.o.buyables[12].gain.times(diff));
            if(hasMilestone("ps",0))player.o.buyables[13] = player.o.buyables[13].plus(tmp.o.buyables[13].gain.times(diff));
            if(hasMilestone("sp",7))player.o.buyables[21] = player.o.buyables[21].plus(tmp.o.buyables[21].gain.times(diff));
            if(hasMilestone("l",4))player.o.buyables[22] = player.o.buyables[22].plus(tmp.o.buyables[22].gain.times(diff));
        },
        solEnEff() { 
            if(inChallenge("h", 32))return new Decimal(1);
            return player.o.energy.plus(1).pow(hasMilestone("h",25)?2:1);
        },
        solPow() {
            if(inChallenge("h", 32))return new Decimal(0);
            let pow = new Decimal(1);
            if(hasUpgrade("ba",21))pow=pow.add(upgradeEffect("ba",21));
            if(hasUpgrade("ss",33))pow=pow.add(upgradeEffect("ss",33));
            if (hasUpgrade("ss", 41))pow=pow.add(buyableEffect("o", 21));

            return pow;
        },
        tabFormat: ["main-display",
            "prestige-button",
            "resource-display",
            "blank",
            ["display-text",
                function() {return 'You have ' + format(player.o.energy) + ' Solar Energy, which multiplies the Time Energy gain by '+format(tmp.o.solEnEff)+'.'},
                    {}],
            "blank",
            "milestones",
            "blank",
            ["display-text",
                function() { return "<b>Solar Power: "+format(tmp.o.solPow.times(100))+"%</b><br>" },
                    {}],
            "buyables",
            "blank"
        ],

        buyables: {
            rows: 3,
            cols: 3,
            11: {
                title: "Solar Cores",
                gain() { return player.o.points.div(2).root(1.5).floor() },
                effect() { 
                    let amt = player[this.layer].buyables[this.id]
                    if(amt.gte(1e10))amt=Decimal.pow(10,Decimal.pow(10,amt.log10().log10().cbrt()));
                    return hasUpgrade("ss", 22)?(amt.plus(1).pow(tmp.o.solPow).cbrt()):(amt.plus(1).pow(tmp.o.solPow).log10().plus(1))
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Solar Cores\n"+
                    "Req: 100 Solarity\n"+
                    "Amount: " + formatWhole(player[this.layer].buyables[this.id])+("\nEffect: Multiplies Solarity gain by "+format(tmp[this.layer].buyables[this.id].effect)))
                    return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() { return player.o.points.gte(100) },
                buy() { 
                    player.o.points = new Decimal(0);
                    player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                style: {'height':'140px', 'width':'140px'},
            },
            12: {
                title: "Tachoclinal Plasma",
                gain() { return player.o.points.div(100).times(player.o.energy.div(2500)).root(3.5).floor() },
                effect() { 
                if(hasUpgrade("p",24))return Decimal.pow(10, player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().cbrt());
                return (player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).log10().times(10).plus(1)) },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity & Solar Energy for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Tachoclinal Plasma\n"+
                    "Req: 100 Solarity & 1e6 Solar Energy\n"+
                    "Amount: " + formatWhole(player[this.layer].buyables[this.id])+"\n"+
                    ("Effect: Multiplies Quirk Layer base by "+format(tmp[this.layer].buyables[this.id].effect)))
                    return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() { return player.o.points.gte(100)&&player.o.energy.gte(1000000) },
                buy() { 
                    player.o.points = new Decimal(0);
                    player.o.energy = new Decimal(0);
                    player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            },
            13: {
                title: "Convectional Energy",
                gain() { return player.o.points.div(1e3).times(player.o.energy.div(2e5)).times(player.ss.subspace.div(10)).root(6.5).floor() },
                effect() { return player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).pow(2.5) },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity, Solar Energy, & Subspace for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Convectional Energy\n"+
                    "Req: 1e5 Solarity, 1e9 Solar Energy, & 1e10 Subspace\n"+
                    "Amount: " + formatWhole(player[this.layer].buyables[this.id]))+"\n"+
                    ("Effect: Multiplies Subspace gain by "+format(tmp[this.layer].buyables[this.id].effect))
                    return display;
                },
                unlocked() { return player[this.layer].unlocked&&player.ss.unlocked }, 
                canAfford() { return player.o.points.gte(1e5)&&player.o.energy.gte(1e9)&&player.ss.subspace.gte(1e10) },
                buy() { 
                    player.o.points = new Decimal(0);
                    player.o.energy = new Decimal(0);
                    player.ss.subspace = new Decimal(0);
                    player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                buyMax() {
                    // I'll do this later ehehe
                },
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            },
            21: {
                title: "Coronal Waves",
                gain() { return player.o.points.div(1e10).root(5).times(player.o.energy.div(1e40).root(30)).times(player.ss.subspace.div(1e50).root(8)).times(player.q.energy.div("1e3000").root(675)).floor() },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).log10();
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity, Solar Energy, Subspace, & Quirk Energy for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Coronal Waves\n"+
                    "Req: 1e10 Solarity, 1e40 Solar Energy, 1e50 Subspace, & 1e3000 Quirk Energy\n"+
                    "Amount: " + formatWhole(player[this.layer].buyables[this.id]))+"\n"+("Effect: +"+format(tmp[this.layer].buyables[this.id].effect)+" to Subspace base & +"+format(tmp[this.layer].buyables[this.id].effect.times(100))+"% Solar Power")
                    return display;
                },
                unlocked() { return player[this.layer].unlocked&&hasUpgrade("ss", 41) }, 
                canAfford() { return player.o.points.gte(1e10)&&player.o.energy.gte(1e40)&&player.ss.subspace.gte(1e50)&&player.q.energy.gte("1e3000") },
                buy() { 
                    player.o.points = new Decimal(0);
                    player.o.energy = new Decimal(0);
                    player.ss.subspace = new Decimal(0);
                    player.q.energy = new Decimal(0);
                    player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                buyMax() {
                    // I'll do this later ehehe
                },
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            },
			22: {
				title: "Noval Remnants",
				gain() { return player.o.buyables[11].div(1e25).pow(3).floor() },
				effect() {
					return player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().root(10).plus(1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solar Cores for "+formatWhole(data.gain)+" Noval Remnants\n"+
					"Req: 1e25 Solar Cores\n"+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+"\n"+
					("Effect: Multiply Super Point gain by "+format(data.effect)+"x"))
				},
				unlocked() { return hasMilestone("l",4) },
				canAfford() { return player.o.buyables[11].gte(1e25) },
				buy() {
					player.o.buyables[11] = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
			},


        },
        passiveGeneration() { return (hasMilestone("ba", 4)?1:0) },
});


addLayer("ba", {
        name: "balance", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "BA", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            pos: new Decimal(0),
            neg: new Decimal(0),
            first: 0,
        }},
        color: "#fced9f",
        requires(){if(hasMilestone("sp",10))return new Decimal(1);return new Decimal("1e100");}, // Can be a function that takes requirement increases into account
        resource: "balance energy", // Name of prestige currency
        baseResource: "quirks", // Name of resource prestige is based on
        baseAmount() {return player.q.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.04,
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "a", description: "A: reset for balance energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            if(hasMilestone("hs",0))keep.push("upgrades");
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.o.unlocked },
        
        branches: ["q","ss"],
        update(diff) {
            if (!player.ba.unlocked) return;
            player.ba.pos = player.ba.pos.plus(tmp.ba.posGain.times(diff));
            player.ba.neg = player.ba.neg.plus(tmp.ba.negGain.times(diff));
             if(hasMilestone("sp",1)){
                 var target=player.ss.subspace.add(1).log(2).pow(1/1).add(1).floor();
                if(target.gt(player.ba.buyables[11])){
                    player.ba.buyables[11]=target;
                }
                target=player.q.points.add(1).log(10).pow(1/(hasUpgrade("ba",33)?1.35:hasUpgrade("ba",23)?1.4:1.5)).add(1).floor();
                if(target.gt(player.ba.buyables[12])){
                    player.ba.buyables[12]=target;
                }
                target=player.ba.neg.add(1).log(3).pow(1/1).add(1).floor();
                if(target.gt(player.ba.buyables[13])){
                    player.ba.buyables[13]=target;
                }
                target=player.o.energy.add(1).log(2).pow(1/1).add(1).floor();
                if(target.gt(player.ba.buyables[21])){
                    player.ba.buyables[21]=target;
                }
                target=player.h.points.add(1).log(10).pow(1/(hasUpgrade("ba",33)?1.35:hasUpgrade("ba",13)?1.4:1.5)).add(1).floor();
                if(target.gt(player.ba.buyables[22])){
                    player.ba.buyables[22]=target;
                }
                target=player.ba.pos.add(1).log(3).pow(1/1).add(1).floor();
                if(target.gt(player.ba.buyables[23])){
                    player.ba.buyables[23]=target;
                }
             }
        },
        posGain() {
            let gain = player.ba.points;
            gain = gain.mul(buyableEffect("ba",11));
            gain = gain.mul(buyableEffect("ba",12));
            gain = gain.mul(buyableEffect("ba",13));
            return gain;
        },
        negGain() {
            let gain = player.ba.points;
            gain = gain.mul(buyableEffect("ba",21));
            gain = gain.mul(buyableEffect("ba",22));
            gain = gain.mul(buyableEffect("ba",23));
            return gain;
        },
        posBuff() { 
            let eff = player.ba.pos.plus(1).log10().div(10);
            if(hasUpgrade("ba",12))eff = eff.mul(1.28);
            if(hasUpgrade("ba",32))eff = eff.mul(1.25);
            return eff.plus(1);
        },
        negBuff() { 
            let eff = player.ba.neg.plus(1).log10().plus(1);
            if(hasUpgrade("ba",22))eff = eff.pow(2);
            if(hasUpgrade("ba",32))eff = eff.pow(2);
            return eff;
        },
        tabFormat: {
            "Main Tab": {
                content: ["main-display",
            "prestige-button",
            "resource-display",
            "blank",
            ["display-text", function(){return "Positivity: "+format(player.ba.pos)+" (+"+format(tmp.ba.posGain)+"/sec)"}],
            ["display-text", function(){return "Buff: Multiply Time Capsule Base by "+format(tmp.ba.posBuff)}],
            ["row", [["buyable",11],["buyable",12],["buyable",13]]],
            "blank",
            ["display-text", function(){return "Negativity: "+format(player.ba.neg)+" (+"+format(tmp.ba.negGain)+"/sec)"}],
            ["display-text", function(){return "Buff: Multiply Quirk Layer Base by "+format(tmp.ba.negBuff)}],
            ["row", [["buyable",21],["buyable",22],["buyable",23]]],
            "blank",
            "upgrades"]
            },
            "Milestones": {
                content: [
                    "main-display",
                    "prestige-button",
                    "resource-display",
                    "blank",
                    "milestones"]
            },
        },
        milestones: {
            0: {
                requirementDescription: "1 Balance Energy",
                done() { return player.ba.best.gte(1)},
                effectDescription: "Keep Row 4 milestones and H challenges on reset.",
            },
            1: {
                requirementDescription: "2 Balance Energy",
                done() { return player.ba.best.gte(2)},
                effectDescription: "You can buy max Subspace Energy.",
            },
            2: {
                requirementDescription: "3 Balance Energy",
                done() { return player.ba.best.gte(3)},
                effectDescription: "Autobuy Quirk Layers.",
            },
            3: {
                requirementDescription: "5 Balance Energy",
                done() { return player.ba.best.gte(5)},
                effectDescription: "Gain 100% of Solar Cores gain per second.",
            },
            4: {
                requirementDescription: "10 Balance Energy",
                done() { return player.ba.best.gte(10)},
                effectDescription: "Gain 100% of Solarity gain per second.",
            },
            5: {
                requirementDescription: "20 Balance Energy",
                done() { return player.ba.best.gte(20)},
                effectDescription: "Gain 100% of Hindrance Spirit gain per second.",
            },
            6: {
                requirementDescription: "40 Balance Energy",
                done() { return player.ba.best.gte(40)},
                effectDescription: "Gain 100% of Quirks gain per second.",
            },
            7: {
                requirementDescription: "200 Balance Energy",
                done() { return player.ba.best.gte(200)},
                effectDescription: "Unlock Balance Upgrades.",
            },
        },
    buyables: {
            rows: 2,
            cols: 3,
            11: {
                title: "Subspace Boosting", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(2, x)
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Level: "+format(player[this.layer].buyables[this.id])+" <br>"+
                    "Multiply Positivity gain by "+format(data.effect)+" <br>"+
                    "Cost: " + format(data.cost) + " Subspace";
                },
                canAfford() {
                    return player.ss.subspace.gte(tmp[this.layer].buyables[this.id].cost)
                },
                effect(){return Decimal.pow(hasUpgrade("ba",25)?1.2:1.1, player[this.layer].buyables[this.id])},
                unlocked(){return player.ba.unlocked},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.ss.subspace = player.ss.subspace.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            12: {
                title: "Quirk Boosting", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(10, x.pow(hasUpgrade("ba",33)?1.35:hasUpgrade("ba",23)?1.4:1.5))
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Level: "+format(player[this.layer].buyables[this.id])+" <br>"+
                    "Multiply Positivity gain by "+format(data.effect)+" <br>"+
                    "Cost: " + format(data.cost) + " Quirks";
                },
                canAfford() {
                    return player.q.points.gte(tmp[this.layer].buyables[this.id].cost)
                },
                effect(){return Decimal.pow(hasUpgrade("ba",25)?1.2:1.1, player[this.layer].buyables[this.id])},
                unlocked(){return player.ba.unlocked},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.q.points = player.q.points.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            13: {
                title: "Negativity Synergy", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(3, x)
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Level: "+format(player[this.layer].buyables[this.id])+" <br>"+
                    "Multiply Positivity gain by "+format(data.effect)+" <br>"+
                    "Cost: " + format(data.cost) + " Negativity";
                },
                canAfford() {
                    return player.ba.neg.gte(tmp[this.layer].buyables[this.id].cost)
                },
                effect(){return Decimal.pow(hasUpgrade("ba",25)?1.2:1.1, player[this.layer].buyables[this.id])},
                unlocked(){return player.ba.unlocked},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.ba.neg = player.ba.neg.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            21: {
                title: "Solar Boosting", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(2, x)
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Level: "+format(player[this.layer].buyables[this.id])+" <br>"+
                    "Multiply Negativity gain by "+format(data.effect)+" <br>"+
                    "Cost: " + format(data.cost) + " Solar Energy";
                },
                canAfford() {
                    return player.o.energy.gte(tmp[this.layer].buyables[this.id].cost)
                },
                effect(){return Decimal.pow(hasUpgrade("ba",15)?1.2:1.1, player[this.layer].buyables[this.id])},
                unlocked(){return player.ba.unlocked},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.o.energy = player.o.energy.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            22: {
                title: "Hindrance Boosting", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(10, x.pow(hasUpgrade("ba",33)?1.35:hasUpgrade("ba",13)?1.4:1.5))
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Level: "+format(player[this.layer].buyables[this.id])+" <br>"+
                    "Multiply Negativity gain by "+format(data.effect)+" <br>"+
                    "Cost: " + format(data.cost) + " Hindrance Spirit";
                },
                canAfford() {
                    return player.h.points.gte(tmp[this.layer].buyables[this.id].cost)
                },
                effect(){return Decimal.pow(hasUpgrade("ba",15)?1.2:1.1, player[this.layer].buyables[this.id])},
                unlocked(){return player.ba.unlocked},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.h.points = player.h.points.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            23: {
                title: "Positivity Synergy", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(3, x)
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Level: "+format(player[this.layer].buyables[this.id])+" <br>"+
                    "Multiply Negativity gain by "+format(data.effect)+" <br>"+
                    "Cost: " + format(data.cost) + " Positivity";
                },
                canAfford() {
                    return player.ba.pos.gte(tmp[this.layer].buyables[this.id].cost)
                },
                effect(){return Decimal.pow(hasUpgrade("ba",15)?1.2:1.1, player[this.layer].buyables[this.id])},
                unlocked(){return player.ba.unlocked},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.ba.pos = player.ba.pos.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
    },
    upgrades: {
            rows: 3,
            cols: 5,
            11: {
                title: "Positive Ion",
                description: "Positivity boosts Subspace.",
                cost() { return new Decimal(1e7) },
                currencyDisplayName: "positivity",
                currencyInternalName: "pos",
                currencyLayer: "ba",
                unlocked() { return hasMilestone("ba", 7) },
                effect() { return Decimal.pow(hasUpgrade("ba",31)?4:2,player.ba.pos.add(1).log10().sqrt()) },
                effectDisplay() { return format(tmp.ba.upgrades[11].effect)+"x" },
            },
            12: {
                title: "Positivity Boost",
                description: "Positivity effect is better.",
                cost() { return new Decimal(1e12) },
                currencyDisplayName: "positivity",
                currencyInternalName: "pos",
                currencyLayer: "ba",
                unlocked() { return hasMilestone("ba", 7) },
            },
            13: {
                title: "H-Discount",
                description: "Hindrance Boosting is cheaper.",
                cost() { return new Decimal(1e100) },
                currencyDisplayName: "positivity",
                currencyInternalName: "pos",
                currencyLayer: "ba",
                unlocked() { return hasMilestone("hs", 0) },
            },
            14: {
                title: "Positive Solarity",
                description: "Positivity boost Solarity.",
                cost() { return new Decimal(1e210) },
                currencyDisplayName: "positivity",
                currencyInternalName: "pos",
                currencyLayer: "ba",
                unlocked() { return hasMilestone("hs", 0) },
                effect() { 
                    let ret = player.ba.pos.plus(1).log10().plus(1).pow(hasUpgrade("ba",34)?2:1);
                    return ret;
                },
                effectDisplay() { return format(tmp.ba.upgrades[14].effect)+"x" },
            },
            15: {
                title: "Positive Power",
                description: "All buyables boost Negativity are better.",
                cost() { return new Decimal(1e300) },
                currencyDisplayName: "positivity",
                currencyInternalName: "pos",
                currencyLayer: "ba",
                unlocked() { return hasMilestone("hs", 0) },
            },
            21: {
                title: "Negative Ion",
                description: "Negativity boosts Solar Power.",
                cost() { return new Decimal(1e7) },
                currencyDisplayName: "negativity",
                currencyInternalName: "neg",
                currencyLayer: "ba",
                unlocked() { return hasMilestone("ba", 7) },
                effect() { 
                    let ret = player.ba.neg.plus(1).log10().plus(1).log10().div(hasUpgrade("ba",31)?5:10);
                    return ret;
                },
                effectDisplay() { return "+"+format(tmp.ba.upgrades[21].effect.times(100))+"%" },
            },
            22: {
                title: "Negativity Boost",
                description: "Negativity effect is better.",
                cost() { return new Decimal(1e12) },
                currencyDisplayName: "negativity",
                currencyInternalName: "neg",
                currencyLayer: "ba",
                unlocked() { return hasMilestone("ba", 7) },
            },
            23: {
                title: "Q-Discount",
                description: "Quirk Boosting is cheaper.",
                cost() { return new Decimal(1e100) },
                currencyDisplayName: "negativity",
                currencyInternalName: "neg",
                currencyLayer: "ba",
                unlocked() { return hasMilestone("hs", 0) },
            },
            24: {
                title: "Negative Subspace",
                description: "Negativity boosts Subspace base.",
                cost() { return new Decimal(1e210) },
                currencyDisplayName: "negativity",
                currencyInternalName: "neg",
                currencyLayer: "ba",
                unlocked() { return hasMilestone("hs", 0) },
                effect() { 
                    let ret = player.ba.neg.plus(1).log10().plus(1).log10().div(10).mul(hasUpgrade("ba",34)?2:1).plus(1);
                    return ret;
                },
                effectDisplay() { return format(tmp.ba.upgrades[24].effect)+"x" },
            },
            25: {
                title: "Negative Power",
                description: "All buyables boost Positivity are better.",
                cost() { return new Decimal(1e300) },
                currencyDisplayName: "negativity",
                currencyInternalName: "neg",
                currencyLayer: "ba",
                unlocked() { return hasMilestone("hs", 0) },
            },
            31: {
                title: "Neutral Ion",
                description: "Boost 2 upgrades above this upgrade.",
                cost() { return new Decimal(1e50) },
                unlocked() { return hasMilestone("hs", 0) },
            },
            32: {
                title: "Balance Boost",
                description: "Boost 2 upgrades above this upgrade.",
                cost() { return new Decimal(1e90) },
                unlocked() { return hasMilestone("hs", 0) },
            },
            33: {
                title: "Balanced Discounts",
                description: "Boost 2 upgrades above this upgrade.",
                cost() { return new Decimal(1e160) },
                unlocked() { return hasMilestone("hs", 0) },
            },
            34: {
                title: "Neutral Boost",
                description: "Boost 2 upgrades above this upgrade.",
                cost() { return new Decimal(1e250) },
                unlocked() { return hasMilestone("hs", 0) },
            },
            35: {
                title: "Neutral Power",
                description: "Boost 2 upgrades above this upgrade.",
                cost() { return new Decimal(2e308) },
                unlocked() { return hasMilestone("hs", 0) },
            },
    },
        passiveGeneration() { return (hasMilestone("sp", 4)?1:0) },
});


addLayer("m", {
        name: "magic", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            hexes: new Decimal(0),
        }},
        color: "#eb34c0",
        requires(){if(hasMilestone("sp",10))return new Decimal(1);return new Decimal("1e100");}, // Can be a function that takes requirement increases into account
        resource: "magic", // Name of prestige currency
        baseResource: "hindrance spirit", // Name of resource prestige is based on
        baseAmount() {return player.h.points}, // Get the current amount of baseResource
       type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return 0.05 }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
            return mult;
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "m", description: "M: reset for magic", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.ba.unlocked },
        branches: ["o","h","q"],
        tabFormat: {
            "Main Tab": {
                content: ["main-display",
            "prestige-button",
            "resource-display",
            "blank",
            "buyables",
            ["display-text",
                function() {return "You have "+formatWhole(player.m.hexes)+"(+"+format(tmp.m.hexGain)+"/s) Hexes (from allocated spells), "+tmp.m.hexEffDesc },
                    {}],
            ]
            },
            "Milestones": {
                content: [
                    "main-display",
                    "prestige-button",
                    "resource-display",
                    "blank",
                    "milestones"]
            },
        },
        milestones: {
            0: {
                requirementDescription: "1 Total Magic",
                done() { return player.m.total.gte(1)},
                effectDescription: "Magically remove a softcap in generator power and quirk energy effects, but these effects are square rooted. <b>Better BP Combo III</b> is better until e10000 booster effect.",
            },
            1: {
                requirementDescription: "2 Total Magic",
                done() { return player.m.total.gte(2)},
                effectDescription: "Autobuy Subspace Energy, Subspace Energy does not reset anything.",
            },
            2: {
                requirementDescription: "3 Total Magic",
                done() { return player.m.total.gte(3)},
                effectDescription: "Keep row 4 upgrades.",
            },
            3: {
                requirementDescription: "5 Total Magic",
                done() { return player.m.total.gte(5)},
                effectDescription: "Gain 100% of Tachoclinal Plasma gain per second.",
            },
            4: {
                requirementDescription: "10 Total Magic",
                done() { return player.m.total.gte(10)},
                effectDescription: "H/Q layer requirements are 1.",
            },
            5: {
                requirementDescription: "100 Total Magic",
                done() { return player.m.total.gte(100)},
                effectDescription: "Unlock another spell.",
            },
            6: {
                requirementDescription: "1e5 Total Magic",
                done() { return player.m.total.gte(1e5)},
                effectDescription: "Unlock another spell.",
            },
            7: {
                requirementDescription: "1e7 Total Magic",
                done() { return player.m.total.gte(1e7)},
                effectDescription: "Unlock another spell. First 2 enhancer effects are better.",
            },
        },
        buyables: {
            rows: 2,
            cols: 2,
            11: {
                title: "Booster Boost",
                gain() { return player.m.points },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].add(1).log10().add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Magic allocated: " + formatWhole(player[this.layer].buyables[this.id])+("\nEffect: Multiplies booster base by "+format(tmp[this.layer].buyables[this.id].effect)))
                    return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() { return player.m.points.gt(0) },
                buy() { 
            player.m.buyables[this.id] = player.m.buyables[this.id].plus(player.m.points);
                    player.m.points = new Decimal(0);
                },
            },
            12: {
                title: "Time Reverse",
                gain() { return player.m.points },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].add(1).log10().sqrt().div(10).add(1);
                    if(hasMilestone("l",3))eff = player[this.layer].buyables[this.id].add(1).log10().div(20).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Magic allocated: " + formatWhole(player[this.layer].buyables[this.id])+("\nEffect: Multiplies time capsule base by "+format(tmp[this.layer].buyables[this.id].effect)))
                    return display;
                },
                unlocked() { return hasMilestone("m",5) }, 
                canAfford() { return player.m.points.gt(0) },
                buy() { 
            player.m.buyables[this.id] = player.m.buyables[this.id].plus(player.m.points);
                    player.m.points = new Decimal(0);
                },
            },
            21: {
                title: "Subspace Extension",
                gain() { return player.m.points },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].add(1).log10().div(20).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Magic allocated: " + formatWhole(player[this.layer].buyables[this.id])+("\nEffect: Multiplies subspace base by "+format(tmp[this.layer].buyables[this.id].effect)))
                    return display;
                },
                unlocked() { return hasMilestone("m",6) }, 
                canAfford() { return player.m.points.gt(0) },
                buy() { 
            player.m.buyables[this.id] = player.m.buyables[this.id].plus(player.m.points);
                    player.m.points = new Decimal(0);
                },
            },
            22: {
                title: "Enhanced Enhancer",
                gain() { return player.m.points },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].add(1).log10().div(20).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Magic allocated: " + formatWhole(player[this.layer].buyables[this.id])+("\nEffect: Multiplies 3rd enhancer effect base by "+format(tmp[this.layer].buyables[this.id].effect)))
                    return display;
                },
                unlocked() { return hasMilestone("m",7) }, 
                canAfford() { return player.m.points.gt(0) },
                buy() { 
            player.m.buyables[this.id] = player.m.buyables[this.id].plus(player.m.points);
                    player.m.points = new Decimal(0);
                },
            },
        },
        update(diff) {
            if (!player.m.unlocked) return;
            player.m.hexes = player.m.hexes.plus(tmp.m.hexGain.times(diff));    
            if(hasMilestone("sp",2)){
                player.m.buyables[11]=player.m.buyables[11].add(player.m.points.times(diff));
                player.m.buyables[12]=player.m.buyables[12].add(player.m.points.times(diff));
                player.m.buyables[21]=player.m.buyables[21].add(player.m.points.times(diff));
                player.m.buyables[22]=player.m.buyables[22].add(player.m.points.times(diff));
            }
        },
        hexGain() {
            let gain = player.m.buyables[11].sqrt();
            if(player.m.buyables[12])gain=gain.add(player.m.buyables[12].sqrt());
            if(player.m.buyables[21])gain=gain.add(player.m.buyables[21].sqrt());
            if(player.m.buyables[22])gain=gain.add(player.m.buyables[22].sqrt());
            gain=gain.mul(tmp.l.lifePowerEff);
            if(hasMilestone("l",5))gain=gain.mul(buyableEffect("l",12));
            return gain;
        },
        hexEff() {
            return Decimal.pow(10,player.m.hexes.add(1).log10().sqrt());
        },
        hexEffDesc() {
            return "which are multiplying Hindrance Spirit, Quirk, Solar Energy, & Subspace gain by "+format(tmp.m.hexEff)
        },

        passiveGeneration() { return (hasMilestone("sp", 3)?1:0) },
});



addLayer("ps", {
    name: "phantom souls",
    symbol: "PS",
    position: 2,
    row: 4,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            souls: new Decimal(0),
        };
    },
    color: "#b38fbf",
    requires: new Decimal("1e765"),
    resource: "phantom souls",
    baseResource: "quirk energy",
    baseAmount() { return player.q.energy;},
    type: "static",
    exponent: 1.5,
    base: new Decimal("1e400"),
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        hotkeys: [
            {key: "P", description: "Press Shift+P to Phantom Soul Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            player.ps.souls = new Decimal(0);
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.m.unlocked && player.ba.unlocked},
        branches: ["q", ["h", 2]],
        update(diff) {
            player.ps.souls = player.ps.souls.max(tmp.ps.soulGain.times(player.h.points.max(1).log10()))
            if(hasMilestone("l",0))player.ps.buyables[11]=player.ps.souls.div(1350).pow(0.25).mul(8).sub(7).max(0).floor();
        },
        soulGainMult() {
            let mult = new Decimal(1);
            mult = mult.mul(buyableEffect("ps",11));
    
            return mult;
        },
        soulGain() {
            let gain = Decimal.pow(player.ps.points,1.5).times(layers.ps.soulGainMult());
            return gain;
        },
        soulEffExp() {
            let exp = new Decimal(1);
            exp = exp.mul(buyableEffect("ps",11));
            return exp;
        },
        soulEff() {
            let eff = player.ps.souls.plus(1).pow(layers.ps.soulEffExp());
            return eff;
        },
        effect(){
            let base=new Decimal(1.5);
            return Decimal.pow(base,player.ps.points);
        },
        tabFormat: {
            "Main Tab": {
                content: ["main-display",
                    ["display-text", function() { 
            if(player.l.unlocked)return "Your phantom souls are multiplying Life Power gain by "+format(tmp.ps.effect);return ""; }],
                    "prestige-button",
                    "resource-display",
                    "blank",
                    ["display-text", function() { return "You have "+formatWhole(player.ps.souls)+" Damned Souls (based on Hindrance Spirit and Phantom Souls), multiply Quirk Layer base by "+format(tmp.ps.soulEff); }],
                    "blank",
                    ["buyable", 11],
                ],
            },
            "Milestones": {
                content: ["main-display",
                    "prestige-button",
                    "resource-display",
                    "blank",
                    "milestones"
                ],
            }
        },
        milestones: {
            0: {
                requirementDescription: "1 phantom soul",
                done() { return player.ps.best.gte(1)},
                effectDescription: "Gain 100% of Convectional Energy gain per second.",
            },
        },
        buyables: {
            rows: 2,
            cols: 1,
            11: {
                title: "Wraiths",
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
let cost = Decimal.pow(x.div(8).add(1),4).mul(hasMilestone("l",0)?1350:1400).floor();
                    return cost;
                },
                effect() {
                    let x = player[this.layer].buyables[this.id];
                    return softcap(x.mul(0.5).add(1),new Decimal(15),new Decimal(0.5));
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: " + formatWhole(data.cost)+" Damned Souls")+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+"\n\
                    Effect: Multiply Damned Soul gain & effect exponent by "+format(data.effect);
                    return display;
                },
                unlocked() { return hasMilestone("sp",5) }, 
                canAfford() {
                    return player.ps.souls.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style: {'height':'200px', 'width':'200px'},
            },
            },

        canBuyMax() { return hasMilestone("l",0) },
        autoPrestige() { return hasMilestone("l",0) },
        resetsNothing() { return hasMilestone("l",0) },
});


addLayer("sp", {
    name: "super points",
    symbol: "SP",
    position: 2,
    row: 5,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
        };
    },
    color: "#00a7bf",
    requires: new Decimal(16),
    resource: "super points",
    baseResource: "points",
    baseAmount() { return player.points;},
    type: "normal",
    exponent(){
	let exp=new Decimal(100);
        if(hasMilestone("h",30))exp=exp.add(challengeEffect("h",11));
        if(hasMilestone("sp",13))exp=exp.add(player.sp.points.add(1).log10().sqrt());
        if(player.sp.unlocked)return exp;
         return 1;
    },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if(hasMilestone("sp",14))mult = mult.mul(Decimal.pow(3,player.sp.upgrades.length));
            if(hasMilestone("l",4))mult = mult.mul(buyableEffect("o",22));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        hotkeys: [
            {key: "ctrl+p", description: "Ctrl+P： Reset for super points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.ps.unlocked},
        branches: ["m","ba"],
        update(diff) {
        },
        tabFormat: {
            "Main Tab": {
                content: ["main-display",
                    "prestige-button",
                    "resource-display",
                    "blank",
                    function(){
                        if(player.i.unlocked)return "upgrades";
                        return "milestones";
                    }
                ],
            },
            "Milestones": {
                unlocked(){return player.i.unlocked;},
                content: ["main-display",
                    "prestige-button",
                    "resource-display",
                    "blank",
                    "milestones"
                ],
            }
        },
        milestones: {
            0: {
                requirementDescription: "1 super point",
                done() { return player.sp.best.gte(1)},
                effectDescription: "Keep row 5 milestones. <b>Better BP Combo III</b> effect always equal to booster effect. <b>Better GP Combo</b> effect always equal to generator power.",
            },
            1: {
                requirementDescription: "2 super points",
                done() { return player.sp.best.gte(2)},
                effectDescription: "Autobuy Balance Energy buyables.",
            },
            2: {
                requirementDescription: "3 super points",
                done() { return player.sp.best.gte(3)},
                effectDescription: "Auto-allocate 100% of magic to all 4 spells per second without spending magic.",
            },
            3: {
                requirementDescription: "10 super points",
                done() { return player.sp.best.gte(10)},
                effectDescription: "Gain 100% of magic gain per second.",
            },
            4: {
                requirementDescription: "20 super points",
                done() { return player.sp.best.gte(20)},
                effectDescription: "Gain 100% of balance energy gain per second.",
            },
            5: {
                requirementDescription: "100 super points",
                done() { return player.sp.best.gte(100)},
                effectDescription: "Unlock Wraiths in Phantom Soul layer.",
            },
            6: {
                requirementDescription: "400 super points",
                done() { return player.sp.best.gte(400)},
                effectDescription: "Unlock more prestige upgrades.",
            },
            7: {
                requirementDescription: "2000 super points",
                done() { return player.sp.best.gte(2000)},
                effectDescription: "Gain 100% of coronal waves gain per second.",
            },
            8: {
                requirementDescription: "5000 super points",
                done() { return player.sp.best.gte(5000)},
                effectDescription: "Boosters are cheaper.",
            },
            9: {
                requirementDescription: "20000 super points",
                unlocked() { return player.hs.unlocked },
                done() { return player.sp.best.gte(20000) && player.hs.unlocked},
                effectDescription: "Super points boost hyperspace energy gain.",
            },
            10: {
                requirementDescription: "1e6 super points",
                unlocked() { return player.l.unlocked },
                done() { return player.sp.best.gte(1e6) && player.l.unlocked},
                effectDescription: "M/BA requirements are 1.",
            },
            11: {
                requirementDescription: "1e7 super points",
                unlocked() { return player.l.unlocked },
                done() { return player.sp.best.gte(1e7) && player.l.unlocked},
                effectDescription: "Prestige Point gain is better.",
            },
            12: {
                requirementDescription: "5e7 super points",
                unlocked() { return player.l.unlocked },
                done() { return player.sp.best.gte(5e7) && player.l.unlocked},
                effectDescription: "Hyperspace Energy requirement is reduced.",
            },
            13: {
                requirementDescription: "2e8 super points",
                unlocked() { return player.l.unlocked },
                done() { return player.sp.best.gte(2e8) && player.l.unlocked},
                effectDescription: "Prestige Point and Super Point gain is better based on super points.",
            },
            14: {
                requirementDescription: "1e12 super points",
                unlocked() { return player.i.unlocked },
                done() { return player.sp.best.gte(1e12) && player.i.unlocked},
                effectDescription: "Super Point upgrades boost Super Point gain.",
            },
            15: {
                requirementDescription: "1e16 super points",
                unlocked() { return player.i.unlocked },
                done() { return player.sp.best.gte(1e16) && player.i.unlocked},
                effectDescription: "Hyperspace Energy requirement is reduced.",
            },
            16: {
                requirementDescription: "1e20 super points",
                unlocked() { return player.i.unlocked },
                done() { return player.sp.best.gte(1e20) && player.i.unlocked},
                effectDescription: "Imperium Bricks boost hyperspace energy gain.",
            },
        },
		upgrades: {
			rows: 5,
			cols: 5,
			11: {
				title: "Life-Hyperspace Synergy",
				description: "The 3 Life Essence milestone is better.",
				cost() { return new Decimal(1e8) },
				unlocked() { return player.i.unlocked && hasUpgrade("p", 11) },
			},
			12: {
				title: "Super Boost",
				description: "Total Super Points boost Prestige Points.",
				cost() { return new Decimal(1e12) },
				unlocked() { return player.i.unlocked && hasUpgrade("p", 12) },
				effect() { 
                    let exp=new Decimal(100);
                    if(hasUpgrade("sp",22))exp=exp.mul(player.sp.upgrades.length);
                    return player.sp.total.plus(1).pow(exp);
                },
				effectDisplay() { return format(tmp.sp.upgrades[12].effect)+"x" },
			},
			13: {
				title: "Self-Self-Synergy",
				description: "<b>Self-Synergy</b> is stronger.",
				cost() { return new Decimal(1e13) },
				unlocked() { return player.i.unlocked && hasUpgrade("p", 13) },
			},
			21: {
				title: "Hyperspace-Life Synergy",
				description: "Life Essence gain is boosted by Hyperspace Energy.",
				cost() { return new Decimal(2e14) },
				unlocked() { return player.i.unlocked && hasUpgrade("p", 21) },
				effect() { return player.hs.points.add(10).log10(); },
				effectDisplay() { return format(tmp.sp.upgrades[21].effect)+"x" },
			},
			22: {
				title: "Superpowered Upgrades",
				description: "<b>Super Boost</b> is stronger based on your SP upgrades.",
				cost() { return new Decimal(5e14) },
				unlocked() { return player.i.unlocked && hasUpgrade("p", 22) },
			},
			23: {
				title: "Reversal Sensational",
				description: "<b>Reverse Prestige Boost</b> is stronger.",
				cost() { return new Decimal(5e18) },
				unlocked() { return player.i.unlocked && hasUpgrade("p", 23) },
			},

        }
});

addLayer("hs", {
    name: "hyperspace",
    symbol: "HS",
    position: 3,
    row: 5,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},

        roundUpCost: true,
        color: "#dfdfff",
        requires() { if(hasMilestone("sp",15))return new Decimal(200); if(hasMilestone("sp",12))return new Decimal(240); return new Decimal(277) }, // Can be a function that takes requirement increases into account
        resource: "hyperspace energy", // Name of prestige currency 
        baseResource: "space energy", // Name of resource prestige is based on
        baseAmount() {return player.s.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { 
            let exp = new Decimal(10);
            return exp;
        }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
            if(hasMilestone("sp",9))mult = mult.mul(player.sp.points.add(10).log10());
            if(hasMilestone("l",1))mult = mult.mul(hasUpgrade("sp",11)?player.l.points.add(10).log10().mul(10):5);
            if(hasMilestone("sp",16))mult = mult.mul(player.i.points.add(1));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "ctrl+s", description: "Press Ctrl+S to Hyperspace Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.ss.unlocked && player.sp.unlocked },
branches: ["ss", "ba"],
        tabFormat: ["main-display",
            "prestige-button",
            "resource-display",
                    ["blank", "5px"],
                    ["buyable",1],
                        "buyables","upgrades","milestones"

        ],
        update(){
            player.hs.buyables[11]=player.hs.buyables[1].add(1).div(2).floor();
            player.hs.buyables[12]=player.hs.buyables[1].add(2).div(4).floor();
            player.hs.buyables[13]=player.hs.buyables[1].add(4).div(8).floor();
            player.hs.buyables[14]=player.hs.buyables[1].add(8).div(16).floor();
        },
    buyables: {
            rows: 1,
            cols: 8,
            1: {
                title: "Hyperspace", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(2, x.pow(1.5)).floor();
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    function calcNext(a){
                        a=a.add(1);
                        if(a.gte(1000))return "";
                        a=a.toNumber();
                        if(a%2)return "Next Hyperspace will be allocated to Hyper Building 1.<br>";
                        if(a%4)return "Next Hyperspace will be allocated to Hyper Building 2.<br>";
                        if(a%8)return "Next Hyperspace will be allocated to Hyper Building 3.<br>";
                        if(a%16)return "Next Hyperspace will be allocated to Hyper Building 4.<br>";
                    }
                    let next = calcNext(player[this.layer].buyables[this.id]);
                    return "You have "+format(player.hs.buyables[1])+" Hyperspace.<br>"+next+
                    "Cost for Next Hyperspace: "+format(data.cost)+" Hyperspace Energy";
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost);
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px'},
            },
            11: {
                display() { 
                    let data = tmp[this.layer].buyables[this.id]
                    return "Hyper Building 1<br>"+
                    "Level: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
                    "Effect: Space Building 1's effect ^"+format(data.effect)+"<br>";
                },
                unlocked() { return player[this.layer].buyables[1].gte(1) }, 
                canAfford() {
                    return false;
                },
                effect(){
                    let x=player[this.layer].buyables[this.id];
                    return x.mul(0.2).add(1);
                },
                style: {'height':'120px','width':'120px','background-color':'#dfdfff'},
            },
            12: {
                display() { 
                    let data = tmp[this.layer].buyables[this.id]
                    return "Hyper Building 2<br>"+
                    "Level: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
                    "Effect: Space Building 2's effect ^"+format(data.effect)+"<br>";
                },
                unlocked() { return player[this.layer].buyables[1].gte(2) }, 
                canAfford() {
                    return false;
                },
                effect(){
                    let x=player[this.layer].buyables[this.id];
                    return x.mul(0.2).add(1);
                },
                style: {'height':'120px','width':'120px','background-color':'#dfdfff'},
            },
            13: {
                display() { 
                    let data = tmp[this.layer].buyables[this.id]
                    return "Hyper Building 3<br>"+
                    "Level: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
                    "Effect: Space Building 3's effect ^"+format(data.effect)+"<br>";
                },
                unlocked() { return player[this.layer].buyables[1].gte(4) }, 
                canAfford() {
                    return false;
                },
                effect(){
                    let x=player[this.layer].buyables[this.id];
                    return x.mul(0.2).add(1);
                },
                style: {'height':'120px','width':'120px','background-color':'#dfdfff'},
            },
            14: {
                display() { 
                    let data = tmp[this.layer].buyables[this.id]
                    return "Hyper Building 4<br>"+
                    "Level: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
                    "Effect: Space Building 4's effect ^"+format(data.effect)+"<br>";
                },
                unlocked() { return player[this.layer].buyables[1].gte(8) }, 
                canAfford() {
                    return false;
                },
                effect(){
                    let x=player[this.layer].buyables[this.id];
                    return x.mul(0.2).add(1);
                },
                style: {'height':'120px','width':'120px','background-color':'#dfdfff'},
            },
    },
        milestones: {
            0: {
                requirementDescription: "1 hyperspace energy",
                done() { return player.hs.best.gte(1)},
                effectDescription: "Space Energy is cheaper. Keep balance upgrades and unlock more balance upgrades.",
            },
            1: {
                requirementDescription: "50 hyperspace energy",
                done() { return player.hs.best.gte(50)},
                effectDescription: "Space Building 3's effect is changed.",
            },
            2: {
                requirementDescription: "300 hyperspace energy",
                done() { return player.hs.best.gte(300)},
                effectDescription: "<b>Spacetime Anomaly</b>'s effect is better.",
            },
            3: {
                requirementDescription: "50000 hyperspace energy",
                done() { return player.hs.best.gte(50000)},
                effectDescription: "Time Energy effects ^1.25",
            },
        }
});

addLayer("l", {
    name: "life",
    symbol: "L",
    position: 1,
    row: 5,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        power: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
	color: "#7fbf7f",
    requires: function(){
		return new Decimal(1e28);
	},
    resource: "life essence",
    baseResource: "hexes", 
    baseAmount() {return player.m.hexes},
    type: "normal",
    exponent: 0.1,

    hotkeys: [
            {key: "l", description: "L: Reset for life essence", onPress(){if (canReset(this.layer)) doReset(this.layer)}},],
    layerShown(){return player.hs.unlocked},
	branches: ["o","m",["ps",3]],
	gainMult(){
		let ret=new Decimal(1);
            if(hasUpgrade("sp",21))ret = ret.mul(upgradeEffect("sp",21));
		return ret;
	},
	effect() {
		let ret = player.l.points;
		ret=ret.mul(tmp.ps.effect);
		return ret;
	},
	effectDescription() { // Optional text to describe the effects
           let eff = this.effect();
           return "which are generating "+format(eff)+" Life Power/sec";
       },
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },

	milestones: {
            0: {requirementDescription: "1 Life Essence",
                done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
                effectDescription: "Autobuy Phantom Souls and wraiths, Phantom Souls resets nothing. Wraith are cheaper.",
            },
            1: {requirementDescription: "3 Life Essence",
                done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
                effectDescription(){ if(hasUpgrade("sp",11))return "Gain more Hyperspace Energy based on Life Essence.";return "Gain 5x more Hyperspace Energy."},
            },
            2: {requirementDescription: "30 Life Essence",
                done() {return player[this.layer].best.gte(30)}, // Used to determine when to give the milestone
                effectDescription: "Unlock a Life Booster.",
            },
            3: {requirementDescription: "300 Life Essence",
                done() {return player[this.layer].best.gte(300)}, // Used to determine when to give the milestone
                effectDescription: "<b>Time Reverse</b> effect is better.",
            },
            4: {requirementDescription: "1e4 Life Essence",
                done() {return player[this.layer].best.gte(10000)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Noval Remnants.",
            },
            5: {requirementDescription: "1e6 Life Essence",
                done() {return player[this.layer].best.gte(1e6)}, // Used to determine when to give the milestone
                effectDescription: "Unlock a Life Booster.",
            },
	},
	 update(diff){
		 player.l.power = player.l.power.add(tmp.l.effect.times(diff)).max(0)
		 if(hasMilestone("l",2)){
			 if(player.ps.points.gte(layers.l.buyables[11].cost())){
				 player.l.buyables[11]=player.ps.points.add(1);
			 }
		 }
		 if(hasMilestone("l",5)){
			 if(player.ps.points.gte(layers.l.buyables[12].cost())){
				 player.l.buyables[12]=player.ps.points.add(1);
			 }
		 }
	 },
	 tabFormat: ["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"],
                    ["display-text",
                        function() {
							return 'You have ' + format(player.l.power) + ' Life Power, which multiplies hex gain by ' + format(tmp.l.lifePowerEff);
						},
                        {}],
						"milestones",
						"buyables",
						"upgrades",
				],
	lifePowerEff(){
		let ret=player.l.power.add(1).sqrt();
		return ret;
	},

	buyables: {
            rows: 1,
            cols: 7,
            11: {
                title: "Life Booster 1", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = x;
                    if(!hasMilestone("l",2))return Decimal.dInf;
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Amount: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
					"Next at: "+formatWhole(data.cost)+" Phantom Souls<br>"+
					"Effect: +"+format(data.effect.sub(1))+" to Super Booster base";
                },
				effect(){
					let x=player[this.layer].buyables[this.id].mul(player.l.power.add(1).log10().add(1));
					return x.pow(0.1).sub(1).div(5).max(0).add(1);
				},
                unlocked() { return hasMilestone("l",2) }, 
                canAfford() {
					return false;
				},
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px','background-color':'#7fbf7f'},
            },
            12: {
                title: "Life Booster 2", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = x;
                    if(!hasMilestone("l",5))return Decimal.dInf;
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Amount: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
					"Next at: "+formatWhole(data.cost)+" Phantom Souls<br>"+
					"Effect: Gain "+format(data.effect)+"x more Hexes";
                },
				effect(){
					let x=player[this.layer].buyables[this.id].mul(player.l.power.add(1).log10().add(1));
					return Decimal.pow(2,x.pow(0.5));
				},
                unlocked() { return hasMilestone("l",5) }, 
                canAfford() {
					return false;
				},
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px','background-color':'#7fbf7f'},
            },
    },

});


addLayer("i", {
    name: "imperium",
    symbol: "I",
    position: 4,
    row: 5,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
    }},
        color: "#e5dab7",
        requires() { return new Decimal("1e110") }, // Can be a function that takes requirement increases into account
        resource: "imperium bricks", // Name of prestige currency
        baseResource: "subspace", // Name of resource prestige is based on
        baseAmount() {return player.ss.subspace}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(2), // Prestige currency exponent
		base() { return new Decimal("1e15") },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "i", description: "Press I to Imperium Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
 doReset(resettingLayer){ 
			let keep = ["buyables","milestones"];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.l.unlocked},
                branches: ["ss"],
                		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			"buyables",
            "upgrades","milestones"
		],
        milestones: {
            
            0: {requirementDescription: "1 Imperium Brick",
                done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
                effectDescription: "Milestones and buyables in this layer won't reset. Unlock SP upgrades.",
            },
        },
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "Imperium Building",
				cap() { return new Decimal(1) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(2);
					return cost;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
                    let display = (player[this.layer].buyables[this.id].gte(data.cap)?"MAXED":("Cost: "+formatWhole(cost)+" Imperium Bricks"))+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(data.cap)+"\n\
					Unlocked "+formatWhole(player[this.layer].buyables[this.id])+" new Space Building"+(player[this.layer].buyables[this.id].eq(1)?"":"s")
					return display;
                },
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.i.unlocked && player.i.points.gte(cost) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
					if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
					if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
        }
});


addLayer("ma", {
		name: "mastery", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "MA", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			first: 0,
			mastered: [],
			selectionActive: false,
			current: null,
        }},
        color: "#ff9f7f",
        requires() { return new Decimal(20) }, // Can be a function that takes requirement increases into account
        resource: "mastery", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
		roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(100), // Prestige currency exponent
		base: new Decimal(100),
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return false },
        row: 6, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "A", description: "Press Shift+A to Mastery Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            
        },
        layerShown(){return player.ps.unlocked && player.i.unlocked},
        branches: ["sp", "hs", ["ps", 2]],
        milestones: {
            0: {requirementDescription: "1 Mastery",
                done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
                effectDescription: "This layer won't reset. Keep Row 6 milestones.",
            },
        },
})
