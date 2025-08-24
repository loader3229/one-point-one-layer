let modInfo = {
	name: "1 point = 1 layer",
	id: "one-points-one-layer",
	author: "loader3229",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js", "donate.js"],

	discordName: "loader3229's Discord Server",
	discordLink: "https://discord.gg/jztUReQ2vT",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "27",
	name: "Ideas",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v27</h3><br>
		- Added Ideas<br>
                - Endgame: 27 points<br>
	<h3>v26</h3><br>
		- Added Robots<br>
                - Endgame: 26 points<br>
	<h3>v25</h3><br>
		- Added Energy<br>
                - Endgame: 25 points<br>
	<h3>v24</h3><br>
		- Added Neurons<br>
                - Endgame: 24 points<br>
	<h3>v23</h3><br>
		- Added Machine<br>
                - Endgame: 23 points<br>
	<h3>v22</h3><br>
		- Added Gears<br>
                - Endgame: 22 points<br>
	<h3>v21</h3><br>
		- Added Mastery<br>
                - Endgame: 21 points<br>
	<h3>v20</h3><br>
		- Added Imperium<br>
                - Endgame: 20 points<br>
	<h3>v19</h3><br>
		- Added Life Essence<br>
                - Endgame: 19 points<br>
	<h3>v18</h3><br>
		- Added Hyperspace<br>
                - Endgame: 18 points<br>
	<h3>v16.5</h3><br>
		- Added Phantom Souls and Super Points<br>
                - Endgame: 16.5 points<br>
	<h3>v15</h3><br>
		- Added Magic<br>
                - Endgame: 15 points<br>
	<h3>v14</h3><br>
		- Added Balance Energy<br>
                - Endgame: 14 points<br>
	<h3>v13</h3><br>
		- Added Solarity<br>
                - Endgame: 13 points<br>
	<h3>v12</h3><br>
		- Added Super Generators<br>
                - Endgame: 12 points<br>
	<h3>v10.5</h3><br>
		- Added 3 Layers<br>
                - Endgame: 10.5 points<br>
	<h3>v8</h3><br>
		- Added 4 Layers<br>
                - Endgame: 9 points<br>
	<h3>v4</h3><br>
		- Added 4 Layers<br>
                - Endgame: 5 points<br>
`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

function getPointBase(){
    if(player.h.challenges[11]>=5){
        let s=40/player.h.challenges[11];
        if(hasMilestone("sp",23))s*=Decimal.pow(0.999,softcap(player.sp.points.add(1).log10(),new Decimal(625),0.5).sub(400)).toNumber();
        return new Decimal(2).add(s);
    }
    return new Decimal(10);
}
// Calculate points/sec!
function getPointGen() {
	let gain = softcap(getRealPoints().add(getRealPointGen()).log(getPointBase()).log2().div(inChallenge("h",11)?2:1),new Decimal(27),0.1).sub(player.points);
    if(inChallenge("h",52))gain = softcap(getRealPoints().add(getRealPointGen()).log(getPointBase()).log2().div(inChallenge("h",11)?2:1).add(1).log2(),new Decimal(27),0.1).sub(player.points);
	return gain
}

function getRealPointGen() {
	let gain = new Decimal(0)
	if(hasUpgrade("p",11))gain=gain.add(player.p.points.mul(10)).add(10);
	if(hasUpgrade("p",12))gain=gain.mul(upgradeEffect("p",12));
	if(hasUpgrade("p",13))gain=gain.mul(upgradeEffect("p",13));
	if(hasUpgrade("p",22))gain=gain.mul(upgradeEffect("p",22));
	if(hasUpgrade("p",23))gain=gain.mul(upgradeEffect("p",23));
	gain = gain.mul(layers.b.effect());
	gain = gain.mul(layers.g.powerEff());
	gain = gain.mul(layers.t.powerEff());
	gain = gain.mul(layers.s.buyables[11].effect());
	if (player.q.unlocked) gain = gain.mul(tmp.q.enEff);
	if (player.h.unlocked) gain = gain.mul(layers.h.effect());
    if(hasUpgrade("ss",43))gain = gain.pow(1.01);
	return gain
}

function getRealPoints() {
    if(inChallenge("h",52))return Decimal.pow(getPointBase(),Decimal.pow(2,Decimal.pow(2,softcap(player.points,new Decimal(27),10)).sub(1).mul(inChallenge("h",11)?2:1)));
	return Decimal.pow(getPointBase(),Decimal.pow(2,softcap(player.points,new Decimal(27),10).mul(inChallenge("h",11)?2:1)));
}

function setRealPoints(s){
	player.points=s.log(getPointBase()).log2().div(inChallenge("h",11)?2:1);
    if(inChallenge("h",52))player.points=player.points.add(1).log2();
    player.points=softcap(player.points,new Decimal(27),0.1);
}
// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"Mod Author: loader3229",
	"Endgame: "+VERSION.num+" points",
	function(){return "Point Gain: "+format(getRealPointGen())+"x"},
	function(){return "Progress: "+format(player.points.mul(100).div(VERSION.num))+"%"},
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal(VERSION.num))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}