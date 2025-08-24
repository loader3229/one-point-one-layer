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
        if(player.ma.points.gte(1)){
            if(hasMilestone("sp",13))eff = eff.add(player.sp.points.add(1).log10());
            return eff.add(100).mul(player.points.pow(2).div(40).add(1)).mul(muleff);
        }
        if(hasMilestone("sp",11)){
            if(hasMilestone("sp",13))eff = eff.add(player.sp.points.add(1).log10());
            ret=new Decimal(10).add(eff).mul(player.points.pow(2).div(50).max(1)).mul(muleff);
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
                    if(inChallenge("ne",11))return new Decimal(1);
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
                    if(player.ma.points.gte(1)) return eff.pow(player.points.div(20).max(1));
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
                    if(hasUpgrade("sp",31))eff = eff.pow(player.sp.upgrades.length**3);
                    if(hasUpgrade("sp",32))eff = eff.pow(7);
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
                    if(player.ma.points.gte(1)) return eff.pow(player.points.div(20).max(1));
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
                effect() { return player.p.total.plus(1).log10().plus(1).log10().div(hasUpgrade("p",14)?(hasUpgrade("sp",14)?0.9:1):5).mul(player.ma.points.gte(1)?(player.points.div(20).max(1)):1).mul(hasUpgrade("sp",33)?upgradeEffect("sp",33):1).plus(1) },
                cost() { return new Decimal(1e53); },
                unlocked() { return hasUpgrade("p", 32) },
                effectDisplay() { return "^"+format(tmp.p.upgrades[33].effect) },
            },
			34: {
				title: "Solar Potential",
				description: "Solarity multiplies the Solarity gain exponent.",
                cost() { return new Decimal("1e102400"); },
                unlocked() { return hasUpgrade("p", 24) },
				effect() { return player.o.points.plus(1).log10().plus(1).log10().plus(1).log10().mul(hasUpgrade("sp",34)?upgradeEffect("sp",34):1).plus(1) },
				effectDisplay() { return format(tmp.p.upgrades[34].effect)+"x" },
			},
            41: {
                title: "Prestige Recursion",
                description: "Prestige Points boost their own gain.",
                cost() { return new Decimal("1e38000"); },
                unlocked() { return hasMilestone("sp", 6) && hasUpgrade("p", 31) },
                effect() { 
                    let eff = Decimal.pow(10, player.p.points.plus(1).log10().pow(hasUpgrade("sp",41)?0.7:0.6));
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
			44: {
				title: "Spelling Dictionary",
				description: "2nd-4th Spells are stronger.",
                cost() { return new Decimal("1e300000"); },
				unlocked() { return player.ma.points.gte(1) },
			},


        },
    layerShown(){return true},
    
        doReset(resettingLayer) {
            let keep = [];
            if (hasMilestone("t", 1)) keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
        },
        passiveGeneration() { return (hasMilestone("t", 2)?1:0) },
        marked: function(){return player.ma.points.gte(1)}
})


addLayer("b", {
        name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#6e64c4",
        requires() { 
            if(player.ma.points.gte(2))return new Decimal(2).sub(player.points.sub(20).max(0).div(10).min(1));
            if(player.ma.points.gte(1))return new Decimal(2).sub(player.points.sub(20).max(0).div(20).min(1));
            return new Decimal(2)
        }, // Can be a function that takes requirement increases into account
        resource: "boosters", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["p"],
        exponent() {
            if(player.h.challenges[12]>=23)return Math.max(1.23/Math.sqrt(player.h.challenges[12]),0.25);
            if(player.h.challenges[12]>=20.92)return Math.max(1.225/Math.sqrt(player.h.challenges[12]),0.257);
            if(player.h.challenges[12]>=19.4)return Math.max(1.211/Math.sqrt(player.h.challenges[12]),0.268);
            if(player.h.challenges[12]>=18.1)return Math.max(5.08/player.h.challenges[12],0.275);
            if(player.h.challenges[12]>=16)return 5/Math.min(player.h.challenges[12],17.8);
            if(player.h.challenges[12]>=9)return 4.5/Math.min(player.h.challenges[12],14);
            return 0.5
        },
        base() { 
            let ret=1.3;
            if(hasUpgrade("b",23))ret-=0.01;
            if(hasMilestone("h",2))ret-=0.02;
            if(hasMilestone("h",20))ret-=0.005;
            if(hasMilestone("h",40))ret-=0.005;
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
            if (hasUpgrade("b", 24)) base = base.times(upgradeEffect("b", 24));
            if (hasUpgrade("b", 34)) base = base.times(upgradeEffect("b", 34));
            return base;
        },
        effect() {
            if(inChallenge("h", 12)||inChallenge("ne",11))return new Decimal(1);
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
                    if(player.ma.points.gte(2))return Decimal.pow(10,player.b.best);
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
                    if(player.ma.points.gte(2))ret = player.g.points.div(1000);
                    if(hasUpgrade("b",14))ret = ret.mul(player.sb.points.div(100).add(1));
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
                    if(player.ma.points.gte(2))ret = player.p.total.add(1).log10().sqrt().div(100);
                    if(hasUpgrade("b",14))ret = ret.mul(player.sb.points.div(100).add(1));
                    if(hasMilestone("h",9))ret=ret.add(1);
                    return ret;
                },
                unlocked() { return player.b.unlocked&&player.b.best.gte(7) },
                effectDisplay() { if(hasMilestone("h",9))return format(tmp.b.upgrades[13].effect)+"x";return "+"+format(tmp.b.upgrades[13].effect) },
            },
			14: {
				title: "Meta-Combo",
				description: "Super Boosters boost 2 upgrades left.",
                cost() { return new Decimal(6160) },
                unlocked() { return player.ma.points.gte(2) },
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
			24: {
				title: "Boost Recursion",
				description: "Boosters multiply their own base.",
                cost() { return new Decimal(6300) },
                unlocked() { return player.ma.points.gte(2) },
				effect() { return player.b.points.div(1000).plus(1) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
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
			34: {
				title: "Anti-Metric",
				description: "Imperium Bricks multiply Booster base.",
                cost() { return new Decimal(10000) },
                unlocked() { return player.ma.points.gte(2) },
				effect() { return player.i.points.plus(1) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
			},
        },
        marked: function(){return player.ma.points.gte(2)}
})



addLayer("g", {
        name: "generators", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#a3d9a5",
        requires() {
            let b=3;
            if(hasUpgrade("g",22))b-=0.15;
            if(hasUpgrade("g",32))b-=0.05;
            if(hasUpgrade("sp",43))b-=0.05;
            if(hasUpgrade("sp",35))b-=0.05;
            if(player.ma.points.gte(3)){
                return new Decimal(b).sub(player.points.sub(20).max(0).div(10)).max(1);
            }
            return new Decimal(b) 
        }, // Can be a function that takes requirement increases into account
        resource: "generators", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["p"],
        exponent() {
            if(player.h.challenges[12]>=23)return Math.max(1.23/Math.sqrt(player.h.challenges[12]),0.25);
            if(player.h.challenges[12]>=20.92)return Math.max(1.225/Math.sqrt(player.h.challenges[12]),0.257);
            if(player.h.challenges[12]>=19.4)return Math.max(1.211/Math.sqrt(player.h.challenges[12]),0.268);
            if(player.h.challenges[12]>=18.1)return Math.max(5.08/player.h.challenges[12],0.275);
            if(player.h.challenges[12]>=16)return 5/Math.min(player.h.challenges[12],17.8);
            if(player.h.challenges[12]>=9)return 4.5/Math.min(player.h.challenges[12],14);
            return 0.5
        },
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
            
            if (hasUpgrade("g", 12) && player.ma.points.lt(3)) base = base.plus(upgradeEffect("g", 12));
            if (hasUpgrade("g", 13) && player.ma.points.lt(3)) base = base.plus(upgradeEffect("g", 13));
            if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).g);
            if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect()[0]);
            if (hasUpgrade("s",14)&&!hasMilestone("hs",1)) base = base.plus(buyableEffect("s", 13));
            
            if (hasUpgrade("g", 12) && player.ma.points.gte(3)) base = base.times(upgradeEffect("g", 12));
            if (hasUpgrade("g", 13) && player.ma.points.gte(3)) base = base.times(upgradeEffect("g", 13));
            if (hasUpgrade("s",14)&&hasMilestone("hs",1)) base = base.times(buyableEffect("s", 13));
            if (player.sg.unlocked) base = base.times(tmp.sg.effect);
            if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
            return base;
        },
        effect() {
            if(inChallenge("h", 12)||inChallenge("ne",11))return new Decimal(0);
            if (player[this.layer].unlocked){
                let eff=Decimal.pow(tmp.g.effectBase, player.g.points).mul(player.g.points);
                
                if (hasUpgrade("g", 21)) eff = eff.times(upgradeEffect("g", 21));
                if (hasUpgrade("s", 12)) eff = eff.times(upgradeEffect("s", 12));
                if (hasUpgrade("s", 13)) eff = eff.times(upgradeEffect("s", 13));
                if (hasUpgrade("t", 15)) eff = eff.times(softcap(softcap(layers.t.powerEff(),new Decimal("1e110000"),0.5),new Decimal("1e150000"),0.5).min("1e200000"));
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
                    if(player.ma.points.gte(3))return Decimal.pow(10,player.g.best);
                    let ret = player.g.best.plus(1);
                    return ret;
                },
                unlocked() { return player.g.unlocked },
                effectDisplay() { return format(tmp.g.upgrades[11].effect)+"x" },
            },
            12: {
                title: "I Need More!",
                description(){
                    if(player.ma.points.gte(3))return "Boosters multiplies the Generator base.";
                    return "Boosters add to the Generator base.";
                },
                cost() { return new Decimal(12) },
                effect() { 
                    let ret = player.b.points.add(1).log10();
                    if(player.ma.points.gte(3))ret = player.b.points.div(15000);
                    if(hasUpgrade("s",24))ret = ret.mul(upgradeEffect("s",24));
                    if(player.ma.points.gte(3))ret = ret.add(1);
                    return ret;
                },
                unlocked() { return player.b.unlocked&&player.g.unlocked },
                effectDisplay() { if(player.ma.points.gte(3))return format(tmp.g.upgrades[12].effect)+"x";return "+"+format(tmp.g.upgrades[12].effect) },
            },
            13: {
                title: "I Need More II",
                description(){
                    if(player.ma.points.gte(3))return "Best Prestige Points multiplies the Generator base.";
                    return "Best Prestige Points add to the Generator base.";
                },
                cost() { return new Decimal(14) },
                effect() { 
                    let ret = player.p.best.add(1).log10().add(1).log10();
                    if(player.ma.points.gte(3))ret = player.p.best.add(1).log10().sqrt().div(1500);
                    if(hasUpgrade("s",24))ret = ret.mul(upgradeEffect("s",24));
                    if(player.ma.points.gte(3))ret = ret.add(1);
                    return ret;
                },
                unlocked() { return player.g.best.gte(8) },
                effectDisplay() { if(player.ma.points.gte(3))return format(tmp.g.upgrades[13].effect)+"x";return "+"+format(tmp.g.upgrades[13].effect) },
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
                    let eff = player.g.points.pow(player.ma.points.gte(3)?0.75:hasMilestone("h",8)?0.68:0.5).add(1);
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
                effect() { return player.b.points.pow(player.ma.points.gte(3)?0.75:hasMilestone("h",8)?0.68:0.3).add(1) },
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
			31: {
				title: "Absurd Generation",
				description: "Generator Power multiplies the Super Generator base.",
                cost() { return new Decimal(6370) },
				unlocked() { return player.ma.points.gte(3) },
				effect() { return player.g.power.plus(1).log10().plus(1).log10().plus(1).log10().div(100).plus(1) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
			},
			32: {
				title: "Another Discount",
                description: "Generators are cheaper.",
                cost() { return new Decimal(6410) },
				unlocked() { return player.ma.points.gte(3) },
			},
			33: {
				title: "Life Production",
				description: "Generators boost Life Power gain.",
                cost() { return new Decimal(7100) },
				unlocked() { return player.ma.points.gte(3) },
				effect() { return Decimal.pow(1.15, player.g.points.sqrt()) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
			},
			34: {
				title: "Time Generators",
				description: "Generator Power multiplies the Time Capsule base.",
                cost() { return new Decimal(12000) },
				unlocked() { return player.ma.points.gte(3) },
				effect() { return player.g.power.plus(1).log10().sqrt().div(500).plus(1) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
			},
			35: {
				title: "Into The Future",
				description: "Life Essence, Super Points, and Hyperspace Energy gains are boosted by Generator Power.",
                cost() { return new Decimal(13700) },
				unlocked() { return player.ma.points.gte(3) },
				effect() { return player.g.power.plus(1).log10().plus(1).sqrt() },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
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
        marked: function(){return player.ma.points.gte(3)}
})



addLayer("t", {
        name: "time", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#006609",
        requires() { 
            if(hasMilestone("i",3))return new Decimal(4).sub(player.points.max(23).sub(23).div(2)).max(1);
            return new Decimal(4) 
        }, // Can be a function that takes requirement increases into account
        resource: "time capsules", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["b"],
        exponent() { 
            a=0.75;
            if(player.h.challenges[22]>=19.63)a=Math.max(Math.min(9.2/player.h.challenges[22],0.4279),0.3915);
            else if(player.h.challenges[22]>=10.5)a=a*10/Math.min(player.h.challenges[22],16);
            if(hasUpgrade("sp",25))a=a-0.001;
            if(hasMilestone("i",10))a=a-0.001;
            if(hasMilestone("h",48))a=a-0.001;
            if(hasUpgrade("q",31))a=a/(player.q.buyables[11].add(1).log10().mul(0.01).toNumber()+1);
            a=Math.max(a,0.375);
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
            if (hasUpgrade("g",34)) base = base.times(upgradeEffect("g",34));
            base = base.mul(tmp.en.twEff);
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
            if(player.ma.points.gte(4))ret = ret.pow(1.25)
            return ret;
        },
        powerEff2() {
            if (!hasUpgrade("t",24)) return new Decimal(1);
            let ret=player.t.power.plus(1).log10().sqrt().div(2);
            if(hasMilestone("h",21))ret=player.t.power.plus(1).log10().pow(0.6);
            if(player.ge.unlocked)ret=player.t.power.plus(1).log10().pow(0.7);
            if(hasUpgrade("t",33))ret=player.t.power.plus(1).log10().pow(0.75);
            if(hasUpgrade("t",34))ret=player.t.power.plus(1).log10().pow(0.8);
            if(hasUpgrade("sp",15))ret=player.t.power.plus(1).log10().pow(0.81);
            if(hasUpgrade("t",14))ret = ret.mul(1.28)
            if(hasMilestone("hs",3))ret = ret.mul(1.25)
            if(player.ma.points.gte(4))ret = ret.mul(1.25)
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
            if (hasMilestone("q",8)&&hasUpgrade("t",31))player.t.buyables[11]=player.t.buyables[11].max(player.b.points.pow(1/1.45).add(0.000001).floor());
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
                    if(hasUpgrade("t",31))cost = x.add(1).pow(1.45).ceil();
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
                    if(player.ge.unlocked)ret = player.t.points.add(1).mul(hasUpgrade("t", 13)?upgradeEffect("t", 13):1);
                    if(hasUpgrade("q",34) && !player.ge.unlocked)ret=ret.add(1);
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
                description(){
                    if(player.ge.unlocked)return "Extra Time Capsules multiplies the <b>Pseudo-Boost</b>'s effect."
                    return "Extra Time Capsules add to the <b>Pseudo-Boost</b>'s effect."
                },
                cost() { return new Decimal(13) },
                unlocked() { return hasUpgrade("t", 12) },
                effect() { 
                    if(player.ge.unlocked)return player.t.buyables[11].add(1);
                    return player.t.buyables[11].pow(0.95);
                },
                effectDisplay() { if(player.ge.unlocked)return format(tmp.t.upgrades[13].effect)+"x";return "+"+format(tmp.t.upgrades[13].effect) }
            },
            14: {
                title: "More Time",
                description: "The Time Energy effect is raised to the power of 1.28.",
                cost() { return new Decimal(19) },
                unlocked() { return hasUpgrade("t", 13) },
            },
            15: {
                title: "Time Potency",
                description: "Time Energy affects Generator Power gain. (softcap at 1e110000 Time Energy effect, hardcap at 1e390000)",
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
                    if(player.ge.unlocked)return player.e.points.plus(1);
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
			31: {
				title: "Cheap Time",
				description: "Extra Time Capsules are cheaper.",
                cost() { return new Decimal(720) },
                unlocked() { return player.ma.points.gte(4) },
			},
			32: {
				title: "The Hypertime Continuum",
				description: "Hyperspace cost is reduced.",
                cost() { return new Decimal(900) },
                unlocked() { return player.ma.points.gte(4) },
			},
			33: {
				title: "Virtually Limitless",
				description: "2nd Time Energy effect is better.",
                cost() { return new Decimal(1375) },
                unlocked() { return player.ma.points.gte(4) },
			},
			34: {
				title: "Don't Kill Time",
				description: "2nd Time Energy effect is better.",
                cost() { return new Decimal(2660) },
                unlocked() { return player.ma.points.gte(4) },
			},
			35: {
				title: "Subtemporal Power",
				description: "Subspace base x1.2, and gain more Hyperspace Energy based on Time Capsules.",
                cost() { return new Decimal(3750) },
                unlocked() { return player.ma.points.gte(4) },
			},
        },
        canBuyMax() { return hasMilestone("q",1) },
        autoPrestige() { return hasMilestone("q",5) },
        resetsNothing() { return hasMilestone("q",5) },
        marked: function(){return player.ma.points.gte(4)}
})


addLayer("s", {
        name: "space", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#dfdfdf",
        requires() { 
            if(hasMilestone("i",3))return new Decimal(4).sub(player.points.max(23).sub(23).div(2)).max(1);
            if(player.ma.points.gte(5))return new Decimal(4);
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
            if(player.h.challenges[22]>=19.63)a=Math.max(Math.min(9.2/player.h.challenges[22],0.4279),0.3915);
            else if(player.h.challenges[22]>=10.5)a=a*10/Math.min(player.h.challenges[22],16);
            if(hasUpgrade("sp",25))a=a-0.001;
            if(hasMilestone("i",10))a=a-0.001;
            if(hasMilestone("h",48))a=a-0.001;
            if(hasUpgrade("q",31))a=a/(player.q.buyables[11].add(1).log10().mul(0.01).toNumber()+1);
            a=Math.max(a,0.375);
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
                    let cost = Decimal.pow(hasUpgrade("s",34)?800:hasUpgrade("s",31)?1e3:1e4,Decimal.pow(x,1.35)).pow(hasUpgrade("sp",42)?0.9:hasUpgrade("p",42)?0.95:1)
                    if(x.eq(0))return new Decimal(0)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(player.s.points.mul(layers.ss.eff1()).mul(buyableEffect("s",25)).add(1),x.add(hasUpgrade("s",32)?player.s.buyables[12].div(5):0).add(buyableEffect("s",15)).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1).mul(3));
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
                    let cost = Decimal.pow(hasUpgrade("s",34)?4e4:hasUpgrade("s",31)?1e5:1e6,Decimal.pow(x,1.35)).pow(hasUpgrade("sp",42)?0.9:hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(player.s.points.mul(layers.ss.eff1()).mul(buyableEffect("s",25)).add(1),x.add(hasUpgrade("s",32)?player.s.buyables[13].div(5):0).add(buyableEffect("s",15)).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1).mul(3));
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
                    let cost = Decimal.pow(hasUpgrade("s",34)?3e7:hasUpgrade("s",31)?1e8:1e10,Decimal.pow(x,1.35)).pow(hasUpgrade("sp",42)?0.9:hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = player.s.points.mul(layers.ss.eff1()).mul(buyableEffect("s",25)).mul(x.add(hasUpgrade("s",32)?player.s.buyables[14].div(5):0).add(buyableEffect("s",15)).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1)).pow(0.4);
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
                    let cost = Decimal.pow(hasUpgrade("s",34)?8e11:hasUpgrade("s",31)?1e13:1e20,Decimal.pow(x,1.35)).pow(hasUpgrade("sp",42)?0.9:hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = player.s.points.mul(layers.ss.eff1()).mul(buyableEffect("s",25)).mul(x.add(hasUpgrade("s",32)?player.s.buyables[15].div(5):0).add(buyableEffect("s",15)).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1)).pow(0.2).add(1);
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
                    let cost = Decimal.pow(hasUpgrade("s",34)?1e40:1e50,Decimal.pow(x,1.35)).pow(hasUpgrade("sp",42)?0.9:hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if(!hasUpgrade("s",25))return new Decimal(0);
                    let eff = player.s.points.mul(layers.ss.eff1()).mul(buyableEffect("s",25)).mul(x.add(hasUpgrade("s",32)?player.s.buyables[21].div(5):0).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1)).pow(0.5).div(5);
                    eff = eff.mul(buyableEffect("hs",15));
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
                    let cost = Decimal.pow(1e30,Decimal.pow(x,1.35)).pow(hasUpgrade("sp",42)?0.9:hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if(player.i.buyables[11].lt(1))return new Decimal(1);
                    let eff = player.s.points.mul(layers.ss.eff1()).mul(buyableEffect("s",25)).mul(x.add(hasUpgrade("s",32)?player.s.buyables[22].div(5):0).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1)).pow(0.25).div(100).add(1);
                    eff = eff.pow(buyableEffect("hs",21));
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
            22: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e60,Decimal.pow(x,1.35)).pow(hasUpgrade("sp",42)?0.9:hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if(player.i.buyables[11].lt(2))return new Decimal(1);
                    let eff = Decimal.pow(player.s.points.mul(layers.ss.eff1()).mul(buyableEffect("s",25)).add(1),x.add(hasUpgrade("s",32)?player.s.buyables[23].div(5):0).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1).mul(20).pow(0.8));
                    eff = eff.pow(buyableEffect("hs",22));
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 7\n\
                    Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Divide phantom soul cost by "+format(data.effect)+". (Boosted by your Space Energy)";
                },
                unlocked() { return player.i.buyables[11].gte(2) }, 
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
            23: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e100,Decimal.pow(x,1.35)).pow(hasUpgrade("sp",42)?0.9:hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if(player.i.buyables[11].lt(3))return new Decimal(1);
                    let eff = player.s.points.mul(layers.ss.eff1()).mul(buyableEffect("s",25)).add(1).log10().mul(x.add(hasUpgrade("s",32)?player.s.buyables[24].div(5):0).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1).add(1).log10()).add(1);
                    eff = eff.pow(buyableEffect("hs",23));
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 8\n\
                    Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Hyperspace Energy gain by "+format(data.effect)+". (Boosted by your Space Energy)";
                },
                unlocked() { return player.i.buyables[11].gte(3) }, 
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
            24: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e150,Decimal.pow(x,1.35)).pow(hasUpgrade("sp",42)?0.9:hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if(player.i.buyables[11].lt(4))return new Decimal(1);
                    let eff = player.s.points.mul(layers.ss.eff1()).mul(buyableEffect("s",25)).add(1).log10().mul(x.add(hasUpgrade("s",32)?player.s.buyables[25].div(5):0).add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1).add(1).log10()).div(100).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 9\n\
                    Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Spell effects by "+format(data.effect)+". (Boosted by your Space Energy)";
                },
                unlocked() { return player.i.buyables[11].gte(4) }, 
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
            25: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e300,Decimal.pow(x,1.35)).pow(hasUpgrade("sp",42)?0.9:hasUpgrade("p",42)?0.95:1)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if(player.i.buyables[11].lt(5))return new Decimal(1);
                    let eff = x.add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).add(hasUpgrade("ss",31)?upgradeEffect("ss",31):0).mul(hasUpgrade("s",21)?1.08:1).add(1).log10().div(5).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 10\n\
                    Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Effective Space Energy by "+format(data.effect)+".";
                },
                unlocked() { return player.i.buyables[11].gte(5) }, 
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
        rows: 3,
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
			31: {
				title: "Useful Dimensionality",
				description: "The first four Space Buildings' cost are cheaper.",
                cost() { return new Decimal(960) },
				unlocked() { return player.ma.points.gte(5) },
			},
			32: {
				title: "Poincaré Recurrence",
				description: "1/5 of Each Space Building's bought Level adds to the previous building's Extra Level.",
                cost() { return new Decimal(1325) },
				unlocked() { return player.ma.points.gte(5) },
			},
			33: {
				title: "Noncontinuous Spectrum",
				description: "Space Energy multiplies Hyperspace Energy gain.",
                cost() { return new Decimal(2620) },
				unlocked() { return player.ma.points.gte(5) },
				effect() { return player.s.points.plus(1) },
				effectDisplay() { return format(tmp.s.upgrades[this.id].effect)+"x" },
			},
			34: {
				title: "Energetic Reduction",
				description: "The first five Space Buildings' cost are cheaper.",
                cost() { return new Decimal(4000) },
				unlocked() { return player.ma.points.gte(5) },
			},
			35: {
				title: "Contiguous Dimension",
				description: "Space Energy multiplies Super Point gain.",
                cost() { return new Decimal(2090) },
				unlocked() { return player.ma.points.gte(5) },
				effect() { return player.s.points.plus(1) },
				effectDisplay() { return format(tmp.s.upgrades[this.id].effect)+"x" },
			},

    },
    
        canBuyMax() { return hasMilestone("q",2) },
        autoPrestige() { return hasMilestone("q",6) },
        resetsNothing() { return hasMilestone("q",6) },
        
        update(diff){
            var pow=player.g.power.pow(hasUpgrade("sp",42)?(1/0.9):hasUpgrade("p",42)?(1/0.95):1);
          if(player.i.buyables[11].gte(5)){
             var target=pow.add(1).log(1e300).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[25])){
                player.s.buyables[25]=target;
            }
         }
          if(player.i.buyables[11].gte(4)){
             var target=pow.add(1).log(1e150).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[24])){
                player.s.buyables[24]=target;
            }
         }
          if(player.i.buyables[11].gte(3)){
             var target=pow.add(1).log(1e100).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[23])){
                player.s.buyables[23]=target;
            }
         }
         if(player.i.buyables[11].gte(2)){
             var target=pow.add(1).log(1e60).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[22])){
                player.s.buyables[22]=target;
            }
         }
         if(player.i.buyables[11].gte(1)){
             var target=pow.add(1).log(1e30).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[21])){
                player.s.buyables[21]=target;
            }
         }
         if(hasUpgrade("s",25)){
             var target=pow.add(1).log(hasUpgrade("s",34)?1e40:1e50).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[15])){
                player.s.buyables[15]=target;
            }
         }
        if(hasMilestone("ss",1)){
            var target=pow.add(1).log(hasUpgrade("s",34)?8e11:hasUpgrade("s",31)?1e13:1e20).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[14])){
                player.s.buyables[14]=target;
            }
            
        }
        if(hasMilestone("ss",0)){
            var target=pow.add(1).log(hasUpgrade("s",34)?3e7:hasUpgrade("s",31)?1e8:1e10).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[13])){
                player.s.buyables[13]=target;
            }
            
        }
        if(hasMilestone("q",11)){
            var target=pow.add(1).log(hasUpgrade("s",34)?4e4:hasUpgrade("s",31)?1e5:1e6).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[12])){
                player.s.buyables[12]=target;
            }
            
        }
         if(hasMilestone("q",10)){
             var target=pow.add(1).log(hasUpgrade("s",34)?800:hasUpgrade("s",31)?1e3:1e4).pow(1/1.35).add(1).floor();
            if(target.gt(player.s.buyables[11])){
                player.s.buyables[11]=target;
            }
         }
        },
        marked: function(){return player.ma.points.gte(5)}
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
            if(player.ma.points.gte(6))return new Decimal(1);
            if(hasMilestone("h",6))return new Decimal(6).min(Decimal.sub(8.5,player.points.div(4)).max(1));
            return new Decimal(6)
        }, // Can be a function that takes requirement increases into account
        resource: "enhance points", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent(){
            if(player.ma.points.gte(6) && player.points.gte(26))return player.points.pow(player.points.sub(10).div(10).min(2)).add(player.points.sub(20).mul(5).min(100));
            if(player.ma.points.gte(6))return player.points.pow(1.6).add(30);
            if(hasMilestone("h",6))return new Decimal(30).max(player.points.pow(1.5));
            return 30;
        },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if(hasUpgrade("e",22))mult=mult.mul(buyableEffect("e",11)[2]);
            if(hasUpgrade("e",24))mult=mult.mul(upgradeEffect("e",24));
            if(hasMilestone("sp",17))mult = mult.mul(player.sp.points.add(1));
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
        rows: 3,
        cols: 4,
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
			31: {
				title: "Amplification",
				description: "Enhancer effect is better.",
                cost() { return new Decimal("1e1400") },
                unlocked() { return player.ma.points.gte(6) },
			},
			32: {
				title: "Supplementation",
				description: "Best Super Points provides free Enhancers.",
                cost() { return new Decimal("1e1777") },
                unlocked() { return player.ma.points.gte(6) },
				effect() { return player.sp.best.plus(1).log10().div(50) },
				effectDisplay() { return "+"+format(tmp[this.layer].upgrades[this.id].effect) },
			},
			33: {
				title: "Augmentation",
				description: "Enhancer effect is better.",
                cost() { return new Decimal("1e4250") },
                unlocked() { return player.ma.points.gte(6) },
			},
			34: {
				title: "Intensification",
				description: "Enhancer is cheaper.",
                cost() { return new Decimal("1e2333") },
                unlocked() { return player.ma.points.gte(6) },
			},
    },
    buyables: {
            rows: 1,
            cols: 1,
            11: {
                title: "Enhancers", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(hasUpgrade("e",34)?1.9:hasMilestone("h",27)?2:10, x.pow(1.5))
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if(hasUpgrade("e",13))x=x.add(1);
                    if(hasUpgrade("e",21))x=x.add(2);
                    if(hasUpgrade("e",23))x=x.add(upgradeEffect("e",23));
                    if(hasUpgrade("e",32))x=x.add(upgradeEffect("e",32));
                    if(hasUpgrade("q",22))x=x.add(upgradeEffect("q",22));
                    if(inChallenge("h",31))x=new Decimal(0);
                    let eff = [];
                    eff[0]=x;
                    eff[1]=x;
                    eff[2]=new Decimal(1);
                    
                    if(hasUpgrade("e",33)){
                        eff[0]=eff[0].pow(8/7);
                        eff[1]=eff[1].pow(8/7);
                        eff[2]=Decimal.pow(challengeEffect("h",31).mul(buyableEffect("m",22)).mul(2),x);
                    }else if(hasUpgrade("e",31)){
                        eff[0]=eff[0].pow(1.125);
                        eff[1]=eff[1].pow(1.125);
                        eff[2]=Decimal.pow(challengeEffect("h",31).mul(buyableEffect("m",22)).mul(2),x);
                    }else if(hasMilestone("m",7)){
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
                var target=player.e.points.add(1).log(hasUpgrade("e",34)?1.9:hasMilestone("h",27)?2:10).pow(1/1.5).add(1).floor();
                if(target.gt(player.e.buyables[11])){
                    player.e.buyables[11]=target;
                }
         }
     },
        marked: function(){return player.ma.points.gte(6)}
});        



