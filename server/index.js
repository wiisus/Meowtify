const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const cors = require('cors'); // Ensure cors is imported
const path = require('path'); // Add this line

const { registerRoutes } = require("./routes"); // Import registerRoutes

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // For parsing application/x-www-form-urlencoded
app.use(cors()); // Enable CORS for all routes

// Serve static files from the project root directory
app.use(express.static(path.join(__dirname, '..')));

const AUTH_PORT = 3000; // Port for authentication
const MEOWTIFY_API_PORT = 3000; // Meowtify API will also run on this port

// Meowtify API routes (from routes.js)
// Register Meowtify API routes
registerRoutes(app);

// Catch-all route to serve index.html for any other request

// Error handling middleware for Meowtify API
app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
});

app.listen(AUTH_PORT, "0.0.0.0", () => {
    console.log(`Combined backend serving on port ${AUTH_PORT}`);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Discord Client for Auth
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


// Simple SHA256 hashing function
function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

// Endpoint for user signup
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
            } catch (e) {
                // Ignore non-JSON messages
            }
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

// Endpoint for user login
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
            } catch (e) {
                // Ignore non-JSON messages
            }
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

// This part will be executed after Discord client is ready


