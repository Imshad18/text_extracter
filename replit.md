# OCR Text Extractor

## Overview

This is a Flask-based web application that provides Optical Character Recognition (OCR) functionality. Users can upload images through a modern web interface and extract text content using Tesseract OCR. The application features drag-and-drop file upload, image preprocessing for better OCR accuracy, and a responsive Bootstrap-based UI.

## System Architecture

The application follows a simple client-server architecture:

- **Frontend**: Bootstrap-based responsive web interface with JavaScript for interactive features
- **Backend**: Flask web framework serving as the API and template renderer
- **OCR Engine**: Tesseract OCR for text extraction from images
- **File Handling**: Local file system storage for temporary image processing
- **Deployment**: Gunicorn WSGI server with autoscaling capabilities

## Key Components

### Backend Components

1. **Flask Application (`app.py`)**
   - Main application logic and route handlers
   - File upload validation and security
   - Image preprocessing pipeline
   - OCR text extraction using Tesseract

2. **Entry Point (`main.py`)**
   - Application bootstrap and development server configuration

3. **Configuration**
   - Environment-based secret key management
   - File size limits (16MB maximum)
   - Allowed file type restrictions (PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP)

### Frontend Components

1. **HTML Templates (`templates/index.html`)**
   - Bootstrap-based responsive design
   - Dark theme support
   - Drag-and-drop file upload interface

2. **JavaScript (`static/js/script.js`)**
   - File upload handling
   - Drag-and-drop functionality
   - AJAX form submission
   - UI state management

3. **CSS (`static/css/style.css`)**
   - Custom styling for drag-and-drop zones
   - Bootstrap theme customizations

### Image Processing Pipeline

1. **File Validation**
   - File type checking against allowed extensions
   - File size validation (16MB limit)
   - Secure filename handling

2. **Image Preprocessing**
   - RGB conversion for compatibility
   - Grayscale conversion for better OCR accuracy
   - Contrast enhancement (2x enhancement factor)

## Data Flow

1. User uploads image via web interface (drag-and-drop or file picker)
2. Frontend JavaScript validates file and sends AJAX request
3. Flask backend validates file type and size
4. Image is temporarily saved to uploads directory
5. Image preprocessing pipeline enhances image for OCR
6. Tesseract OCR extracts text from processed image
7. Extracted text is returned to frontend
8. Results displayed in web interface with copy functionality

## External Dependencies

### Python Packages
- **Flask 3.1.1**: Web framework for API and templating
- **Werkzeug 3.1.3**: WSGI utilities and security functions
- **Pytesseract 0.3.13**: Python wrapper for Tesseract OCR
- **Pillow (PIL)**: Image processing and manipulation
- **Gunicorn 23.0.0**: Production WSGI server
- **Flask-SQLAlchemy 3.1.1**: Database ORM (configured but not actively used)
- **psycopg2-binary 2.9.10**: PostgreSQL adapter (for future database features)
- **email-validator 2.2.0**: Email validation utilities

### System Dependencies
- **Tesseract OCR**: Core OCR engine for text extraction
- **PostgreSQL**: Database system (available but not currently used)
- **OpenSSL**: Cryptographic library for secure connections

### Frontend Dependencies
- **Bootstrap**: CSS framework for responsive design
- **Feather Icons**: Icon library for UI elements

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

1. **Runtime Environment**: Python 3.11 with Nix package management
2. **Web Server**: Gunicorn with autoscaling deployment target
3. **Port Configuration**: Bound to 0.0.0.0:5000 with port reuse
4. **Development Mode**: Hot reload enabled for development
5. **File Storage**: Local filesystem with uploads directory

### Production Considerations
- Gunicorn provides production-ready WSGI serving
- Autoscale deployment target handles traffic scaling
- File uploads stored temporarily (consider cloud storage for production)
- Environment-based configuration for secrets

## Changelog

- June 21, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.