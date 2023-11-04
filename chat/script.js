const messagesContainer = document.getElementById("messages");
const input = document.getElementById("textInput");

let messages = [];

let session = {
    user: {
        userId: "matteo",
        nickname: "Matteo Salverio",
        password: "",
        profilePicture: "http://ratlabstudio.com/wp-content/uploads/2023/07/favicon.png"
    }
}

function getDateString() {
    let date = new Date();
    let hours = date.getHours();

    // Convert to 12-hour clock:
    let suffix = "PM";
    hours -= 12;
    if (hours < 1) {
        hours += 12;
        suffix = "AM";
    }
    if (hours == 12) { // Fixes suffix for both 12:00 times
        if (suffix == "AM")
            suffix = "PM";
        else
            suffix = "AM";
    }

    let minutes = date.getMinutes();
    if (minutes.toString().length < 2)
        minutes = "0" + minutes; // Adds the 0 before single digit minutes
    let month = date.getMonth();
    let day = date.getDate()
    let year = (date.getFullYear() + "").substring(2);
    return `${month}/${day}/${year} ${hours}:${minutes} ${suffix}`;
}

function displayMessage(message, user) {
    if (messages.length > 0 && user.userId == messages[messages.length - 1].senderId) {
        //messages[messages.length - 1].element.innerHTML += "<br><br>" + convertToMarkdown(message);
        messagesContainer.innerHTML += `
        <div class="chat subchat" id="message${messages.length}">
            <div style="margin-bottom: 10px;">
                <span class="miniName">${user.nickname}</span>
                <span class="miniTime">${getDateString()}</span>
            </div>
            <br>
            ${convertToMarkdown(message)}
        </div>`;
        messages.push({
            senderId: user.userId,
            element: document.getElementById(`message${messages.length}`)
        });
    }
    else {
        messagesContainer.innerHTML += `
        <div class="chat" id="message${messages.length}">
            <div class="senderInfo">
                <img class="senderPicture" src="${user.profilePicture}">
                <span class="senderText">${user.nickname}</span>
                <span class="sendTime">${getDateString()}</span>
            </div>
            <br>
            ${convertToMarkdown(message)}
        </div>`;
    }
    messages.push({
        senderId: user.userId,
        element: document.getElementById(`message${messages.length}`)
    });
}

function log(text) {
    messagesContainer.innerHTML += `
    <div class="chat log">
        <div class="senderInfo">
            <img class="senderPicture" src="http://ratlabstudio.com/wp-content/uploads/2023/07/favicon.png">
            <span class="senderText">Studio Console</span>
            <span class="sendTime">${getDateString()}</span>
        </div>
        <br>
        ${convertToMarkdown(text)}
    </div>`;
}

function error(text) {
    messagesContainer.innerHTML += `
    <div class="chat error">
        <div class="senderInfo">
            <img class="senderPicture" src="http://ratlabstudio.com/wp-content/uploads/2023/07/favicon.png">
            <span class="senderText">Studio Console</span>
            <span class="sendTime">${getDateString()}</span>
        </div>
        <br>
        <span style="color: rgb(255, 128, 128);">An error occurred:</span>
        <br><br>
        ${text}
    </div>`;
}

let keys = [];
input.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
    if (e.key == "Enter" && keys[16])
        input.value += "<br>";
    else if (e.key == "Enter") {
        e.preventDefault(); // Ensures the textarea will not have an extra blank line after hitting Enter
        testMessage();
    }
});
input.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});
function testMessage() {
    if (input.value.length <= 0)
        return;
    displayMessage(input.value, session.user);
    input.value = "";
}

window.onerror = function (e, url, line) {
    error(e);
}

function login() {

}

/*log("App running in *front-end alpha mode*");
displayMessage("##The *quick* brown fox *jumped* over the **lazy dog**.<br><br>According to ***all known laws of aviation***, there is no way a *bee* should be able to **fly**.", session.user);
displayMessage("###Welcome to the Rat Lab Studio!<br>This is a test for an upcoming Rat Lab project, which hasn't been named yet. It will be a cool chat app that allows you to use your own servers to chat with friends!", session.user);*/