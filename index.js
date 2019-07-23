const protocol = require('minecraft-protocol');
const express = require('express')
const app = express()

let tokens = []

app.get('/', (req, res) => {
    let token = req.query.token;
    if (token == undefined) {
        res.status(400).send("Missing token.");
        return
    }

    for (let t in tokens) {
        res.status(200).send(tokens[t])
        tokens.splice(tokens.indexOf(tokens[t]), 1)
        return
    }
    res.status(400).send("Invalid token.")
})

app.listen(80, () => console.log(`✅ Listening.`))

// Create a minecraft server for recieving connections
const server = protocol.createServer({
    'online-mode': true,  
    encryption: true, 
    host: '0.0.0.0',
    port: 25565, 
    motd: "§7Join to generate an authentication token.\n§7Powered by §a§lhttps://git.io/fjM2L§7.",
    maxPlayers: 0,
    playerCount: 0
});

// Run on an incoming connection
server.on('login', function (client) {
    // Generate a new token
    while (true) {
        let token = Math.floor(100000 + Math.random() * 900000)
        for (let i in tokens) {
            if (tokens[i]['token'] == token) continue
        }

        // Add token record and schedule deletion
        let record = {
            "token": token,
            "uuid": client.uuid,
            "username": client.username
        }
        tokens.push(record)

        setTimeout(() => {
            // Remove token from list
            tokens.splice(tokens.indexOf(record), 1)
        }, 10000)

        // Kick player with message
        client.write("kick_disconnect", {reason: `{"text": "§7Hey there, ${client.username}!\n§7Your code is §a§l${token}§7."}`})
        return
    }
});