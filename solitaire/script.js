let suits = {
    clubs: {
        name: "Clubs",
        color: "black"
    },
    spades: {
        name: "Spades",
        color: "black"
    },
    diamonds: {
        name: "Diamonds",
        color: "red"
    },
    hearts: {
        name: "Hearts",
        color: "red"
    }
}

const cardContainer = document.getElementById("cardContainer");

let specialValues = ['K', 'Q', 'J', 'A'];

let isDown = false;
let heldCard = null;
let currentZ = 1;

function updateCards() {
    let cards = document.getElementsByClassName("card");
    for (let i = 0; i < cards.length; i++) {
        let card = document.getElementById("card" + i);
        card.addEventListener('mousedown', function (e) {
            let card = e.target
            // This code ensures that you grab the card, not its contents:
            if (!card.id.includes("card")) {
                for (let j = 0; j < 10; j++) {
                    card = card.parentElement;
                    if (card.id.includes("card"))
                        break;
                }
            }
            isDown = true;
            offset = [
                card.offsetLeft - e.clientX,
                card.offsetTop - e.clientY
            ];
            heldCard = card;
            heldCard.style.zIndex = currentZ++;
        }, true);

        document.addEventListener('mouseup', function () {
            isDown = false;
            heldCard = null;
        }, true);

        document.addEventListener('mousemove', function (event) {
            event.preventDefault();
            if (isDown) {
                mousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
                heldCard.style.left = (mousePosition.x + offset[0]) + 'px';
                heldCard.style.top = (mousePosition.y + offset[1]) + 'px';
            }
        }, true);
    }
}

class card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
        this.flipped = false;

        let special = false;
        if (specialValues.includes(value))
            special = true;
        let icon = `assets/media/suits/${suit.name.toLowerCase()}.png`;
        let currentCardIndex = document.getElementsByClassName("card").length
        let card = `
        <div id="card${currentCardIndex}" class="card" style="color: ${suit.color};">
            <img id="back${currentCardIndex}" class="back" src="assets/media/back.png"; style="opacity: 0;">
            <div id="content${currentCardIndex}">
                <div class="cardCorner" style="left: 1.5vh; top: 1vh;">
                    <p>${value}</p>
                    <!--<img src="${icon}">-->
                </div>
                <img class="cardCenter" src="${icon}">
                <div class="cardCorner" style="right: 1.5vh; bottom: 1vh; rotate: 180deg;">
                    <p>${value}</p>
                    <!--<img src="${icon}">-->
                </div>
            </div>
        </div>
        `;
        cardContainer.innerHTML += card;
        this.element = document.getElementById(`card${currentCardIndex}`);
        updateCards();
    }

    flip() {
        if (this.flipped) { // Unflip
            this.flipped = false;
            this.element.classList.remove("flipped");
            this.element.classList.add("unflipped");
            document.getElementById(`back${this.element.id.replace("card", "")}`).classList.remove("flippedBack");
            document.getElementById(`content${this.element.id.replace("card", "")}`).classList.remove("unflippedBack");
            document.getElementById(`back${this.element.id.replace("card", "")}`).classList.add("unflippedBack");
            document.getElementById(`content${this.element.id.replace("card", "")}`).classList.add("flippedBack");
        }
        else { // Flip
            this.flipped = true;
            this.element.classList.remove("unflipped");
            this.element.classList.add("flipped");
            document.getElementById(`back${this.element.id.replace("card", "")}`).classList.remove("unflippedBack");
            document.getElementById(`content${this.element.id.replace("card", "")}`).classList.remove("flippedBack");
            document.getElementById(`back${this.element.id.replace("card", "")}`).classList.add("flippedBack");
            document.getElementById(`content${this.element.id.replace("card", "")}`).classList.add("unflippedBack");
        }
    }
}

let stacks = [];
class stack {
    constructor() {
        this.index = stacks.length;
        this.cards = [];
        this.bounds = {
            left: cardWidth * 1.5 * (this.index + 1),
            right: (cardWidth * 1.5 * (this.index + 1)) + cardWidth,
        }
        cardContainer.innerHTML += `<div class="blankCardSpace" style="left: ${cardWidth * 1.5 * (this.index + 1)}px;"></div>`;
        stacks.push(this);
    }
}

var root = document.querySelector(':root');
let cardWidth = window.innerWidth / 13;
let cardHeight = cardWidth * 1.42857143;
root.style.setProperty('--cardWidth', cardWidth + "px");
root.style.setProperty('--cardHeight', cardHeight + "px");

for (let i = 0; i < 7; i++)
    new stack();
let c = new card(2, suits.hearts);
c.flip();