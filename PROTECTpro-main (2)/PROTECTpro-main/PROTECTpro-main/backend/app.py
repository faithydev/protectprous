from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import time
import datetime
import random
import os

app = Flask(__name__)
CORS(app)

# In-memory storage for demo purposes (would be Redis/DB in real prod)
users_db = {}  # { userId: { plan: 'free', last_scan: date, scans_today: 0, apks_week: 0, last_apk_reset: date } }

PLANS = {
    'free': {'link_daily': 3, 'apk_weekly': 1},
    'monthly': {'link_daily': 15, 'apk_weekly': 5},
    'yearly': {'link_daily': float('inf'), 'apk_weekly': 20}
}

def get_user_data(user_id):
    if user_id not in users_db:
        users_db[user_id] = {
            'plan': 'free',
            'scans_today': 0,
            'last_scan_date': datetime.date.today().isoformat(),
            'apks_week': 0,
            'last_apk_reset': datetime.date.today().isoformat()
        }
    return users_db[user_id]

def check_rate_limit(user_id, type='link'):
    user = get_user_data(user_id)
    plan = PLANS[user['plan']]
    today = datetime.date.today().isoformat()
    
    # Reset Link Counter Daily
    if user['last_scan_date'] != today:
        user['scans_today'] = 0
        user['last_scan_date'] = today
        
    # Reset APK Counter Weekly (Approximate)
    last_reset = datetime.date.fromisoformat(user['last_apk_reset'])
    if (datetime.date.today() - last_reset).days >= 7:
        user['apks_week'] = 0
        user['last_apk_reset'] = today

    if type == 'link':
        limit = plan['link_daily']
        if user['scans_today'] >= limit:
            return False, f"Daily link limit reached ({limit}). Upgrade plan for more."
        user['scans_today'] += 1
        
    elif type == 'apk':
        limit = plan['apk_weekly']
        if user['apks_week'] >= limit:
            return False, f"Weekly APK limit reached ({limit}). Upgrade plan for more."
        user['apks_week'] += 1
        
    return True, "Allowed"

def analyze_url_deep(input_url):
    risk_score = 0
    threats = []
    lower_url = input_url.lower()

    # 1. Advanced Heuristics
    patterns = [
        (r't\.me\/.*bot', 'Telegram Bot Link (Potential Spam/Scam)', 30),
        (r'api\.telegram\.org', 'Telegram API call (Potential Exfiltration)', 50),
        (r'ngrok|serveo|localtunnel', 'Tunneling Service (Hides server location)', 70),
        (r'ipfs\.', 'IPFS Gateway (Often used for phishing)', 40),
        (r'discord\.com\/api\/webhooks', 'Discord Webhook (Data Exfiltration)', 80),
        (r'google\.com\/amp\/s\/', 'Google AMP redirect abuse', 20),
        (r'firebaseapp\.com', 'Firebase Hosting (Common for phishing)', 20),
        (r'herokuapp\.com', 'Heroku App (Common for phishing)', 20),
        (r'000webhostapp', 'Free Hosting (High abuse rate)', 40),
        (r'duckdns\.org', 'Dynamic DNS (High abuse rate)', 30),
        (r'\.xyz$|\.top$|\.gq$|\.cf$|\.ml$', 'Suspicious TLD (Cheap/Free domains)', 20),
        (r'login.*bank', 'Bank Login Pattern', 40),
        (r'verify.*account', 'Account Verification Pattern', 30),
        (r'script|javascript:|vbscript:', 'Inline Script Injection', 60),
        (r'<script>', 'XSS Vector', 70)
    ]

    for pattern, warning, score in patterns:
        if re.search(pattern, lower_url):
            risk_score += score
            threats.append(warning)

    # 2. Typosquatting
    common_domains = ['google', 'facebook', 'instagram', 'telegram', 'paypal', 'binance', 'coinbase']
    for domain in common_domains:
        stripped_domain = domain.replace('o', '0').replace('l', '1').replace('i', '1').replace('a', '@')
        if (stripped_domain in lower_url and domain not in lower_url):
             risk_score += 50
             threats.append(f"Impersonating {domain}")

    # Cap score
    risk_score = min(risk_score, 100)
    
    status = 'SAFE'
    if risk_score >= 80: status = 'DANGEROUS'
    elif risk_score >= 10: status = 'WARNING'
    
    explanation = "URL analysis complete."
    if status == 'SAFE': explanation = "No common threat signatures found. This URL appears to be safe."
    elif status == 'WARNING': explanation = "Some suspicious indicators were found. Proceed with caution."
    else: explanation = "CRITICAL THREATS DETECTED. Do not visit this link."

    return {
        'url': input_url,
        'riskScore': risk_score,
        'threats': threats,
        'status': status,
        'explanation': explanation,
        'scanTime': datetime.datetime.now().isoformat()
    }

@app.route('/api/scan', methods=['POST'])
def scan():
    data = request.json
    url = data.get('url')
    user_id = data.get('userId', 'guest')
    
    if not url: return jsonify({'error': 'URL required'}), 400

    # Rate Limit Check
    allowed, msg = check_rate_limit(user_id, 'link')
    if not allowed:
        return jsonify({'error': msg, 'limitReached': True}), 429
        
    time.sleep(1) # Sim processing
    result = analyze_url_deep(url)
    
    # Add User Stats to response
    user = users_db.get(user_id)
    plan_limit = PLANS[user['plan']]['link_daily']
    result['remainingList'] = plan_limit - user['scans_today']
    result['plan'] = user['plan']
    
    return jsonify(result)

