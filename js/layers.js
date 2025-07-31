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
        eff=eff.add(layers.e.buyables[11].effect()[1]).add(challengeEffect("h",11)).add(challengeEffect("h",21));
		let ret=new Decimal(4).add(eff);
        if(hasMilestone("h",5)){
            let ret2=eff.mul(player.points.pow(2).div(50));
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
		if(hasUpgrade("b",31))mult=mult.mul(upgradeEffect("b",31));
		if(hasUpgrade("e",12))mult=mult.mul(upgradeEffect("e",12));
		if(hasUpgrade("g",25))mult=mult.mul(upgradeEffect("g",25));
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
					return eff;
				},
				unlocked() { return hasUpgrade("p", 12) },
				effectDisplay() { return format(tmp.p.upgrades[13].effect)+"x" },
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
					return eff;
				},
				unlocked() { return hasUpgrade("p", 22) },
				effectDisplay() { return format(tmp.p.upgrades[23].effect)+"x" },
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
				effect() { return player.p.total.plus(1).log10().plus(1).log10().div(5).plus(1) },
				cost() { return new Decimal(1e53); },
				unlocked() { return hasUpgrade("p", 32) },
				effectDisplay() { return "^"+format(tmp.p.upgrades[33].effect) },
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
        exponent() { if(player.h.challenges[12]>=9)return 4.5/player.h.challenges[12]; return 0.5 }, // Prestige currency exponent
		base() { 
            let ret=1.3;
            if(hasUpgrade("b",23))ret-=0.01;
		    if(hasMilestone("h",2))ret-=0.02;
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
			if (hasUpgrade("t", 11)) base = base.plus(upgradeEffect("t", 11));
			if (hasUpgrade("e", 11)&&!hasUpgrade("e", 14)) base = base.plus(upgradeEffect("e", 11).b);
			if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect()[0]);
			if (hasUpgrade("s",14)) base = base.plus(buyableEffect("s", 13));
            base = base.add(challengeEffect("h",12));
			//if (hasUpgrade("t", 25)) base = base.plus(upgradeEffect("t", 25));
			return base;
		},
		effectBase() {
			let base = new Decimal(2);
			
			base = base.plus(tmp.b.addToBase);
			
			if (player.sb.unlocked) base = base.times(tmp.sb.effect);
			if (hasUpgrade("b", 12)&&hasMilestone("h",9)) base = base.times(upgradeEffect("b", 12));
			if (hasUpgrade("b", 13)&&hasMilestone("h",9)) base = base.times(upgradeEffect("b", 13));
			if (hasUpgrade("e", 11)&&hasUpgrade("e", 14)) base = base.times(upgradeEffect("e", 11).b);
			if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
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
        exponent() { if(player.h.challenges[12]>=9)return 4.5/player.h.challenges[12]; return 0.5 }, // Prestige currency exponent
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
			if (hasUpgrade("s",14)) base = base.plus(buyableEffect("s", 13));
            
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
			if(hasUpgrade("b",21))ret=ret.pow(1.28);
			if(hasUpgrade("b",22))ret=ret.pow(1.25);
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
        exponent() { if(player.h.challenges[22]>=10.5)return 7.5/player.h.challenges[22]; return 0.75 }, // Prestige currency exponent
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
			return base;
		},
		effect() {
            if(inChallenge("h", 22))return new Decimal(0);
			if (player[this.layer].unlocked){
                let gain=Decimal.pow(tmp.t.effectBase,layers.t.effect1()).mul(layers.t.effect1());
                if (player.h.unlocked) gain = gain.mul(layers.h.effect());
                if (hasUpgrade("t",22)) gain = gain.mul(upgradeEffect("t",22));
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
            return ret;
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
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text",
				function() {return 'You have ' + format(player.t.power) + ' Time Energy, which boosts Point & Prestige Point generation by '+format(tmp.t.powerEff)+'x'},
					{}],
			"blank",
			["display-text",
				function() {return 'Your best Time Capsules is ' + formatWhole(player.t.best)},
					{}],
			"buyables",
			"milestones", "blank", "blank", "upgrades"],
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
				description: "Non-extra Time Capsules add to the Booster base.",
				cost() { return new Decimal(8) },
				unlocked() { return player.t.unlocked },
				effect() { 
					return player.t.points.pow(0.9).add(0.5).plus(hasUpgrade("t", 13)?upgradeEffect("t", 13):0);
				},
				effectDisplay() { return "+"+format(tmp.t.upgrades[11].effect) }
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
            
            
            if(player.s.points.gte(15))ret=ret.min(4.8362118522710054416216354073349);
            return ret;
        }, // Can be a function that takes requirement increases into account
        resource: "space energy", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		branches: ["g"],
        exponent() { if(player.h.challenges[22]>=10.5)return 7.5/player.h.challenges[22]; return 0.75 }, // Prestige currency exponent
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
            rows: 1,
            cols: 10,
            11: {
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1e4,Decimal.pow(x,1.35))
					if(x.eq(0))return new Decimal(0)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let eff = Decimal.pow(player.s.points.mul(layers.ss.eff1()).add(1),x.add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).mul(hasUpgrade("s",21)?1.08:1).mul(3));
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
                    let cost = Decimal.pow(1e6,Decimal.pow(x,1.35))
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let eff = Decimal.pow(player.s.points.mul(layers.ss.eff1()).add(1),x.add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).mul(hasUpgrade("s",21)?1.08:1).mul(3));
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
                    let cost = Decimal.pow(1e10,Decimal.pow(x,1.35))
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let eff = player.s.points.mul(layers.ss.eff1()).mul(x.add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).mul(hasUpgrade("s",21)?1.08:1)).pow(0.4);
					return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 3\n\
					Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Adding Booster/Generator Bases by "+format(data.effect)+". (Boosted by your Space Energy)";
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
                    let cost = Decimal.pow(1e20,Decimal.pow(x,1.35))
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let eff = player.s.points.mul(layers.ss.eff1()).mul(x.add(hasUpgrade("s",11)?1:0).add(hasUpgrade("s",22)?upgradeEffect("s",22):0).mul(hasUpgrade("s",21)?1.08:1)).pow(0.2).add(1);
                    if(hasUpgrade("s",23))eff=eff.pow(2);
					return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Space Building 4\n\
					Cost: " + format(data.cost) + " Generator Power\n\
                    Level: " + format(player[this.layer].buyables[this.id]) + "\n"+
                    "Currently: Multiply Subspace gain by "+format(data.effect)+". (Boosted by your Space Energy)";
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
				effect() { return player.t.points.cbrt().floor() },
				effectDisplay() { return "+"+formatWhole(tmp.s.upgrades[22].effect) },
			},
			23: {
				title: "Subspace Boost",
				description: "Space Building 4 effect is squared.",
				cost() { return new Decimal(26) },
				unlocked() { return hasUpgrade("s", 21) },
			},

	},
	
		canBuyMax() { return hasMilestone("q",2) },
		autoPrestige() { return hasMilestone("q",6) },
		resetsNothing() { return hasMilestone("q",6) },
		
		update(diff){
			var pow=player.g.power;
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
                    let cost = Decimal.pow(10, x.pow(1.5))
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					if(hasUpgrade("e",13))x=x.add(1);
					if(hasUpgrade("e",21))x=x.add(2);
					if(hasUpgrade("e",23))x=x.add(upgradeEffect("e",23));
					let eff = [];
					eff[0]=x;
					eff[1]=x;
                    eff[2]=new Decimal(1);
                    if(hasUpgrade("e",22))eff[0]=eff[0].pow(1.1);
                    if(hasUpgrade("e",22))eff[1]=eff[1].pow(1.05);
					if(hasUpgrade("e",22))eff[2]=Decimal.pow(2,x);
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
				var target=player.e.points.add(1).log(10).pow(1/1.5).add(1).floor();
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
        requires: new Decimal("1e40"), // Can be a function that takes requirement increases into account
        resource: "quirks", // Name of prestige currency
        baseResource: "generator power", // Name of resource prestige is based on
        baseAmount() {return player.g.power}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(0.1) }, // Prestige currency exponent
		gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
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
			let keep = [];
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.sb.unlocked},
        branches: ["e"],
		enGainMult() {
			let mult = new Decimal(1);
            if (hasUpgrade("q", 11)) mult = mult.times(upgradeEffect("q", 11));
			return mult;
		},
		enGainExp() {
			let exp = player.q.buyables[11].plus(tmp.q.freeLayers).sub(1);
			return exp;
		},
		enEff() {
			if (!player[this.layer].unlocked) return new Decimal(1);
			let eff = player.q.energy.plus(1).pow(2);
			return eff;
		},
		update(diff) {
			if (tmp.q.enGainExp.gte(0)) player.q.energy = player.q.energy.plus(new Decimal(player.timePlayed).times(tmp.q.enGainMult).pow(tmp.q.enGainExp).times(player.q.buyables[11]).times(diff));
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
        },
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
        requires: new Decimal(1e15), // Can be a function that takes requirement increases into account
        resource: "hindrance spirit", // Name of prestige currency
        baseResource: "time energy", // Name of resource prestige is based on
        baseAmount() {return player.t.power}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(0.25) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
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
			let keep = [];
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
        },
		challenges: {
			rows: 4,
			cols: 2,
			11: {
				name: "Halved Points (1)",
				challengeDescription: "Your points are divided by 2.",
				unlocked() { return hasMilestone("h",1) },
				rewardDescription: "Add Prestige Exponent based on highest points in this challenge.",
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]);
                    if(hasMilestone("h",4))ret = ret.mul(player.h.points.add(1).log10().add(1).log10().add(1));
                    return ret;
                },
                rewardDisplay(){return "+"+format(challengeEffect("h",11))}
			},
			12: {
				name: "Row 2 Disabled (2)",
				challengeDescription: "Boosters/Generators are disabled.",
				unlocked() { return hasMilestone("h",3) },
				rewardDescription: "Add to Booster Base based on highest points in this challenge.",
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]);
                    return ret;
                },
                rewardDisplay(){return "+"+format(challengeEffect("h",12))}
			},
			21: {
				name: "No Prestige (3)",
				challengeDescription: "You can't gain prestige points.",
				unlocked() { return hasMilestone("h",7) },
				rewardDescription: "Add Prestige Exponent based on highest points in this challenge.",
                canComplete: false,
                completionLimit: Infinity,
                goalDescription(){return format(player[this.layer].challenges[this.id],4)},
                rewardEffect(){
                    let ret=new Decimal(player[this.layer].challenges[this.id]).sqrt();
                    return ret;
                },
                rewardDisplay(){return "+"+format(challengeEffect("h",21))}
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
                    let ret=new Decimal(player[this.layer].challenges[this.id]).div(10);
                    if(hasUpgrade("t",23))ret=ret.add(1);
                    return ret;
                },
                rewardDisplay(){if(hasUpgrade("t",23))return format(challengeEffect("h",22))+"x"; return "+"+format(challengeEffect("h",22))}
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
            
			return base;
		},
		effect() { 
			if (!player.ss.unlocked) return new Decimal(0);
			let gain = Decimal.pow(tmp.ss.effBase, player.ss.points).mul(player.ss.points);
			if (hasUpgrade("s",15)) gain=gain.mul(buyableEffect("s", 14));
			if (hasUpgrade("ss",13)) gain=gain.mul(upgradeEffect("ss", 13));
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
            let eff=player.ss.subspace.plus(1).log10().plus(1).log10();
            if(hasUpgrade("ss",12))eff=eff.mul(upgradeEffect("ss",12));
            return eff.add(1);
        },

        doReset(resettingLayer){ 
			let keep = [];
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
        },
});