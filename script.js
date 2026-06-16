document.addEventListener('DOMContentLoaded', () => {
    // Navigation / Steps
    const steps = {
        1: document.getElementById('step-1'),
        2: document.getElementById('step-2'),
        3: document.getElementById('step-3'),
        4: document.getElementById('step-4'),
    };

    let selectedCuisine = '';
    let selectedDate = '';
    let selectedTime = '';

    // Step 1: Runaway Button Setup
    const btnNo = document.getElementById('btn-no');
    const btnYes = document.getElementById('btn-yes');

    function runawayButton(e) {
        // Prevent default tap behaviors on mobile to prevent accidental clicks
        if (e.type === 'touchstart') {
            e.preventDefault();
        }

        // Set to fixed positioning on first interaction so it can move anywhere
        if (!btnNo.classList.contains('btn-no-active')) {
            const rect = btnNo.getBoundingClientRect();
            btnNo.style.width = rect.width + 'px';
            btnNo.style.height = rect.height + 'px';
            btnNo.style.left = rect.left + 'px';
            btnNo.style.top = rect.top + 'px';
            btnNo.style.position = 'fixed';
            btnNo.style.margin = '0';
            btnNo.offsetHeight; // force reflow
            btnNo.classList.add('btn-no-active');
            
            // On first run, schedule the slide after positioning is established
            requestAnimationFrame(() => {
                moveButton(e);
            });
            return;
        }

        moveButton(e);
    }

    function moveButton(e) {
        const rect = btnNo.getBoundingClientRect();
        const btnWidth = rect.width;
        const btnHeight = rect.height;
        const margin = 20;

        // Get cursor position
        let clientX = e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
        let clientY = e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;

        // Button center position
        const btnX = rect.left + btnWidth / 2;
        const btnY = rect.top + btnHeight / 2;

        // Calculate vector from cursor to button center
        let dx = btnX - clientX;
        let dy = btnY - clientY;
        let dist = Math.hypot(dx, dy);

        if (dist === 0) {
            dx = 1;
            dy = 1;
            dist = Math.sqrt(2);
        }

        // Normalize vector and multiply by push distance
        const ux = dx / dist;
        const uy = dy / dist;
        const pushDistance = 160 + Math.random() * 80; // push 160-240px

        let newX = rect.left + ux * pushDistance;
        let newY = rect.top + uy * pushDistance;

        // Bounds constraints
        const minX = margin;
        const maxX = window.innerWidth - btnWidth - margin;
        const minY = margin;
        const maxY = window.innerHeight - btnHeight - margin;

        // Bouncing logic if it exceeds viewport boundaries
        if (newX < minX) {
            newX = maxX - Math.random() * 50;
        } else if (newX > maxX) {
            newX = minX + Math.random() * 50;
        }

        if (newY < minY) {
            newY = maxY - Math.random() * 50;
        } else if (newY > maxY) {
            newY = minY + Math.random() * 50;
        }

        btnNo.style.left = `${newX}px`;
        btnNo.style.top = `${newY}px`;

        showRunawayTooltip(clientX, clientY);
    }

    // Show a small cute pop-up text when the button runs away
    function showRunawayTooltip(x, y) {
        const tooltips = ['Упс! 😉', 'Неа) 😜', 'Мимо! 🤭', 'Попробуй еще! ✨', 'Не-а! 🙅‍♀️'];
        const randomText = tooltips[Math.floor(Math.random() * tooltips.length)];
        
        const tooltip = document.createElement('div');
        tooltip.className = 'runaway-tooltip';
        tooltip.textContent = randomText;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y - 30}px`;
        
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
            tooltip.remove();
        }, 1500);
    }

    // Attach mouseenter and touchstart to runaway
    btnNo.addEventListener('mouseenter', runawayButton);
    btnNo.addEventListener('touchstart', runawayButton, { passive: false });
    
    // Fallback if they somehow manage to click it
    btnNo.addEventListener('click', (e) => {
        e.preventDefault();
        runawayButton(e);
    });

    // Go to step 2 when "Yes" is clicked
    btnYes.addEventListener('click', () => {
        switchStep(1, 2);
    });

    // Step 2: Cuisine selection
    const cuisineCards = document.querySelectorAll('.cuisine-card');
    const btnToStep3 = document.getElementById('btn-to-step3');

    cuisineCards.forEach(card => {
        card.addEventListener('click', () => {
            cuisineCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedCuisine = card.getAttribute('data-value');
            
            // Enable next button
            btnToStep3.removeAttribute('disabled');
            btnToStep3.classList.remove('btn-disabled');
        });
    });

    btnToStep3.addEventListener('click', () => {
        if (selectedCuisine) {
            switchStep(2, 3);
        }
    });

    // Step 3: Date & Time Picker
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const btnSubmit = document.getElementById('btn-submit');

    // Restrict date selection to today or future dates
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;

    // Set default time to current time plus some buffer, or 19:00
    timeInput.value = "19:00";

    btnSubmit.addEventListener('click', () => {
        selectedDate = dateInput.value;
        selectedTime = timeInput.value;

        if (!selectedDate || !selectedTime) {
            alert('Пожалуйста, выбери удобные дату и время! ✨');
            return;
        }

        sendData();
    });

    // Meme button interactivity
    const btnMeme = document.getElementById('btn-meme');
    btnMeme.addEventListener('click', () => {
        btnMeme.classList.add('btn-pressed');
    });

    // Transition between steps helper
    function switchStep(from, to) {
        steps[from].classList.remove('active');
        setTimeout(() => {
            steps[to].classList.add('active');
        }, 300);
    }

    // API Send Data via FormSubmit
    function sendData() {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Отправка... 💌';

        const payload = {
            _subject: 'Новый ответ на свидание! 💌',
            _honey: '', // Honeypot field to prevent spam
            'Выбор кухни': selectedCuisine,
            'Дата свидания': selectedDate,
            'Время свидания': selectedTime,
            _template: 'box' // FormSubmit premium template look
        };

        fetch('https://formsubmit.co/ajax/1c98e9ef47e25ece7ff01885932c4dc8', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                switchStep(3, 4);
                startConfetti();
            } else {
                throw new Error('Network error');
            }
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            // Fallback: Proceed anyway so the user experience isn't broken, 
            // but log/notify about error.
            switchStep(3, 4);
            startConfetti();
        });
    }

    // Confetti Animation System
    function startConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Resize canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        // Confetti particle template
        const colors = [
            '#ff6b8b', '#ff8e53', '#ff4757', '#eccc68', '#70a1ff', '#2ed573', '#ff7f50'
        ];
        const particles = [];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                r: Math.random() * 6 + 4,
                d: Math.random() * canvas.height,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 5,
                tiltAngleIncremental: Math.random() * 0.07 + 0.02,
                tiltAngle: 0
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, index) => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.x += Math.sin(p.tiltAngle);
                p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();

                // Reset particle to top if it goes off bottom
                if (p.y > canvas.height) {
                    particles[index] = {
                        x: Math.random() * canvas.width,
                        y: -20,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: p.tilt,
                        tiltAngleIncremental: p.tiltAngleIncremental,
                        tiltAngle: p.tiltAngle
                    };
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        }

        draw();

        // Stop after 7 seconds to save performance
        setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 7000);
    }
});