@app.route('/api/deep-scan', methods=['POST'])
def deep_scan():
    # Only for Premium users in real app, but for now we basically alias it
    return scan() 

@app.route('/api/scan-apk', methods=['POST'])
def scan_apk():
    # User ID from form
    user_id = request.form.get('userId', 'guest')
    
    if 'apk' not in request.files: return jsonify({'error': 'No file'}), 400
    file = request.files['apk']
    if file.filename == '': return jsonify({'error': 'No file'}), 400
    
    # Rate Limit Check
    allowed, msg = check_rate_limit(user_id, 'apk')
    if not allowed:
        return jsonify({'error': msg, 'limitReached': True}), 429

    print(f"Scanning APK: {file.filename}")
    
    # Analyze Content
    content = file.read()
    file_size_mb = len(content) / (1024 * 1024)
    
    try:
        content_str = content.decode('utf-8', errors='ignore')
    except:
        content_str = ""
        
    risk_score = 0
    threats = []
    
    # Malware Signatures
    signatures = [
        (r'org\.telegram\.messenger', 'Targets Telegram (Stealer/Spam)', 60),
        (r'Telethon|Pyrogram|Aiogram', 'Telegram Bot Library (Userbot)', 50),
        (r'sms_manager|SendSMS|READ_SMS', 'SMS Access (OTP Stealer)', 70),
        (r'android\.permission\.RECEIVE_BOOT_COMPLETED', 'Persists after reboot', 20),
        (r'android\.permission\.SYSTEM_ALERT_WINDOW', 'Overlay Attack (Draws over apps)', 40),
        (r'android\.permission\.BIND_ACCESSIBILITY_SERVICE', 'Accessibility Abuse (Control device)', 80),
        (r'Ljava/lang/Runtime;->exec', 'Remote Code Execution', 90),
        (r'metasploit|meterpreter', 'Metasploit Payload', 100)
    ]
    
    for pat, desc, score in signatures:
        if re.search(pat, content_str, re.IGNORECASE):
            if desc not in threats:
                risk_score += score
                threats.append(desc)
                
    # Filename Heuristics (Social Engineering)
    fn_lower = file.filename.lower()
    
    suspicious_terms = [
        ('mod', 20), ('crack', 20), ('premium', 10), ('unlocked', 10),
        ('video', 30), ('albom', 30), ('to\'y', 40), ('foto', 30), 
        ('rasm', 30), ('bepul', 20), ('hack', 50), ('cheat', 40)
    ]
    
    for term, score in suspicious_terms:
        if term in fn_lower:
            risk_score += score
            if "Suspicious Filename" not in threats:
                threats.append("Suspicious Filename (Social Engineering Pattern)")
                
    if fn_lower.endswith('.exe') or fn_lower.endswith('.bat'):
        risk_score = 100
        threats.append("Not an APK package (Windows Executable)")


    risk_score = min(risk_score, 100)
    
    if risk_score >= 70: status = 'DANGEROUS'
    elif risk_score >= 30: status = 'WARNING'
    else: status = 'SAFE'
    
    time.sleep(2)
    
    # User Stats
    user = users_db.get(user_id)
    plan_limit = PLANS[user['plan']]['apk_weekly']
    
    return jsonify({
        'filename': file.filename,
        'riskScore': risk_score,
        'threats': threats,
        'status': status,
        'remainingApk': plan_limit - user['apks_week'],
        'plan': user['plan']
    })

@app.route('/api/contact', methods=['POST'])
def contact():
    # Mock log
    time.sleep(0.5)
    return jsonify({'success': True})

@app.route('/api/payment', methods=['POST'])
def payment():
    data = request.json
    user_id = data.get('userId')
    plan_name = data.get('plan', '').lower() # Starter, Professional, Expert, Elite VIP
    
    # Map frontend plan names to internal plans
    # 'Starter' -> Monthly ($4 equivalent logic in our simplified limiter)
    # 'Professional' -> Yearly ($39 logic)
    # This is a loose mapping for the demo.
    
    internal_plan = 'free'
    if 'starter' in plan_name or 'monthly' in plan_name:
        internal_plan = 'monthly'
    elif 'professional' in plan_name or 'expert' in plan_name or 'vip' in plan_name:
        internal_plan = 'yearly'
        
    if user_id:
        if user_id not in users_db: get_user_data(user_id)
        users_db[user_id]['plan'] = internal_plan
        
        # Reset counters on upgrade
        users_db[user_id]['scans_today'] = 0
        users_db[user_id]['apks_week'] = 0
        
        print(f"User {user_id} upgraded to {internal_plan}")

    time.sleep(1.5)
    return jsonify({'success': True, 'plan': internal_plan})

@app.route('/api/admin/data', methods=['GET'])
def admin_data():
    total_scans = 0
    
    # Calculate stats
    for u in users_db.values():
        total_scans += int(u.get('scans_today', 0))
        total_scans += int(u.get('apks_week', 0))
    
    # Transform users_db to list
    users_list = []
    for uid, data in users_db.items():
        users_list.append({
            'id': uid,
            'plan': data.get('plan', 'free'),
            'scans': data.get('scans_today', 0),
            'apk_scans': data.get('apks_week', 0)
        })

    return jsonify({
        "stats": {
            "total_users": len(users_db),
            "total_scans": total_scans, 
            "threats_blocked": 42 
        },
        "users": users_list
    })

if __name__ == '__main__':
    print("Starting Production-Ready Backend on port 3000...")
    app.run(host='0.0.0.0', port=3000, debug=False)
