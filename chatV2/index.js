const { readFile, readFileSync } = require('fs');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '1728',
    database: 'chat'
}).promise();

app.get("/", (request, response) => {
    readFile('home.html', 'utf8', (err, html) => {
        if (err)
            response.status(500).send('Sorry, we couldn\'t find that page');
        response.send(html);
    });
});

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

app.get("/getUser/:id", async (request, response) => {
    let [[user]] = await pool.query(`
    SELECT * FROM users 
    WHERE id = ?;
    `, request.params.id);
    response.send(user);
});

app.get("/getAllMessagesFromServer/:id", async (request, response) => {
    let [messages] = await pool.query(`
    SELECT * FROM messages 
    WHERE server_id = ?;
    `, request.params.id);
    response.send(messages);
});

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

app.post("/sendMessage/:server_id/:message/:user_id", async (request, response) => {
    let message = request.params.message;
    for (let i = 0; i < textFixes.length; i++)
        message = message.replaceAll(textFixes[i][1], textFixes[i][0]);
    await pool.query(`
    INSERT INTO messages (content, sender_id, server_id) 
    VALUES (?, ?, ?);
    `, [message, request.params.user_id, request.params.server_id]);
});

app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));