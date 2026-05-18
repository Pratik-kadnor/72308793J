const TEST_SERVER_URL = "http://4.224.186.213/evaluation-service/logs";

class Logger {
    constructor() {
        this.token = "";
    }

    initToken(authToken) {
        this.token = authToken;
    }

    async Log(stack, level, pkg, message) {
        const validStacks = ["backend", "frontend"];
        const validLevels = ["debug", "info", "warn", "error", "fatal"];

        const formattedStack = stack.toLowerCase();
        const formattedLevel = level.toLowerCase();
        const formattedPkg = pkg.toLowerCase();

        if (!validStacks.includes(formattedStack) || !validLevels.includes(formattedLevel)) {
            console.error("Logger Warning: Invalid stack or level provided.");
            return;
        }

        try {
            const response = await fetch(TEST_SERVER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    stack: formattedStack,
                    level: formattedLevel,
                    package: formattedPkg,
                    message: message
                })
            });

            if (!response.ok) {
                console.error("Logger Failed to reach test server. Status:", response.status);
            }
        } catch (error) {
            console.error("Logger Network Error:", error.message);
        }
    }
}

const loggerInstance = new Logger();

module.exports = {
    initLogger: (token) => loggerInstance.initToken(token),
    Log: (stack, level, pkg, message) => loggerInstance.Log(stack, level, pkg, message)
};