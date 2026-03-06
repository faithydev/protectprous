// ===== LANGUAGE SWITCHER WITH I18N =====
function initLanguage() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const savedLang = localStorage.getItem('selectedLanguage') || 'uz';

    // Set initial language
    setLanguage(savedLang);

    // Add event listeners to language buttons
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);

            // Update active state
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function setLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);

    // Update all elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key, lang);

        if (translation) {
            // For input placeholders and other attributes
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else if (element.tagName === 'BUTTON' && element.querySelector('span')) {
                element.querySelector('span').textContent = translation;
            } else if (element.tagName === 'A' && element.querySelector('span')) {
                element.querySelector('span').textContent = translation;
            } else if (element.tagName === 'A') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;
}

function getTranslation(key, lang) {
    const keys = key.split('.');
    let translation = translations[lang];

    for (const k of keys) {
        translation = translation?.[k];
    }

    return translation;
}

function getCurrentLang() {
    return localStorage.getItem('selectedLanguage') || 'uz';
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', initLanguage);

// ===== MATRIX BACKGROUND ANIMATION =====
const canvas = document.getElementById('matrix');
if (canvas) {
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * canvas.height / fontSize;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(10, 14, 23, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff90';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(drawMatrix, 35);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ===== YEAR IN FOOTER =====
const yearElements = document.querySelectorAll('#year');
yearElements.forEach(el => {
    el.textContent = new Date().getFullYear();
});

// ===== COUNTER ANIMATION =====
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

const statNumbers = document.querySelectorAll('.stat-number[data-target]');
if (statNumbers.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => observer.observe(stat));
}

// ===== HERO TERMINAL ANIMATION =====
const heroTerminal = document.getElementById('heroTerminal');
if (heroTerminal) {
    const messages = [
        { text: '$ initializing security scanner...', delay: 0 },
        { text: '✓ AI heuristics engine loaded', delay: 800 },
        { text: '✓ Sandbox environment ready', delay: 1400 },
        { text: '✓ Network monitor active', delay: 2000 },
        { text: '✓ Threat database updated', delay: 2600 },
        { text: '$ system ready for scanning_', delay: 3200, cursor: true }
    ];

    let index = 0;
    function displayMessage() {
        if (index < messages.length) {
            const msg = messages[index];
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = 'term-line' + (msg.cursor ? ' term-cursor' : '');
                if (msg.text.startsWith('✓')) {
                    line.innerHTML = `<span class="term-success">✓</span> ${msg.text.substring(1)}`;
                } else if (msg.text.startsWith('$')) {
                    line.innerHTML = `<span class="term-prompt">$</span> ${msg.text.substring(1)}`;
                } else {
                    line.textContent = msg.text;
                }
                heroTerminal.appendChild(line);
                index++;
                displayMessage();
            }, msg.delay);
        }
    }
    displayMessage();
}

// ===== URL SCANNER =====
const urlInput = document.getElementById('urlInput');
const quickScanBtn = document.getElementById('quickScanBtn');
const deepScanBtn = document.getElementById('deepScanBtn');
const scanOutput = document.getElementById('scanOutput');
const scanStatus = document.getElementById('scanStatus');

function addScanLog(message, type = 'normal') {
    if (!scanOutput) return;

    const line = document.createElement('div');
    line.className = 'term-line';

    if (type === 'success') {
        line.innerHTML = `<span class="term-success">✓</span> ${message}`;
        line.style.color = 'var(--success)';
    } else if (type === 'error') {
        line.innerHTML = `<span style="color: var(--danger)">✖</span> ${message}`;
        line.style.color = 'var(--danger)';
    } else if (type === 'warning') {
        line.innerHTML = `<span style="color: var(--warning)">⚠</span> ${message}`;
        line.style.color = 'var(--warning)';
    } else if (type === 'prompt') {
        line.innerHTML = `<span class="term-prompt">$</span> ${message}`;
    } else {
        line.textContent = message;
    }

    scanOutput.appendChild(line);
    scanOutput.scrollTop = scanOutput.scrollHeight;
}

function updateScanStatus(status, color) {
    if (!scanStatus) return;
    scanStatus.textContent = status;
    scanStatus.style.background = `rgba(${color}, 0.2)`;
    scanStatus.style.borderColor = `rgb(${color})`;
    scanStatus.style.color = `rgb(${color})`;
}

// ===== CONFIGURATION =====
const API_URL = 'http://localhost:3000/api';

// Generate or retrieve User ID for Rate Limiting
function getUserId() {
    let userId = localStorage.getItem('protectPro_userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('protectPro_userId', userId);
    }
    return userId;
}

