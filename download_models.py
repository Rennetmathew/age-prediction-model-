import os
import requests
from tqdm import tqdm

def download_file(url, filename):
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(filename, 'wb') as f, tqdm(
        desc=filename,
        total=total_size,
        unit='iB',
        unit_scale=True
    ) as pbar:
        for data in response.iter_content(chunk_size=1024):
            size = f.write(data)
            pbar.update(size)

def setup_models():
    os.makedirs('models', exist_ok=True)
    
    # Replace these URLs with your actual model file URLs
    models = {
        'models/best_generalist_model.h5': 'YOUR_GENERALIST_MODEL_URL',
        'models/best_specialist_model.h5': 'YOUR_SPECIALIST_MODEL_URL'
    }
    
    for filename, url in models.items():
        if not os.path.exists(filename):
            print(f"Downloading {filename}...")
            download_file(url, filename)

if __name__ == '__main__':
    setup_models()