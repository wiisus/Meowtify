const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const { registerRoutes } = require("./routes");

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(express.static(path.join(__dirname, '..')));

const AUTH_PORT = 3000;
const MEOWTIFY_API_PORT = 3000;
registerRoutes(app);

app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log('Discord client is ready!');
});

client.login(config.BOT_TOKEN);

function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

app.post('/signup', async (req, res) => {
    const { username_hash } = req.body;

    if (!username_hash) {
        return res.status(400).json({ success: false, message: 'Username hash is required.' });
    }

    try {
        const channel = await client.channels.fetch(config.DATABASE_CHANNEL_ID);
        if (!channel) {
            return res.status(500).json({ success: false, message: 'Database channel not found.' });
        }

        const messages = await channel.messages.fetch({ limit: 100 });
        let userExists = false;
        messages.forEach(msg => {
            try {
                const userData = JSON.parse(msg.content);
                if (userData.username_hash === username_hash) {
                    userExists = true;
                }
            } catch (e) {}
        });

        if (userExists) {
            return res.status(409).json({ success: false, message: 'Username already exists.' });
        }

        const userId = crypto.randomUUID();
        const userData = {
            id: userId,
            username_hash: username_hash,
        };

        await channel.send(JSON.stringify(userData));
        res.json({ success: true, message: 'User signed up successfully.', userId: userId });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Internal server error during signup.' });
    }
});

app.post('/login', async (req, res) => {
    const { username_hash } = req.body;

    if (!username_hash) {
        return res.status(400).json({ success: false, message: 'Username hash is required.' });
    }

    try {
        const channel = await client.channels.fetch(config.DATABASE_CHANNEL_ID);
        if (!channel) {
            return res.status(500).json({ success: false, message: 'Database channel not found.' });
        }

        const messages = await channel.messages.fetch({ limit: 100 });
        let loggedIn = false;
        let foundUserId = null;

        messages.forEach(msg => {
            try {
                const userData = JSON.parse(msg.content);
                if (userData.username_hash === username_hash) {
                    loggedIn = true;
                    foundUserId = userData.id;
                }
            } catch (e) {}
        });

        if (loggedIn) {
            res.json({ success: true, message: 'Login successful.', userId: foundUserId });
        }

        else {
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error during login.' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(AUTH_PORT, "0.0.0.0", () => {
    console.log(`Combined backend serving on port ${AUTH_PORT}`);
});
