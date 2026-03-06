const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock Database for history
let scanHistory = [];

// Helper: Heuristic Analysis Logic
function analyzeUrl(inputUrl) {
    let riskScore = 0;
    const threats = [];
    const lowerUrl = inputUrl.toLowerCase();

    // 1. Check for suspicious patterns (Moved from frontend mock to backend)
    const suspiciousPatterns = [
        { pattern: /eval\(|base64|atob|fromcharcode/i, threat: 'Obfuscated code detected', score: 30 },
        { pattern: /\.exe|\.scr|\.bat|\.cmd/i, threat: 'Executable file in URL', score: 40 },
        { pattern: /login|signin|account|verify|secure|update/i, threat: 'Potential phishing keywords', score: 20 },
        { pattern: /paypal|amazon|bank|credit/i, threat: 'Financial institution mimicry', score: 35 },
        { pattern: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i, threat: 'IP address instead of domain', score: 25 },
        { pattern: /ngrok\.io|serveo\.net|localtunnel\.me/i, threat: 'Tunneling service detected', score: 60 }
    ];

    suspiciousPatterns.forEach(({ pattern, threat, score }) => {
        if (pattern.test(lowerUrl)) {
            riskScore += score;
            threats.push(threat);
        }
    });

    // 2. Typosquatting Check
    const commonDomains = ['google', 'facebook', 'amazon', 'paypal', 'microsoft', 'instagram', 'twitter', 'tiktok'];
    commonDomains.forEach(domain => {
        // Simple regex to catch replacements like 'google' -> 'goog1e' or 'g0ogle'
        // This is a basic implementation.
        if ((lowerUrl.includes(domain + '1') || lowerUrl.includes(domain + '0') ||
            lowerUrl.includes(domain.replace('o', '0')) || lowerUrl.includes(domain.replace('l', '1'))) && !lowerUrl.includes(domain + '.com')) {
             
             // Only flag if it's not the official domain (basic check, could be improved)
             // For safety, let's just use the logic we had:
             riskScore += 50;
             threats.push(`Typosquatting attempt mimicking: ${domain}`);
        }
    });

    // 3. Length check
    if (inputUrl.length > 70) {
        riskScore += 10;
        threats.push('Unusually long URL');
    }

    // Determine Status
    riskScore = Math.min(riskScore, 100);
    let status = 'SAFE';
    if (riskScore >= 80) status = 'DANGEROUS';
    else if (riskScore > 0) status = 'WARNING';

    return {
        url: inputUrl,
        riskScore,
        threats,
        status,
        scanTime: new Date().toISOString()
    };
}

// Routes

// 1. Quick Scan Endpoint
app.post('/api/scan', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Simulate processing time
    setTimeout(() => {
        const result = analyzeUrl(url);
        scanHistory.push(result);
        res.json(result);
    }, 1500);
});

// 2. Deep Scan Endpoint (Simulates deeper analysis)
app.post('/api/deep-scan', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Simulate longer processing for "Deep Scan"
    setTimeout(() => {
        const result = analyzeUrl(url);
        
        // Add random "Deep Scan" findings for demonstration if it was clean but we want to show deep capabilities
        // Or if it's already bad, add more details.
        // For this demo, let's just return the same result but with a flag.
        result.deepScan = true;
        result.networkRequests = Math.floor(Math.random() * 20) + 5;
        result.screenshot = true; // Flag to tell frontend we "took" a screenshot
        
        res.json(result);
    }, 4000);
});

// 3. Contact Form Endpoint
app.post('/api/contact', (req, res) => {
    const { fullName, email, phone, message } = req.body;
    console.log('New Contact Message:', { fullName, email, phone, message });
    
    // Simulate email sending delay
    setTimeout(() => {
        res.json({ success: true, message: 'Message sent successfully' });
    }, 1000);
});

// 4. Payment Endpoint
app.post('/api/payment', (req, res) => {
    const { payerName, payerEmail, paymentMethod, amount } = req.body;
    console.log('Payment Processing:', { payerName, payerEmail, paymentMethod, amount });

    // Simulate payment gateway delay
    setTimeout(() => {
       res.json({ 
           success: true, 
           transactionId: 'TXN-' + Math.floor(Math.random() * 1000000),
           timestamp: new Date().toISOString()
       });
    }, 2000);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
    console.log('Ready to process requests...');
});