addLayer("sb", {
        name: "super boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SB", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        row: 2,
        color: "#504899",
        requires() {
            if(hasMilestone("sp",20))return new Decimal(10).sub(player.sp.points.add(10).log10().sub(200).max(0).div(10)).max(1);
            if(player.ma.points.gte(7))return new Decimal(12); 
            return new Decimal(24)
        }, // Can be a function that takes requirement increases into account
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
            if(player.ma.points.gte(7))base = new Decimal(1.35);
            if(hasMilestone("l",2))base = base.add(buyableEffect("l",11)).sub(1);
            base = base.mul(tmp.en.swEff);
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
        marked: function(){return player.ma.points.gte(6)}
});

addLayer("sg", {
        name: "super generators", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SG", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        row: 2,
        color: "#248239",
        requires(){
            if(hasMilestone("sp",20))return new Decimal(10).sub(player.sp.points.add(10).log10().sub(200).max(0).div(10)).max(1);
            if(player.ma.points.gte(11))return new Decimal(12); 
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
        base() { 
            if(player.ma.points.gte(11))return 1.08; return 1.1 },
        layerShown(){return player.ss.unlocked},
        effectBase() {
            let base = new Decimal(1.05);
            if(player.ma.points.gte(11))base = new Decimal(1.06);
            if(hasUpgrade("g",31))base = base.mul(upgradeEffect("g",31));
            if(hasMilestone("ne",1))base = base.mul(tmp.ne.thoughtEff2);
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
        marked: function(){return player.ma.points.gte(11)}
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
            let b=player.q.buyables[12];
            if(hasMilestone("m",2))keep.push("upgrades");
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
                player.q.buyables[12]=b;
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
            if(hasUpgrade("q",23))exp = player.q.buyables[11].add(player.q.buyables[12].add(1).div(4).floor().sqrt());
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
            cols: 2,
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
            12: {
                title: "Quirk Improvements", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if(hasUpgrade("q",35))return Decimal.pow(10,x.pow(2).mul(1000));
                    let cost = Decimal.pow(hasUpgrade("q",44)?"1e115000":hasUpgrade("q",42)?"1e135000":"1e145000", x.div(10).add(1).pow(2))
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "You have "+format(player[this.layer].buyables[this.id])+" Quirk Improvements.<br>"+
                    "Next Effect: "+(["<b>Row 4 Synergy</b> is better.","<b>Quirk City</b> is better.","<b>The Waiting Game</b> is better.","<b>Infinite Possibilities</b> is better."])[player[this.layer].buyables[this.id].toNumber()%4]+
                    "<br>Cost for next Quirk Improvement: " + format(data.cost) + " Quirk Energy";
                },
                canAfford() {
                    return player[this.layer].energy.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].energy = player[this.layer].energy.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                unlocked(){
                    return hasUpgrade("q",41);
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
                    let hmul=Decimal.pow(10,q.plus(10).log10().pow(0.5)).pow(player.q.buyables[12].add(3).div(4).floor().sqrt());
                    let qmul=Decimal.pow(10,h.plus(10).log10().pow(0.5)).pow(player.q.buyables[12].add(3).div(4).floor().sqrt());
                    if(hasUpgrade("q",24))return {
                        h: q.plus(1).root(20).pow(player.ma.points.gte(8)?1.6:1).mul(hmul),
                        q: h.plus(1).root(40).pow(player.ma.points.gte(8)?1.6:1).mul(qmul),
                    };
                    return {
                        h: q.plus(1).root(50).mul(hmul),
                        q: h.plus(1).root(100).mul(qmul),
                    };
                },
                effectDisplay() { return "H: "+format(tmp.q.upgrades[14].effect.h)+"x, Q: "+format(tmp.q.upgrades[14].effect.q)+"x" },
            },
			15: {
				title: "Quirk Extension",
				description: "Hindrance Spirit effect based on points is better based on Quirk Energy.",
                cost() { return new Decimal("1e25255") },
				unlocked() { return player.ma.points.gte(8) },
			},
            21: {
                title: "Quirk City",
                description: "Super Boosters multiply each Quirk Layer's production.",
                cost() { return new Decimal(1e280) },
                unlocked() { return hasUpgrade("q", 11)&&hasUpgrade("q", 13) },
                effect() { return Decimal.pow(1.1, player.sb.points).pow(player.q.buyables[12].add(2).div(4).floor().sqrt().add(1)) },
                effectDisplay() { return format(tmp.q.upgrades[21].effect)+"x" },
            },
            22: {
                title: "Infinite Possibilities",
                description: "Total Quirks provide free Extra Enhancers.",
                cost() { return new Decimal("1e920") },
                unlocked() { return hasUpgrade("q", 12)&&hasUpgrade("q", 14) },
                effect() { return player.q.total.plus(1).log10().plus(1).log10().mul(player.q.buyables[12].div(4).floor().sqrt().add(1)); },
                effectDisplay() { return "+"+format(tmp.q.upgrades[22].effect) },
            },
            23: {
                title: "The Waiting Game",
                description(){
                    if(player.q.buyables[12].gte(3))return "Add "+format(player.q.buyables[12].add(1).div(4).floor().sqrt().add(1))+" free Quirk Layers.";
                    return "Add a free Quirk Layer.";
                },
                cost() { return new Decimal("1e1010") },
                unlocked() { return hasUpgrade("q", 13)&&hasUpgrade("q", 21) },
            },
            24: {
                title: "Exponential Madness",
                description(){ if(player.ma.points.gte(8))return "Effect of <b>Row 4 Synergy</b> are raised ^4."; return "Effect of <b>Row 4 Synergy</b> are raised ^2.5."},
                cost() { return new Decimal("1e1135") },
                unlocked() { return hasUpgrade("q", 14)&&hasUpgrade("q", 22) },
            },
			25: {
				title: "Neuron Boost",
				description: "Neuron requirement is reduced to 1 and signal gain is doubled.",
                cost() { return new Decimal("1e117500") },
				unlocked() { return player.r.unlocked },
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
			35: {
				title: "Millennial Abilities",
				description: "Quirk Improvements are cheaper.",
                cost() { return new Decimal("1e188800") },
				unlocked() { return player.r.unlocked },
			},
			41: {
				title: "Quirkier",
				description: "Unlock Quirk Improvements.",
                cost() { return new Decimal("1e44000") },
				unlocked() { return player.ma.points.gte(8) },
			},
			42: {
				title: "Improvement Boost",
				description: "Quirk Improvements are cheaper.",
                cost() { return new Decimal("1e63000") },
				unlocked() { return player.ma.points.gte(8) },
			},
			43: {
				title: "Neuron Boost II",
				description: "Neurons are cheaper and signal gain is doubled.",
                cost() { return new Decimal("1e123456") },
				unlocked() { return player.r.unlocked },
			},
			44: {
				title: "Improvements Galore",
				description: "Quirk Improvements are cheaper.",
                cost() { return new Decimal("1e134250") },
				unlocked() { return player.r.unlocked },
			},
			45: {
				title: "Anti-Hindrance",
				description: "Hindrance Spirit effect based on points is better based on Quirks.",
                cost() { return new Decimal("1e212000") },
				unlocked() { return player.r.unlocked },
			},

        },
        passiveGeneration() { return hasMilestone("ba",6)?1:0 },
        marked: function(){return player.ma.points.gte(8)}
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
            let eff = player.h.points.times(player.points.add(1).pow(hasUpgrade("q",15)?player.q.energy.add(10).log10().sqrt().add(1):1).pow(hasUpgrade("q",45)?player.q.points.add(10).log10().pow(0.1).add(1):1)).add(1).pow(2);
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
                done() { return player.h.challenges[41]>=7.8},
                effectDescription: "7th Challenge Effect is boosted by hindrance spirit.",
            },
            35: {
                requirementDescription: "19.6 points in 4th Challenge",
                done() { return player.h.challenges[22]>=19.6},
                effectDescription: "The 10.5 points in 4th Challenge milestone effect is better.",
            },
            36: {
                requirementDescription: "18 points in 8th Challenge",
                done() { return player.h.challenges[42]>=18},
                effectDescription: "8th Challenge Effect is boosted by hindrance spirit.",
            },
            37: {
                requirementDescription: "7.7 points in 9th Challenge",
                done() { return player.h.challenges[51]>=7.7},
                effectDescription: "5th Challenge Effect is better.",
            },
            38: {
                requirementDescription: "8 points in 9th Challenge",
                done() { return player.h.challenges[51]>=8},
                effectDescription: "9th Challenge Effect is boosted by hindrance spirit.",
            },
            39: {
                requirementDescription: "21 points in 4th Challenge",
                done() { return player.h.challenges[22]>=21},
                effectDescription: "4th Challenge Effect is boosted by hindrance spirit.",
            },
            40: {
                requirementDescription: "21 points in 2nd Challenge",
                done() { return player.h.challenges[12]>=21},
                effectDescription: "Boosters are cheaper.",
            },
            41: {
                requirementDescription: "11 points in 1st Challenge",
                done() { return player.h.challenges[11]>=11},
                effectDescription: "1st Challenge add a new reward.",
            },
            42: {
                requirementDescription: "3.3 points in 10th Challenge",
                unlocked(){return player.ma.points.gte(9)},
                done() { return player.h.challenges[52]>=3.3},
                effectDescription: "<b>Anti-Timeless</b> effect is better.",
            },
            43: {
                requirementDescription: "3.375 points in 10th Challenge",
                unlocked(){return player.ma.points.gte(9)},
                done() { return player.h.challenges[52]>=3.375},
                effectDescription: "<b>Anti-Timeless</b> effect is better.",
            },
            44: {
                requirementDescription: "24 points in 2nd Challenge",
                unlocked(){return player.ma.points.gte(9)},
                done() { return player.h.challenges[12]>=24},
                effectDescription: "Hindrance Spirit Challenge Boost boost Energy",
            },
            45: {
                requirementDescription: "3.4 points in 10th Challenge",
                unlocked(){return player.ma.points.gte(9)},
                done() { return player.h.challenges[52]>=3.4},
                effectDescription: "<b>Anti-Timeless</b> effect is better.",
            },
            46: {
                requirementDescription: "25 points in 4th Challenge",
                unlocked(){return player.ma.points.gte(9)},
                done() { return player.h.challenges[22]>=25},
                effectDescription: "<b>Anti-Timeless</b> effect is better.",
            },
            47: {
                requirementDescription: "3.425 points in 10th Challenge",
                unlocked(){return player.ma.points.gte(9)},
                done() { return player.h.challenges[52]>=3.425},
                effectDescription: "6th Challenge Effect is better.",
            },
            48: {
                requirementDescription: "12.5 points in 1st Challenge",
                done() { return player.h.challenges[11]>=12.5},
                effectDescription: "Time Capsules and Space Energy are cheaper.",
            },
        },
        getHCBoost(){
            if(inChallenge("ne",11))return new Decimal(0);
            return player.h.points.add(1).log10().add(1).log10().add(1);
        },
        challenges: {
            rows: 5,
            cols: 2,
            11: {
                name: "Halved Points (1)",
                challengeDescription: "Your points are divided by 2.",
                unlocked() { return hasMilestone("h",1) },
                rewardDescription(){
                    if(player[this.layer].challenges[this.id]>=11)return "Add Prestige, Super Point and SP upgrade 'Super Boost' base Exponent based on highest points in this challenge."; 
                    if(player[this.layer].challenges[this.id]>=9)return "Add Prestige and Super Point Exponent based on highest points in this challenge.";
                    return "Add Prestige Exponent based on highest points in this challenge."
                },
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    if(inChallenge("ne",11))return new Decimal(0);
                    let ret=new Decimal(player[this.layer].challenges[this.id]).mul(challengeEffect("h",41)).mul(challengeEffect("h",51)).mul(challengeEffect("h",52));
                    if(hasMilestone("h",4) || player.ma.points.gte(9))ret = ret.mul(layers.h.getHCBoost());
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
                    if(inChallenge("ne",11))return new Decimal(1);
                    let ret=new Decimal(player[this.layer].challenges[this.id]).mul(challengeEffect("h",42)).mul(challengeEffect("h",51)).mul(challengeEffect("h",52));
                    if(hasMilestone("h",24) || player.ma.points.gte(9))ret = ret.mul(layers.h.getHCBoost());
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
                    if(inChallenge("ne",11))return new Decimal(1);
                    let ret=new Decimal(player[this.layer].challenges[this.id]).mul(challengeEffect("h",41)).mul(challengeEffect("h",51)).mul(challengeEffect("h",52));
                    if(hasMilestone("h",26) || player.ma.points.gte(9))ret = ret.mul(layers.h.getHCBoost());
                    ret = ret.sqrt();
                    if(hasMilestone("h",17)){
                        ret=new Decimal(player[this.layer].challenges[this.id]).mul(challengeEffect("h",41)).mul(challengeEffect("h",51)).mul(challengeEffect("h",52)).div(15);
                        if(hasMilestone("h",26) || player.ma.points.gte(9))ret = ret.mul(layers.h.getHCBoost());
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
                    if(inChallenge("ne",11))return new Decimal(1);
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(10).mul(challengeEffect("h",42)).mul(challengeEffect("h",51)).mul(challengeEffect("h",52));
                    if(hasUpgrade("ss",23)){
                        let mxtime=20000;
                        if(player.m.unlocked)mxtime=25000;
                        if(player.ps.unlocked)mxtime=30000;
                        if(player.sp.unlocked)mxtime=35000;
                        if(player.hs.unlocked)mxtime=40000;
                        if(player.l.unlocked)mxtime=45000;
                        if(player.i.unlocked)mxtime=50000;
                        if(player.ma.unlocked)mxtime=55000;
                        if(player.ge.unlocked)mxtime=60000;
                        if(player.mc.unlocked)mxtime=65000;
                        if(player.ne.unlocked)mxtime=70000;
                        if(player.en.unlocked)mxtime=75000;
                        if(player.r.unlocked)mxtime=80000;
                        if(player.id.unlocked)mxtime=85000;
                        ret=ret.mul(Math.min(player.timePlayed,mxtime)/(hasMilestone("h",46)?3000:hasMilestone("h",45)?7000:hasMilestone("h",43)?10000:hasMilestone("h",42)?20000:hasMilestone("h",32)?50000:100000)+1);
                    }
                    if(hasMilestone("h",39) || player.ma.points.gte(9))ret = ret.mul(layers.h.getHCBoost());
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
                    if(inChallenge("ne",11))return new Decimal(1);
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(20).mul(challengeEffect("h",41)).mul(challengeEffect("h",51)).mul(challengeEffect("h",52));
                    if(hasMilestone("h",37) || player.ma.points.gte(9))ret = ret.mul(layers.h.getHCBoost());
                    ret = ret.add(1);
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
                    if(inChallenge("ne",11))return new Decimal(1);
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(hasMilestone("h",47)?1:hasMilestone("h",33)?5:hasMilestone("h",30)?10:hasMilestone("h",23)?20:50).mul(challengeEffect("h",42)).mul(challengeEffect("h",51)).mul(challengeEffect("h",52));
                    let a = 4;
                    if(hasMilestone("i",5))a = 1;
                    if(player.ma.points.gte(9))ret = ret.mul(layers.h.getHCBoost().max(a)).div(a);
                    ret = ret.add(1);
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
                    if(inChallenge("ne",11))return new Decimal(1);
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(100).mul(challengeEffect("h",51)).mul(challengeEffect("h",52));
                    if(hasMilestone("h",34) || player.ma.points.gte(9))ret = ret.mul(layers.h.getHCBoost());
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
                    if(inChallenge("ne",11))return new Decimal(1);
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(200).mul(challengeEffect("h",51)).mul(challengeEffect("h",52));
                    if(hasMilestone("h",36) || player.ma.points.gte(9))ret = ret.mul(layers.h.getHCBoost());
                    ret = ret.add(1);
                    return ret;
                },
                rewardDisplay(){return format(challengeEffect("h",this.id))+"x"},
                countsAs: [12,22,32]
            },
            51: {
                name: "The Reality (9)",
                challengeDescription: "The Last Challenge! Left Wing and Right Wing at once.",
                unlocked() { return hasMilestone("h",29) },
                rewardDescription(){return "Effect of all previous 8 challenges are stronger."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    if(inChallenge("ne",11))return new Decimal(1);
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(100).mul(challengeEffect("h",52));
                    if(player.ma.points.gte(9))ret = ret.mul(layers.h.getHCBoost());
                    else if(hasMilestone("h",38))ret = ret.mul(player.h.points.add(1).log10().add(1).log10().div(2).add(1));
                    ret = ret.add(1);
                    return ret;
                },
                rewardDisplay(){return format(challengeEffect("h",this.id))+"x"},
                countsAs: [11,21,31,12,22,32]
            },
            52: {
                name: "The True Reality (10)",
                challengeDescription: "THE VERY LAST CHALLENGE! The Reality and your points are log2(points+1) after Halved Points.",
                unlocked() { return player.ma.points.gte(9) },
                rewardDescription(){return "Effect of all previous 9 challenges are stronger."},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    if(inChallenge("ne",11))return new Decimal(1);
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(200).mul(layers.h.getHCBoost()).add(1);
                    return ret;
                },
                rewardDisplay(){return format(challengeEffect("h",this.id))+"x"},
                countsAs: [11,21,31,12,22,32],
                onEnter(){
                    updateTemp();
                    updateTemp();
                    updateTemp();
                }
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
                    ["display-text",function(){
                    if(player.ma.points.gte(9))return "Your Hindrance Spirit are boosting all 10 Challenge reward effects by "+format(layers.h.getHCBoost())+"x";
                    }],
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
        marked: function(){return player.ma.points.gte(9)}
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
        requires() { 
            if(hasMilestone("ne",5))return new Decimal(1);
            if(player.ne.unlocked)return new Decimal(1).add(Decimal.pow(0.9,player.ne.thoughts).mul(7));
            if(player.ma.points.gte(10))return new Decimal(10);
            return new Decimal(16);
        }, // Can be a function that takes requirement increases into account
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
            if(hasMilestone("l",7))base = base.mul(buyableEffect("l",13));
            if(hasMilestone("i",2))base = base.mul(player.i.points.div(10).add(1));
            if(hasMilestone("ne",1))base = base.mul(tmp.ne.thoughtEff2);
            if(hasUpgrade("t",35))base = base.mul(1.2);
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
            if(player.ma.points.gte(8))gain = gain.mul(Decimal.pow(tmp.ma.milestoneBase,player.ma.points));
        if(hasMilestone("i",4))gain = gain.mul(Decimal.pow(2,player.i.points));
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
            if(hasUpgrade("ss",42))eff=player.ss.subspace.plus(1).log10().root(5);
            if(player.ma.points.gte(10))eff = eff.pow(1.25);
            if(hasUpgrade("ss",12))eff=eff.mul(upgradeEffect("ss",12));
            if(hasMilestone("l",6))eff=eff.mul(buyableEffect("o",23));
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
			42: {
				title: "Sub-Subspace",
				description: "Subspace effect is better.",
                cost() { return new Decimal(1e150) },
				currencyDisplayName: "subspace",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasMilestone("i",1) },
			},
			43: {
				title: "Non-Challenging Speedup",
				description() { return "Point gain is raised to the power of 1.01." },
                cost() { return new Decimal(1e235) },
				currencyDisplayName: "subspace",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasMilestone("i",1) },
			},
        },
        canBuyMax() { return hasMilestone("ba",1) },
        autoPrestige() { return hasMilestone("m",1) },
        resetsNothing() { return hasMilestone("m",1) },
        marked: function(){return player.ma.points.gte(10)}
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
            if(player.ma.points.gte(12))req=req.sub(player.o.points.add(10).log10().sqrt().min(19));
            return req;
        },
        resource: "solarity", // Name of prestige currency
        baseResource: "super boosters", // Name of resource prestige is based on
        baseAmount() {return player.sb.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { 
            let exp = new Decimal(15);
            if(hasUpgrade("p",34))exp = exp.mul(upgradeEffect("p",34));
            if(player.ma.points.gte(12))exp = exp.mul(buyableEffect("o",32));
            exp = exp.mul(tmp.en.owEff);
            return exp;
        }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = buyableEffect("o", 11);
            if(hasUpgrade("ba",14))mult = mult.mul(upgradeEffect("ba",14));
            if(player.ma.points.gte(8))mult = mult.mul(Decimal.pow(tmp.ma.milestoneBase,player.ma.points));
            mult = mult.mul(buyableEffect("r",21));
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
            gain = gain.mul(buyableEffect("r",21));
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
            if(hasMilestone("l",6))player.o.buyables[23] = player.o.buyables[23].plus(tmp.o.buyables[23].gain.times(diff));
            if(hasMilestone("l",9))player.o.buyables[31] = player.o.buyables[31].plus(tmp.o.buyables[31].gain.times(diff));
            if(player.ma.points.gte(12))player.o.buyables[32] = player.o.buyables[32].plus(tmp.o.buyables[32].gain.times(diff));
            if(player.ma.points.gte(12))player.o.buyables[33] = player.o.buyables[33].plus(tmp.o.buyables[33].gain.times(diff));
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
            if(hasMilestone("l",10))pow=pow.add(buyableEffect("l", 14));
            if(player.ma.points.gte(12))pow=pow.add(1);
            if(player.ma.points.gte(14))pow=pow.add(buyableEffect("m", 31).sub(1));
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
                gain() { if(hasMilestone("l",8))return player.o.points.root(1.5).mul(100).floor(); return player.o.points.div(2).root(1.5).floor() },
                effect() { 
                    let amt = player[this.layer].buyables[this.id]
                    if(amt.gte(1e10))amt=Decimal.pow(10,Decimal.pow(10,amt.log10().log10().cbrt()));
                    return hasUpgrade("ss", 22)?(amt.plus(1).pow(tmp.o.solPow).cbrt()):(amt.plus(1).pow(tmp.o.solPow).log10().plus(1))
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Solar Cores\n"+
                    (hasMilestone("l",8)?"":"Req: 100 Solarity\n")+
                    "Amount: " + formatWhole(player[this.layer].buyables[this.id])+("\nEffect: Multiplies Solarity gain by "+format(tmp[this.layer].buyables[this.id].effect)))
                    return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() { return player.o.points.gte(100) || hasMilestone("l",8) },
                buy() { 
                    player.o.points = new Decimal(0);
                    player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                style: {'height':'140px', 'width':'140px'},
            },
            12: {
                title: "Tachoclinal Plasma",
                gain() { if(hasMilestone("l",8))return player.o.points.times(player.o.energy).root(3).mul(100).floor(); return player.o.points.div(100).times(player.o.energy.div(2500)).root(3.5).floor() },
                effect() { 
                if(hasUpgrade("p",24))return Decimal.pow(10, player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().cbrt());
                return (player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).log10().times(10).plus(1)) },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity & Solar Energy for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Tachoclinal Plasma\n"+
                    (hasMilestone("l",8)?"":"Req: 100 Solarity & 1e6 Solar Energy\n")+
                    "Amount: " + formatWhole(player[this.layer].buyables[this.id])+"\n"+
                    ("Effect: Multiplies Quirk Layer base by "+format(tmp[this.layer].buyables[this.id].effect)))
                    return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() { return (player.o.points.gte(100)&&player.o.energy.gte(1000000)) || hasMilestone("l",8) },
                buy() { 
                    player.o.points = new Decimal(0);
                    player.o.energy = new Decimal(0);
                    player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
            },
            13: {
                title: "Convectional Energy",
                gain() { if(hasMilestone("l",8))return player.o.points.times(player.o.energy).times(player.ss.subspace).root(6).mul(100).floor(); return player.o.points.div(1e3).times(player.o.energy.div(2e5)).times(player.ss.subspace.div(10)).root(6.5).floor() },
                effect() { return player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).pow(2.5) },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity, Solar Energy, & Subspace for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Convectional Energy\n"+
                    (hasMilestone("l",8)?"":"Req: 1e5 Solarity, 1e9 Solar Energy, & 1e10 Subspace\n")+
                    "Amount: " + formatWhole(player[this.layer].buyables[this.id]))+"\n"+
                    ("Effect: Multiplies Subspace gain by "+format(tmp[this.layer].buyables[this.id].effect))
                    return display;
                },
                unlocked() { return player[this.layer].unlocked&&player.ss.unlocked }, 
                canAfford() { return (player.o.points.gte(1e5)&&player.o.energy.gte(1e9)&&player.ss.subspace.gte(1e10)) || hasMilestone("l",8) },
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
                gain() { if(hasMilestone("l",11))return player.o.points.root(5).times(player.o.energy.root(30)).times(player.ss.subspace.root(8)).times(player.q.energy.root(675)).mul(100).floor();
                    return player.o.points.div(1e10).root(5).times(player.o.energy.div(1e40).root(30)).times(player.ss.subspace.div(1e50).root(8)).times(player.q.energy.div("1e3000").root(675)).floor() },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).log10();
                    if(hasUpgrade("sp",24))eff = eff.mul(2);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity, Solar Energy, Subspace, & Quirk Energy for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Coronal Waves\n"+
                    (hasMilestone("l",11)?"":"Req: 1e10 Solarity, 1e40 Solar Energy, 1e50 Subspace, & 1e3000 Quirk Energy\n")+
                    "Amount: " + formatWhole(player[this.layer].buyables[this.id]))+"\n"+("Effect: +"+format(tmp[this.layer].buyables[this.id].effect)+" to Subspace base & +"+format(tmp[this.layer].buyables[this.id].effect.times(100))+"% Solar Power")
                    return display;
                },
                unlocked() { return player[this.layer].unlocked&&hasUpgrade("ss", 41) }, 
                canAfford() { return (player.o.points.gte(1e10)&&player.o.energy.gte(1e40)&&player.ss.subspace.gte(1e50)&&player.q.energy.gte("1e3000")) || hasMilestone("l",11) },
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
				gain() { if(hasMilestone("l",11))return player.o.buyables[11].pow(3).floor(); return player.o.buyables[11].div(1e25).pow(3).floor() },
				effect() {
					return player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().root(10).plus(1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solar Cores for "+formatWhole(data.gain)+" Noval Remnants\n"+
					(hasMilestone("l",11)?"":"Req: 1e25 Solar Cores\n")+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+"\n"+
					("Effect: Multiply Super Point gain by "+format(data.effect)+"x"))
				},
				unlocked() { return hasMilestone("l",4) },
				canAfford() { return player.o.buyables[11].gte(1e25) || hasMilestone("l",11)},
				buy() {
					player.o.buyables[11] = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
			},
			23: {
				title: "Nuclear Forges",
				gain() { if(hasMilestone("l",11))return player.o.buyables[11].times(player.o.energy.root(10)).floor(); return player.o.buyables[11].div(1e30).times(player.o.energy.div("1e160").root(10)).floor() },
				effect() {
					return player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).log10().plus(1).root(5)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solar Cores & Solar Energy for "+formatWhole(data.gain)+" Nuclear Forges\n"+
					(hasMilestone("l",11)?"":"Req: 1e30 Solar Cores & 1e160 Solar Energy\n")+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+"\n"+
					"Effect: Subspace effect is "+format(data.effect)+"x stronger")
				},
				unlocked() { return hasMilestone("l",6) },
				canAfford() { return (player.o.buyables[11].gte(1e30)&&player.o.energy.gte("1e160")) || hasMilestone("l",11) },
				buy() {
					player.o.buyables[11] = new Decimal(0);
					player.o.energy = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
			},
			31: {
				title: "Blueshifted Flares",
				gain() { if(hasMilestone("l",12))return player.o.points.pow(10).floor(); return player.o.points.div("1e55").pow(10).floor() },
				effect() {
                    if(player.ma.points.gte(12))return player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).log10().div(10).add(1);
					return player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).log10().root(5).div(10).add(1);
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solarity for "+formatWhole(data.gain)+" Blueshifted Flares\n"+
					(hasMilestone("l",12)?"":"Req: 1e55 Solarity\n")+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+"\n"+
					"Effect: Multiply Spell Effects by "+format(data.effect))
				},
				unlocked() { return hasMilestone("l",9) },
				canAfford() { return player.o.points.gte("1e55") },
				buy() {
					player.o.points = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
			},
			32: {
				title: "Combustion Gas",
				gain() { if(hasMilestone("l",12))return player.o.energy.root(100).floor();return player.o.energy.div("1e400").root(100).floor() },
				effect() {
					return player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).log10().plus(1).log10().plus(1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solar Energy for "+formatWhole(data.gain)+" Combustion Gas\n"+
					(hasMilestone("l",12)?"":"Req: 1e400 Solar Energy\n")+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+"\n"+
					("Effect: Multiply the Solarity gain exponent by "+format(data.effect)+"."))
				},
				unlocked() { return player.ma.points.gte(12) },
				canAfford() { return player.o.energy.gte("1e400") },
				buy() {
					player.o.energy = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
			},
			33: {
				title: "Thermonuclear Reactants",
				gain() { if(hasMilestone("l",12))return player.o.points.pow(10).floor(); return player.o.points.div("1e110").pow(10).floor() },
				effect() {
					return player[this.layer].buyables[this.id].plus(1).pow(tmp.o.solPow).log10().plus(1).log10().div(20).plus(1);
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solarity for "+formatWhole(data.gain)+" Thermonuclear Reactants\n"+
					(hasMilestone("l",12)?"":"Req: 1e110 Solarity\n")+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+"\n"+
					("Effect: Hyperspace cost ^"+format(data.effect.pow(-1))));
				},
				unlocked() { return player.ma.points.gte(12) },
				canAfford() { return player.o.points.gte("1e110") },
				buy() {
					player.o.points = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
			},



        },
        passiveGeneration() { return (hasMilestone("ba", 4)?1:0) },
        marked: function(){return player.ma.points.gte(12)}
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
                 var target=player.ss.subspace.add(1).log(player.ma.points.gte(13)?1.1:2).pow(1/1).add(1).floor();
                if(target.gt(player.ba.buyables[11])){
                    player.ba.buyables[11]=target;
                }
                target=player.q.points.add(1).log(player.ma.points.gte(13)?2:10).pow(1/(player.ma.points.gte(13)?1.3:hasUpgrade("ba",33)?1.35:hasUpgrade("ba",23)?1.4:1.5)).add(1).floor();
                if(target.gt(player.ba.buyables[12])){
                    player.ba.buyables[12]=target;
                }
                target=player.ba.neg.add(1).log(3).pow(1/1).add(1).floor();
                if(target.gt(player.ba.buyables[13])){
                    player.ba.buyables[13]=target;
                }
                target=player.o.energy.add(1).log(player.ma.points.gte(13)?1.1:2).pow(1/1).add(1).floor();
                if(target.gt(player.ba.buyables[21])){
                    player.ba.buyables[21]=target;
                }
                target=player.h.points.add(1).log(player.ma.points.gte(13)?2:10).pow(1/(player.ma.points.gte(13)?1.3:hasUpgrade("ba",33)?1.35:hasUpgrade("ba",13)?1.4:1.5)).add(1).floor();
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
                    let cost = Decimal.pow(player.ma.points.gte(13)?1.1:2, x)
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
                effect(){return Decimal.pow(hasUpgrade("ba",35)?1.3:hasUpgrade("ba",25)?1.2:1.1, player[this.layer].buyables[this.id])},
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
                    let cost = Decimal.pow(player.ma.points.gte(13)?2:10, x.pow(player.ma.points.gte(13)?1.3:hasUpgrade("ba",33)?1.35:hasUpgrade("ba",23)?1.4:1.5))
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
                effect(){return Decimal.pow(hasUpgrade("ba",35)?1.3:hasUpgrade("ba",25)?1.2:1.1, player[this.layer].buyables[this.id])},
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
                effect(){return Decimal.pow(hasUpgrade("ba",35)?1.3:hasUpgrade("ba",25)?1.2:1.1, player[this.layer].buyables[this.id])},
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
                    let cost = Decimal.pow(player.ma.points.gte(13)?1.1:2, x)
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
                effect(){return Decimal.pow(hasUpgrade("ba",35)?1.3:hasUpgrade("ba",15)?1.2:1.1, player[this.layer].buyables[this.id])},
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
                    let cost = Decimal.pow(player.ma.points.gte(13)?2:10, x.pow(player.ma.points.gte(13)?1.3:hasUpgrade("ba",33)?1.35:hasUpgrade("ba",13)?1.4:1.5))
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
                effect(){return Decimal.pow(hasUpgrade("ba",35)?1.3:hasUpgrade("ba",15)?1.2:1.1, player[this.layer].buyables[this.id])},
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
                effect(){return Decimal.pow(hasUpgrade("ba",35)?1.3:hasUpgrade("ba",15)?1.2:1.1, player[this.layer].buyables[this.id])},
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
                cost() { return new Decimal(player.ge.unlocked?1e40:1e50) },
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
                cost() { return new Decimal(player.ge.unlocked?"1e360":"1e530") },
                unlocked() { return hasMilestone("hs", 0) },
            },
    },
        passiveGeneration() { return (hasMilestone("sp", 4)?1:0) },
        marked: function(){return player.ma.points.gte(13)}
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
            rows: 3,
            cols: 3,
            11: {
                title: "Booster Boost",
                gain() { return player.m.points },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].add(1).log10().mul(buyableEffect("o",31)).mul(player.i.buyables[11].gte(4)?buyableEffect("s",24):1).add(1);
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
                    let eff = player[this.layer].buyables[this.id].add(1).log10().sqrt().div(10).mul(buyableEffect("o",31)).mul(player.i.buyables[11].gte(4)?buyableEffect("s",24):1).add(1);
                    if(hasMilestone("l",3))eff = player[this.layer].buyables[this.id].add(1).log10().div(hasUpgrade("sp",44)?Math.max(1,10/buyableEffect("o",31).toNumber()):hasUpgrade("p",44)?Math.max(1,15/buyableEffect("o",31).toNumber()):20).mul(buyableEffect("o",31)).mul(player.i.buyables[11].gte(4)?buyableEffect("s",24):1).add(1);
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
            13: {
                title: "Gear Smoothing",
                gain() { return player.m.points },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].add(1).log10().mul(buyableEffect("o",31)).mul(player.i.buyables[11].gte(4)?buyableEffect("s",24):1).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Magic allocated: " + formatWhole(player[this.layer].buyables[this.id])+("\nEffect: Multiplies gear and rotation gain by "+format(tmp[this.layer].buyables[this.id].effect)))
                    return display;
                },
                unlocked() { return player.ma.points.gte(21) }, 
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
                    let eff = player[this.layer].buyables[this.id].add(1).log10().div(hasUpgrade("sp",44)?Math.max(1,10/buyableEffect("o",31).toNumber()):hasUpgrade("p",44)?Math.max(1,15/buyableEffect("o",31).toNumber()):20).mul(buyableEffect("o",31)).mul(player.i.buyables[11].gte(4)?buyableEffect("s",24):1).add(1);
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
                    let eff = player[this.layer].buyables[this.id].add(1).log10().div(hasUpgrade("sp",44)?Math.max(1,10/buyableEffect("o",31).toNumber()):hasUpgrade("p",44)?Math.max(1,15/buyableEffect("o",31).toNumber()):20).mul(buyableEffect("o",31)).mul(player.i.buyables[11].gte(4)?buyableEffect("s",24):1).add(1);
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
            31: {
                title: "Solar Empower",
                gain() { return player.m.points },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].add(1).log10().div(1000).mul(buyableEffect("o",31)).mul(player.i.buyables[11].gte(4)?buyableEffect("s",24):1).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Magic allocated: " + formatWhole(player[this.layer].buyables[this.id])+("\nEffect: Add Solar Power by "+format(tmp[this.layer].buyables[this.id].effect.sub(1).mul(100))+"%"))
                    return display;
                },
                unlocked() { return player.ma.points.gte(14) }, 
                canAfford() { return player.m.points.gt(0) },
                buy() { 
            player.m.buyables[this.id] = player.m.buyables[this.id].plus(player.m.points);
                    player.m.points = new Decimal(0);
                },
            },
            32: {
                title: "Robot Cloning",
                gain() { return player.m.points },
                effect() {
                    let eff = player[this.layer].buyables[this.id].add(1).log10().mul(buyableEffect("o",31)).mul(player.i.buyables[11].gte(4)?buyableEffect("s",24):1).div(Decimal.pow(10,Decimal.sub(3,player.i.buyables[12]))).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Magic allocated: " + formatWhole(player[this.layer].buyables[this.id])+("\nEffect: Multiply Robot gain by "+format(tmp[this.layer].buyables[this.id].effect)))
                    return display;
                },
                unlocked() { return hasMilestone("r",4) }, 
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
                if(player.ma.points.gte(14))player.m.buyables[31]=player.m.buyables[31].add(player.m.points.times(diff));
                if(hasMilestone("r",4))player.m.buyables[32]=player.m.buyables[32].add(player.m.points.times(diff));
                if(player.ma.points.gte(21))player.m.buyables[13]=player.m.buyables[13].add(player.m.points.times(diff));
            }
        },
        hexGain() {
            let gain = player.m.buyables[11].sqrt();
            gain=gain.add(player.m.buyables[12].sqrt());
            gain=gain.add(player.m.buyables[13].sqrt());
            gain=gain.add(player.m.buyables[21].sqrt());
            gain=gain.add(player.m.buyables[22].sqrt());
            gain=gain.add(player.m.buyables[31].sqrt());
            gain=gain.add(player.m.buyables[32].sqrt());
            gain=gain.mul(tmp.l.lifePowerEff);
            gain=gain.mul(tmp.ps.powerEff);
            if(hasMilestone("l",5))gain=gain.mul(buyableEffect("l",12));
            if(player.ma.points.gte(14))gain = gain.mul(player.o.energy.pow(0.1));
            return gain;
        },
        hexEff() {
            return Decimal.pow(10,player.m.hexes.add(1).log10().pow(player.ge.unlocked?0.625:0.5));
        },
        hexEffDesc() {
            return "which are multiplying Hindrance Spirit, Quirk, Solar Energy, & Subspace gain by "+format(tmp.m.hexEff)
        },

        passiveGeneration() { return (hasMilestone("sp", 3)?1:0) },
        marked: function(){return player.ma.points.gte(14)}
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
			power: new Decimal(0),
        };
    },
    color: "#b38fbf",
    requires(){
        if(player.ma.points.gte(15))return new Decimal(1);
        return new Decimal("1e765");
    },
    resource: "phantom souls",
    baseResource: "quirk energy",
    baseAmount() { return player.q.energy;},
    type: "static",
    exponent: 1.5,
    base: new Decimal("1e400"),
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if (player.i.buyables[11].gte(2)) mult = mult.div(buyableEffect("s", 22));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        hotkeys: [
            {key: "P", description: "Press Shift+P to Phantom Soul Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            let b=player.ps.buyables[21];
            let keep = ["milestones"];
            player.ps.souls = new Decimal(0);
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
            player.ps.buyables[21]=b;
        },
        layerShown(){return player.m.unlocked && player.ba.unlocked},
        branches: ["q", ["h", 2]],
        update(diff) {
            player.ps.souls = player.ps.souls.max(tmp.ps.soulGain.times(softcap(player.h.points.max(1).log10(),new Decimal(51400),0.1)))
            if(hasMilestone("l",0))player.ps.buyables[11]=player.ps.souls.div(1350).pow(0.25).mul(8).sub(7).max(0).floor();
			if (player.ma.points.gte(15)) player.ps.power = player.ps.power.root(tmp.ps.powerExp).plus(tmp.ps.powerGain.times(diff)).pow(tmp.ps.powerExp);
        },
        soulGainMult() {
            let mult = new Decimal(1);
            mult = mult.mul(buyableEffect("ps",11));
            return mult;
        },
        soulGain() {
            let gain = Decimal.pow(player.ps.points.min(120),1.5).times(layers.ps.soulGainMult());
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
            if(!player.ge.unlocked)return Decimal.pow(1.5,player.ps.points);
            let base=new Decimal(1.5).add(tmp.ge.rotationEff);
            if(player.ma.points.gte(15))base = new Decimal(10).add(tmp.ge.rotationEff);
            if(player.ma.points.gte(21))base = new Decimal(10).mul(tmp.ge.rotationEff);
            return Decimal.pow(base,player.ps.points);
        },
		powerGain() { return player.ps.souls.plus(1).times(tmp.ps.buyables[21].effect) },
		powerExp() { return player.ps.points.sqrt().plus(1).times(tmp.ps.buyables[21].effect) },
		powerEff() { return player.ps.power.sqrt().plus(1); },
        tabFormat: {
            "Main Tab": {
                content: ["main-display",
                    ["display-text", function() { 
            if(player.l.unlocked)return "Your phantom souls are multiplying Life Power gain by "+format(tmp.ps.effect);return ""; }],
                    "prestige-button",
                    "resource-display",
                    "blank",
                    ["display-text", function() { let a = "You have "+formatWhole(player.ps.souls)+" Damned Souls (based on Hindrance Spirit and Phantom Souls), multiply Quirk Layer base by "+format(tmp.ps.soulEff);
                    if(player.ma.points.gte(15)) a += '<br>You have ' + formatWhole(player.ps.power)+' Phantom Power'+(" (+"+format(tmp.ps.powerGain)+"/sec (based on Damned Souls), then raised to the power of "+format(tmp.ps.powerExp)+" (based on Phantom Souls))")+', which multiplies hex gain by ' + format(tmp.ps.powerEff);
                    return a;
                    }],
                    "blank",
                    "buyables",
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
	if(player.ge.unlocked)return x.mul(0.2).add(1);
                    return softcap(softcap(x.mul(0.5).add(1),new Decimal(15),new Decimal(0.5)),new Decimal(23),new Decimal(0.5));
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
			21: {
				title: "Ghost Spirit",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(2,Decimal.pow(2,x).mul(1024));
					return cost;
                },
				effect() {
					return player[this.layer].buyables[this.id].div(25).plus(1).pow(2);
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = (("Cost: " + formatWhole(data.cost) + " Phantom Power"))+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+"\n\
					Effect: Multiply Phantom Power gain/exponent by "+format(tmp.ps.buyables[this.id].effect);
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.ps.power.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					player.ps.power = player.ps.power.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style: {'height':'200px', 'width':'200px'},
			},
            },

        canBuyMax() { return hasMilestone("l",0) },
        autoPrestige() { return hasMilestone("l",0) },
        resetsNothing() { return hasMilestone("l",0) },
        marked: function(){return player.ma.points.gte(15)}
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
        requires() { 
            if(player.ma.points.gte(16))return new Decimal(16).sub(player.points.max(24).sub(24).mul(5)).max(1);
            return new Decimal(16) 
        }, // Can be a function that takes requirement increases into account
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
        mult = mult.mul(Decimal.pow(tmp.ma.milestoneBase,player.ma.points));
        if(hasUpgrade("g",35))mult = mult.mul(upgradeEffect("g",35));
        if(hasUpgrade("s",35))mult = mult.mul(upgradeEffect("s",35));
        if(hasMilestone("i",4))mult = mult.mul(Decimal.pow(2,player.i.points));
        if(player.ma.points.gte(19))mult = mult.mul(Decimal.pow(1.5,player.i.points));
        mult = mult.mul(buyableEffect("mc",21));
            mult = mult.times(buyableEffect("r",22));
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
            if(player.ma.points.gte(7))keep.push("upgrades");
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
            17: {
                requirementDescription: "2e29 super points",
                unlocked() { return player.i.unlocked },
                done() { return player.sp.best.gte(2e29) && player.i.unlocked},
                effectDescription: "Super points boost Enhance points.",
            },
            18: {
                requirementDescription: "1e72 super points",
                unlocked() { return player.ma.unlocked },
                done() { return player.sp.best.gte(1e72) && player.ma.unlocked},
                effectDescription: "<b>Super Boost</b> softcap is weaker.",
            },
            19: {
                requirementDescription: "1e91 super points",
                unlocked() { return player.ma.unlocked },
                done() { return player.sp.best.gte(1e91) && player.ma.unlocked},
                effectDescription: "<b>Super Boost</b> softcap is weaker.",
            },
            20: {
                requirementDescription: "1e200 super points",
                unlocked() { return player.r.unlocked },
                done() { return player.sp.best.gte(1e200) && player.r.unlocked},
                effectDescription: "Super Boosters and Super Generators are cheaper based on super points.",
            },
            21: {
                requirementDescription: "1e220 super points",
                unlocked() { return player.r.unlocked },
                done() { return player.sp.best.gte(1e220) && player.r.unlocked},
                effectDescription: "Gear Evolution is cheaper.",
            },
            22: {
                requirementDescription: "1e275 super points",
                unlocked() { return player.r.unlocked },
                done() { return player.sp.best.gte(1e275) && player.r.unlocked},
                effectDescription: "Reduce Machine Requirements.",
            },
            23: {
                requirementDescription: "1e445 super points",
                unlocked() { return player.id.unlocked },
                done() { return player.sp.best.gte("1e445") && player.id.unlocked},
                effectDescription: "Point scaling is weaker based on super points.",
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
                    if(hasMilestone("h",41))exp = exp.add(challengeEffect("h",11));
                    if(hasUpgrade("sp",22))exp=exp.mul(player.sp.upgrades.length);
                    if(player.ma.points.gte(16))return player.sp.total.plus(1).pow(exp);
                    return softcap(player.sp.total.plus(1).pow(exp),new Decimal("1e80000"),player.sp.best.gte(1e91)?0.3:player.sp.best.gte(1e72)?0.1:0.01);
                },
				effectDisplay() { return format(tmp.sp.upgrades[12].effect)+"x" },
			},
			13: {
				title: "Self-Self-Synergy",
				description: "<b>Self-Synergy</b> is stronger.",
				cost() { return new Decimal(1e13) },
				unlocked() { return player.i.unlocked && hasUpgrade("p", 13) },
			},
			14: {
				title: "Anti-Calm",
				description: "<b>Prestigious Intensity</b>'s effect is stronger.",
				cost() { return new Decimal(2e38) },
				unlocked() { return player.mc.unlocked && hasUpgrade("p", 14) },
			},
			15: {
				title: "Re: Time",
				description: "2nd Time Energy effect is stronger.",
				cost() { return new Decimal(Number.MAX_VALUE) },
				unlocked() { return player.r.unlocked },
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
			24: {
				title: "Coronal Energies",
				description: "Both Coronal Wave effects are doubled (unaffected by softcap).",
				cost() { return new Decimal(1e51) },
				unlocked() { return player.mc.unlocked && hasUpgrade("p", 24) },
			},
			25: {
				title: "Re: Cost",
				description: "Time Capsules and Space Energy are cheaper.",
				cost() { return new Decimal("1e330") },
				unlocked() { return player.r.unlocked },
			},
			31: {
				title: "Exponential Drift",
				description: "<b>Upgrade Power</b> is raised to a power based on your SP upgrades.",
				cost() { return new Decimal(2e21) },
				unlocked() { return player.i.unlocked && hasUpgrade("p", 31) },
			},
			32: {
				title: "Less Useless",
				description: "<b>Upgrade Power</b> is raised ^7.",
				cost() { return new Decimal(6e25) },
				unlocked() { return player.i.unlocked && hasUpgrade("p", 32) },
			},
			33: {
				title: "Column Leader Leader",
				description: "<b>Column Leader</b> is stronger based on your Best Super Points.",
				cost() { return new Decimal(1e28) },
				unlocked() { return player.ge.unlocked && hasUpgrade("p", 33) },
				effect() { return player.sp.best.plus(1).log10().plus(1).log10().plus(1) },
				effectDisplay() { return format(tmp.sp.upgrades[33].effect)+"x" },
			},
			34: {
				title: "Solar Exertion",
				description: "The <b>Solar Potential</b> effect is boosted by your Total Super Points.",
				cost() { return new Decimal(1e65) },
				unlocked() { return player.mc.unlocked && hasUpgrade("p", 34) },
				effect() { return player.sp.total.plus(1).log10().plus(1).log10().plus(1).log10().plus(1) },
				effectDisplay() { return format(tmp.sp.upgrades[34].effect)+"x" },
			},
			35: {
				title: "Re: Discount",
				description: "Generators are cheaper.",
				cost() { return new Decimal("1e370") },
				unlocked() { return player.r.unlocked },
			},
			41: {
				title: "Again and Again",
				description: "<b>Prestige Recursion</b> is stronger.",
				cost() { return new Decimal(1e76) },
				unlocked() { return player.ne.unlocked && hasUpgrade("p", 41) },
			},
			42: {
				title: "Spatial Awareness II",
				description: "Space Buildings are cheaper.",
				cost() { return new Decimal(1e85) },
				unlocked() { return player.ne.unlocked && hasUpgrade("p", 42) },
			},
			43: {
				title: "Even more Discount",
				description: "Generators are cheaper.",
				cost() { return new Decimal(1e190) },
				unlocked() { return player.ma.points.gte(16) && hasUpgrade("p", 43) },
			},
			44: {
				title: "Spelling Dictionary II",
				description: "2nd-4th spells are better.",
				cost() { return new Decimal(1e205) },
				unlocked() { return player.ma.points.gte(16) && hasUpgrade("p", 44) },
			},
        },

        passiveGeneration() { return (player.ma.points.gte(10)?1:0) },
        marked: function(){return player.ma.points.gte(16)}
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
        requires() { 

            if(player.ma.points.gte(17))return new Decimal(160).sub(player.points.max(25).sub(25).mul(50)).max(1);
        if(hasMilestone("sp",15))return new Decimal(200); if(hasMilestone("sp",12))return new Decimal(240); return new Decimal(277) }, // Can be a function that takes requirement increases into account
        resource: "hyperspace energy", // Name of prestige currency 
        baseResource: "space energy", // Name of resource prestige is based on
        baseAmount() {return player.s.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { 
            let exp = new Decimal(10);
            exp = exp.mul(tmp.mc.mechEff);
            return exp;
        }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
            if(hasMilestone("sp",9))mult = mult.mul(player.sp.points.add(10).log10());
            if(hasMilestone("l",1))mult = mult.mul(hasUpgrade("sp",11)?player.l.points.add(10).log10().mul(10):5);
            if(hasMilestone("sp",16)){
                if(hasMilestone("i",2))mult = mult.mul(Decimal.pow(2,player.i.points));
                else mult = mult.mul(player.i.points.add(1));
            }
        if(player.ma.points.gte(19))mult = mult.mul(Decimal.pow(1.5,player.i.points));
            mult = mult.mul(Decimal.pow(tmp.ma.milestoneBase,player.ma.points));
            if(player.i.buyables[11].gte(3))mult = mult.mul(buyableEffect("s",23));
        if(hasUpgrade("g",35))mult = mult.mul(upgradeEffect("g",35));
        if(hasUpgrade("s",33))mult = mult.mul(upgradeEffect("s",33));
        
            if(hasUpgrade("t",35))mult = mult.mul(player.t.points.add(1));
            mult = mult.times(buyableEffect("r",23));
         mult = mult.mul(buyableEffect("mc",31));
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
    buyables: {
            rows: 2,
            cols: 5,
            1: {
                title: "Hyperspace", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(hasUpgrade("t",32)?1.8:2, x.pow(1.5));
                    if(player.ma.points.gte(12))cost = cost.root(buyableEffect("o",33));
                    cost = cost.floor();
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
                        if(a%32)return "Next Hyperspace will be allocated to Hyper Building 5.<br>";
                        if(a%64)return "Next Hyperspace will be allocated to Hyper Building 6.<br>";
                        if(a%128)return "Next Hyperspace will be allocated to Hyper Building 7.<br>";
                        if(a%256)return "Next Hyperspace will be allocated to Hyper Building 8.<br>";
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
            15: {
                display() { 
                    let data = tmp[this.layer].buyables[this.id]
                    return "Hyper Building 5<br>"+
                    "Level: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
                    "Effect: Space Building 5's effect x"+format(data.effect)+"<br>";
                },
                unlocked() { return player[this.layer].buyables[1].gte(16) }, 
                canAfford() {
                    return false;
                },
                effect(){
                    let x=player[this.layer].buyables[this.id];
                    return x.mul(0.2).add(1);
                },
                style: {'height':'120px','width':'120px','background-color':'#dfdfff'},
            },
            21: {
                display() { 
                    let data = tmp[this.layer].buyables[this.id]
                    return "Hyper Building 6<br>"+
                    "Level: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
                    "Effect: Space Building 6's effect ^"+format(data.effect)+"<br>";
                },
                unlocked() { return player[this.layer].buyables[1].gte(32) }, 
                canAfford() {
                    return false;
                },
                effect(){
                    let x=player[this.layer].buyables[this.id];
                    return x.mul(0.2).add(1);
                },
                style: {'height':'120px','width':'120px','background-color':'#dfdfff'},
            },
            22: {
                display() { 
                    let data = tmp[this.layer].buyables[this.id]
                    return "Hyper Building 7<br>"+
                    "Level: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
                    "Effect: Space Building 7's effect ^"+format(data.effect)+"<br>";
                },
                unlocked() { return player[this.layer].buyables[1].gte(64) }, 
                canAfford() {
                    return false;
                },
                effect(){
                    let x=player[this.layer].buyables[this.id];
                    return x.mul(0.2).add(1);
                },
                style: {'height':'120px','width':'120px','background-color':'#dfdfff'},
            },
            23: {
                display() { 
                    let data = tmp[this.layer].buyables[this.id]
                    return "Hyper Building 8<br>"+
                    "Level: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
                    "Effect: Space Building 8's effect ^"+format(data.effect)+"<br>";
                },
                unlocked() { return player[this.layer].buyables[1].gte(128) }, 
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
        },

        passiveGeneration() { return (player.ma.points.gte(5)?1:0) },
        update(diff) {
         if(hasMilestone("mc",1)){
                var target=player.hs.points.pow(buyableEffect("o",33)).add(1).log(hasUpgrade("t",32)?1.8:2).pow(1/1.5).add(1).floor();
                if(target.gt(player.hs.buyables[1])){
                    player.hs.buyables[1]=target;
                }
         }
         
            player.hs.buyables[11]=player.hs.buyables[1].add(1).div(2).floor();
            player.hs.buyables[12]=player.hs.buyables[1].add(2).div(4).floor();
            player.hs.buyables[13]=player.hs.buyables[1].add(4).div(8).floor();
            player.hs.buyables[14]=player.hs.buyables[1].add(8).div(16).floor();
            player.hs.buyables[15]=player.hs.buyables[1].add(16).div(32).floor();
            player.hs.buyables[21]=player.hs.buyables[1].add(32).div(64).floor();
            player.hs.buyables[22]=player.hs.buyables[1].add(64).div(128).floor();
            player.hs.buyables[23]=player.hs.buyables[1].add(128).div(256).floor();
        },
        marked: function(){return player.ma.points.gte(17)}
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
        if(player.ma.points.gte(18))return new Decimal(1);
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
        ret = ret.mul(Decimal.pow(tmp.ma.milestoneBase,player.ma.points));
        if(hasUpgrade("g",35))ret = ret.mul(upgradeEffect("g",35));
        if(hasMilestone("i",4))ret = ret.mul(Decimal.pow(2,player.i.points));
        if(player.ma.points.gte(19))ret = ret.mul(Decimal.pow(1.5,player.i.points));
        ret = ret.mul(buyableEffect("mc",32));
           ret = ret.times(buyableEffect("r",32));
		return ret;
	},
	effect() {
		let ret = player.l.points;
		ret=ret.mul(tmp.ps.effect);
        if(hasUpgrade("g",33))ret = ret.mul(upgradeEffect("g",33));
           ret = ret.times(buyableEffect("r",32));
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
            6: {requirementDescription: "1e11 Life Essence",
                done() {return player[this.layer].best.gte(1e11)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Nuclear Forges.",
            },
            7: {requirementDescription: "1e14 Life Essence",
                done() {return player[this.layer].best.gte(1e14)}, // Used to determine when to give the milestone
                effectDescription: "Unlock a Life Booster.",
            },
            8: {requirementDescription: "1e16 Life Essence",
                done() {return player[this.layer].best.gte(1e16)}, // Used to determine when to give the milestone
                effectDescription: "First 3 solarity buyables gain is better.",
            },
            9: {requirementDescription: "1e40 Life Essence",
                done() {return player[this.layer].best.gte(1e40)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Blueshifted Flares.",
            },
            10: {requirementDescription: "1e53 Life Essence",
                done() {return player[this.layer].best.gte(1e53)}, // Used to determine when to give the milestone
                effectDescription: "Unlock a Life Booster.",
            },
            11: {requirementDescription: "1e75 Life Essence",
                done() {return player[this.layer].best.gte(1e75)}, // Used to determine when to give the milestone
                effectDescription: "Next 3 solarity buyables gain is better.",
            },
            12: {requirementDescription: "1e105 Life Essence",
                done() {return player[this.layer].best.gte(1e105)}, // Used to determine when to give the milestone
                effectDescription: "Last 3 solarity buyables gain is better.",
            },
            13: {requirementDescription: "1e220 Life Essence",
                done() {return player[this.layer].best.gte(1e220)}, // Used to determine when to give the milestone
                effectDescription: "Life Boosters 2 and 5 are better.",
            },
            14: {requirementDescription: "1e240 Life Essence",
                done() {return player[this.layer].best.gte(1e240)}, // Used to determine when to give the milestone
                effectDescription: "Life Booster 5 is better.",
            },
            15: {requirementDescription: "1e260 Life Essence",
                done() {return player[this.layer].best.gte(1e260)}, // Used to determine when to give the milestone
                effectDescription: "Life Boosters 3 and 5 are better.",
            },
            16: {requirementDescription: "1e300 Life Essence",
                done() {return player[this.layer].best.gte(1e300)}, // Used to determine when to give the milestone
                effectDescription: "Life Boosters 3 and 5 are better.",
            },
            17: {requirementDescription: "1e400 Life Essence",
                done() {return player[this.layer].best.gte("1e400")}, // Used to determine when to give the milestone
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
		 if(hasMilestone("l",7)){
			 if(player.ps.points.gte(layers.l.buyables[13].cost())){
				 player.l.buyables[13]=player.ps.points.add(1);
			 }
		 }
		 if(hasMilestone("l",10)){
			 if(player.ps.points.gte(layers.l.buyables[14].cost())){
				 player.l.buyables[14]=player.ps.points.add(1);
			 }
		 }
		 if(player.ma.points.gte(18)){
			 if(player.ps.points.gte(layers.l.buyables[15].cost())){
				 player.l.buyables[15]=player.ps.points.add(1);
			 }
		 }
		 if(hasMilestone("l",17)){
			 if(player.ps.points.gte(layers.l.buyables[16].cost())){
				 player.l.buyables[16]=player.ps.points.add(1);
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
						["row",[["buyable",11],["buyable",12],["buyable",13]]],
						["row",[["buyable",14],["buyable",15],["buyable",16]]],
						"milestones",
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
					return Decimal.pow(hasMilestone("l",13)?10:2,x.pow(0.5));
				},
                unlocked() { return hasMilestone("l",5) }, 
                canAfford() {
					return false;
				},
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px','background-color':'#7fbf7f'},
            },
            13: {
                title: "Life Booster 3", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = x;
                    if(!hasMilestone("l",7))return Decimal.dInf;
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Amount: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
					"Next at: "+formatWhole(data.cost)+" Phantom Souls<br>"+
					"Effect: "+format(data.effect)+"x to Subspace base";
                },
				effect(){
					let x=player[this.layer].buyables[this.id].mul(player.l.power.add(1).log10().add(1));
                    if(hasMilestone("l",16))return x.add(1).log10().add(1);
					return x.add(1).log10().add(1).log10().div(hasMilestone("l",15)?1:5).add(1);
				},
                unlocked() { return hasMilestone("l",7) }, 
                canAfford() {
					return false;
				},
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px','background-color':'#7fbf7f'},
            },
            14: {
                title: "Life Booster 4", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = x;
                    if(!hasMilestone("l",10))return Decimal.dInf;
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Amount: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
					"Next at: "+formatWhole(data.cost)+" Phantom Souls<br>"+
					"Effect: +"+format(data.effect.mul(100))+"% to Solar Power";
                },
				effect(){
					let x=player[this.layer].buyables[this.id].mul(player.l.power.add(1).log10().add(1));
					return x.pow(player.ma.points.gte(18)?0.2:0.1).sub(player.ma.points.gte(18)?0:1).div(5).max(0).add(1);
				},
                unlocked() { return hasMilestone("l",10) }, 
                canAfford() {
					return false;
				},
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px','background-color':'#7fbf7f'},
            },
            15: {
                title: "Life Booster 5", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = x;
                    if(player.ma.points.lt(18))return Decimal.dInf;
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Amount: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
					"Next at: "+formatWhole(data.cost)+" Phantom Souls<br>"+
					"Effect: "+format(data.effect)+"x signal gain";
                },
				effect(){
					let x=player[this.layer].buyables[this.id].mul(player.l.power.add(1).log10().add(1));
					return x.div(hasMilestone("l",16)?1:hasMilestone("l",15)?10:hasMilestone("l",14)?100:hasMilestone("l",13)?1000:10000).add(1);
				},
                unlocked() { return player.ma.points.gte(18) }, 
                canAfford() {
					return false;
				},
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px','background-color':'#7fbf7f'},
            },
            16: {
                title: "Life Booster 6", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = x;
                    if(!hasMilestone("l",17))return Decimal.dInf;
                    return cost
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Amount: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
					"Next at: "+formatWhole(data.cost)+" Phantom Souls<br>"+
					"Effect: "+format(data.effect)+"x robot gain";
                },
				effect(){
					let x=player[this.layer].buyables[this.id].mul(player.l.power.add(1).log10().add(1));
					return x.div(10000).add(1);
				},
                unlocked() { return hasMilestone("l",17) }, 
                canAfford() {
					return false;
				},
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px','background-color':'#7fbf7f'},
            },
    },

        passiveGeneration() { return (hasMilestone("ge",1)?1:0) },
        marked: function(){return player.ma.points.gte(18)}

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
        requires() { if(player.ma.points.gte(19))return new Decimal(1); return new Decimal("1e110") }, // Can be a function that takes requirement increases into account
        resource: "imperium bricks", // Name of prestige currency
        baseResource: "subspace", // Name of resource prestige is based on
        baseAmount() {return player.ss.subspace}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.5), // Prestige currency exponent
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
            1: {requirementDescription: "3 Imperium Bricks",
                done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
                effectDescription: "Unlock more subspace upgrades.",
            },
            2: {requirementDescription: "5 Imperium Bricks",
                unlocked(){return player.ma.unlocked},
                done() {return player[this.layer].best.gte(5) && player.ma.unlocked}, // Used to determine when to give the milestone
                effectDescription: "The 1e20 super points milestone is better and Imperium bricks make subspace gain better.",
            },
            3: {requirementDescription: "9 Imperium Bricks",
                unlocked(){return player.ma.unlocked},
                done() {return player[this.layer].best.gte(9) && player.ma.unlocked}, // Used to determine when to give the milestone
                effectDescription: "Time Capsules and Space Energy are cheaper based on points above 23.",
            },
            4: {requirementDescription: "11 Imperium Bricks",
                unlocked(){return player.ma.unlocked},
                done() {return player[this.layer].best.gte(11) && player.ma.unlocked}, // Used to determine when to give the milestone
                effectDescription: "Each Imperium Brick multiply Life Essence/Super Point/Subspace gain by 2.",
            },
            5: {requirementDescription: "12 Imperium Bricks",
                unlocked(){return player.ma.unlocked},
                done() {return player[this.layer].best.gte(12) && player.ma.unlocked}, // Used to determine when to give the milestone
                effectDescription: "<b>Black Area</b> effect is better.",
            },
            6: {requirementDescription: "13 Imperium Bricks",
                unlocked(){return player.ne.unlocked},
                done() {return player[this.layer].best.gte(13) && player.ne.unlocked}, // Used to determine when to give the milestone
                effectDescription: "The second Thought effect is squared.",
            },
            7: {requirementDescription: "14 Imperium Bricks",
                unlocked(){return player.r.unlocked},
                done() {return player[this.layer].best.gte(14) && player.r.unlocked}, // Used to determine when to give the milestone
                effectDescription: "Imperium Bricks boost Energy gain.",
            },
            8: {requirementDescription: "15 Imperium Bricks",
                unlocked(){return player.r.unlocked},
                done() {return player[this.layer].best.gte(15) && player.r.unlocked}, // Used to determine when to give the milestone
                effectDescription: "Imperium Bricks boost Robot gain.",
            },
            9: {requirementDescription: "16 Imperium Bricks",
                unlocked(){return player.r.unlocked},
                done() {return player[this.layer].best.gte(16) && player.r.unlocked}, // Used to determine when to give the milestone
                effectDescription: "Robot Requirement is 1.",
            },
            10: {requirementDescription: "18 Imperium Bricks",
                unlocked(){return player.r.unlocked},
                done() {return player[this.layer].best.gte(18) && player.r.unlocked}, // Used to determine when to give the milestone
                effectDescription: "Time Capsules and Space Energy are cheaper.",
            },
        },
		buyables: {
			rows: 1,
			cols: 2,
			11: {
				title: "Imperium Building",
				cap() { return new Decimal(5) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = x.mul(2).add(2);
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
                    player.i.points = player.i.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style: {'height':'200px', 'width':'200px'},
			},
			12: {
				title: "Imperium Building II",
				cap() { return new Decimal(3) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = x.mul(2).add(15);
					return cost;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
                    let display = (player[this.layer].buyables[this.id].gte(data.cap)?"MAXED":("Cost: "+formatWhole(cost)+" Imperium Bricks"))+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(data.cap)+"\n\
					<b>Robot Cloning</b> is "+formatWhole(Decimal.pow(10,player[this.layer].buyables[this.id]))+"x stronger";
					return display;
                },
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.i.unlocked && player.i.points.gte(cost) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.i.points = player.i.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style: {'height':'200px', 'width':'200px'},
                unlocked(){return player.ma.points.gte(19)}
			},
        },
        canBuyMax() { return hasMilestone("mc",0) },
        autoPrestige() { return hasMilestone("mc",0) },
        resetsNothing() { return hasMilestone("mc",0) },
        marked: function(){return player.ma.points.gte(19)}
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
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.11), // Prestige currency exponent
		base: new Decimal(1.01),
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
	milestoneBase(){
        if(player[this.layer].best.gte(20))return player[this.layer].points.div(5).max(3);
		if(player.mc.unlocked)return new Decimal(3);
		if(player.ge.unlocked)return new Decimal(2.5);
		return new Decimal(2);
	},
        layerShown(){return player.ps.unlocked && player.i.unlocked},
        branches: ["sp", "hs", ["ps", 2]],
        getMilestoneDesc(){
            if(player[this.layer].best.gte(8))return "Gain "+format(tmp.ma.milestoneBase)+"x Super Points/Life Essence/Hyperspace Energy/Solarity/Subspace.";
            return "Gain "+format(tmp.ma.milestoneBase)+"x Super Points/Life Essence/Hyperspace Energy.";
        },
        milestones: {
            0: {requirementDescription: "1 Mastery",
                done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+" This layer won't reset. Keep Row 6 milestones. <br>Master Prestige: Prestige Exponent formula is better, 3rd column of prestige upgrades is boosted by points above 20."},
            },
            1: {requirementDescription: "2 Mastery",
                done() {return player[this.layer].best.gte(2)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Boosters: Boosters are cheaper based on points above 20. Unlock new booster upgrades, 1st row of booster upgrades are better."},
            },
            2: {requirementDescription: "3 Mastery",
                done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Generators: Generators are cheaper based on points above 20. Unlock new generator upgrades, 1st row of generator upgrades and <b>Double Reversal</b> are better."},
            },
            3: {requirementDescription: "4 Mastery",
                done() {return player[this.layer].best.gte(4)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Time Capsules: Time Energy effect ^1.25, unlocked new time upgrades"+(player.ge.unlocked?", some time upgrades are better, 2nd Time Energy effect is better.":".")},
            },
            4: {requirementDescription: "5 Mastery",
                done() {return player[this.layer].best.gte(5)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+" Gain 100% of Hyperspace Energy gain per second.<br>Master Space Energy: Space Energy is cheaper. Unlock new space upgrades."},
            },
            5: {requirementDescription: "6 Mastery",
                done() {return player[this.layer].best.gte(6)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Enhance: Enhance point gain is better. Unlock new enhance upgrades."},
            },
            6: {requirementDescription: "7 Mastery",
                done() {return player[this.layer].best.gte(7)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+" Keep Super Point Upgrades.<br>Master Super-Boosters: Super-Boosters are cheaper, Super-Booster effect is better."},
            },
            7: {requirementDescription: "8 Mastery",
                done() {return player[this.layer].best.gte(8)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+(player[this.layer].best.lt(8)?" The previous effect will affect Solarity/Subspace in all Mastery milestones.":"")+"<br>Master Quirks: <b>Exponential Madness</b> is better. Unlock new quirk upgrades."},
            },
            8: {requirementDescription: "9 Mastery",
                done() {return player[this.layer].best.gte(9)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Hindrance Spirit: H Challenge Effects are boosted by Hindrance Spirit."},
            },
            9: {requirementDescription: "10 Mastery",
                done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+" Gain 100% of Super Point gain per second.<br>Master Subspace: Subspace effect is better. Subspace energy is cheaper."},
            },
            10: {requirementDescription: "11 Mastery",
                done() {return player[this.layer].best.gte(11)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Super-Generators: Super-Generators are cheaper, Super-Generator effect is better."},
            },
            11: {requirementDescription: "12 Mastery",
                done() {return player[this.layer].best.gte(12)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Solarity: +100% Solar Power, unlock more Solaity buyables, Solarity reduces Solarity requirement."},
            },
            12: {requirementDescription: "13 Mastery",
                done() {return player[this.layer].best.gte(13)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Balance Energy: Balance buyables are cheaper."},
            },
            13: {requirementDescription: "14 Mastery",
                done() {return player[this.layer].best.gte(14)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Magic: Solar energy boost hexes at a reduced rate. Unlock a new spell."},
            },
            14: {requirementDescription: "15 Mastery",
                done() {return player[this.layer].best.gte(15)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Phantom Souls: Phantom Souls requirement is 1, Phantom soul base +8.5. Unlock Phantom Power."},
            },
            15: {requirementDescription: "16 Mastery",
                done() {return player[this.layer].best.gte(16)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Super Points: Super Point gain is better. Remove <b>Super Boost</b> softcap."},
            },
            16: {requirementDescription: "17 Mastery",
                done() {return player[this.layer].best.gte(17)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Hyperspace: Hyperspace requirement is reduced and is further reduced by points above 25."},
            },
            17: {requirementDescription: "18 Mastery",
                done() {return player[this.layer].best.gte(18)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Life Essence: Life Essence requirement is 1, Life Booster 4 is better. Unlock a new Life Booster."},
            },
            18: {requirementDescription: "19 Mastery",
                done() {return player[this.layer].best.gte(19)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Imperium: Imperium requirement is 1. Unlock Imperium Building II, each Imperium Brick multiply Super Points/Life Essence/Hyperspace Energy by 1.5x."},
            },
            19: {requirementDescription: "20 Mastery",
                done() {return player[this.layer].best.gte(20)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Mastery: Mastery Milestone's effect is (Mastery/5)x instead of 3x."},
            },
            20: {requirementDescription: "21 Mastery",
                done() {return player[this.layer].best.gte(21)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Gears: Gear Requirement is 1, unlock a new spell."},
            },
            21: {requirementDescription: "22 Mastery",
                done() {return player[this.layer].best.gte(22)}, // Used to determine when to give the milestone
                effectDescription(){ return layers.ma.getMilestoneDesc()+"<br>Master Machines: Machine Requirement is 1, unlock a new spell, Mech-Energy won't lost."},
            },
        },
        marked: function(){return player.ma.points.gte(20)}
})



addLayer("ge", {
    name: "gears",
    symbol: "GE",
    position: 1,
    row: 6,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        rotations: new Decimal(0),
    }},
        color: "#bfbfbf",
    requires: function(){
        if(player.ma.points.gte(21))return new Decimal(1);
		return new Decimal(1e168);
	},
		nodeStyle() { return {
            "background": ((((player.ge.unlocked||canReset("ge"))))?("radial-gradient(circle, #bfbfbf 0%, #838586 100%)"):"#bf8f8f") ,
		}},
		componentStyles: {
            "prestige-button"() {return { "background": (canReset("ge"))?("radial-gradient(circle, #bfbfbf 0%, #838586 100%)"):"#bf8f8f" }},
		},
    resource: "gears",
    baseResource: "solar energy", 
    baseAmount() {return player.o.energy},
    type: "normal",
    exponent: 0.1,
    hotkeys: [
            {key: "E", description: "Press Shift+E to Gear Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},],
    layerShown(){return player.ma.unlocked},
        branches: ["l", "r"],
	gainMult(){
		let ret=new Decimal(1);
        if(hasMilestone("en",0))ret = ret.mul(Decimal.pow(tmp.ma.milestoneBase,player.ma.points));
        ret = ret.mul(buyableEffect("mc",22));
        ret = ret.mul(buyableEffect("r",13));
        if(player.ma.points.gte(21))ret = ret.mul(buyableEffect("m",13));
		return ret;
	},
	effect() {
		let ret = player.ge.points;
        ret = ret.mul(buyableEffect("ge",11));
        ret = ret.mul(buyableEffect("ge",12));
        ret = ret.mul(buyableEffect("r",13));
        if(player.ma.points.gte(21))ret = ret.mul(buyableEffect("m",13));
		return ret;
	},
	effectDescription() { // Optional text to describe the effects
           let eff = this.effect();
           return "which are generating "+format(eff)+" Rotations/sec";
       },
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },

	milestones: {
            0: {requirementDescription: "1 Gears",
                done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
                effectDescription: "Each Mastery now give 2.5x Super Points/Life Essence/Hyperspace Energy instead of 2x. Hex effect is better and Time Capsules add a new mastered effect. Wraiths are nerfed but effect softcap is removed.",
            },
            1: {requirementDescription: "50 Gears",
                done() {return player[this.layer].best.gte(50)}, // Used to determine when to give the milestone
                effectDescription: "Gain 100% of Life Essence gain per second.",
            },
            2: {requirementDescription: "1e6 Gears",
                done() {return player[this.layer].best.gte(1e6)}, // Used to determine when to give the milestone
                effectDescription: "Unlock a gear buyable.",
            },
            3: {requirementDescription: "1e19 Gears",
                done() {return player[this.layer].best.gte(1e19)}, // Used to determine when to give the milestone
                effectDescription: "The 1st gear buyable is cheaper.",
            },
	},
	 update(diff){
		 player.ge.rotations = player.ge.rotations.add(tmp.ge.effect.times(diff)).max(0)
	 },
	 tabFormat: ["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"],
                    ["display-text",
                        function() {
							return 'You have ' + format(player.ge.rotations) + ' Rotations, which are '+(player.ma.points.gte(21)?'multiplying':'adding')+' phantom soul base by ' + format(tmp.ge.rotationEff);
						},
                        {}],
						"buyables",
						"upgrades",
						"milestones",
				],
	rotationEff(){
		let ret=player.ge.rotations.add(1).log10().div(10).add(1);
		return ret;
	},
    buyables: {
            rows: 1,
            cols: 3,
            11: {
                title: "Gear Speed", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(2, x.add(hasMilestone("ge",3)?0:7).pow(1.5));
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(buyableEffect("ge",13).mul(2), x);
                    if(hasMilestone("mc",5))eff = Decimal.pow(buyableEffect("ge",13).mul(buyableEffect("mc",13)).mul(2), x);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " Gears\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Rotation gain by "+format(data.effect)+".";
                },
                unlocked() { return hasMilestone("ge",2) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
            },
            12: {
                title: "Gear Boost", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(10, x.pow(1.5));
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(buyableEffect("ge",13).mul(2), x);
                    if(hasMilestone("mc",5))eff = Decimal.pow(buyableEffect("ge",13).mul(buyableEffect("mc",13)).mul(2), x);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " Rotations\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Rotations gain by "+format(data.effect)+".";
                },
                unlocked() { return hasMilestone("en",1) }, 
                canAfford() {
                    return player[this.layer].rotations.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].rotations= player[this.layer].rotations.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
            },
            13: {
                title: "Gear Evolution", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(hasMilestone("sp",21)?1e50:1e70,Decimal.pow(1.1,x));
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = x.div(20).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " Rotations\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply base of first 2 Gear & Machine buyables by "+format(data.effect)+".";
                },
                unlocked() { return hasMilestone("en",2) }, 
                canAfford() {
                    return player[this.layer].rotations.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].rotations= player[this.layer].rotations.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
            },
    },
        passiveGeneration() { return (hasMilestone("r", 0)?1:0) },
        marked: function(){return player.ma.points.gte(21)}
});



addLayer("mc", {
    name: "machines",
    symbol: "MC",
    position: 3,
    row: 6,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			mechEn: new Decimal(0),
    }},
        color: "#c99a6b",
    requires: function(){
        if(player.ma.points.gte(22))return new Decimal(1);
        if(hasMilestone("sp",22))return new Decimal(1e168);
		return new Decimal(1e258);
	},
		nodeStyle() { return {
            "background": ((((player.mc.unlocked||canReset("mc"))))?("radial-gradient(circle, #c99a6b 0%, #706d6d 100%)"):"#bf8f8f") ,
		}},
		componentStyles: {
            "prestige-button"() {return { "background": (canReset("mc"))?("radial-gradient(circle, #c99a6b 0%, #706d6d 100%)"):"#bf8f8f" }},
		},
    resource: "machine power",
    baseResource: "subspace", 
    baseAmount() {return player.ss.subspace},
    type: "normal",
    exponent: 0.1,
    hotkeys: [
            {key: "c", description: "Press C to Machine Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},],
    layerShown(){return player.ge.unlocked},
        branches: ["hs", "i", "id"],
	gainMult(){
		let ret=new Decimal(1);
        if(hasMilestone("ne",0))ret = ret.mul(Decimal.pow(tmp.ma.milestoneBase,player.ma.points));
        ret = ret.mul(buyableEffect("mc",22));
        ret = ret.mul(buyableEffect("r",31));
		return ret;
	},
	effect() {
		let ret = player.mc.points;
        ret = ret.mul(buyableEffect("mc",11));
        ret = ret.mul(buyableEffect("mc",12));
        ret = ret.mul(tmp.id.revEff);
        ret = ret.mul(buyableEffect("r",31));
		return ret;
	},
	effectDescription() { // Optional text to describe the effects
           let eff = this.effect();
           return "which are generating "+format(eff)+" Mech-Energy/sec";
       },
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },

	milestones: {
            0: {requirementDescription: "1 Machine Power",
                done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
                effectDescription: "Each Mastery now give 3x Super Points/Life Essence/Hyperspace Energy instead of 2.5x. Autobuy Imperium Bricks and it resets nothing.",
            },
            1: {requirementDescription: "1e5 Machine Power",
                done() {return player[this.layer].best.gte(1e5)}, // Used to determine when to give the milestone
                effectDescription: "Autobuy Hyperspace.",
            },
            2: {requirementDescription: "1e9 Machine Power",
                done() {return player[this.layer].best.gte(1e9)}, // Used to determine when to give the milestone
                effectDescription: "Unlock a machine buyable.",
            },
            3: {requirementDescription: "1e11 Machine Power",
                done() {return player[this.layer].best.gte(1e11)}, // Used to determine when to give the milestone
                effectDescription: "The 1st machine buyable is cheaper.",
            },
            4: {requirementDescription: "1 Machine Upgrade",
                unlocked() {return hasMilestone("ne",2)},
                done() {return player[this.layer].buyables[13].gte(1)}, // Used to determine when to give the milestone
                effectDescription: "Unlock a new tab.",
            },
            5: {requirementDescription: "3 Machine Upgrades",
                unlocked() {return hasMilestone("ne",2)},
                done() {return player[this.layer].buyables[13].gte(3)}, // Used to determine when to give the milestone
                effectDescription: "Machine Upgrade affects first 2 gear buyables.",
            },
            6: {requirementDescription: "5 Machine Upgrades",
                unlocked() {return hasMilestone("ne",2)},
                done() {return player[this.layer].buyables[13].gte(5)}, // Used to determine when to give the milestone
                effectDescription: "Unlock The Port.",
            },
            7: {requirementDescription: "10 Machine Upgrades",
                unlocked() {return hasMilestone("ne",2)},
                done() {return player[this.layer].buyables[13].gte(10)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Northbridge.",
            },
            8: {requirementDescription: "14 Machine Upgrades",
                unlocked() {return hasMilestone("ne",2)},
                done() {return player[this.layer].buyables[13].gte(14)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Southbridge.",
            },
            9: {requirementDescription: "15 Machine Upgrades",
                unlocked() {return hasMilestone("ne",2)},
                done() {return player[this.layer].buyables[13].gte(15)}, // Used to determine when to give the milestone
                effectDescription: "Gain 100% of Machine Power gain per second.",
            },
            10: {requirementDescription: "17 Machine Upgrades",
                unlocked() {return hasMilestone("ne",2)},
                done() {return player[this.layer].buyables[13].gte(17)}, // Used to determine when to give the milestone
                effectDescription: "Motherboard is autoed.",
            },
	},
	 update(diff){
         if(player.ma.points.gte(22))player.mc.mechEn = player.mc.mechEn.add(tmp.mc.effect.mul(diff));
		 else player.mc.mechEn = tmp.mc.effect.times(100).sub(tmp.mc.effect.times(100).sub(player.mc.mechEn).mul(Decimal.pow(0.99,diff)));
         if(hasMilestone("mc",10)){
             player.mc.buyables[21]=player.mc.buyables[21].add(player.mc.mechEn.mul(diff));
             player.mc.buyables[22]=player.mc.buyables[22].add(player.mc.mechEn.mul(diff));
             player.mc.buyables[31]=player.mc.buyables[31].add(player.mc.mechEn.mul(diff));
             player.mc.buyables[32]=player.mc.buyables[32].add(player.mc.mechEn.mul(diff));
         }
	 },
	 tabFormat: {"Main Tab":{"content":["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"],
                    ["display-text",
                        function() {
							return 'You have ' + format(player.mc.mechEn) + ' Mech-Energy, which multiplies hyperspace energy exponent by ' + format(tmp.mc.mechEff);
						},
                        {}],
                        ["display-text",function(){if(player.ma.points.gte(22))return "";return "Your Mech-Energy are losing by 1% per second."}],
						["row",[["buyable",11],["buyable",12],["buyable",13]]],
						"upgrades",
						"milestones",
     ]},
     "The Motherboard":{"content":["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"],
                    ["display-text",
                        function() {
							return 'You have ' + format(player.mc.mechEn) + ' Mech-Energy, which multiplies hyperspace energy exponent by ' + format(tmp.mc.mechEff);
						},
                        {}],
                        ["display-text","Your Mech-Energy are losing by 1% per second."],
						["row",[["buyable",21],["buyable",22]]],
						["row",[["buyable",31],["buyable",32]]],
     ],unlocked(){return hasMilestone("mc",4)}
     },
     },
	mechEff(){
		let ret=player.mc.mechEn.add(1).log10().div(10).add(1);
		return ret;
	},
    buyables: {
            rows: 1,
            cols: 3,
            11: {
                title: "Machine Speed", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(2, x.add(hasMilestone("mc",3)?0:7).pow(1.5));
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(buyableEffect("ge",13).mul(buyableEffect("mc",13)).mul(2), x);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " Machine Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Mech-Energy gain by "+format(data.effect)+".";
                },
                unlocked() { return hasMilestone("mc",2) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
            },
            12: {
                title: "Machine Efficiency", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(10, x.pow(1.5));
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(buyableEffect("ge",13).mul(buyableEffect("mc",13)).mul(2), x);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " Mech-Energy\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Mech-Energy gain by "+format(data.effect)+".";
                },
                unlocked() { return hasMilestone("ne",1) }, 
                canAfford() {
                    return player[this.layer].mechEn.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].mechEn= player[this.layer].mechEn.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
            },
            13: {
                title: "Machine Upgrade", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1e50).pow(Decimal.pow(1.1,x));
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = x.div(20).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " Mech-Energy\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply base of first 2 Machine buyables by "+format(data.effect)+".";
                },
                unlocked() { return hasMilestone("ne",2) }, 
                canAfford() {
                    return player[this.layer].mechEn.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].mechEn= player[this.layer].mechEn.sub(cost)    
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
            },
            21: {
                title: "CPU", // Optional, displayed at the top in a larger font
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = player[this.layer].buyables[this.id].add(1).log10().pow(player[this.layer].buyables[13]).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Active: " + format(player[this.layer].buyables[this.id]) + " Mech-Energy\n\
                    Currently: Machine Upgrade level boost Super Points by "+format(data.effect)+"x.";
                },
                unlocked() { return hasMilestone("mc",4) }, 
                canAfford() {
                    return player[this.layer].mechEn.gte(player[this.layer].buyables[this.id])
                },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(player[this.layer].mechEn)
                    player[this.layer].mechEn = new Decimal(0)
                },
            },
            22: {
                title: "The Port", // Optional, displayed at the top in a larger font
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = player[this.layer].buyables[this.id].add(1).log10().pow(player[this.layer].buyables[13].sqrt()).add(1).pow(0.2);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Active: " + format(player[this.layer].buyables[this.id]) + " Mech-Energy\n\
                    Currently: Machine Upgrade level boost Gear and Machine Power by "+format(data.effect)+"x.";
                },
                unlocked() { return hasMilestone("mc",6) }, 
                canAfford() {
                    return player[this.layer].mechEn.gte(player[this.layer].buyables[this.id])
                },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(player[this.layer].mechEn)
                    player[this.layer].mechEn = new Decimal(0)
                },
            },
            31: {
                title: "Northbridge", // Optional, displayed at the top in a larger font
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = player[this.layer].buyables[this.id].add(1).log10().pow(player[this.layer].buyables[13].pow(0.6)).add(1).pow(0.3);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Active: " + format(player[this.layer].buyables[this.id]) + " Mech-Energy\n\
                    Currently: Machine Upgrade level boost Hyperspace Energy by "+format(data.effect)+"x.";
                },
                unlocked() { return hasMilestone("mc",7) }, 
                canAfford() {
                    return player[this.layer].mechEn.gte(player[this.layer].buyables[this.id])
                },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(player[this.layer].mechEn)
                    player[this.layer].mechEn = new Decimal(0)
                },
            },
            32: {
                title: "Southbridge", // Optional, displayed at the top in a larger font
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = player[this.layer].buyables[this.id].add(1).log10().pow(player[this.layer].buyables[13]).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Active: " + format(player[this.layer].buyables[this.id]) + " Mech-Energy\n\
                    Currently: Machine Upgrade level boost Life Essence by "+format(data.effect)+"x.";
                },
                unlocked() { return hasMilestone("mc",8) }, 
                canAfford() {
                    return player[this.layer].mechEn.gte(player[this.layer].buyables[this.id])
                },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(player[this.layer].mechEn)
                    player[this.layer].mechEn = new Decimal(0)
                },
            },
    },
        passiveGeneration() { return (hasMilestone("mc", 9)?1:0) },
        marked: function(){return player.ma.points.gte(22)}
});

