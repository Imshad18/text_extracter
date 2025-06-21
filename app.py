import os
import logging
from flask import Flask, request, render_template, jsonify, flash, redirect, url_for
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
import pytesseract
from PIL import Image, ImageEnhance
import tempfile
import traceback

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "fallback_secret_key_for_dev")

# Configuration
UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_path):
    """Preprocess image for better OCR results."""
    try:
        # Open the image
        image = Image.open(image_path)
        
        # Convert to RGB if necessary (for compatibility)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to grayscale
        image = image.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        
        # Save preprocessed image to temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
        image.save(temp_file.name, 'PNG')
        temp_file.close()
        
        return temp_file.name
    except Exception as e:
        logging.error(f"Error preprocessing image: {str(e)}")
        raise

def extract_text_from_image(image_path):
    """Extract text from image using pytesseract."""
    try:
        # Preprocess the image
        preprocessed_path = preprocess_image(image_path)
        
        # Extract text using pytesseract
        text = pytesseract.image_to_string(preprocessed_path)
        
        # Clean up temporary file
        os.unlink(preprocessed_path)
        
        return text.strip()
    except Exception as e:
        logging.error(f"Error extracting text: {str(e)}")
        raise

@app.route('/')
def index():
    """Main page with upload form."""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and OCR processing."""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        
        # Check if file was actually selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported. Please upload PNG, JPG, JPEG, GIF, BMP, TIFF, or WEBP files.'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Extract text from image
            extracted_text = extract_text_from_image(filepath)
            
            # Clean up uploaded file
            os.unlink(filepath)
            
            if not extracted_text:
                return jsonify({
                    'success': True,
                    'text': '',
                    'message': 'No text was detected in the image. Please try with a clearer image containing text.'
                })
            
            return jsonify({
                'success': True,
                'text': extracted_text,
                'message': 'Text extracted successfully!'
            })
            
        except Exception as e:
            # Clean up uploaded file on error
            if os.path.exists(filepath):
                os.unlink(filepath)
            
            logging.error(f"OCR processing error: {str(e)}")
            logging.error(traceback.format_exc())
            return jsonify({'error': 'Failed to process image. Please try with a different image.'}), 500
            
    except RequestEntityTooLarge:
        return jsonify({'error': 'File too large. Please upload an image smaller than 16MB.'}), 413
    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({'error': 'An unexpected error occurred. Please try again.'}), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    return jsonify({'error': 'File too large. Please upload an image smaller than 16MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors."""
    logging.error(f"Internal server error: {str(e)}")
    return jsonify({'error': 'Internal server error. Please try again.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
