var gamesTiles = document.getElementsByClassName("gameTile");
for (let i = 0; i < gamesTiles.length; i++) {
    gamesTiles[i].addEventListener("click", function (event) {
        selectGame(event.target.id);
    });
}

const gameList = document.getElementById("gameList");
const itemList = document.getElementById("itemList");
var game = null;

function selectGame(gameId) {
    fetch('games/' + gameId + '.json')
        .then(response => response.text())
        .then(data => {
            game = JSON.parse(data);
            toggleElement("gameList");
            loadItems();
            toggleElement("itemList");
            console.log(getRecipe("netherite_block"));
        })
        .catch(err => {
            //console.clear();
            console.log(err)
            //console.error("Error: Cannot Access Games");
            //alert("NOTICE: Crafting Tool is meant to be run on an online website. It will now run in offline mode");
            //offlineStart();
        });
}
selectGame("minecraft");

function loadItems() {
    let itemsArr = Object.values(game.items);
    for (let i = 0; i < itemsArr.length; i++) {
        itemList.innerHTML += "<li id='" + itemsArr[i].name + "'>" + itemsArr[i].name + "</li>";
        document.getElementById(itemsArr[i].name).addEventListener("click", function (event) {
            console.log(getRecipe(event.target.id));
        });
    }
}

let currentRecipe = [];
function getRecipe(itemName) {
    try {
        let recipe = game.items[itemName].recipe;
        let recipeItemsArr = Object.values(recipe)
        if (recipe == null)
            return itemName;
        for (let i = 0; i < recipeItemsArr.length; i++) {
            if (recipeItemsArr[i].recipe != null)
                currentRecipe.push(getRecipe(recipeItemsArr.name));
            else
                currentRecipe.push(itemName);
        }
        console.log(currentRecipe)
    }
    catch {
        return "none";
    }
}

function toggleElement(elementId) {
    let elem = document.getElementById(elementId);
    if (elem.style.display == "none")
        elem.style.display = "inline";
    else
        elem.style.display = "none";
}