addLayer("ne", {
		name: "neurons", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "NE", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			signals: new Decimal(0),
			thoughts: new Decimal(0),
        }},
        color: "#ded9ff",
        requires() { if(hasMilestone("ai",0))return new Decimal(1); if(hasUpgrade("q",25))return new Decimal(1); return new Decimal("1e370") }, // Can be a function that takes requirement increases into account
        resource: "neurons", // Name of prestige currency
        baseResource: "subspace", // Name of resource prestige is based on
        baseAmount() {return player.ss.subspace}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(2), // Prestige currency exponent
		base(){ if(hasUpgrade("q",43))return new Decimal(1e50); return new Decimal("1e100") },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
		canBuyMax() { return false },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "u", description: "Press U to Neuron Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.mc.unlocked},
        doReset(resettingLayer){ 
			let keep = ["milestones","challenges"];
			if (layers[resettingLayer].row<7&&resettingLayer!="id"&&resettingLayer!="ai"&&resettingLayer!="c") {
				keep.push("thoughts")
				keep.push("buyables")
			}
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        branches: ["ss", "sg"],
		update(diff) {
			if (player.ne.unlocked && player.ne.activeChallenge==11) {
                player.ne.challenges[11]=player.points.max(player.ne.challenges[11]).toNumber();
            }
            
            if (player.ne.unlocked && (player.ne.activeChallenge==11 || hasMilestone("id",3))) {
				player.ne.signals = player.ne.signals.plus(layers.ne.challenges[11].amt().times(diff)).min((hasMilestone("ne", 4)||hasMilestone("id", 0))?(Decimal.dInf):tmp.ne.signalLim);
				if (player.ne.signals.gte(tmp.ne.signalLim.times(0.999))) {
					if (hasMilestone("id", 0)) player.ne.thoughts = player.ne.thoughts.max(tmp.ne.thoughtTarg);
					else {
						if (!hasMilestone("ne", 4)) player.ne.signals = new Decimal(0);
						player.ne.thoughts = player.ne.thoughts.plus(1);
					}
				}
				if (hasMilestone("ai", 2)) layers.ne.buyables[11].buyMax();
			}
		},
		effect() {
			let eff = player[this.layer].points;
            if(hasMilestone("ne", 3))eff = eff.times(Decimal.pow(2,player[this.layer].points));
			return eff;
		},
		effectDescription() { return "which multiply Signal gain speed by <h2 style='color: #ded9ff; text-shadow: #ded9ff 0px 0px 10px;'>"+format(tmp[this.layer].effect)+"</h2>." },
        signalLimThresholdInc() {
			let inc = new Decimal(hasMilestone("ne", 4)?2:(hasMilestone("ne", 3)?2.5:(hasMilestone("ne", 2)?3:5)));
			if (player.id.unlocked) inc = inc.sub(layers.id.effect());
			return inc;
		},
		signalLimThresholdDiv() {
			let div = new Decimal(1);
			//if (player.c.unlocked && tmp.c) div = div.times(tmp.c.eff2);
			return div;
		},
		signalLim() { return Decimal.pow(layers[this.layer].signalLimThresholdInc(), player.ne.thoughts).times(100).div(layers[this.layer].signalLimThresholdDiv()) },
		thoughtEff2() { return player.ne.thoughts.add(1).log10().div(hasMilestone("id", 2)?85:hasMilestone("id", 1)?97:100).add(1).pow(hasMilestone("ne", 2)?2:1).pow(hasMilestone("i", 6)?2:1); },
		thoughtEff3() { return Decimal.pow(1.2, player.ne.thoughts.times(hasMilestone("id", 2)?3:hasMilestone("id", 1)?2:hasMilestone("ne", 5)?1:0).sqrt()) },
		thoughtTarg() { return player.ne.signals.times(layers[this.layer].signalLimThresholdDiv()).div(100).max(1).log(layers[this.layer].signalLimThresholdInc()).plus(1).floor() },
        challenges: {
			rows: 1,
			cols: 1,
			11: {
				name: "The Brain",
				challengeDescription: "Hindrance Spirit's Reward boost effect is 0; Prestige Upgrade 2, Boosters, & Generators are disabled.<br>",
				unlocked() { return player.ne.unlocked && player.ne.points.gt(0) },
				gainMult() { 
					let mult = tmp.ne.effect.times(player.ne.signals.plus(1).log10().plus(1));
					if (hasMilestone("ne", 0)) mult = mult.times(player.ss.points.plus(1).sqrt());
					if (hasMilestone("ne", 2)) mult = mult.times(player.ne.points.max(1));
					if (player.en.unlocked && hasMilestone("en", 3)) mult = mult.times(tmp.en.mwEff);
                    mult = mult.times(buyableEffect("r",12));
                    if(hasUpgrade("q",25))mult = mult.times(2);
                    if(hasUpgrade("q",43))mult = mult.times(2);
                    mult = mult.times(buyableEffect("l",15));
            mult = mult.mul(tmp.ai.conscEff1);
                    return mult;
				},
				amt() { 
					let a = Decimal.pow(10, player.points.div(20).pow(3));
                    if(a.gte(16.91))a = Decimal.pow(10, player.points.div(19).pow(3.5));
                    if(hasMilestone("id",3))a = Decimal.pow(10, Decimal.div(player.ne.challenges[11],18).pow(4));
                    a = a.pow(tmp.ne.buyables[11].effect).times(tmp.ne.challenges[11].gainMult);
					if (!a.eq(a)) return new Decimal(0);
					return a;
				},
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
				rewardDescription() { let ret="Gain Signals based on "+(hasMilestone("id",3)?"highest ":"")+"points in The Brain. <br>Signals: <h3 style='color: #ded9ff'>"+formatWhole(player.ne.signals)+"/"+formatWhole(tmp.ne.signalLim)+"</h3> "+("(+"+formatWhole((player.ne.activeChallenge==11 || hasMilestone("id",3))?tmp.ne.challenges[11].amt:0)+"/s)")+"<br><br><br>Thoughts: <h3 style='color: #ffbafa'>"+formatWhole(player.ne.thoughts)+"</h3> (Next at "+formatWhole(tmp.ne.signalLim)+" Signals)<br><br>Effects<br>Subspace Energy is cheaper based on Thoughts (10 -> "+format(tmp.ss.requires)+")";
                if(hasMilestone("ne",1))ret = ret+"<br>Multiply Subspace & SG bases by "+format(tmp.ne.thoughtEff2)+"x";
                if(hasMilestone("ne",5))ret = ret+"<br>Multiply Energy gain by "+format(tmp.ne.thoughtEff3)+"x";
                return ret;
                },
                onEnter(){
                    doReset("m",true);
                    player.ne.activeChallenge=11;
                },
				style() { return {'background-color': "#484659", filter: "brightness("+(100+player.ne.signals.plus(1).log10().div(tmp.ne.signalLim.plus(1).log10()).times(50).toNumber())+"%)", color: "white", 'border-radius': "25px", height: "400px", width: "400px"}},
			},
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "The Neural Network",
				cost(x=player[this.layer].buyables[this.id]) {
					x = Decimal.pow(10, x.add(1).log10().pow(1.5));
					return Decimal.pow(4, x.pow(1.2)).times(1e3);
				},
				bulk(r=player.ne.signals) {
					let b = r.div(1e3).max(1).log(4).root(1.2);
					b = Decimal.pow(10, b.max(1).log10().root(1.5));
					return b.floor().max(0);
				},
				power() {
					return new Decimal(1);
                    //let p = new Decimal(hasUpgrade("ai", 11)?1.5:1);
					//if (player.c.unlocked && tmp.c) p = p.times(tmp.c.eff5);
					//return p;
				},
				effect() { return player[this.layer].buyables[this.id].times(tmp.ne.buyables[11].power).div(3).plus(1) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = "Cost: "+format(cost)+" Signals<br><br>Level: "+formatWhole(amt)+"<br><br>Effect: Signal gain from Points is raised ^"+format(data.effect);
					return display;
                },
                unlocked() { return hasMilestone("ne", 0) }, 
                canAfford() {
					if (!tmp[this.layer].buyables[this.id].unlocked) return false;
                    return player[this.layer].unlocked && player.ne.signals.gte(layers[this.layer].buyables[this.id].cost());
				},
                buy() { 
					player.ne.signals = player.ne.signals.sub(tmp[this.layer].buyables[this.id].cost).max(0)
					player.ne.buyables[this.id] = player.ne.buyables[this.id].plus(1);
                },
				buyMax() { player.ne.buyables[this.id] = player.ne.buyables[this.id].max(tmp.ne.buyables[11].bulk) },
                style: {'height':'250px', 'width':'250px', 'background-color'() { return tmp.ne.buyables[11].canAfford?'#a2cade':'#bf8f8f' }, "border-color": "#a2cade"},
			},
		},

		milestones: {
			0: {
				requirementDescription: "2,000 Signals",
				done() { return player.ne.signals.gte(2000) || player.ne.milestones.includes(0) },
				effectDescription() { return "Subspace Energy multiplies Signal gain ("+format(player.ss.points.plus(1).sqrt())+"x), Mastery milestone boost Machine Power and unlock The Neural Network." },
			},
			1: {
				requirementDescription: "80,000 Signals",
				done() { return player.ne.signals.gte(8e4) || player.ne.milestones.includes(1) },
				effectDescription() { return "Unlock a new Thought effect, and unlock 2nd Machine buyable." },
			},
			2: {
				requirementDescription: "3,000,000 Signals",
				done() { return player.ne.signals.gte(3e6) || player.ne.milestones.includes(2) },
				effectDescription() { return "The Thought requirement increases slower (5x -> 3x), the second Thought effect is squared, and multiply Signal gain by your Neurons, and unlock 3rd Machine buyable." },
			},
			3: {
				requirementDescription: "100,000,000 Signals",
				done() { return player.ne.signals.gte(1e8) || player.ne.milestones.includes(3) },
				effectDescription() { return "The Thought requirement increases even slower (3x -> 2.5x), and the Neuron effect uses a better formula." },
			},
			4: {
				requirementDescription: "2.5e9 Signals",
				done() { return player.ne.signals.gte(2.5e9) || player.ne.milestones.includes(4) },
				effectDescription() { return "The Thought requirement increases even slower (2.5x -> 2x), and getting a Thought does not reset Signals" },
			},
			5: {
				requirementDescription: "1e16 Signals",
				done() { return player.ne.signals.gte(1e16) || player.ne.milestones.includes(5) },
				effectDescription() { return "The first Thought effect is maxed. Unlock a new Thought effect." },
			},
        },

        canBuyMax() { return hasMilestone("ai",0) },
        autoPrestige() { return hasMilestone("ai",0) },
        resetsNothing() { return hasMilestone("ai",0) },


});