function quickScan(url) {
    const lang = getCurrentLang();
    if (!url || !url.match(/^https?:\/\//i)) {
        addScanLog(getTranslation('script.invalidUrl', lang), 'error');
        updateScanStatus('ERROR', '239, 68, 68');
        return;
    }

    scanOutput.innerHTML = '';
    updateScanStatus('SCANNING', '245, 158, 11');
    addScanLog(`${getTranslation('script.scanInitiated', lang)} ${url}`, 'prompt');
    addScanLog(`Connecting to backend server...`, 'normal');

    fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, userId: getUserId() })
    })
        .then(async res => {
            if (res.status === 429) {
                const data = await res.json();
                throw new Error(data.error || "Rate limit exceeded");
            }
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);

            const { riskScore, threats, status, explanation, remainingList, plan } = data;

            // Visual delay for effect
            setTimeout(() => {
                // Show rate limit info
                if (plan !== 'yearly' && remainingList !== undefined) {
                    addScanLog(`ℹ️ ${getTranslation('pricing.monthly', lang)} Plan: ${remainingList} scans remaining today`, 'normal');
                }

                if (status === 'SAFE') {
                    addScanLog(getTranslation('script.noThreats', lang), 'success');
                    if (explanation) addScanLog(`Explain: ${explanation}`, 'success');
                    addScanLog(`Risk Score: 0/100 - ${getTranslation('script.safe', lang)}`, 'success');
                    updateScanStatus(getTranslation('script.safe', lang), '16, 185, 129');
                } else if (status === 'WARNING') {
                    addScanLog(`⚠ ${getTranslation('script.suspicious', lang)}`, 'warning');
                    threats.forEach(t => addScanLog(`  - ${t}`, 'warning'));
                    if (explanation) addScanLog(`Explain: ${explanation}`, 'warning');
                    updateScanStatus(getTranslation('script.suspicious', lang), '245, 158, 11');
                } else {
                    addScanLog(`✖ ${getTranslation('script.dangerous', lang)}`, 'error');
                    threats.forEach(t => addScanLog(`  - ${t}`, 'error'));
                    if (explanation) addScanLog(`Explain: ${explanation}`, 'error');
                    updateScanStatus(getTranslation('script.dangerous', lang), '239, 68, 68');
                }
                addScanLog(getTranslation('script.scanCompleted', lang), 'normal');
            }, 1000);
        })
        .catch(err => {
            console.error(err);
            addScanLog(err.message, 'error');
            updateScanStatus('LIMIT', '239, 68, 68');

            if (err.message.includes('limit')) {
                showNotification("Daily Limit Reached! Upgrade plan.", "error");
                setTimeout(() => {
                    window.location.hash = "pricing";
                }, 2000);
            }
        });
}

