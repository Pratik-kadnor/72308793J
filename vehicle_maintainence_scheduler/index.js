const { Log, initLogger } = require('../logging_middleware/index.js'); 
const API_BASE = "http://4.224.186.213/evaluation-service";

// MUST REPLACE THIS STRING WITH YOUR TOKEN
const MY_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzUxMDczNy5kaXRAZHlwZHB1LmVkdS5pbiIsImV4cCI6MTc3OTEwMzE0MSwiaWF0IjoxNzc5MTAyMjQxLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMzgxNGQxOGUtM2E5Ni00ZTgxLWI3OTktY2YxZWM0ZjgxNzA4IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoicHJhdGlrIGthZG5vciIsInN1YiI6IjE5M2FlY2ViLTA5ODEtNGI5ZS1hNjdmLTYyZTllNTlmNzA2NCJ9LCJlbWFpbCI6IjIzNTEwNzM3LmRpdEBkeXBkcHUuZWR1LmluIiwibmFtZSI6InByYXRpayBrYWRub3IiLCJyb2xsTm8iOiI3MjMwODc5M2oiLCJhY2Nlc3NDb2RlIjoiZnpFUVNRIiwiY2xpZW50SUQiOiIxOTNhZWNlYi0wOTgxLTRiOWUtYTY3Zi02MmU5ZTU5ZjcwNjQiLCJjbGllbnRTZWNyZXQiOiJYVEZSUmdybVNhc3hRTmJuIn0.KeB9pAj7paId08NIqI0Jy8NR6LeC5p6K3pbbkBtsQ4U"; 
initLogger(MY_TOKEN);

async function fetchAPI(endpoint) {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
        headers: { "Authorization": `Bearer ${MY_TOKEN}` }
    });
    if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return response.json();
}

function maximizeImpact(capacity, tasks) {
    const n = tasks.length;
    const dp = Array(capacity + 1).fill(0);

    for (let i = 0; i < n; i++) {
        const duration = tasks[i].Duration;
        const impact = tasks[i].Impact;
        for (let w = capacity; w >= duration; w--) {
            dp[w] = Math.max(dp[w], dp[w - duration] + impact);
        }
    }
    return dp[capacity];
}

async function runScheduler() {
    try {
        await Log("backend", "info", "scheduler", "Fetching depots and vehicles data");
        const depotData = await fetchAPI("depots");
        const vehicleData = await fetchAPI("vehicles");

        const results = depotData.depots.map(depot => {
            const maxScore = maximizeImpact(depot.MechanicHours, vehicleData.vehicles);
            return {
                depotID: depot.ID,
                mechanicHours: depot.MechanicHours,
                maxImpactScore: maxScore
            };
        });

        console.log("--- SCHEDULING RESULTS ---");
        console.log(JSON.stringify(results, null, 2));
        await Log("backend", "info", "scheduler", "Successfully calculated max impact");

    } catch (error) {
        await Log("backend", "error", "scheduler", `Error computing schedule: ${error.message}`);
        console.error(error);
    }
}

runScheduler();