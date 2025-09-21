Age-I: AI-Powered Age Predictor

Age-I is an AI-powered web application that predicts a person's age from an uploaded photograph. It leverages deep learning models built with TensorFlow and Keras, served via a FastAPI backend, and presented through a clean, user-friendly frontend.

Live Demo: https://age-prediction-api-i9jh.onrender.com

Features

AI-Powered Prediction: Uses a Convolutional Neural Network (CNN) to estimate age accurately.

Dual Model System: Integrates a generalist model for broad age ranges and a specialist model for more precise predictions on younger faces.

FastAPI Backend: High-performance asynchronous API for serving model predictions.

Interactive Frontend: Intuitive interface for uploading images and viewing predictions instantly.

Easy Deployment: Ready for deployment on platforms like Render.

How to Run Locally

Follow these steps to run the project locally:

1. Clone the repository:

git clone https://github.com/Rennetmathew/age-prediction-model-.git
cd age-prediction-model-


2. Create a virtual environment:

python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate


3. Install dependencies:

pip install -r requirements.txt


4. Download the models:
Ensure best_generalist_model.h5 and best_specialist_model.h5 are placed inside the models/ directory.

5. Start the application:

uvicorn app:app --reload


The app will be available at http://127.0.0.1:8000
.

Contributing

We welcome contributions to improve the model’s accuracy and expand the project’s capabilities. Please refer to the CONTRIBUTING.md guide below.

CONTRIBUTING.md
Contributing to Age-I

Thank you for considering contributing to Age-I! We welcome any efforts to improve the model’s accuracy and enhance the project overall. Your contributions are highly valued.

How Can I Contribute?

There are several ways to contribute:

1. Improve the Dataset

The quality of a model depends on the dataset. We cannot accept direct image submissions for privacy reasons, but you can help by suggesting open-source, ethically sourced datasets suitable for retraining the models.

To suggest a dataset: Open a GitHub Issue
 with the dataset link and a brief description of its benefits.

2. Enhance Model Architecture

Experts in deep learning can help by improving the CNN architecture. Possible enhancements include:

Experimenting with architectures like EfficientNet or MobileNet

Fine-tuning hyperparameters

Applying advanced data augmentation techniques

Proposing entirely new model structures

3. Submit a New Model

If you train a model that outperforms the existing ones:

Model format: .h5 (HDF5)

Must be compatible with the preprocessing in app.py

Provide evidence of improved performance (e.g., accuracy on UTKFace or other benchmarks)

Submitting Your Contribution

1. Fork the repository
Click "Fork" on the main repo
 to create your own copy.

2. Create a branch

git checkout -b feature/improve-prediction-accuracy


3. Make your changes
Update code, model architecture, or add a new .h5 model in the models/ folder.

4. Commit and push

git add .
git commit -m "feat: Introduce new EfficientNet model for improved accuracy"
git push origin feature/improve-prediction-accuracy


5. Open a pull request
Provide a clear title and detailed description explaining your improvements. Your PR will be reviewed, and feedback may be requested.

Thank you for helping make Age-I better!