function deepScan(url) {
    if (!url || !url.match(/^https?:\/\//i)) {
        addScanLog('Invalid URL format. Please use http:// or https://', 'error');
        updateScanStatus('ERROR', '239, 68, 68');
        return;
    }

    scanOutput.innerHTML = '';
    updateScanStatus('DEEP SCAN', '168, 85, 247');
    addScanLog(`deep-scan queued: ${url}`, 'prompt');
    addScanLog(`Sending URL to sandbox engine...`, 'normal');

    fetch(`${API_URL}/deep-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    })
        .then(res => res.json())
        .then(data => {
            const stages = [
                { msg: 'Launching headless browser...', delay: 500 },
                { msg: 'Loading page in sandbox environment...', delay: 1200 },
                { msg: 'Monitoring network requests...', delay: 2000 },
                { msg: 'Analyzing JavaScript execution...', delay: 3000 },
            ];

            stages.forEach(({ msg, delay }) => {
                setTimeout(() => addScanLog(msg, 'normal'), delay);
            });

            setTimeout(() => {
                if (data.status === 'SAFE') {
                    addScanLog('✓ No suspicious behavior detected', 'success');
                    addScanLog('✓ All network requests legitimate', 'success');
                    addScanLog(`Risk Score: ${data.riskScore}/100 - SAFE`, 'success');
                    updateScanStatus('SAFE', '16, 185, 129');
                } else {
                    addScanLog('✖ Suspicious behavior detected:', 'error');
                    data.threats.forEach(t => addScanLog(`  - ${t}`, 'error'));
                    addScanLog(`Risk Score: ${data.riskScore}/100 - DANGEROUS`, 'error');
                    updateScanStatus('DANGEROUS', '239, 68, 68');
                }
                addScanLog('Deep scan completed.', 'normal');
            }, 4000);
        })
        .catch(err => {
            addScanLog('Error: Deep Scan Failed', 'error');
            updateScanStatus('ERROR', '239, 68, 68');
        });
}

if (quickScanBtn) {
    quickScanBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        quickScan(url);
    });
}

if (deepScanBtn) {
    deepScanBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        deepScan(url);
    });
}

if (urlInput) {
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            quickScan(urlInput.value.trim());
        }
    });
}

// ===== APK SCANNING =====
const apkUploadBtn = document.getElementById('apkUploadBtn');
const apkInput = document.getElementById('apkInput');

if (apkUploadBtn && apkInput) {
    apkUploadBtn.addEventListener('click', () => {
        apkInput.click();
    });

    apkInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadApk(file);
        }
    });
}

function uploadApk(file) {
    if (!file.name.endsWith('.apk')) {
        showNotification('Faqat .apk fayllar qabul qilinadi', 'error');
        return;
    }

    scanOutput.innerHTML = '';
    updateScanStatus('UPLOADING', '59, 130, 246');
    addScanLog(`Initiating APK upload: ${file.name}`, 'prompt');
    addScanLog(`File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`, 'normal');

    const formData = new FormData();
    formData.append('apk', file);
    formData.append('userId', getUserId());

    fetch(`${API_URL}/scan-apk`, {
        method: 'POST',
        body: formData
    })
        .then(async res => {
            if (res.status === 429) {
                const data = await res.json();
                throw new Error(data.error || "Rate limit exceeded");
            }
            return res.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);

            addScanLog('Upload complete. Analyzing package...', 'normal');

            setTimeout(() => {
                const { riskScore, threats, status, remainingApk } = data;

                if (remainingApk !== undefined) {
                    addScanLog(`ℹ️ APK Limit: ${remainingApk} scans remaining this week`, 'normal');
                }

                if (status === 'SAFE') {
                    addScanLog('✓ APK Signature verified', 'success');
                    addScanLog('✓ No malware detected', 'success');
                    addScanLog(`Risk Score: ${riskScore}/100 - SAFE`, 'success');
                    updateScanStatus('SAFE', '16, 185, 129');
                } else {
                    addScanLog('✖ Security threats detected:', 'error');
                    threats.forEach(t => addScanLog(`  - ${t}`, 'error'));
                    addScanLog(`Risk Score: ${riskScore}/100 - ${status}`, 'error');
                    updateScanStatus(status, '239, 68, 68');
                }
            }, 1500);
        })
        .catch(err => {
            console.error(err);
            addScanLog(err.message, 'error');
            updateScanStatus('LIMIT', '239, 68, 68');

            if (err.message.includes('limit')) {
                showNotification("APK Limit Reached! Upgrade plan.", "error");
            }
        });
}

// ... unchanged Copy/Notification/FAQ/Pricing/SelectPlan/LoadPlan/PaymentMethod/CardFormat code ...

// ===== PAYMENT FORM SUBMISSION =====
const paymentForm = document.getElementById('paymentForm');
if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const payerName = document.getElementById('payerName').value;
        const payerEmail = document.getElementById('payerEmail').value;
        const payerPhone = document.getElementById('payerPhone').value;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        const planName = document.getElementById('planName').textContent;
        const planPrice = document.getElementById('planPrice').textContent;

        if (!paymentMethod) {
            showNotification(getTranslation('script.selectPayment', getCurrentLang()), 'error');
            return;
        }

        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>⏳ ${getTranslation('script.processing', getCurrentLang())}</span>`;
        submitBtn.disabled = true;

        // Send to Backend
        fetch(`${API_URL}/payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: getUserId(),
                name: payerName,
                email: payerEmail,
                method: paymentMethod.value,
                plan: planName,
                amount: planPrice
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.querySelector('.payment-container').style.display = 'none';
                    const successDiv = document.getElementById('paymentSuccess');
                    if (successDiv) successDiv.style.display = 'block';
                    paymentForm.reset();
                } else {
                    showNotification('Payment failed. Please try again.', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                showNotification('Server Error. Payment not processed.', 'error');
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
    });
}

// ===== CONTACT FORM SUBMISSION =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        // POST to backend
        fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, phone, message })
        })
            .then(res => res.json())
            .then(data => {
                // Show success message
                const formSuccess = document.getElementById('formSuccess');
                if (formSuccess) {
                    contactForm.style.display = 'none';
                    formSuccess.classList.add('active');

                    setTimeout(() => {
                        contactForm.style.display = 'flex';
                        formSuccess.classList.remove('active');
                        contactForm.reset();
                    }, 5000);
                } else {
                    showNotification(getTranslation('script.messageSent', getCurrentLang()), 'success');
                    contactForm.reset();
                }
            })
            .catch(err => {
                showNotification('Error sending message.', 'error');
                console.error(err);
            });
    });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== ACTIVE SIDEBAR LINK ON SCROLL (for guide page) =====
if (document.querySelector('.guide-sidebar')) {
    const sections = document.querySelectorAll('.guide-section');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===== ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('🛡️ ProtectPro loaded successfully!');
console.log('💻 Developed with ❤️ by ProtectPro Team');
console.log('🔒 Stay safe online!');
