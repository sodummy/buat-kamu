// ===== PIN CONFIGURATION =====
const CORRECT_PIN = '040425'; // Ganti dengan PIN yang lo mau
let pinAttempts = 0;
const MAX_ATTEMPTS_BEFORE_HINT = 3;
const MAX_ATTEMPTS_BEFORE_DRAMATIC = 10;

// ===== PIN INPUT LOGIC =====
function showPinInput() {
    const landing = document.getElementById('landing');
    const pinPage = document.getElementById('pinPage');
    const openBtn = document.getElementById('openBtn');

    // Sembunyiin halaman ucapan, munculin halaman PIN
    if (landing) landing.style.display = 'none';
    if (pinPage) {
        pinPage.style.display = 'flex';
    }
    if (openBtn) openBtn.style.display = 'none';

    // Focus ke input pertama di halaman PIN
    const firstInput = document.querySelector('.pin-page [data-index="0"]') || document.querySelector('[data-index="0"]');
    if (firstInput) firstInput.focus();
}

function resetPinForm() {
    document.querySelectorAll('.pin-input').forEach(input => {
        input.value = '';
    });
    document.getElementById('pinError').style.display = 'none';
    document.querySelector('[data-index="0"]').focus();
}

// ===== PIN INPUT AUTO-ADVANCE & VALIDATION =====
function initializePinInputs() {
    const pinInputs = document.querySelectorAll('.pin-input');
    
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Only allow numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            // Auto-advance to next field
            if (e.target.value && index < pinInputs.length - 1) {
                pinInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            // Handle backspace
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                pinInputs[index - 1].focus();
            }
            // Allow tab navigation
            if (e.key === 'Tab') {
                return;
            }
            // Prevent non-numeric input
            if (!/[0-9]/.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
    });
}

function validatePin() {
    const pinInputs = document.querySelectorAll('.pin-input');
    const pinInputsContainer = document.getElementById('pinInputsContainer');
    const pinHintElement = document.getElementById('pinHint');
    const enteredPin = Array.from(pinInputs).map(input => input.value).join('');
    
    if (enteredPin === CORRECT_PIN) {
        // PIN benar
        pinAttempts = 0; // Reset attempts
        pinInputsContainer.classList.remove('shake');
        enterExperience();
    } else {
        // PIN salah - trigger shake effect
        pinAttempts++;
        
        // Trigger haptic vibration - DISINKRONKAN DENGAN ANIMASI SHAKE
        // Animasi shakeIntense durasinya 600ms dengan pola: intens di awal → makin halus di akhir
        try {
            // Cek dulu apakah navigator.vibrate ada dan bisa dipanggil
            if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
                // Pola getaran yang sinkron dengan animasi shakeIntense (600ms):
                // - 0-240ms: getar kuat (60ms on, 20ms off, repeat 3x) = intens di awal
                // - 240-420ms: getar sedang (40ms on, 30ms off, repeat 2x) = makin halus
                // - 420-600ms: getar halus (20ms on, 40ms off, repeat 2x) = makin halus lagi
                // Total: ~600ms, sesuai durasi animasi shakeIntense
                navigator.vibrate([
                    60, 20,  // getar kuat 1
                    60, 20,  // getar kuat 2
                    60, 20,  // getar kuat 3
                    40, 30,  // getar sedang 1
                    40, 30,  // getar sedang 2
                    20, 40,  // getar halus 1
                    20, 40   // getar halus 2
                ]);
            }
        } catch (e) {
            // Silent fail - kalau vibrate nggak bisa, tetap lanjut animasi
            console.log('Vibration tidak tersedia:', e);
        }
        
        // Add shake class to container
        pinInputsContainer.classList.add('shake');
        
        // Add shake class to individual inputs
        pinInputs.forEach(input => {
            input.classList.add('shake');
        });
        
        // Remove shake class after animation
        setTimeout(() => {
            pinInputsContainer.classList.remove('shake');
            pinInputs.forEach(input => {
                input.classList.remove('shake');
            });
        }, 600);
        
        document.getElementById('pinError').style.display = 'block';
        
        // Show dramatic message setelah 10 kali salah
        if (pinAttempts >= MAX_ATTEMPTS_BEFORE_DRAMATIC) {
            pinHintElement.style.display = 'block';
            pinHintElement.textContent = '😢 Kamu udah nggak sayang aku ya?';
            pinHintElement.style.color = '#d62828';
            pinHintElement.style.fontStyle = 'normal';
            pinHintElement.style.fontWeight = '600';
        }
        // Show hint setelah 3 kali salah (sebelum dramatic message)
        else if (pinAttempts >= MAX_ATTEMPTS_BEFORE_HINT) {
            pinHintElement.style.display = 'block';
            pinHintElement.textContent = '💡 Hint: apa hari paling bahagia buat kita berdua?';
            pinHintElement.style.color = '#e63946';
            pinHintElement.style.fontStyle = 'italic';
            pinHintElement.style.fontWeight = '500';
        }
        
        resetPinForm();
    }
}

