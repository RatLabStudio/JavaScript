const { readFile, readFileSync } = require('fs');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const mysql = require('mysql2');

// Local Server
/*const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '1728',
    database: 'chat'
}).promise();*/

// Global Server Hosted on Hostinger:
const pool = mysql.createPool({
    host: '154.56.47.52',
    user: 'u970664113_chat',
    password: 'RatLabChat1',
    database: 'u970664113_chatServer1'
}).promise();

// Returns the home page
app.get("/", (request, response) => {
    readFile('home.html', 'utf8', (err, html) => {
        if (err)
            response.status(500).send('Sorry, we couldn\'t find that page');
        response.send(html);
    });
});

// Returns a user given the correct username and password
app.get("/login/:username/:password", async (request, response) => {
    let username = request.params.username;
    let password = request.params.password;
    let [[user]] = await pool.query(`
    SELECT * FROM users 
    WHERE username = ? 
    AND password = ?;
    `, [username, password]);
    response.send(user);
});

// Gets a list of all users
app.get("/getAllUsers", async (request, response) => {
    let [users] = await pool.query(`
    SELECT * FROM users;
    `);
    response.send(users);
});

// Gets a specific user given it's ID
app.get("/getUser/:id", async (request, response) => {
    let [[user]] = await pool.query(`
    SELECT * FROM users 
    WHERE id = ?;
    `, request.params.id);
    response.send(user);
});

// Gets a list of all servers
app.get("/getAllServers", async (request, response) => {
    let [servers] = await pool.query(`
    SELECT * FROM servers;
    `);
    response.send(servers);
});

// Gets all messages from a given server
app.get("/getAllMessagesFromServer/:id", async (request, response) => {
    let [messages] = await pool.query(`
    SELECT * FROM messages 
    WHERE server_id = ?;
    `, request.params.id);
    response.send(messages);
});

// Gets all messages from a given server starting with a certain ID
app.get("/getMessagesFromServerStartingWithId/:server_id/:id", async (request, response) => {
    let [messages] = await pool.query(`
    SELECT * FROM messages 
    WHERE id >= ?
    AND server_id = ?;
    `, [request.params.id, request.params.server_id]);
    response.send(messages);
});

// Converts translated characters back to their original
// These are needed because some characters create issues when being sent to the server
let textFixes = [
    ["#", "~hashtag~"],
    ["'", "~apostrophe~"],
    ["?", "~questionMark~"],
    ["<", "~leftAngleBracket~"],
    [">", "~rightAngleBracket~"],
    ['"', "~doubleQuotes~"],
    ["&", "~ampersand~"],
    ["%", "~percent~"],
    ["/", "~slash~"],
    [".", "~period~"],
    ["$", "~dollarSign~"],
    ["@", "~atSign~"]
];

// Sends a provided message to the server
app.post("/sendMessage/:server_id/:message/:user_id/:date", async (request, response) => {
    let message = request.params.message;
    let date = request.params.date;
    for (let i = 0; i < textFixes.length; i++)
        message = message.replaceAll(textFixes[i][1], textFixes[i][0]);
    await pool.query(`
    INSERT INTO messages (content, sender_id, server_id, date) 
    VALUES (?, ?, ?, ?);
    `, [message, request.params.user_id, request.params.server_id, date]);
});

app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));