// OCR Text Extractor JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const selectedFile = document.getElementById('selectedFile');
    const fileName = document.getElementById('fileName');
    const extractBtn = document.getElementById('extractBtn');
    const extractBtnText = document.getElementById('extractBtnText');
    const extractBtnLoading = document.getElementById('extractBtnLoading');
    const alertContainer = document.getElementById('alertContainer');
    const resultsSection = document.getElementById('resultsSection');
    const extractedText = document.getElementById('extractedText');
    const copyBtn = document.getElementById('copyBtn');

    let currentFile = null;

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    // Drag and drop handlers
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    // Click to select file
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });

    // Form submission handler
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentFile) {
            showAlert('Please select an image file first.', 'warning');
            return;
        }

        uploadAndExtractText();
    });

    // Copy button handler
    copyBtn.addEventListener('click', function() {
        extractedText.select();
        document.execCommand('copy');
        
        // Provide visual feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i data-feather="check" class="me-1"></i>Copied!';
        copyBtn.classList.remove('btn-outline-secondary');
        copyBtn.classList.add('btn-success');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('btn-success');
            copyBtn.classList.add('btn-outline-secondary');
            feather.replace();
        }, 2000);
    });

    function handleFileSelection(file) {
        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showAlert('Please select a valid image file (PNG, JPG, JPEG, GIF, BMP, TIFF, or WEBP).', 'danger');
            return;
        }

        // Validate file size (16MB)
        const maxSize = 16 * 1024 * 1024;
        if (file.size > maxSize) {
            showAlert('File size must be less than 16MB.', 'danger');
            return;
        }

        currentFile = file;
        fileName.textContent = file.name;
        selectedFile.classList.remove('d-none');
        extractBtn.disabled = false;
        
        // Hide results and alerts
        hideAlert();
        resultsSection.classList.add('d-none');
    }

    function uploadAndExtractText() {
        const formData = new FormData();
        formData.append('file', currentFile);

        // Show loading state
        setLoadingState(true);
        hideAlert();

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            setLoadingState(false);
            
            if (data.success) {
                // Display extracted text
                extractedText.value = data.text;
                resultsSection.classList.remove('d-none');
                resultsSection.classList.add('fade-in');
                
                if (data.message) {
                    showAlert(data.message, 'success');
                }
                
                // Scroll to results
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                showAlert(data.error || 'An error occurred while processing the image.', 'danger');
            }
        })
        .catch(error => {
            setLoadingState(false);
            console.error('Error:', error);
            showAlert('Network error. Please check your connection and try again.', 'danger');
        });
    }

    function setLoadingState(loading) {
        if (loading) {
            extractBtn.disabled = true;
            extractBtnText.classList.add('d-none');
            extractBtnLoading.classList.remove('d-none');
        } else {
            extractBtn.disabled = false;
            extractBtnText.classList.remove('d-none');
            extractBtnLoading.classList.add('d-none');
        }
    }

    function showAlert(message, type) {
        hideAlert();
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i data-feather="${getAlertIcon(type)}" class="me-2"></i>
                ${message}
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.appendChild(alertDiv);
        feather.replace();
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                hideAlert();
            }, 5000);
        }
    }

    function hideAlert() {
        alertContainer.innerHTML = '';
    }

    function getAlertIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'danger': return 'alert-circle';
            case 'warning': return 'alert-triangle';
            case 'info': return 'info';
            default: return 'info';
        }
    }

    // Global function for clearing file selection
    window.clearFile = function() {
        currentFile = null;
        fileInput.value = '';
        selectedFile.classList.add('d-none');
        extractBtn.disabled = true;
        hideAlert();
        resultsSection.classList.add('d-none');
    };
});