// ===== LANDING INTERACTION =====
function enterExperience() {
    const landing = document.querySelector('.landing');
    const pinPage = document.getElementById('pinPage');
    const mainContainer = document.getElementById('mainContainer');
    
    landing.style.display = 'none';
    if (pinPage) {
        pinPage.style.display = 'none';
    }
    mainContainer.classList.add('visible');
    
    // Trigger animations
    setTimeout(() => {
        observeSections();
        // start typing effect for opening punch
        typeOpeningPunch();

        // Coba autoplay lagu di halaman isi (setelah konten muncul)
        const musicMain = document.getElementById('musicMain');
        if (musicMain) {
            ensureAudioAutoplay(musicMain, { promptText: 'Tap buat nyalain lagu yaa sayangg' });
        }
    }, 100);
}

// ===== TYPING EFFECT FOR OPENING PUNCH =====
function typeOpeningPunch() {
    const el = document.getElementById('openingPunch');
    if (!el) return;
    if (el.dataset.typed === '1') return; // only once
    const text = el.getAttribute('data-text') || '';
    el.textContent = '';
    el.classList.add('typing');
    let i = 0;
    const speed = 40; // ms per char
    const canVibrate = ('vibrate' in navigator) && typeof navigator.vibrate === 'function';
    // Durasi getar per karakter: cukup kuat terasa, tapi masih pas dengan speed typing
    const vibratePerCharMs = Math.min(35, Math.max(20, Math.floor(speed * 0.75))); // speed=40 => 30ms

    const interval = setInterval(() => {
        el.textContent += text.charAt(i);
        i++;

        // ===== HAPTIC SYNC (GETAR FISIK IKUT ANIMASI TYPING) =====
        // Sinkron 1:1 dengan karakter yang muncul, jadi ritmenya pasti sama dengan animasi
        if (canVibrate) {
            try {
                navigator.vibrate([vibratePerCharMs]);
            } catch (_) {
                // ignore
            }
        }

        if (i >= text.length) {
            clearInterval(interval);
            el.classList.remove('typing');
            el.dataset.typed = '1';
            if (canVibrate) {
                try { navigator.vibrate(0); } catch (_) {}
            }
        }
    }, speed);
}

// ===== INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS =====
const observeSections = () => {
    const options = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, options);

    // Observe all sections
    document.querySelectorAll('.opening, .nostalgia, .romantic, .playful').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(section);
    });
};

// ===== PLAYFUL BUTTON ENDING =====
function triggerEnding() {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '💕 Tentu aja!';
    
    // Optional: confetti or celebration effect
    celebrateWithConfetti();
    
    setTimeout(() => {
        btn.textContent = 'Klik kalau kamu setuju 💕';
        btn.disabled = false;
    }, 2000);
}

// ===== SIMPLE CONFETTI EFFECT =====
function celebrateWithConfetti() {
    const colors = ['#e63946', '#f8d7da', '#fff6e9'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        const duration = 2000 + Math.random() * 1000;
        const xMove = (Math.random() - 0.5) * 200;
        
        confetti.animate([
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${xMove}px, ${window.innerHeight + 20}px) rotate(360deg)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        setTimeout(() => {
            confetti.remove();
        }, duration);
    }
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== FLOATING HEARTS ANIMATION =====
function createFloatingHeart() {
    const container = document.getElementById('floatingHearts');
    if (!container) return;
    
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '❤️';
    
    // Random position
    heart.style.left = Math.random() * 100 + '%';
    
    // Random size
    const size = Math.random() * 15 + 10; // 10-25px
    heart.style.fontSize = size + 'px';
    
    // Random animation duration
    const duration = Math.random() * 4 + 4; // 4-8 seconds
    heart.style.animationDuration = duration + 's';
    
    // Random delay
    heart.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(heart);
    
    // Remove heart after animation
    setTimeout(() => {
        heart.remove();
    }, (duration + 2) * 1000);
}

function startFloatingHearts() {
    // Create hearts periodically
    setInterval(createFloatingHeart, 2000);
    
    // Create initial hearts
    for (let i = 0; i < 5; i++) {
        setTimeout(createFloatingHeart, i * 500);
    }
}

// ===== INITIALIZE ON LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    initializePinInputs();
    startFloatingHearts();
});

