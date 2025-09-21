Age-I: AI-Powered Age Predictor 📸
An intelligent web application that estimates a person's age from a photograph using a powerful dual-model deep learning system.

Age-I leverages deep learning to predict age from an image. It features a sophisticated backend built with TensorFlow and Keras, served via a high-performance FastAPI server, and a clean, intuitive frontend for a seamless user experience.

Check out the live demo: age-prediction-api-i9jh.onrender.com

✨ Features
🧠 Dual-Model AI Engine: Utilizes a generalist model for broad age ranges and a specialist model fine-tuned for more precise predictions on younger faces.

⚡ High-Performance Backend: Built with FastAPI, ensuring asynchronous, fast, and scalable API performance.

✨ Sleek & Simple UI: An intuitive interface that allows users to upload an image and receive an age prediction instantly.

🚀 Ready for Deployment: The application is container-ready and configured for easy deployment on platforms like Render.

🛠️ Tech Stack
.Backend: FastAPI, Uvicorn

.Machine Learning: TensorFlow, Keras

.Data Processing: NumPy, Pillow

.Frontend: HTML, CSS, JavaScript

🚀 Getting Started Locally
Follow these steps to set up and run the project on your local machine.

1. Clone the Repository

git clone https://github.com/Rennetmathew/age-prediction-model-.git
cd age-prediction-model-
2. Set Up a Virtual Environment
It's recommended to use a virtual environment to manage dependencies.

# Create the environment
python -m venv .venv

# Activate the environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate
3. Install Dependencies

pip install -r requirements.txt
4. Download the Models
This project requires two pre-trained model files. Ensure you have best_generalist_model.h5 and best_specialist_model.h5 placed inside the models/ directory.

5. Launch the Application
Shell

uvicorn app:app --reload
The application will be running and available at http://127.0.0.1:8000.

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. We welcome any efforts to improve Age-I's accuracy, performance, and features.

How You Can Help
1) Improve the Dataset: We cannot accept direct image submissions for privacy reasons. However, you can suggest open-source, ethically-sourced datasets suitable for retraining the models by opening a GitHub Issue.

2) Enhance the Model Architecture: If you're skilled in deep learning, you can help by:

Experimenting with architectures like EfficientNet or MobileNet.

Fine-tuning hyperparameters or applying advanced data augmentation.

Proposing and building entirely new model structures.

3) Submit a New, Better Model: If you train a model that outperforms our current ones, we'd love to see it! Please ensure it is in .h5 format, compatible with the existing preprocessing pipeline, and include evidence of its improved performance.

Submitting Your Contribution
1) Fork the Repository to create your own copy.

2) Create a new branch for your feature or fix (git checkout -b feature/your-amazing-feature).

3) Make your changes and commit them with a clear, descriptive message (git commit -m "feat: Introduce new EfficientNet model for improved accuracy").

4) Push to your forked repository (git push origin feature/your-amazing-feature).

5) Open a Pull Request back to our main repository. Please provide a clear title and a detailed description of your changes.

Your PR will be reviewed, and we'll collaborate with you to get it merged. Thank you for helping make Age-I better!

📜 License
This project is licensed under the MIT License. See the LICENSE file for details.