// State variables
let currentPredictedAge = 0;
let currentConfidence = 0;
let isSecondPrediction = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing...');
    setupEventListeners();
    resizeCanvas();
});

// Setup all event listeners
function setupEventListeners() {
    // File upload
    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', handleFileUpload);
        console.log('Image upload listener added');
    }

    // Predict button
    const predictBtn = document.getElementById('predictBtn');
    if (predictBtn) {
        predictBtn.addEventListener('click', handlePredict);
        console.log('Predict button listener added');
    }

    // Yes/No feedback buttons with more robust selection
    document.addEventListener('click', function (e) {
        // Yes button
        if (e.target.closest('#yesBtn')) {
            console.log('Yes button clicked');
            e.preventDefault();
            handleYesFeedback();
        }

        // No button
        if (e.target.closest('#noBtn')) {
            console.log('No button clicked');
            e.preventDefault();
            handleNoFeedback();
        }

        // Modal buttons
        if (e.target.closest('#tryAgainBtn')) {
            console.log('Try again clicked');
            e.preventDefault();
            handleTryAgain();
        }

        if (e.target.closest('#tellAgeBtn')) {
            console.log('Tell age clicked');
            e.preventDefault();
            handleTellAge();
        }

        // Close modal buttons
        if (e.target.closest('.close-modal')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                hideModal(modal);
            }
        }
    });

    // Age range selection
    const ageRangeSelect = document.getElementById('ageRangeSelect');
    const predictAgainBtn = document.getElementById('predictAgainBtn');
    if (ageRangeSelect && predictAgainBtn) {
        ageRangeSelect.addEventListener('change', function () {
            predictAgainBtn.disabled = !this.value;
        });
        predictAgainBtn.addEventListener('click', handlePredictAgain);
    }

    // Actual age input
    const actualAgeInput = document.getElementById('actualAgeInput');
    const submitAgeBtn = document.getElementById('submitAgeBtn');
    if (actualAgeInput && submitAgeBtn) {
        actualAgeInput.addEventListener('input', function () {
            const age = parseInt(this.value);
            submitAgeBtn.disabled = !(age >= 1 && age <= 100);
        });
        submitAgeBtn.addEventListener('click', handleSubmitAge);
    }

    // Canvas resize
    window.addEventListener('resize', resizeCanvas);

    console.log('All event listeners setup complete');
}

// Handle file upload
function handleFileUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const file = imageUpload.files[0];

    if (file) {
        console.log('File selected:', file.name);
        const predictBtn = document.getElementById('predictBtn');
        predictBtn.disabled = false;

        // Update upload area
        const uploadLabel = document.getElementById('uploadLabel');
        const uploadText = document.querySelector('.upload-text');
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');

        if (uploadText) {
            uploadText.textContent = `Selected: ${file.name}`;
        }

        // Show image preview
        if (imagePreview && previewImage) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImage.src = e.target.result;
                imagePreview.classList.add('show');
                if (uploadLabel) {
                    uploadLabel.classList.add('has-image');
                }
            };
            reader.readAsDataURL(file);
        }
    }
}

// Handle predict button click
async function handlePredict() {
    const imageUpload = document.getElementById('imageUpload');
    if (!imageUpload.files[0]) {
        alert('Please select an image first!');
        return;
    }

    console.log('Starting prediction...');

    // Show loading state
    const predictBtn = document.getElementById('predictBtn');
    const btnText = document.querySelector('.btn-text');

    predictBtn.classList.add('loading');
    predictBtn.disabled = true;
    if (btnText) btnText.textContent = 'Analyzing...';

    try {
        // Create form data
        const formData = new FormData();
        formData.append('image', imageUpload.files[0]);

        // Send to backend
        const response = await fetch('https://age-prediction-api-i9jh.onrender.com/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Prediction failed');
        }

        const result = await response.json();

        // Update global variables
        currentPredictedAge = result.predicted_age;
        currentConfidence = result.confidence * 100;

        // Update UI
        const predictedAge = document.getElementById('predictedAge');
        const confidenceScore = document.getElementById('confidenceScore');

        if (predictedAge) predictedAge.textContent = currentPredictedAge;
        if (confidenceScore) confidenceScore.textContent = currentConfidence.toFixed(1) + '%';

        showResults();

        console.log('Prediction complete:', result);
    } catch (error) {
        console.error('Prediction error:', error);
        alert('Error during prediction. Please try again.');
    } finally {
        // Reset button
        predictBtn.classList.remove('loading');
        predictBtn.disabled = false;
        if (btnText) btnText.textContent = 'Predict My Age';
    }
}