addLayer("en", {
		name: "energy", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "EN", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			bestOnReset: new Decimal(0),
			total: new Decimal(0),
			stored: new Decimal(0),
			target: 0,
			tw: new Decimal(0),
			ow: new Decimal(0),
			sw: new Decimal(0),
			mw: new Decimal(0),
        }},
        color: "#fbff05",
        resource: "energy", // Name of prestige currency
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		baseResource: "solarity",
		baseAmount() { return player.o.points },
		requires() { 
            if (hasMilestone("r", 3))return Decimal.pow("1e162",Decimal.pow(0.95,player.r.total.add(1).log10()));
            return new Decimal("1e162")
        },
		exponent() { return new Decimal(0.1) },
		passiveGeneration() { return hasMilestone("en", 0)?buyableEffect("r",11).mul(0.1).min(1).toNumber():0 },
		canReset() {
            if(!tmp.en.resetGain.gte)tmp.en.resetGain=new Decimal(0);
            if(tmp.en.resetGain.gte(1) && hasMilestone("r",1))return true;
			return player.o.points.gte(tmp.en.req) && tmp.en.resetGain.gte(1) && (hasMilestone("en", 0)?player.en.points.lt(tmp.en.resetGain):player.en.points.eq(0))
		},
		prestigeNotify() {
            if(!tmp.en.resetGain.gte)tmp.en.resetGain=new Decimal(0);
			if (!canReset("en")) return false;
			if (tmp.en.resetGain.gte(player.o.points.times(0.1).max(1)) && !tmp.en.passiveGeneration) return true;
			else return false;
		},
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "y", description: "Press Y to Energy Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = ["milestones","target"];
			if (resettingLayer==this.layer) player.en.target = player.en.target%(hasMilestone("en", 3)?4:3)+1;
			if (layers[resettingLayer].row<7 && resettingLayer!="r" && resettingLayer!="ai" && resettingLayer!="c") {
				keep.push("tw");
				keep.push("sw");
				keep.push("ow");
				keep.push("mw");
			}
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		gainMult() {
			let mult = new Decimal(1);
			if (hasMilestone("en", 0)) mult = mult.times(2);
			if (hasMilestone("en", 2)) mult = mult.times(player.o.points.plus(1).log10().plus(1).log10().plus(1));
            mult = mult.mul(tmp.en.clickables[11].eff);
            mult = mult.times(buyableEffect("r",11));
			if (hasMilestone("i", 7)) mult = mult.times(player.i.points.add(1));
            if(hasMilestone("ne",5))mult = mult.times(tmp.ne.thoughtEff3);
            if(hasMilestone("h",44))mult = mult.times(layers.h.getHCBoost());
            mult = mult.mul(tmp.ai.conscEff1);
			return mult;
		},
		onPrestige(gain) { player.en.bestOnReset = player.en.bestOnReset.max(gain) },
        layerShown(){return player.ne.unlocked },
        branches: ["sb","o"],
		update(diff) {
			if (!player[this.layer].unlocked) return;
			let subbed = new Decimal(0);
			if (player.en.points.gt(0)) {
				subbed = player.en.points.times(Decimal.sub(1, Decimal.pow(0.75, diff))).plus(diff);
				player.en.points = player.en.points.times(Decimal.pow(0.75, diff)).sub(diff).max(0);
				if (hasMilestone("en", 1)) player.en.stored = player.en.stored.plus(subbed.div(5));
			}
			let sw_mw_exp = 1
			if (hasMilestone("r", 2)) {
				if (hasMilestone("r", 3))subbed = subbed.times(buyableEffect("r",11).max(1));
				player.en.tw = player.en.tw.pow(1.5).plus(subbed.div(player.en.target==1?1:3)).root(1.5);
				player.en.ow = player.en.ow.pow(1.5).plus(subbed.div(player.en.target==2?1:3)).root(1.5);
				player.en.sw = player.en.sw.pow(sw_mw_exp*(hasMilestone("en", 4)?2.5:4)).plus(subbed.div(player.en.target==3?1:3)).root(sw_mw_exp*(hasMilestone("en", 4)?2.5:4));
				if (hasMilestone("en", 3)) player.en.mw = player.en.mw.pow(sw_mw_exp*(hasMilestone("en", 4)?5.5:7)).plus(subbed.div(player.en.target==4?1:3)).root(sw_mw_exp*(hasMilestone("en", 4)?5.5:7));
				
			} else switch(player.en.target) {
				case 1: 
					player.en.tw = player.en.tw.pow(1.5).plus(subbed).root(1.5);
					break;
				case 2: 
					player.en.ow = player.en.ow.pow(1.5).plus(subbed).root(1.5);
					break;
				case 3: 
					player.en.sw = player.en.sw.pow(sw_mw_exp*(hasMilestone("en", 4)?2.5:4)).plus(subbed).root(sw_mw_exp*(hasMilestone("en", 4)?2.5:4));
					break;
				case 4: 
					if (hasMilestone("en", 3)) player.en.mw = player.en.mw.pow(sw_mw_exp*(hasMilestone("en", 4)?5.5:7)).plus(subbed).root(sw_mw_exp*(hasMilestone("en", 4)?5.5:7));
					break;
			}
		},
		storageLimit() { return player.en.total.div(2) },
		twEff() { return player.en.tw.plus(1).log10().plus(1).log10().plus(1) },
		owEff() { return player.en.ow.plus(1).log10().plus(1).log10().plus(1).log10().plus(1) },
		swEff() { return player.en.sw.plus(1).log10().plus(1).log10().div(10).plus(1) },
		mwEff() { return hasMilestone("en", 3)?player.en.mw.plus(1).log10().plus(1).log10().plus(1).pow(3):new Decimal(1) },
        tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank",
			"milestones",
			"blank", "blank", 
			"clickables",
			"blank", "blank",
			["row", [
				["column", [["display-text", function() { return "<h3 style='color: "+(player.en.target==1?"#e1ffde;":"#8cfa82;")+"'>"+(player.en.target==1?"TIME WATTS":"Time Watts")+"</h3>" }], ["display-text", function() { return "<h4 style='color: #8cfa82;'>"+formatWhole(player.en.tw)+"</h4><br><br>Time Capsule base x<span style='color: #8cfa82; font-weight: bold; font-size: 20px;'>"+format(tmp.en.twEff)+"</span>" }]], {width: "100%"}],
				]], "blank", "blank", ["row", [
				["column", [["display-text", function() { return "<h3 style='color: "+(player.en.target==2?"#fff0d9":"#ffd187;")+"'>"+(player.en.target==2?"SOLAR WATTS":"Solar Watts")+"</h3>" }], ["display-text", function() { return "<h4 style='color: #ffd187;'>"+formatWhole(player.en.ow)+"</h4><br><br>Solarity gain exponent x<span style='color: #ffd187; font-weight: bold; font-size: 20px;'>"+format(tmp.en.owEff)+"</span>" }]], {width: "50%"}],
				["column", [["display-text", function() { return "<h3 style='color: "+(player.en.target==3?"#dbfcff;":"#8cf5ff;")+"'>"+(player.en.target==3?"SUPER WATTS":"Super Watts")+"</h3>" }], ["display-text", function() { return "<h4 style='color: #8cf5ff;'>"+formatWhole(player.en.sw)+"</h4><br><br>Super Booster base x<span style='color: #8cf5ff; font-weight: bold: font-size: 20px;'>"+format(tmp.en.swEff)+"</span>" }]], {width: "50%"}],
				]], "blank", "blank", ["row", [
				["column", [["display-text", function() { return hasMilestone("en", 3)?("<h3 style='color: "+(player.en.target==4?"#f4deff;":"#d182ff;")+"'>"+(player.en.target==4?"MIND WATTS":"Mind Watts")+"</h3>"):"" }], ["display-text", function() { return hasMilestone("en", 3)?("<h4 style='color: #d182ff;'>"+formatWhole(player.en.mw)+"</h4><br><br>Multiplies Signal gain by <span style='color: #d182ff; font-weight: bold; font-size: 20px;'>"+format(tmp.en.mwEff)+"</span>"):"" }]], {width: "75%"}],
			], function() { return {display: hasMilestone("en", 3)?"none":""} }],
			"blank", "blank", "blank",
		],
		clickables: {
			rows: 1,
			cols: 2,
			11: {
				title: "Store Energy",
				display(){
					return "Stored Energy: <span style='font-size: 20px; font-weight: bold;'>"+formatWhole(player.en.stored)+" / "+formatWhole(tmp.en.storageLimit)+"</span><br><br>"+(tmp.nerdMode?("Effect Formula: log(log(x+1)+1)/5"):("Increases Energy gain by <span style='font-size: 20px; font-weight: bold;'>"+format(tmp.en.clickables[11].eff)+"x</span>"))
				},
				eff() { 
					let e = player.en.stored.sqrt().add(1);
					return e;
				},
				unlocked() { return player.en.unlocked },
				canClick() { return player.en.unlocked && player.en.points.gt(0) },
				onClick() { 
					player.en.stored = player.en.stored.plus(player.en.points).min(tmp.en.storageLimit);
					player.en.points = new Decimal(0);
				},
				style: {width: "160px", height: "160px"},
			},
			12: {
				title: "Release Energy",
				display: "",
				unlocked() { return player.en.unlocked },
				canClick() { return player.en.unlocked && player.en.stored.gt(0) },
				onClick() { 
					player.en.points = player.en.points.plus(player.en.stored);
					player.en.best = player.en.best.max(player.en.points);
					player.en.stored = new Decimal(0);
				},
				style: {width: "80px", height: "80px"},
			},
		},
		milestones: {
			0: {
				requirementDescription: "100 Energy in one reset",
				done() { return player.en.bestOnReset.gte(100) },
				effectDescription: "Gain 10% of Energy gain every second, you can always Energy reset when under 100% of Energy gain, and Energy gain is doubled. Mastery milestone boost Gears.",
            },
			1: {
				requirementDescription: "22,500 Energy in one reset",
				done() { return player.en.bestOnReset.gte(22500) },
				effectDescription: "20% of Energy that's lost over time becomes stored. Unlock a gear buyable.",
            },
			2: {
				requirementDescription: "335,000 Energy in one reset",
				done() { return player.en.bestOnReset.gte(335e3) },
				effectDescription() { return "Energy gain is multiplied by the double-log of your Solarity ("+format(player.o.points.plus(1).log10().plus(1).log10().plus(1))+"x). Unlock a gear buyable." },
			},
			3: {
				requirementDescription: "1e8 Energy in one reset",
				done() { return player.en.bestOnReset.gte(1e8) },
				effectDescription() { return "Unlock Mind Watts." },
			},
			4: {
				requirementDescription: "1e10 Energy in one reset",
				done() { return player.en.bestOnReset.gte(1e10) },
				effectDescription() { return "The Mind Watt & Super Watt gain roots are decreased by 1.5" },
			},
        },
});



