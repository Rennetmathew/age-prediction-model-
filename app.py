# -*- coding: utf-8 -*-
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
import pickle
import os
from PIL import Image
import io
from sklearn.preprocessing import LabelEncoder

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/templates", StaticFiles(directory="templates"), name="templates")

# Define age groups to match training (4 groups)
AGE_GROUPS = {
    'Child': (1, 17),
    'YoungAdult': (18, 35),
    'MiddleAge': (36, 55),
    'Senior': (56, 90)
}

def create_feature_extractor():
    """Create a feature extractor using ResNet50"""
    base_model = tf.keras.applications.ResNet50(
        include_top=False,
        weights='imagenet',
        input_shape=(224, 224, 3),
        pooling='avg'
    )
    
    # Add a dense layer to match the expected dimensions
    inputs = layers.Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    outputs = layers.Dense(2622, activation='relu', name='features')(x)
    
    model = models.Model(inputs=inputs, outputs=outputs)
    return model

# Load models at startup
@app.on_event("startup")
async def load_models():
    global feature_extractor, generalist_model, specialist_model, label_encoder
    
    try:
        print("Loading models...")
        # Create feature extractor model
        feature_extractor = create_feature_extractor()
        feature_extractor.trainable = False
        print("✓ Feature extractor created")
        
        # Load the Generalist model
        generalist_model = tf.keras.models.load_model('models/generalist_model.h5')
        print("✓ Generalist model loaded")
        
        # Load Label Encoder
        with open('models/label_encoder.pkl', 'rb') as f:
            label_encoder = pickle.load(f)
        print("✓ Label encoder loaded")
        
        # Load the Specialist model
        specialist_model = tf.keras.models.load_model('models/specialist_model.h5')
        print("✓ Specialist model loaded")
        
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error loading models: {str(e)}")

def preprocess_image(image_bytes):
    """Preprocess image bytes for ResNet50 input"""
    try:
        # Open image from bytes
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to model's expected size while preserving aspect ratio
        img.thumbnail((224, 224), Image.Resampling.LANCZOS)
        
        # Create a new image with padding to exactly 224x224
        new_img = Image.new('RGB', (224, 224), (0, 0, 0))
        paste_x = (224 - img.width) // 2
        paste_y = (224 - img.height) // 2
        new_img.paste(img, (paste_x, paste_y))
        
        # Convert to array
        img_array = tf.keras.preprocessing.image.img_to_array(new_img)
        img_array = np.expand_dims(img_array, 0)
        
        # Preprocess input for ResNet50
        img_array = tf.keras.applications.resnet50.preprocess_input(img_array)
        
        return img_array
        
    except Exception as e:
        print(f"Error in image preprocessing: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    with open("templates/index.html", encoding='utf-8') as f:
        return HTMLResponse(content=f.read(), status_code=200)

@app.post("/predict-age/")
async def predict_age(image: UploadFile = File(...)):
    """
    Three-step age prediction process:
    1. Extract facial features using VGGFace
    2. Predict age group using Generalist model
    3. Predict precise age using Specialist model
    """
    try:
        # Step 1: Read and preprocess the image
        try:
            contents = await image.read()
            processed_image = preprocess_image(contents)
        except Exception as e:
            print(f"Error preprocessing image: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Image preprocessing error: {str(e)}")
        
        # Step 2: Extract features
        try:
            print("\nExtracting features...")
            features = feature_extractor(processed_image, training=False)
            print(f"Features shape: {features.shape}")
        except Exception as e:
            print(f"Error extracting features: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Feature extraction error: {str(e)}")
        
        # Step 3: Get age group prediction from generalist model
        try:
            print("\nPredicting age group...")
            range_prediction = generalist_model(features, training=False)
            predicted_range_idx = np.argmax(range_prediction[0])
            predicted_range = label_encoder.inverse_transform([predicted_range_idx])[0]
            print(f"Predicted age group: {predicted_range}")
            
            # Get the bounds for predicted age range
            min_age, max_age = AGE_GROUPS[predicted_range]
            print(f"Age range bounds: {min_age}-{max_age}")
        except Exception as e:
            print(f"Error in generalist model prediction: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Age group prediction error: {str(e)}")
        
        # Step 4: Get specific age prediction from specialist model
        try:
            print("\nPredicting specific age...")
            age_group_one_hot = tf.keras.utils.to_categorical([predicted_range_idx], num_classes=len(AGE_GROUPS))
            specialist_inputs = [features, age_group_one_hot]
            age_prediction = specialist_model(specialist_inputs, training=False)
            
            # Get raw prediction and convert to relative position
            raw_output = float(age_prediction[0][0])
            print(f"Raw specialist output: {raw_output}")
            
            # Print age group probabilities
            print("\nAge Group Probabilities:")
            group_probs = []
            for i, prob in enumerate(range_prediction[0]):
                group_name = label_encoder.inverse_transform([i])[0]
                print(f"{group_name}: {prob:.4f}")
                group_probs.append(float(prob))
            
            # Normalize features before prediction
            features = tf.keras.utils.normalize(features, axis=1)
            
            # Calculate predicted age
            # The specialist model outputs a value between 0 and 1
            # representing the position within the age range
            age_range = max_age - min_age
            relative_position = tf.sigmoid(raw_output)  # Ensure output is between 0 and 1
            predicted_age = min_age + (age_range * relative_position)
            predicted_age = round(float(predicted_age))
            predicted_age = np.clip(predicted_age, min_age, max_age)
            
            # Calculate confidence based on generalist model's prediction certainty
            group_confidence = float(tf.reduce_max(tf.nn.softmax(range_prediction[0])))
            relative_pos_in_range = (predicted_age - min_age) / age_range
            
            # Reduce confidence if prediction is near range boundaries
            boundary_distance = min(relative_pos_in_range, 1 - relative_pos_in_range)
            boundary_penalty = max(0.5, boundary_distance * 2)
            
            confidence = float(group_confidence * boundary_penalty * 100)
            confidence = min(95.0, max(10.0, confidence))
            
            print(f"\nPrediction Results:")
            print(f"Age: {predicted_age}")
            print(f"Group: {predicted_range}")
            print(f"Confidence: {confidence:.1f}%")
            
            # Verify outputs are valid
            if np.isnan(predicted_age) or np.isnan(confidence):
                raise ValueError("Prediction resulted in NaN values")
            
            # Return results
            return JSONResponse({
                'age_group': str(predicted_range),
                'predicted_age': int(predicted_age),
                'confidence': float(confidence)
            })
            
        except Exception as e:
            error_msg = str(e)
            if not error_msg:
                error_msg = "Unknown error during prediction"
            print(f"Error in final prediction step: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Age prediction error: {error_msg}")
            
    except HTTPException as he:
        if not he.detail:
            he.detail = "Unknown error occurred"
        raise he
    except Exception as e:
        error_msg = str(e)
        if not error_msg:
            error_msg = "Unexpected error during prediction"
        print(f"Unexpected error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8003)