// Generate age prediction
function generatePrediction() {
    if (isSecondPrediction) {
        // Second prediction based on age range
        const ageRangeSelect = document.getElementById('ageRangeSelect');
        const selectedRange = ageRangeSelect.value;
        if (selectedRange) {
            const [min, max] = selectedRange.split('-').map(Number);
            const midpoint = Math.floor((min + max) / 2);
            currentPredictedAge = midpoint + Math.floor(Math.random() * 6) - 3;
            currentConfidence = Math.floor(Math.random() * 20) + 75;
        }

        // Update UI for second prediction
        const feedbackQuestion = document.getElementById('feedbackQuestion');
        const yesBtnText = document.getElementById('yesBtnText');
        const noBtnText = document.getElementById('noBtnText');

        if (feedbackQuestion) feedbackQuestion.textContent = 'Is this second prediction more accurate?';
        if (yesBtnText) yesBtnText.textContent = '✨ Yes, much better!';
        if (noBtnText) noBtnText.textContent = '📝 No, let me tell you my exact age';
    } else {
        // First prediction
        currentPredictedAge = Math.floor(Math.random() * 50) + 18;
        currentConfidence = Math.floor(Math.random() * 30) + 65;

        // Reset UI for first prediction
        const feedbackQuestion = document.getElementById('feedbackQuestion');
        const yesBtnText = document.getElementById('yesBtnText');
        const noBtnText = document.getElementById('noBtnText');

        if (feedbackQuestion) feedbackQuestion.textContent = 'Is this prediction accurate?';
        if (yesBtnText) yesBtnText.textContent = '✨ Yes, this is my age';
        if (noBtnText) noBtnText.textContent = '🎯 No, my age is wrong';
    }

    // Update display
    const predictedAge = document.getElementById('predictedAge');
    const confidenceScore = document.getElementById('confidenceScore');

    if (predictedAge) predictedAge.textContent = currentPredictedAge;
    if (confidenceScore) confidenceScore.textContent = currentConfidence + '%';

    console.log('Generated prediction:', currentPredictedAge, 'confidence:', currentConfidence);
}

// Show results section
function showResults() {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.classList.add('show');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        console.log('Results section shown');
    }
}

// Handle "Yes" feedback
function handleYesFeedback() {
    console.log('Handling yes feedback, isSecondPrediction:', isSecondPrediction);

    let modalToShow, modalBody;

    if (isSecondPrediction) {
        modalToShow = document.getElementById('secondSuccessModal');
        modalBody = document.getElementById('secondSuccessModalBody');

        if (modalBody) {
            modalBody.innerHTML = `
                <h3>Perfect! AGE-I got it right on the second try! 🎯</h3>
                <div style="margin: 20px 0;">
                    <div style="font-size: 2.5rem; color: #00ffff; margin-bottom: 10px;">${currentPredictedAge}</div>
                    <div style="color: rgba(255, 255, 255, 0.7);">AGE-I Prediction</div>
                </div>
                <p>You look absolutely amazing! AGE-I learned from your feedback and nailed it! ✨</p>
                <p style="margin-top: 20px; font-size: 0.9rem; opacity: 0.8;">
                    Thanks for helping AGE-I improve! Share with friends! 🎈
                </p>
            `;
        }
    } else {
        modalToShow = document.getElementById('successModal');
        modalBody = document.getElementById('successModalBody');

        const messages = [
            "You look younger than ever! 🎉",
            "Amazing! You have great genes! ✨",
            "Wow! You're aging like fine wine! 🍷",
            "Incredible! You look fantastic! 🌟",
            "You've got that timeless look! ⭐"
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        if (modalBody) {
            modalBody.innerHTML = `
                <h3>${randomMessage}</h3>
                <div style="margin: 20px 0;">
                    <div style="font-size: 2.5rem; color: #00ffff; margin-bottom: 10px;">${currentPredictedAge}</div>
                    <div style="color: rgba(255, 255, 255, 0.7);">Predicted Age</div>
                </div>
                <p>Our AI got it right! You look absolutely amazing for your age.</p>
                <p style="margin-top: 20px; font-size: 0.9rem; opacity: 0.8;">
                    Thanks for using our age predictor! Share it with friends! 🎈
                </p>
            `;
        }
    }

    if (modalToShow) {
        showModal(modalToShow);
        startRainbowConfetti();

        // Auto reset after 5 seconds
        setTimeout(() => {
            resetForm();
        }, 5000);
    }
}

// Handle "No" feedback
function handleNoFeedback() {
    console.log('Handling no feedback, isSecondPrediction:', isSecondPrediction);

    if (isSecondPrediction) {
        // Second "No" - Go directly to exact age input
        hideAllSections();
        const actualAgeSection = document.getElementById('actualAgeSection');
        if (actualAgeSection) {
            actualAgeSection.classList.add('show');
            actualAgeSection.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // First "No" - Show another chance modal
        const anotherChanceModal = document.getElementById('anotherChanceModal');
        if (anotherChanceModal) {
            console.log('Showing another chance modal');
            showModal(anotherChanceModal);
        } else {
            console.error('Another chance modal not found');
        }
    }
}

// Handle "Try Again" from modal
function handleTryAgain() {
    console.log('Handling try again');
    const anotherChanceModal = document.getElementById('anotherChanceModal');
    hideModal(anotherChanceModal);
    hideAllSections();

    const ageRangeSection = document.getElementById('ageRangeSection');
    if (ageRangeSection) {
        ageRangeSection.classList.add('show');
        ageRangeSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle "Tell Age" from modal
function handleTellAge() {
    console.log('Handling tell age');
    const anotherChanceModal = document.getElementById('anotherChanceModal');
    hideModal(anotherChanceModal);
    hideAllSections();

    const actualAgeSection = document.getElementById('actualAgeSection');
    if (actualAgeSection) {
        actualAgeSection.classList.add('show');
        actualAgeSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle predict again
function handlePredictAgain() {
    console.log('Handling predict again');
    isSecondPrediction = true;

    const predictAgainBtn = document.getElementById('predictAgainBtn');
    predictAgainBtn.disabled = true;
    predictAgainBtn.innerHTML = '<span>🔮 Analyzing...</span>';

    setTimeout(() => {
        generatePrediction();
        hideAllSections();
        showResults();

        predictAgainBtn.disabled = false;
        predictAgainBtn.innerHTML = '<span>🔮 Predict Again</span>';
    }, 2000);
}

// Handle submit actual age
function handleSubmitAge() {
    const actualAgeInput = document.getElementById('actualAgeInput');
    const actualAge = parseInt(actualAgeInput.value);
    const ageDifference = Math.abs(currentPredictedAge - actualAge);

    let message = '';
    if (ageDifference <= 2) {
        message = "Wow! We were very close! 🎯";
    } else if (ageDifference <= 5) {
        message = "Not bad! We're getting better! 📈";
    } else {
        message = "Thanks for the feedback! This helps us improve! 🤖";
    }

    const thanksModal = document.getElementById('thanksModal');
    const thanksModalBody = thanksModal.querySelector('.modal-body');
    if (thanksModalBody) {
        thanksModalBody.innerHTML = `
            <h3>${message}</h3>
            <p>Your actual age: <strong>${actualAge}</strong> | Our prediction: <strong>${currentPredictedAge}</strong></p>
            <p>Your input helps us improve our AI prediction accuracy.</p>
            <p>Keep exploring and have fun with our age predictor! ✨</p>
        `;
    }

    showModal(thanksModal);

    setTimeout(() => {
        resetForm();
    }, 7000);
}

// Modal functions
function showModal(modal) {
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        console.log('Modal shown:', modal.id);
    }
}

function hideModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        console.log('Modal hidden:', modal.id);
    }
}

// Hide all sections
function hideAllSections() {
    const sections = ['resultsSection', 'ageRangeSection', 'actualAgeSection'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('show');
        }
    });
}

// Reset form
function resetForm() {
    console.log('Resetting form');

    // Hide all modals and sections
    const modals = ['successModal', 'secondSuccessModal', 'anotherChanceModal', 'thanksModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        hideModal(modal);
    });

    hideAllSections();

    // Reset inputs
    const imageUpload = document.getElementById('imageUpload');
    const ageRangeSelect = document.getElementById('ageRangeSelect');
    const actualAgeInput = document.getElementById('actualAgeInput');

    if (imageUpload) imageUpload.value = '';
    if (ageRangeSelect) ageRangeSelect.value = '';
    if (actualAgeInput) actualAgeInput.value = '';

    // Reset buttons
    const predictBtn = document.getElementById('predictBtn');
    const predictAgainBtn = document.getElementById('predictAgainBtn');
    const submitAgeBtn = document.getElementById('submitAgeBtn');

    if (predictBtn) predictBtn.disabled = true;
    if (predictAgainBtn) predictAgainBtn.disabled = true;
    if (submitAgeBtn) submitAgeBtn.disabled = true;

    // Reset upload area
    const uploadText = document.querySelector('.upload-text');
    const uploadLabel = document.getElementById('uploadLabel');
    const imagePreview = document.getElementById('imagePreview');

    if (uploadText) uploadText.textContent = 'Choose your photo';
    if (uploadLabel) uploadLabel.classList.remove('has-image');
    if (imagePreview) imagePreview.classList.remove('show');

    // Reset state
    isSecondPrediction = false;
    currentPredictedAge = 0;
    currentConfidence = 0;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Confetti animation
function resizeCanvas() {
    const confettiCanvas = document.getElementById('confetti-canvas');
    if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
}

function startRainbowConfetti() {
    const confettiCanvas = document.getElementById('confetti-canvas');
    if (!confettiCanvas) return;

    const ctx = confettiCanvas.getContext('2d');
    const particles = [];
    const colors = ['#ff0080', '#00ffff', '#ff8000', '#8000ff', '#00ff80', '#ffff00', '#ff4080', '#40ff80'];

    for (let i = 0; i < 200; i++) {
        particles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * 4 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 6,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15,
            shape: Math.random() < 0.5 ? 'rect' : 'circle'
        });
    }

    let frameCount = 0;
    const maxFrames = 400;

    function animateConfetti() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        particles.forEach((particle, index) => {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation * Math.PI / 180);

            ctx.fillStyle = particle.color;

            if (particle.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size / 2);
            }

            ctx.restore();

            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            particle.vy += 0.15;
            particle.vx *= 0.99;

            if (particle.y > confettiCanvas.height + particle.size) {
                particles.splice(index, 1);
            }
        });

        frameCount++;
        if (frameCount < maxFrames && particles.length > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }

    animateConfetti();
}