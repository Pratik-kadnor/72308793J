// notification_app_be/index.js

const express = require('express');
// Import the middleware from the adjacent folder
const { Log, initLogger } = require('../logging_middleware'); 

const app = express();
const PORT = 3000;

// Initialize your logger with the token (Consider moving this to a .env file later)
const MY_ACCESS_TOKEN = "paste_your_access_token_here";
initLogger(MY_ACCESS_TOKEN);

app.use(express.json());

// Example Endpoint 1: Successful operation log
app.post('/api/notifications', async (req, res) => {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
        // Logging a bad request
        await Log("backend", "warn", "handler", "Received notification request with missing payload data");
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Logic to save notification to DB would go here...
    
    await Log("backend", "info", "handler", `Notification successfully queued for user ${userId}`);
    res.status(201).json({ status: "success", message: "Notification sent." });
});

// Example Endpoint 2: Simulated Fatal Error log
app.get('/api/simulate-crash', async (req, res) => {
    try {
        throw new Error("Connection Timeout");
    } catch (error) {
        await Log("backend", "fatal", "db", "Critical database connection failure during data retrieval.");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, async () => {
    console.log(`Notification Backend running on port ${PORT}`);
    // Log the server startup event
    await Log("backend", "info", "server", `Express server initialized and listening on port ${PORT}`);
});