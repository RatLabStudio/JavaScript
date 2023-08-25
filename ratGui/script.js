const desktop = document.getElementById("desktop");
const taskbar = document.getElementById("taskBar");
const date = document.getElementById("date");
const time = document.getElementById("time");
const windows = document.getElementById("windows");

var highestZ = 0;

var icons = ["settings", "browser", "notes", "terminal"];

function fillIcons() {
    let grids = document.getElementsByClassName("iconGrid");
    let taskBarIcons = document.getElementById("taskBarIcons");
    for (let j = 0; j < icons.length; j++) {
        let iconElem = '<img class="icon" src="assets/icons/' + icons[j] + '.png" onclick="' + "openWindow('" + icons[j] + "')" + '">';
        for (let i = 0; i < grids.length; i++)
            grids[i].innerHTML += iconElem;
        taskBarIcons.innerHTML += iconElem;
    }
}
fillIcons();

function toggleElement(id) { // Makes visibility of an element the opposite of whatever it is
    if (document.getElementById(id).style.display == "none")
        document.getElementById(id).style.display = "inline";
    else
        document.getElementById(id).style.display = "none";
}

function setElementState(id, state) { // Sets the visibility of an element to a specific state
    if (state == true)
        document.getElementById(id).style.display = "inline";
    else
        document.getElementById(id).style.display = "none";
}

function updateTime() { // Sets the time display in the taskbar
    let newDate = new Date();
    date.innerHTML = (newDate.getMonth() + 1) + "/" + newDate.getDate() + "/" + (newDate.getFullYear() + "").substring(2, 4);
    let min = newDate.getMinutes();
    if ((min + "").length < 2)
        min = "0" + min;
    let h = newDate.getHours() + 12;
    let p = "AM";
    if (h > 12) {
        h -= 12;
        p = "PM";
    }

    time.innerHTML = h + ":" + min + " " + p;
}

function openWindow(id) {
    if (document.getElementById(id) != null) {
        let w = document.getElementById(id);
        if (w.style.zIndex < highestZ) {
            highestZ++;
            w.style.zIndex = highestZ;
        }
        else {
            toggleElement(id);
        }
        return;
    }
    highestZ++;
    openTasks.push(id);
    let temp = "";
    temp += "<div class='window' id='" + id + "' style='display: inline; z-index: " + highestZ + ";'>";
    temp += '<div class="controls" id="' + id + '_controls"' + '>';
    temp += '<div class="controlBtns">';
    temp += '<button class="controlsBtn closeBtn" onclick="' + "closeWindow('" + id + "')" + '">X</button>';
    temp += '<button class="controlsBtn minMaxBtn" onclick="' + "maximizeWindow('" + id + "')" + '">~</button>';
    temp += '</div></div>';
    if (id == "terminal")
        temp += '<iframe class="windowFrame" src="https://matteosalverio.github.io/ratlab/projects/vcpu" width="100%" height="100%"></iframe>';
    else
        temp += '<iframe class="windowFrame" src="apps/' + id + '.html" width="100%" height="100%"></iframe>';
    windows.innerHTML += temp;
    setElementState("startMenu", false);
}

function minimizeWindow(id) {
    let elem = document.getElementById(id);
    elem.style.display = 'none';
}

function closeWindow(id) {
    windows.removeChild(document.getElementById(id));
    let index = 0;
    for (let i = 0; i < openTasks.length; i++) {
        if (openTasks[i] == id) {
            index = i;
            break;
        }
    }
    openTasks.splice(index, 1);
}

function maximizeWindow(id) {
    let elem = document.getElementById(id);
    if (elem.style.width != "100%") {
        elem.style.margin = "0px";

        elem.style.width = "100%"; // Sets window to full screen width
        elem.style.height = (desktop.clientHeight - taskbar.clientHeight - 30) + "px"; // Sets window to full screen height minus the height of the taskbar

        elem.style.transform = "translate(-50%, 0px)"; // Moves the window translation to the top of the screen
        elem.style.top = "0px"; // Moves the window position to the top of the screen

        elem.style.borderRadius = "0px"; // Removes window border curves
        elem.firstChild.style.borderRadius = "0px"; // Removes control border curves
        elem.lastChild.style.borderRadius = "0px"; // Removes iFrame border curves

        elem.firstChild.style.backgroundColor = "rgba(0, 0, 0, 1)"; // Sets the controls to not be translucent
    }
    else {
        elem.style.width = "70%";
        elem.style.height = "70%";

        elem.style.transform = "translate(-50%, -50%)";
        elem.style.top = "45%";

        elem.style.borderRadius = "15px";
        elem.firstChild.style.borderRadius = "15px 15px 0px 0px";
        elem.lastChild.style.borderRadius = "0px 0px 15px 15px";

        elem.firstChild.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    }
}

const tasksTable = document.getElementById("taskViewTable");
var openTasks = [];

function updateTasks() {
    tasksTable.innerHTML = "<tr><th>Task Name</th><th>Show</th><th>Close</th></tr>";
    for (let i = 0; i < openTasks.length; i++) {
        let temp = "";
        temp += "<tr>";
        temp += "<td id='" + openTasks[i] + "Task' style='background-color: rgba(255, 255, 255, 0.2);'>" + openTasks[i] + "</td>";
        temp += "<td class='taskButton' id='" + openTasks[i] + "Show' style='background-color: rgba(0, 255, 150, 0.2);' onclick='" + 'toggleElement("' + openTasks[i] + '")' + "'>[ ]</td>";
        temp += "<td class='taskButton' id='" + openTasks[i] + "Close' style='background-color: rgba(255, 50, 50, 0.2);' onclick='" + 'closeWindow("' + openTasks[i] + '")' + "'>X</td>";
        temp += "</tr>";
        tasksTable.innerHTML += temp;
    }
}

desktop.addEventListener("click", function () {
    setElementState("startMenu", false);
});

setInterval(() => { // Updates every millisecond
    updateTime();
}, 1);

setInterval(() => { // Updates every half second
    updateTasks();
}, 500);

setInterval(() => { // Updates every two seconds
    // Implement a method that updates settings based on data.json
}, 2000);