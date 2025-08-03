// Enhanced authentication functionality
class AuthManager {
  constructor() {
    this.initializeAuth();
  }

  initializeAuth() {
    this.setupPasswordStrength();
    this.setupFormValidation();
    this.setupPasswordToggle();
    this.setupRememberMe();
    this.setupBiometricAuth();
  }

  setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.querySelector('.strength-meter');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');

    if (!passwordInput || !strengthMeter) return;

    passwordInput.addEventListener('input', (e) => {
      const password = e.target.value;
      const strength = this.calculatePasswordStrength(password);
      
      this.updateStrengthMeter(strength, strengthFill, strengthText);
    });
  }

  calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 25;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) score += 25;
    else feedback.push('Lowercase letter');

    if (/[A-Z]/.test(password)) score += 25;
    else feedback.push('Uppercase letter');

    if (/[0-9]/.test(password)) score += 25;
    else feedback.push('Number');

    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    else feedback.push('Special character');

    return { score: Math.min(score, 100), feedback };
  }

  updateStrengthMeter(strength, strengthFill, strengthText) {
    const { score, feedback } = strength;
    
    strengthFill.className = 'strength-fill';
    
    if (score < 25) {
      strengthFill.classList.add('strength-weak');
      strengthText.textContent = 'Weak password';
      strengthText.style.color = '#ef4444';
    } else if (score < 50) {
      strengthFill.classList.add('strength-fair');
      strengthText.textContent = 'Fair password';
      strengthText.style.color = '#f59e0b';
    } else if (score < 75) {
      strengthFill.classList.add('strength-good');
      strengthText.textContent = 'Good password';
      strengthText.style.color = '#10b981';
    } else {
      strengthFill.classList.add('strength-strong');
      strengthText.textContent = 'Strong password';
      strengthText.style.color = '#059669';
    }
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });

      // Real-time validation
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          this.validateField(input);
        });
      });
    });
  }

  validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    // Remove existing error styling
    input.classList.remove('error');
    this.removeErrorMessage(input);

    if (input.hasAttribute('required') && !value) {
      isValid = false;
      message = 'This field is required';
    } else if (input.type === 'email' && value && !this.isValidEmail(value)) {
      isValid = false;
      message = 'Please enter a valid email address';
    } else if (input.name === 'password' && value && value.length < 8) {
      isValid = false;
      message = 'Password must be at least 8 characters long';
    } else if (input.name === 'username' && value && value.length < 3) {
      isValid = false;
      message = 'Username must be at least 3 characters long';
    }

    if (!isValid) {
      input.classList.add('error');
      this.showErrorMessage(input, message);
    }

    return isValid;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showErrorMessage(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      animation: slideInDown 0.3s ease;
    `;
    
    input.parentNode.appendChild(errorDiv);
  }

  removeErrorMessage(input) {
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  setupPasswordToggle() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const input = toggle.parentNode.querySelector('input');
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.className = 'fas fa-eye-slash';
        } else {
          input.type = 'password';
          icon.className = 'fas fa-eye';
        }
      });
    });
  }

  setupRememberMe() {
    const rememberCheckbox = document.getElementById('remember');
    const usernameInput = document.querySelector('input[name="username"]');
    
    if (!rememberCheckbox || !usernameInput) return;

    // Load saved username
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      usernameInput.value = savedUsername;
      rememberCheckbox.checked = true;
    }

    // Save username on form submit
    const form = rememberCheckbox.closest('form');
    if (form) {
      form.addEventListener('submit', () => {
        if (rememberCheckbox.checked) {
          localStorage.setItem('rememberedUsername', usernameInput.value);
        } else {
          localStorage.removeItem('rememberedUsername');
        }
      });
    }
  }

  setupBiometricAuth() {
    if (!window.PublicKeyCredential) return;

    const biometricBtn = document.getElementById('biometricLogin');
    if (!biometricBtn) return;

    biometricBtn.addEventListener('click', async () => {
      try {
        await this.authenticateWithBiometrics();
      } catch (error) {
        console.error('Biometric authentication failed:', error);
        this.showAlert('Biometric authentication failed. Please try again.', 'error');
      }
    });
  }

  async authenticateWithBiometrics() {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: { name: "Smart Login Portal" },
        user: {
          id: new Uint8Array(16),
          name: "user@example.com",
          displayName: "User"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        }
      }
    });

    if (credential) {
      // Send credential to server for verification
      const response = await fetch('/api/verify-biometric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credential.id })
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      }
    }
  }

  showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      ${message}
    `;

    document.body.insertBefore(alert, document.body.firstChild);

    setTimeout(() => {
      alert.remove();
    }, 5000);
  }
}

// Initialize authentication manager
document.addEventListener('DOMContentLoaded', () => {
  new AuthManager();
});

// Add CSS for error states
const style = document.createElement('style');
style.textContent = `
  input.error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
    animation: slideInDown 0.3s ease;
  }
`;
document.head.appendChild(style);