// ===== MUSIC HELPERS (opsional) =====
function setupOptionalAudio({ audioId, cardId, subtitleId, src, titleText }) {
    const audioEl = document.getElementById(audioId);
    const cardEl = document.getElementById(cardId);
    const subtitleEl = subtitleId ? document.getElementById(subtitleId) : null;

    if (!audioEl || !cardEl) return;

    // Kalau belum ada src, kita keep hidden (biar gak ganggu layout)
    if (!src) return;

    // Inject source
    const source = document.createElement('source');
    source.src = src;
    // Simple type inference
    if (src.endsWith('.mp3')) source.type = 'audio/mpeg';
    else if (src.endsWith('.ogg')) source.type = 'audio/ogg';
    else if (src.endsWith('.wav')) source.type = 'audio/wav';
    audioEl.appendChild(source);

    if (titleText && subtitleEl) subtitleEl.textContent = titleText;

    cardEl.style.display = 'block';
    audioEl.load();

    // Hint ke browser: inline di mobile (no autoplay)
    audioEl.playsInline = true;
}

function ensureAudioAutoplay(audioEl, { promptText = 'Tap buat nyalain lagu yaa' } = {}) {
    if (!audioEl) return;
    const canPlay = () => {
        try {
            const p = audioEl.play();
            if (p && typeof p.catch === 'function') {
                p.catch(() => {
                    // Autoplay kemungkinan diblokir → tampilkan prompt 1x
                    showAutoplayPrompt(audioEl, promptText);
                });
            }
        } catch (_) {
            showAutoplayPrompt(audioEl, promptText);
        }
    };
    canPlay();
}

function showAutoplayPrompt(audioEl, text) {
    if (!audioEl) return;
    if (document.getElementById('autoplayPrompt')) return;

    const wrap = document.createElement('div');
    wrap.id = 'autoplayPrompt';
    wrap.style.position = 'fixed';
    wrap.style.left = '0';
    wrap.style.right = '0';
    wrap.style.bottom = '0';
    wrap.style.padding = '0.9rem 1rem 1.1rem';
    wrap.style.background = 'rgba(255, 255, 255, 0.92)';
    wrap.style.backdropFilter = 'blur(8px)';
    wrap.style.borderTop = '1px solid rgba(230, 57, 70, 0.15)';
    wrap.style.zIndex = '9999';
    wrap.style.display = 'flex';
    wrap.style.justifyContent = 'center';

    const btn = document.createElement('button');
    btn.className = 'landing-btn';
    btn.type = 'button';
    btn.textContent = text;
    btn.style.padding = '0.85rem 1.4rem';
    btn.style.fontSize = '0.95rem';

    btn.addEventListener('click', async () => {
        try {
            await audioEl.play();
        } catch (_) {
            // kalau masih gagal, biarin aja (user bisa pencet play manual)
        }
        wrap.remove();
    });

    wrap.appendChild(btn);
    document.body.appendChild(wrap);
}

// ===== IMAGE LOAD SAFETY =====
function fixBrokenMemoryImages() {
    const imgs = document.querySelectorAll('.memory-image img');
    imgs.forEach(img => {
        let retried = false;
        const handleBroken = () => {
            if (!retried) {
                retried = true;
                console.warn('Image failed to load, retrying with cache-bust:', img.src);
                img.src = img.src.split('?')[0] + '?v=' + Date.now();
                return;
            }
            console.warn('Broken image detected, replacing with placeholder:', img.getAttribute('src'));
            img.src = 'images/foto-placeholder.svg';
            img.style.objectFit = 'contain';
            img.style.filter = 'grayscale(0.1)';
            img.style.background = 'linear-gradient(135deg, #fde8e8, #fff6e9)';
        };

        // set onerror so future failures are handled
        img.onerror = handleBroken;

        // if already loaded but empty (failed earlier), fix it now
        if (img.complete && img.naturalWidth === 0) {
            handleBroken();
        }
    });
}

// run the check after DOM load and also after opening the content
document.addEventListener('DOMContentLoaded', fixBrokenMemoryImages);

// Setup lagu di halaman yang lagi dibuka (kalau elemennya ada)
document.addEventListener('DOMContentLoaded', () => {
    // Isi dengan file audio kamu sendiri nanti (contoh: 'audio/lagu-kita.mp3')
    setupOptionalAudio({
        audioId: 'musicMain',
        cardId: 'musicMainCard',
        subtitleId: 'musicMainSubtitle',
        src: 'audio/closer.mp3', // Closer buat halaman isi
        titleText: 'putar lagunya dulu biar makin berasa yaa sayangg 🫶'
    });

    setupOptionalAudio({
        audioId: 'musicLetter',
        cardId: 'musicLetterCard',
        subtitleId: 'musicLetterSubtitle',
        src: 'audio/birds-of-a-feather.mp3', // Birds of a Feather buat halaman surat
        titleText: 'lagu ini buat nemenin kamu sambil baca biar ga sepii'
    });

    // Coba autoplay di halaman surat (kalau elemennya ada)
    const musicLetter = document.getElementById('musicLetter');
    if (musicLetter) {
        ensureAudioAutoplay(musicLetter, { promptText: 'tap buat nyalain lagunya yaa sayangg' });
    }
});
