// Rat Lab Studio 2023 - https://ratlabstudio.com

/*  Project Summary:
    The idea here is to allow two or more users to 
    play a game together over the internet via the 
    Rat Lab Studio Chat client. This will be achieved 
    by choosing data to share, and sending it back and 
    forth between clients like a message. The end result 
    will hopefully be something like Game Pigeon for iOS.
*/

class ratCom {
    constructor() {
        this.comDataObj = {}; // Data Storage
        this.refreshRate = 1000; // How long in msec between data updates
    }

    // Returns the data as an object
    getData() {
        return this.comDataObj;
    }

    // Returns the data as a sendable string (item:cheese|count:1)
    getDataKey() {
        let str = "";
        for (let obj in this.comDataObj)
            str += `${obj}:${this.comDataObj[obj]}|`;
        return str.substring(0, str.length - 1);
    }

    // Loads data from an object
    loadData(data) {
        this.comDataObj = data;
    }

    // Loads data from the string format ({item: 'cheese', count: '1'})
    loadDataFromKey(dataKey) {
        this.comDataObj = {};
        let entries = dataKey.split("|");
        for (let e in entries) {
            let attribute = entries[e].split(":")[0];
            let value = entries[e].split(":")[1];
            this.comDataObj[attribute] = value;
        }
    }
}

// Testing:

let rc = new ratCom();

rc.loadData({
    item: "cheese",
    count: 1
});

console.log(rc.getDataKey());