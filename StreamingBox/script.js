const tileContainer = document.getElementById("tileContainer");

const apps = [
    ["YouTube", "https://youtube.com", "Online Video Streaming"],
    ["123Movies", "https://ww2.123moviesfree.net/", "Free Movies and TV"],
    ["ABC", "https://www.abc.com", "Sports and TV"],
    ["Fox", "https://www.fox.com", "Sports and TV"],
    //["Get Login Info", "getInfo.html", "Passwords and etc."]
]

function populateList() {
    for (let i = 0; i < apps.length; i++) {
        let temp = "";
        temp += '<a id="tile' + i + '" class="tileLink" href="' + apps[i][1] + '" target="_blank">';
        temp += '<div class="tile">';
        temp += '<img src="media/' + apps[i][0].toLowerCase() + '.png">';
        temp += '<h2 class="tileText tileTitle">' + apps[i][0] + '</h2>';
        temp += '<h3 class="tileText tileSubtitle">' + apps[i][2] + '</h3>';
        temp += '</div>';
        temp += '</a>';
        tileContainer.innerHTML += temp;
    }
}

populateList();

var selectedApp = 0;
document.addEventListener("keydown", function (e) {
    let k = e.key;
    if (k == "ArrowLeft" && selectedApp > 0)
        selectedApp--;
    else if (k == "ArrowRight" && selectedApp < apps.length - 1)
        selectedApp++;
    else if (k == "ArrowUp" && selectedApp >= 4)
        selectedApp -= 4;
    else if (k == "ArrowDown" && selectedApp < apps.length - 4)
        selectedApp += 4;
    selectApp();
});

function selectApp() {
    document.getElementById("tile" + selectedApp).focus();
}