var points = 0;
var level = 1;
var speedLevel = 0;
const pointsDisplay = document.getElementById("pointsDisplay");

const version = 0.0;
if (localStorage.getItem("version") == null)
    localStorage.setItem("version", version);
else if (localStorage.getItem("version") != version) {
    localStorage.setItem("version", version);
    resetAll();
}

if (localStorage.getItem("points") == null)
    localStorage.setItem("points", 0);
points = localStorage.getItem("points") * 1;

if (localStorage.getItem("level") == null)
    localStorage.setItem("level", 1);
level = localStorage.getItem("level") * 1;

if (localStorage.getItem("speed") == null)
    localStorage.setItem("speed", 600);
time = localStorage.getItem("speed") * 1;

if (localStorage.getItem("speedLevel") == null)
    localStorage.setItem("speedLevel", 0);
speedLevel = localStorage.getItem("speedLevel") * 1;

function resetAll() {
    localStorage.setItem("points", 0);
    localStorage.setItem("level", 1);
    localStorage.setItem("speed", 600);
    localStorage.setItem("speedLevel", 0);
    points = 0;
    level = 1;
    time = 600;
    speedLevel = localStorage.getItem("speedLevel") * 1;
    document.getElementById("upgradeSpeed").innerHTML = "Upgrade Speed: " + addCommas(speeds[speedLevel] + "") + "c";
    displayPoints();
}

displayPoints();

function addCommas(number) {
    let str = number;
    let revStr = [];
    let newStr = "";
    let finalStr = "";
    for (let i = str.length - 1; i >= 0; i--) {
        revStr.push(str[i]);
    }
    for (let i = 0; i < revStr.length; i++) {
        newStr += revStr[i];
        if ((i + 1) % 3 == 0 && i != revStr.length - 1)
            newStr += ",";
    }
    for (let i = newStr.length - 1; i >= 0; i--) {
        finalStr += newStr[i];
    }
    return finalStr;
}

function displayPoints() {
    pointsDisplay.innerHTML = addCommas(points + '') + " Cookies";
}

function addPoints(amount) {
    points += amount;
    localStorage.setItem("points", points);
    displayPoints();
}

function clicked() {
    addPoints(level * 1);
    displayPoints();
}

var time = 600;
var clock = 0;
setInterval(function () {
    clock++;
    if (clock % time != 0)
        return;
    addPoints(level * 1);
    displayPoints();
}, 1);

var priceMultiplier = 4;
function fillUpgrades() {
    let btns = document.getElementsByClassName("levelBtn");
    let upgradeLevel = level + 1;
    for (let i = 0; i < btns.length; i++) {
        let price = Math.pow(upgradeLevel, priceMultiplier);
        btns[i].innerHTML = "Level " + upgradeLevel + " " + addCommas(price + '') + "c";
        btns[i].id = upgradeLevel;
        upgradeLevel++;
        btns[i].addEventListener('click', function (e) {
            if (points >= Math.pow(e.target.id, priceMultiplier)) {
                console.log(price)
                addPoints(-price);
                displayPoints();
                levelUp(Math.floor(Math.pow(e.target.id, 1.2)));
                e.target.style.backgroundColor = "gold";
                e.target.disabled = true;
            }
        })
    }
}
fillUpgrades();

function levelUp(newLevel) {
    level = newLevel;
    localStorage.setItem("level", level);
}

var speeds = [
    512, 2050, 8200, 16000, 52000, 150000, 500000, 1000000, 5000000, 12000000, 25000000
];
document.getElementById("upgradeSpeed").innerHTML = "Upgrade Speed: " + addCommas(speeds[speedLevel] + "") + "c";
function upgradeSpeed() {
    if (speedLevel >= speeds.length) {
        document.getElementById("upgradeSpeed").innerHTML = "Max Speed";
        return;
    }
    if (speeds[speedLevel] > points)
        return;
    speedLevel++;
    time = Math.floor(time * 0.7);
    addPoints(-speeds[speedLevel - 1])
    localStorage.setItem("speed", time);
    localStorage.setItem("speedLevel", speedLevel - 1);
    if (speedLevel < speeds.length)
        document.getElementById("upgradeSpeed").innerHTML = "Upgrade Speed: " + addCommas(speeds[speedLevel] + "") + "c";
    else
        document.getElementById("upgradeSpeed").innerHTML = "Max Speed";
}

function togglePopup(popup) {
    let popupElement = document.getElementById(popup);
    if (popupElement.style.display == "none")
        popupElement.style.display = "inline";
    else
        popupElement.style.display = "none";
}

// DEV: