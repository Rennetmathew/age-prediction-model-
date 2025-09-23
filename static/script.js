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

        // Show image preview
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewImage = document.getElementById('previewImage');
            const imagePreview = document.getElementById('imagePreview');
            const uploadLabel = document.getElementById('uploadLabel');

            if (previewImage && imagePreview && uploadLabel) {
                previewImage.src = e.target.result;
                imagePreview.classList.add('show');
                uploadLabel.classList.add('has-image');

                // Enable predict button
                const predictBtn = document.getElementById('predictBtn');
                if (predictBtn) {
                    predictBtn.disabled = false;
                }

                // Show remove button
                showRemoveButton();

                console.log('Image preview updated');
            }
        };
        reader.readAsDataURL(file);
    }
}

// Show remove image button
function showRemoveButton() {
    const uploadArea = document.querySelector('.upload-area');

    // Check if remove button already exists
    if (document.getElementById('removeImageBtn')) {
        return;
    }

    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.id = 'removeImageBtn';
    removeBtn.className = 'remove-image-btn';
    removeBtn.innerHTML = '<span>🗑️ Remove Image</span>';

    // Add event listener
    removeBtn.addEventListener('click', handleRemoveImage);

    // Insert after predict button
    const predictBtn = document.getElementById('predictBtn');
    predictBtn.parentNode.insertBefore(removeBtn, predictBtn.nextSibling);
}

// Handle remove image
function handleRemoveImage() {
    console.log('Removing image...');

    // Reset file input
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.value = '';

    // Hide image preview
    const imagePreview = document.getElementById('imagePreview');
    const uploadLabel = document.getElementById('uploadLabel');

    if (imagePreview && uploadLabel) {
        imagePreview.classList.remove('show');
        uploadLabel.classList.remove('has-image');
    }

    // Disable predict button
    const predictBtn = document.getElementById('predictBtn');
    if (predictBtn) {
        predictBtn.disabled = true;
        predictBtn.classList.remove('loading');
        const btnText = predictBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = 'Predict My Age';
        }
    }

    // Remove the remove button
    const removeBtn = document.getElementById('removeImageBtn');
    if (removeBtn) {
        removeBtn.remove();
    }

    // Hide results and other sections
    hideAllSections();

    // Reset state
    currentPredictedAge = 0;
    currentConfidence = 0;
    isSecondPrediction = false;

    // Call backend to handle removal
    fetch('/remove-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Image removal confirmed:', data);
        })
        .catch(error => {
            console.error('Error removing image:', error);
        });
}

// Hide all sections
function hideAllSections() {
    const sections = [
        'resultsSection',
        'ageRangeSection',
        'actualAgeSection'
    ];

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('show');
        }
    });

    hideAllModals();
}

// Handle predict button click
function handlePredict() {
    const imageUpload = document.getElementById('imageUpload');
    const file = imageUpload.files[0];

    if (!file) {
        alert('Please select an image first');
        return;
    }

    console.log('Starting prediction...');

    // Show loading state
    const predictBtn = document.getElementById('predictBtn');
    if (predictBtn) {
        predictBtn.classList.add('loading');
        predictBtn.disabled = true;
        const btnText = predictBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = 'Analyzing...';
        }
    }

    // Create FormData and send to backend
    const formData = new FormData();
    formData.append('image', file);

    fetch('https://age-prediction-api-i9jh.onrender.com/predict-age/', {
        method: 'POST',
        body: formData
    })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Prediction response:', data);

            if (data.detail) {
                throw new Error(data.detail);
            }

            // Store current prediction
            currentPredictedAge = data.predicted_age;
            currentConfidence = data.confidence;

            // Update UI with results
            displayResults(data);

            // Reset predict button
            if (predictBtn) {
                predictBtn.classList.remove('loading');
                const btnText = predictBtn.querySelector('.btn-text');
                if (btnText) {
                    btnText.textContent = 'Predict My Age';
                }
            }
        })
        .catch(error => {
            console.error('Prediction error:', error);
            alert('Error during prediction: ' + error.message);

            // Reset predict button
            if (predictBtn) {
                predictBtn.classList.remove('loading');
                predictBtn.disabled = false;
                const btnText = predictBtn.querySelector('.btn-text');
                if (btnText) {
                    btnText.textContent = 'Predict My Age';
                }
            }
        });
}

// Display prediction results
function displayResults(data) {
    // Update age and confidence
    const predictedAge = document.getElementById('predictedAge');
    const confidenceScore = document.getElementById('confidenceScore');

    if (predictedAge) {
        predictedAge.textContent = Math.round(data.predicted_age);
    }
    if (confidenceScore) {
        confidenceScore.textContent = Math.round(data.confidence) + '%';
    }

    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.classList.add('show');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    console.log('Results displayed');
}

// Handle Yes feedback
function handleYesFeedback() {
    console.log('Handling yes feedback');

    if (isSecondPrediction) {
        // Second time saying yes - show second success modal
        showSecondSuccessModal();
    } else {
        // First time saying yes - show first success modal
        showSuccessModal();
    }

    // Send feedback to backend
    sendFeedback(true, currentPredictedAge);
}

// Handle No feedback
function handleNoFeedback() {
    console.log('Handling no feedback');

    // Show "give another chance" modal
    showAnotherChanceModal();
}

// Handle try again (from modal)
function handleTryAgain() {
    console.log('Handling try again');
    hideAllModals();

    // Show age range section
    const ageRangeSection = document.getElementById('ageRangeSection');
    if (ageRangeSection) {
        ageRangeSection.classList.add('show');
        ageRangeSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle tell age (from modal)
function handleTellAge() {
    console.log('Handling tell age');
    hideAllModals();

    // Show actual age section
    const actualAgeSection = document.getElementById('actualAgeSection');
    if (actualAgeSection) {
        actualAgeSection.classList.add('show');
        actualAgeSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle predict again (with age range)
function handlePredictAgain() {
    const ageRangeSelect = document.getElementById('ageRangeSelect');
    const selectedRange = ageRangeSelect.value;

    if (!selectedRange) {
        alert('Please select an age range');
        return;
    }

    console.log('Predicting again with age range:', selectedRange);

    // Mark as second prediction
    isSecondPrediction = true;

    // Hide age range section
    const ageRangeSection = document.getElementById('ageRangeSection');
    if (ageRangeSection) {
        ageRangeSection.classList.remove('show');
    }

    // Show results section again
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Update feedback question for second prediction
    const feedbackQuestion = document.getElementById('feedbackQuestion');
    const yesBtnText = document.getElementById('yesBtnText');
    const noBtnText = document.getElementById('noBtnText');

    if (feedbackQuestion) {
        feedbackQuestion.textContent = 'How about now? Is this prediction better?';
    }
    if (yesBtnText) {
        yesBtnText.textContent = '✨ Yes, much better!';
    }
    if (noBtnText) {
        noBtnText.textContent = '📝 No, let me tell you my age';
    }
}

// Handle submit age
function handleSubmitAge() {
    const actualAgeInput = document.getElementById('actualAgeInput');
    const actualAge = parseInt(actualAgeInput.value);

    if (actualAge < 1 || actualAge > 100) {
        alert('Please enter a valid age between 1 and 100');
        return;
    }

    console.log('Submitting actual age:', actualAge);

    // Send feedback with actual age
    sendFeedback(false, actualAge);

    // Show thanks modal
    showThanksModal();
}

// Send feedback to backend
function sendFeedback(isCorrect, actualAge) {
    const feedback = {
        predicted_age: currentPredictedAge,
        actual_age: actualAge,
        is_correct: isCorrect,
        confidence: currentConfidence,
        timestamp: new Date().toISOString()
    };

    console.log('Sending feedback:', feedback);

    fetch('/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedback)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Feedback sent successfully:', data);
        })
        .catch(error => {
            console.error('Error sending feedback:', error);
        });
}

// Modal functions
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    const modalBody = document.getElementById('successModalBody');

    if (modal && modalBody) {
        modalBody.innerHTML = `
            <h3>Awesome! 🎉</h3>
            <p>AGE-I got it right! You look exactly your age.</p>
            <p>Thanks for confirming - this helps us improve our AI! ✨</p>
        `;
        showModal(modal);

        // Trigger confetti
        triggerConfetti();
    }
}

function showSecondSuccessModal() {
    const modal = document.getElementById('secondSuccessModal');
    const modalBody = document.getElementById('secondSuccessModalBody');

    if (modal && modalBody) {
        modalBody.innerHTML = `
            <h3>Perfect! 🌟</h3>
            <p>AGE-I nailed it on the second try! Thanks for giving us another chance.</p>
            <p>Your feedback helps us get better at age prediction! 🚀</p>
        `;
        showModal(modal);

        // Trigger confetti
        triggerConfetti();
    }
}

function showAnotherChanceModal() {
    const modal = document.getElementById('anotherChanceModal');
    if (modal) {
        showModal(modal);
    }
}

function showThanksModal() {
    const modal = document.getElementById('thanksModal');
    if (modal) {
        showModal(modal);

        // Trigger confetti
        triggerConfetti();
    }
}

function showModal(modal) {
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function hideModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => hideModal(modal));
}

// Confetti animation
function triggerConfetti() {
    console.log('Triggering confetti animation');

    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const confetti = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];

    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = confetti.length - 1; i >= 0; i--) {
            const piece = confetti[i];

            // Update position
            piece.x += piece.vx;
            piece.y += piece.vy;
            piece.rotation += piece.rotationSpeed;

            // Apply gravity
            piece.vy += 0.1;

            // Draw confetti piece
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate(piece.rotation * Math.PI / 180);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
            ctx.restore();

            // Remove if off screen
            if (piece.y > canvas.height + 10) {
                confetti.splice(i, 1);
            }
        }

        if (confetti.length > 0) {
            requestAnimationFrame(animateConfetti);
        }
    }

    animateConfetti();
}

// Canvas resize function
function resizeCanvas() {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