addLayer("r", {
        name: "robots", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
        }},
        color: "#00ccff",
        requires(){
            if(hasMilestone("i",9))return new Decimal(1);
            return Decimal.pow(3e12,Decimal.pow(0.001,player.points.sub(25)));
        }, // Can be a function that takes requirement increases into account
        resource: "robots", // Name of prestige currency
        baseResource: "total energy", // Name of resource prestige is based on
        baseAmount() {return player.en.total}, // Get the current amount of baseResource
       type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return 0.1 }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
            if(hasMilestone("r",4))mult = mult.mul(buyableEffect("m",32));
			if (hasMilestone("i", 8)) mult = mult.times(player.i.points.add(1));
            
            if(hasMilestone("l",17))mult = mult.times(buyableEffect("l", 16));
            mult = mult.mul(buyableEffect("r",33));
            mult = mult.mul(tmp.ai.conscEff1);
            return mult;
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "r", description: "R: reset for robots", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
            let keep = ["milestones"];
            if (layers[resettingLayer].row > this.row+1 || resettingLayer=="ai") layerDataReset(this.layer, keep)
        },
        layerShown(){return player.en.unlocked },
        branches: ["en"],
        tabFormat: {
            "Main Tab": {
                content: ["main-display",
            "prestige-button",
            "resource-display",
            "blank",
            "buyables",
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
                requirementDescription: "1 Total Robot",
                done() { return player.r.total.gte(1)},
                effectDescription: "Gain 100% of gear gain per second.",
            },
            1: {
                requirementDescription: "2 Total Robots",
                done() { return player.r.total.gte(2)},
                effectDescription: "Unlock Mindbots. You can always energy reset.",
            },
            2: {
                requirementDescription: "20 Total Robots",
                done() { return player.r.total.gte(20)},
                effectDescription: "Non-selected Watts are still generated (but 3x slower).",
            },
            3: {
                requirementDescription: "100 Total Robots",
                done() { return player.r.total.gte(100)},
                effectDescription: "Energybots boost Watts gain, energy requirement is reduced based on total robots.",
            },
            4: {
                requirementDescription: "300 Total Robots",
                done() { return player.r.total.gte(300)},
                effectDescription: "Unlock a new spell.",
            },
            5: {
                requirementDescription: "2,000 Total Robots",
                done() { return player.r.total.gte(2000)},
                effectDescription: "Unlock Gearbot.",
            },
            6: {
                requirementDescription: "10,000 Total Robots",
                done() { return player.r.total.gte(10000)},
                effectDescription: "Unlock Solarbot.",
            },
            7: {
                requirementDescription: "40,000 Total Robots",
                done() { return player.r.total.gte(40000)},
                effectDescription: "Unlock Superbot.",
            },
            8: {
                requirementDescription: "100,000 Total Robots",
                done() { return player.r.total.gte(100000)},
                effectDescription: "Unlock Hyperbot.",
            },
            9: {
                requirementDescription: "2e6 Total Robots",
                done() { return player.r.total.gte(2e6)},
                effectDescription: "Solarbot effect is better.",
            },
            10: {
                requirementDescription: "5e6 Total Robots",
                done() { return player.r.total.gte(5e6)},
                effectDescription: "Superbot effect is better.",
            },
            11: {
                requirementDescription: "1e8 Total Robots",
                done() { return player.r.total.gte(1e8)},
                effectDescription: "Energybot effect is better.",
            },
            12: {
                requirementDescription: "1e12 Total Robots",
                done() { return player.r.total.gte(1e12)},
                effectDescription: "Unlock Mechbot.",
            },
            13: {
                requirementDescription: "5e12 Total Robots",
                done() { return player.r.total.gte(5e12)},
                effectDescription: "Unlock Lifebot.",
            },
            14: {
                requirementDescription: "1e14 Total Robots",
                done() { return player.r.total.gte(1e14)},
                effectDescription: "Unlock Metabot.",
            },
            15: {
                requirementDescription: "3e15 Total Robots",
                done() { return player.r.total.gte(3e15)},
                effectDescription: "Energybot effect is better.",
            },
            16: {
                requirementDescription: "2e16 Total Robots",
                done() { return player.r.total.gte(2e16)},
                effectDescription: "Gearbot effect is better.",
            },
            17: {
                requirementDescription: "5e16 Total Robots",
                done() { return player.r.total.gte(5e16)},
                effectDescription: "Gain 100% of robot gain per second.",
            },
            18: {
                requirementDescription: "5e17 Total Robots",
                done() { return player.r.total.gte(5e17)},
                effectDescription: "Mechbot effect is better.",
            },
            19: {
                requirementDescription: "2e18 Total Robots",
                done() { return player.r.total.gte(2e18)},
                effectDescription: "Hyperbot effect is better.",
            },
            20: {
                requirementDescription: "8e18 Total Robots",
                done() { return player.r.total.gte(8e18)},
                effectDescription: "Metabot effect is better.",
            },
            21: {
                requirementDescription: "1e20 Total Robots",
                done() { return player.r.total.gte(1e20)},
                effectDescription: "Auto-allocate 100% of your robots per second to all 9 types without spending your robot.",
            },
        },
        buyables: {
            rows: 3,
            cols: 3,
            11: {
                title: "Energybot",
                gain() { return player[this.layer].points },
                effect() { 
                    if(hasMilestone("r",15))return player[this.layer].buyables[this.id].pow(0.25).add(1);
                    let eff = player[this.layer].buyables[this.id].mul(100).add(1).log10().add(1);
                    if(hasMilestone("r",11))eff = eff.pow(2);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("You have " + formatWhole(player[this.layer].buyables[this.id])+(" Energybots.\nEffect: Multiplies energy gain by "+format(tmp[this.layer].buyables[this.id].effect)+" and passive energy gain by "+format(tmp[this.layer].buyables[this.id].effect.min(10))))
                    return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() { return player[this.layer].points.gt(0) },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(player[this.layer].points);
                    player[this.layer].points = new Decimal(0);
                },
            },
            12: {
                title: "Mindbot",
                gain() { return player[this.layer].points },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].mul(100).add(1).log10().add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("You have " + formatWhole(player[this.layer].buyables[this.id])+(" Mindbots.\nEffect: Multiplies signal gain by "+format(tmp[this.layer].buyables[this.id].effect)));
                    return display;
                },
                unlocked() { return hasMilestone(this.layer,1) }, 
                canAfford() { return player[this.layer].points.gt(0) },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(player[this.layer].points);
                    player[this.layer].points = new Decimal(0);
                },
            },
            13: {
                title: "Gearbot",
                gain() { return player[this.layer].points },
                effect() { 
                    if(hasMilestone("r",15))return Decimal.pow(10,player[this.layer].buyables[this.id].add(1).log10().sqrt());
                    let eff = player[this.layer].buyables[this.id].mul(100).add(1).log10().add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("You have " + formatWhole(player[this.layer].buyables[this.id])+(" Gearbots.\nEffect: Multiplies gear and rotations gain by "+format(tmp[this.layer].buyables[this.id].effect)));
                    return display;
                },
                unlocked() { return hasMilestone(this.layer,5) }, 
                canAfford() { return player[this.layer].points.gt(0) },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(player[this.layer].points);
                    player[this.layer].points = new Decimal(0);
                },
            },
            21: {
                title: "Solarbot",
                gain() { return player[this.layer].points },
                effect() { 
                    if(hasMilestone("r",9))return player[this.layer].buyables[this.id].add(1).pow(1.5);
                    let eff = player[this.layer].buyables[this.id].mul(100).add(1).log10().add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("You have " + formatWhole(player[this.layer].buyables[this.id])+(" Solarbots.\nEffect: Multiplies solarity and solar energy gain by "+format(tmp[this.layer].buyables[this.id].effect)));
                    return display;
                },
                unlocked() { return hasMilestone(this.layer,6) }, 
                canAfford() { return player[this.layer].points.gt(0) },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(player[this.layer].points);
                    player[this.layer].points = new Decimal(0);
                },
            },
            22: {
                title: "Superbot",
                gain() { return player[this.layer].points },
                effect() { 
                    if(hasMilestone("r",10))return player[this.layer].buyables[this.id].mul(2).add(1);
                    let eff = player[this.layer].buyables[this.id].mul(100).add(1).log10().add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("You have " + formatWhole(player[this.layer].buyables[this.id])+(" Superbots.\nEffect: Multiplies super point gain by "+format(tmp[this.layer].buyables[this.id].effect)));
                    return display;
                },
                unlocked() { return hasMilestone(this.layer,7) }, 
                canAfford() { return player[this.layer].points.gt(0) },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(player[this.layer].points);
                    player[this.layer].points = new Decimal(0);
                },
            },
            23: {
                title: "Hyperbot",
                gain() { return player[this.layer].points },
                effect() { 
                    if(hasMilestone("r",19))return Decimal.pow(10,player[this.layer].buyables[this.id].add(1).log10().sqrt());
                    let eff = player[this.layer].buyables[this.id].mul(100).add(1).log10().add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("You have " + formatWhole(player[this.layer].buyables[this.id])+(" Hyperbots.\nEffect: Multiplies hyperspace energy gain by "+format(tmp[this.layer].buyables[this.id].effect)));
                    return display;
                },
                unlocked() { return hasMilestone(this.layer,8) }, 
                canAfford() { return player[this.layer].points.gt(0) },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(player[this.layer].points);
                    player[this.layer].points = new Decimal(0);
                },
            },
            31: {
                title: "Mechbot",
                gain() { return player[this.layer].points },
                effect() { 
                    if(hasMilestone("r",18))return Decimal.pow(10,player[this.layer].buyables[this.id].add(1).log10().sqrt());
                    let eff = player[this.layer].buyables[this.id].mul(100).add(1).log10().add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("You have " + formatWhole(player[this.layer].buyables[this.id])+(" Mechbots.\nEffect: Multiplies Machine Power and Mech-Energy gain by "+format(tmp[this.layer].buyables[this.id].effect)));
                    return display;
                },
                unlocked() { return hasMilestone(this.layer,12) }, 
                canAfford() { return player[this.layer].points.gt(0) },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(player[this.layer].points);
                    player[this.layer].points = new Decimal(0);
                },
            },
            32: {
                title: "Lifebot",
                gain() { return player[this.layer].points },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].mul(10).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("You have " + formatWhole(player[this.layer].buyables[this.id])+(" Lifebots.\nEffect: Multiplies Life Essence and Life Power gain by "+format(tmp[this.layer].buyables[this.id].effect)));
                    return display;
                },
                unlocked() { return hasMilestone(this.layer,13) }, 
                canAfford() { return player[this.layer].points.gt(0) },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(player[this.layer].points);
                    player[this.layer].points = new Decimal(0);
                },
            },
            33: {
                title: "Metabot",
                gain() { return player[this.layer].points },
                effect() { 
                    let eff = player[this.layer].buyables[this.id].pow(hasMilestone("r",20)?0.2:0.1).add(1);
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("You have " + formatWhole(player[this.layer].buyables[this.id])+(" Metabots.\nEffect: Multiplies Robot gain by "+format(tmp[this.layer].buyables[this.id].effect)));
                    return display;
                },
                unlocked() { return hasMilestone(this.layer,14) }, 
                canAfford() { return player[this.layer].points.gt(0) },
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(player[this.layer].points);
                    player[this.layer].points = new Decimal(0);
                },
            },
        },
        passiveGeneration() { return (hasMilestone("r", 17)?1:0) },
        update(diff) {
            if (!player.r.unlocked) return; 
            if(hasMilestone("r",21)){
                player.r.buyables[11]=player.r.buyables[11].add(player.r.points.times(diff));
                player.r.buyables[12]=player.r.buyables[12].add(player.r.points.times(diff));
                player.r.buyables[13]=player.r.buyables[13].add(player.r.points.times(diff));
                player.r.buyables[21]=player.r.buyables[21].add(player.r.points.times(diff));
                player.r.buyables[22]=player.r.buyables[22].add(player.r.points.times(diff));
                player.r.buyables[23]=player.r.buyables[23].add(player.r.points.times(diff));
                player.r.buyables[31]=player.r.buyables[31].add(player.r.points.times(diff));
                player.r.buyables[32]=player.r.buyables[32].add(player.r.points.times(diff));
                player.r.buyables[33]=player.r.buyables[33].add(player.r.points.times(diff));
            }
        }
});


