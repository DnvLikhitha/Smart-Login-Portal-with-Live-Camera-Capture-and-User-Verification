// DOM Elements
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const capturedImage = document.getElementById('capturedImage');
const imagePreview = document.getElementById('imagePreview');
const acceptBtn = document.getElementById('acceptBtn');
const retakeBtn = document.getElementById('retakeBtn');
const message = document.getElementById('message');

let stream = null;
let capturedImageData = null;

// Initialize camera
async function initializeCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      } 
    });
    video.srcObject = stream;
    
    // Show success message
    showMessage('Camera initialized successfully!', 'success');
  } catch (error) {
    console.error('Error accessing camera:', error);
    showMessage('Error accessing camera. Please check permissions.', 'error');
  }
}

// Show message with animation
function showMessage(text, type = 'success') {
  message.textContent = text;
  message.className = `success-message ${type}`;
  message.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    message.style.display = 'none';
  }, 3000);
}

// Capture image
captureBtn.addEventListener('click', () => {
  if (!stream) {
    showMessage('Camera not available. Please refresh the page.', 'error');
    return;
  }
  
  try {
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Get image data with compression (0.8 quality to reduce size)
    capturedImageData = canvas.toDataURL('image/jpeg', 0.8);
    capturedImage.src = capturedImageData;
    
    // Show preview section with animation
    imagePreview.style.display = 'block';
    imagePreview.style.opacity = '0';
    imagePreview.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      imagePreview.style.opacity = '1';
      imagePreview.style.transform = 'translateX(0)';
    }, 100);
    
    showMessage('Image captured! Review and accept or retake.', 'success');
  } catch (error) {
    console.error('Error capturing image:', error);
    showMessage('Error capturing image. Please try again.', 'error');
  }
});

// Accept and save image
acceptBtn.addEventListener('click', async () => {
  if (!capturedImageData) {
    showMessage('No image captured. Please capture an image first.', 'error');
    return;
  }
  
  try {
    console.log('Starting image upload...');
    console.log('Image data length:', capturedImageData.length);
    
    // Show loading state
    acceptBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    acceptBtn.disabled = true;
    
    // Try to compress image further if it's too large
    let imageToSend = capturedImageData;
    if (capturedImageData.length > 5000000) { // If larger than 5MB
      console.log('Image too large, compressing further...');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        // Reduce canvas size
        const maxSize = 800;
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress with lower quality
        imageToSend = canvas.toDataURL('image/jpeg', 0.6);
        await sendImageToServer(imageToSend);
      };
      
      img.src = capturedImageData;
      return;
    }
    
    await sendImageToServer(imageToSend);
    
  } catch (error) {
    console.error('Error saving image:', error);
    
    // Show more specific error message
    let errorMessage = 'Error saving image. Please try again.';
    if (error.message.includes('Server error:')) {
      errorMessage = error.message.replace('Server error: ', '');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    showMessage(errorMessage, 'error');
    acceptBtn.innerHTML = '<i class="fas fa-check"></i> Accept & Save';
    acceptBtn.disabled = false;
  }
});

// Helper function to send image to server
async function sendImageToServer(imageData) {
  console.log('Sending request to /upload_image...');
  const response = await fetch('/upload_image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'image=' + encodeURIComponent(imageData)
  });
  
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  
  const result = await response.json();
  console.log('Response data:', result);
  
  if (result.status === 'success') {
    showMessage('✅ Image saved successfully! Your face data is now stored securely.', 'success');
    
    // Reset form after successful save
    setTimeout(() => {
      imagePreview.style.display = 'none';
      capturedImageData = null;
      acceptBtn.innerHTML = '<i class="fas fa-check"></i> Accept & Save';
      acceptBtn.disabled = false;
    }, 2000);
  } else {
    const errorMsg = result.message || 'Unknown server error';
    throw new Error('Server error: ' + errorMsg);
  }
}

// Retake photo
retakeBtn.addEventListener('click', () => {
  imagePreview.style.display = 'none';
  capturedImageData = null;
  showMessage('Ready to capture new image!', 'success');
});

// Handle page visibility change (pause/resume camera)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause camera when tab is not visible
    if (video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => track.enabled = false);
    }
  } else {
    // Resume camera when tab becomes visible
    if (video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => track.enabled = true);
    }
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  }
});

// Initialize camera when page loads
document.addEventListener('DOMContentLoaded', initializeCamera);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.target.matches('input, textarea')) {
    e.preventDefault();
    if (imagePreview.style.display === 'none') {
      captureBtn.click();
    }
  }
});
