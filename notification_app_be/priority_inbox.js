const { Log, initLogger } = require('../logging_middleware/index.js');
const API_URL = "http://4.224.186.213/evaluation-service/notifications";

const MY_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzUxMDczNy5kaXRAZHlwZHB1LmVkdS5pbiIsImV4cCI6MTc3OTEwMzkzMSwiaWF0IjoxNzc5MTAzMDMxLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNzFjYzgxNWMtNDBlNS00ZTZhLThjOGQtNzY4YzljZWNlZWU1IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoicHJhdGlrIGthZG5vciIsInN1YiI6IjE5M2FlY2ViLTA5ODEtNGI5ZS1hNjdmLTYyZTllNTlmNzA2NCJ9LCJlbWFpbCI6IjIzNTEwNzM3LmRpdEBkeXBkcHUuZWR1LmluIiwibmFtZSI6InByYXRpayBrYWRub3IiLCJyb2xsTm8iOiI3MjMwODc5M2oiLCJhY2Nlc3NDb2RlIjoiZnpFUVNRIiwiY2xpZW50SUQiOiIxOTNhZWNlYi0wOTgxLTRiOWUtYTY3Zi02MmU5ZTU5ZjcwNjQiLCJjbGllbnRTZWNyZXQiOiJYVEZSUmdybVNhc3hRTmJuIn0.zsNn0JcXQ_3FkfPizIqZY3EETDMdsR-EpYp8ehN-0Q4"; 
initLogger(MY_TOKEN);

const WEIGHTS = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
};

async function getPriorityInbox(n = 10) {
    try {
        await Log("backend", "info", "priority_inbox", "Fetching notifications for priority sorting");
        
        const response = await fetch(API_URL, {
            headers: { "Authorization": `Bearer ${MY_TOKEN}` }
        });
        
        if (!response.ok) throw new Error("Failed to fetch notifications");
        
        const data = await response.json();
        let notifications = data.notifications;

        notifications.sort((a, b) => {
            const weightA = WEIGHTS[a.Type] || 0;
            const weightB = WEIGHTS[b.Type] || 0;

            if (weightA !== weightB) {
                return weightB - weightA; 
            }

            const timeA = new Date(a.Timestamp).getTime();
            const timeB = new Date(b.Timestamp).getTime();
            return timeB - timeA;
        });

        const topNotifications = notifications.slice(0, n);
        
        console.log(`--- TOP ${n} PRIORITY INBOX ---`);
        console.log(JSON.stringify(topNotifications, null, 2));
        
        await Log("backend", "info", "priority_inbox", `Successfully generated top ${n} priority notifications`);

    } catch (error) {
        await Log("backend", "error", "priority_inbox", `Sorting failed: ${error.message}`);
        console.error(error);
    }
}

getPriorityInbox(10);