addLayer("id", {
		name: "ideas", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "ID", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 5, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
        }},
        color: "#fad682",
        requires() { 
        if(hasMilestone("ai",0))return new Decimal(1);
            let req=Decimal.pow(70,Decimal.pow(0.01,player.points.sub(26))).ceil();
            if(player.points.gte(26.1))req=Decimal.pow(70,Decimal.pow(0.01,player.points.sub(26)));
            return req;
		}, // Can be a function that takes requirement increases into account
        resource: "ideas", // Name of prestige currency
        baseResource: "thoughts", // Name of resource prestige is based on
        baseAmount() {return player.ne.thoughts}, // Get the current amount of baseResource
		roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.4), // Prestige currency exponent
		base: new Decimal(1.2),
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "I", description: "Press Shift+I to Idea Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = ["milestones"];
			if (layers[resettingLayer].row<7&&resettingLayer!="ai"&&resettingLayer!="c") {
				keep.push("points");
				keep.push("best");
			}
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		effect() { return Decimal.sub(0.95, Decimal.div(0.95, player.id.points.plus(1).log10().times(hasMilestone("id", 4)?1.5:1).times(hasMilestone("id", 5)?1.75:1).plus(1))) },
		effectDescription() { return "which reduce the Thought threshold's increase by <h2 style='color: #fad682; text-shadow: #fad682 0px 0px 10px;'>"+format(tmp[this.layer].effect)+"</h2>." },
		rev() { return player.ne.signals.plus(1).log10().div(10).pow(.75).times(player.id.points).pow(hasMilestone("id", 0)?2:1).floor() },
		revEff() { return tmp.id.rev.add(1); },
        layerShown(){return player.r.unlocked},
        branches: ["ne"],
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank", 
			"milestones", "blank", "blank",
			["display-text", function() { return "Revelations: <h2>"+formatWhole(tmp.id.rev)+"</h2> (based on Ideas & Signals)"}],
			["display-text", function() { return "Effect: Multiply Mech-Energy by <h2>"+format(tmp.id.revEff)+"</h2>." } ], "blank",
		],
		milestones: {
			0: {
				requirementDescription: "2 Ideas & 3 Revelations",
				done() { return (player.id.points.gte(2) && tmp.id.rev.gte(3)) },
				effectDescription: "Thoughts can be gained in bulk, and Revelations are squared.",
			},
			1: {
				requirementDescription: "2 Ideas & 12 Revelations",
				done() { return (player.id.points.gte(2) && tmp.id.rev.gte(12)) },
				effectDescription: "The 2nd-3rd thought effects are better.",
			},
			2: {
				requirementDescription: "5 Ideas & 80 Revelations",
				done() { return (player.id.points.gte(5) && tmp.id.rev.gte(80)) },
				effectDescription: "The 2nd-3rd thought effects are better.",
			},
			3: {
				requirementDescription: "7 Ideas & 170 Revelations",
				done() { return (player.id.points.gte(7) && tmp.id.rev.gte(170)) },
				effectDescription: "Signal gain now use your Highest point in the Brain.",
			},
			4: {
				requirementDescription: "11 Ideas",
				done() { return player.id.points.gte(11) },
				effectDescription: "The Idea effect is 50% more effective.",
			},
        },
        canBuyMax() { return hasMilestone("ai",0) },
        autoPrestige() { return hasMilestone("ai",0) },
        resetsNothing() { return hasMilestone("ai",0) },
});


