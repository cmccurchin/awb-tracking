// Install dependencies: npm install express axios dotenv

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Airline tracking URLs
const airlineTrackingURLs = {
    '001': { name: 'American Airlines', baseUrl: 'https://www.aacargo.com/tracking?awb=' },
    '006': { name: 'Delta Airlines', baseUrl: 'https://www.delta.com/track?awb=' },
    '016': { name: 'United Airlines', baseUrl: 'https://www.unitedcargo.com/tracking?awb=' },
    '084': { name: 'Emirates', baseUrl: 'https://www.skycargo.com/tracking?awb=' }
};

// Extract IATA prefix
function getIATAPrefix(awbNumber) {
    return awbNumber.slice(0, 3);
}

// Endpoint to track and redirect with pre-filled form
app.get('/track/:awbNumber', (req, res) => {
    const { awbNumber } = req.params;

    if (!awbNumber || awbNumber.length < 3) {
        return res.status(400).send('Invalid AWB number.');
    }

    const iataPrefix = getIATAPrefix(awbNumber);
    const airline = airlineTrackingURLs[iataPrefix];

    if (!airline) {
        return res.status(404).send('No tracking information found for this AWB prefix.');
    }

    const trackingURL = airline.baseUrl;

    // Redirect user to airline tracking page with AWB pre-filled in form
    res.send(`
        <html>
        <head>
            <title>Redirecting to ${airline.name} Tracking</title>
            <script>
                window.onload = function() {
                    // Automatically submit the form with the AWB number
                    document.getElementById('awbForm').submit();
                };
            </script>
        </head>
        <body>
            <h1>Redirecting to ${airline.name} Tracking...</h1>
            <form id="awbForm" action="${trackingURL}" method="get">
                <input type="hidden" name="awb" value="${awbNumber}" />
                <noscript>
                    <p>JavaScript is required to automatically redirect. Please click the button below:</p>
                    <button type="submit">Go to ${airline.name} Tracking</button>
                </noscript>
            </form>
        </body>
        </html>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`AWB tracking API running on http://localhost:${PORT}`);
});