addLayer("ai", {
		name: "AI", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "AI", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			first: 0,
			consc: new Decimal(0),
        }},
        color: "#e6ffcc",
		nodeStyle() { return {
			background: (player.ai.unlocked||canReset("ai"))?("radial-gradient(circle, #e6ffcc 0%, #566b65 100%)"):"#bf8f8f",
		}},
		componentStyles: {
			"prestige-button": {
				background() { return (canReset("ai"))?("radial-gradient(circle, #e6ffcc 0%, #566b65 100%)"):"#bf8f8f" },
			},
		},
        requires(){
            return new Decimal(800);
        }, // Can be a function that takes requirement increases into account
        resource: "superintelligence", // Name of prestige currency 
        baseResource: "revelations", // Name of resource prestige is based on
        baseAmount() {return tmp.id.rev}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(3), // Prestige currency exponent
		roundUpCost: true,
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 6, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "R", description: "Press Shift+R to AI Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		passiveGeneration() { return 0 },
        doReset(resettingLayer){ 
			let keep = ["milestones"];
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.r.unlocked && player.id.unlocked },
        branches: ["r", ["id", 3]],
		update(diff) {
			player.ai.consc = player.ai.consc.add(buyableEffect("ai",11).mul(diff));
		},
		conscEff1() { return player.ai.consc.plus(1) },
		nodeSlots() { return Math.floor(player.ai.buyables[11].div(2).min(16).toNumber()); },
        tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank",
			["buyable", 11], "blank",
			["display-text", function() { return "<h3>"+format(player.ai.consc)+"</h3> Artificial Consciousness" }], 
			["display-text", function() { return "Effect: Multiplies Energy, Signal, & Robot gain by "+format(tmp.ai.conscEff1) }],"blank", "blank",
			["clickable", 11],
			["display-text", function() { return "Nodes: "+formatWhole(player.ai.upgrades.length)+" / "+formatWhole(tmp.ai.nodeSlots) }], "blank",
			"upgrades", "blank", "milestones"
		],
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "AI Network",
				cost(x=player[this.layer].buyables[this.id]) {
					return Decimal.pow(2, x.pow(1.5)).floor();
				},
				effect() { return player[this.layer].buyables[this.id].mul(player[this.layer].points.add(1)).mul(Decimal.pow(2,player[this.layer].buyables[this.id])); },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = formatWhole(player.ai.points)+" / "+formatWhole(cost)+" Superintelligence<br><br>Level: "+formatWhole(amt)+"<br><br>Reward: Generates "+formatWhole(data.effect)+" Artificial Consciousness/sec.";
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					if (!tmp[this.layer].buyables[this.id].unlocked) return false;
					let cost = layers[this.layer].buyables[this.id].cost();
                    return player[this.layer].unlocked && player.ai.points.gte(cost);
				},
                buy() { 
					let cost = tmp[this.layer].buyables[this.id].cost;
					player.ai.points = player.ai.points.sub(cost);
					player.ai.buyables[this.id] = player.ai.buyables[this.id].plus(1);
                },
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
		},
        upgrades: {
			rows: 4,
			cols: 4,
			11: {
				title: "Node AA",
				description: "Point softcap starts later.",
				cost: new Decimal(2),
				canAfford() {
					return player.ai.points.gte(layers[this.layer].upgrades[this.id].cost) && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked },
				style: {height: '150px', width: '150px'},
			},
        },
		milestones: {
			0: {
				requirementDescription: "1 superintelligence",
				done() { return (player.ai.best.gte(1)) },
				effectDescription: "Autobuy Neurons and Ideas, Neurons and Ideas requirements are 1, Neurons and Ideas don't reset anything.",
			},
			1: {
				requirementDescription: "3 superintelligence",
				done() { return (player.ai.best.gte(3)) },
				effectDescription: "Unlock an AI node.",
			},
			2: {
				requirementDescription: "6 superintelligence",
				done() { return (player.ai.best.gte(6)) },
				effectDescription: "Autobuy Neural Network.",
			},
        },
});