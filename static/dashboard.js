// Dashboard functionality
class Dashboard {
  constructor() {
    this.initializeComponents();
    this.loadUserStats();
    this.loadRecentActivity();
    this.startRealTimeUpdates();
  }

  initializeComponents() {
    this.setupEventListeners();
    this.initializeCharts();
    this.setupNotifications();
  }

  setupEventListeners() {
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.handleLogout.bind(this));
    }

    // Profile update
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', this.handleProfileUpdate.bind(this));
    }

    // Security settings
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
      securityForm.addEventListener('submit', this.handleSecurityUpdate.bind(this));
    }
  }

  async loadUserStats() {
    try {
      const response = await fetch('/api/user-stats');
      const stats = await response.json();
      
      this.updateStatsDisplay(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  updateStatsDisplay(stats) {
    const elements = {
      loginCount: document.getElementById('loginCount'),
      lastLogin: document.getElementById('lastLogin'),
      accountAge: document.getElementById('accountAge'),
      securityScore: document.getElementById('securityScore')
    };

    if (elements.loginCount) elements.loginCount.textContent = stats.loginCount || '0';
    if (elements.lastLogin) elements.lastLogin.textContent = stats.lastLogin || 'Never';
    if (elements.accountAge) elements.accountAge.textContent = stats.accountAge || '0 days';
    if (elements.securityScore) elements.securityScore.textContent = stats.securityScore || '85%';
  }

  async loadRecentActivity() {
    try {
      const response = await fetch('/api/recent-activity');
      const activities = await response.json();
      
      this.updateActivityList(activities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  }

  updateActivityList(activities) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    activityList.innerHTML = activities.map(activity => `
      <li class="activity-item">
        <div class="activity-icon">
          <i class="fas ${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
        </div>
      </li>
    `).join('');
  }

  getActivityIcon(type) {
    const icons = {
      login: 'fa-sign-in-alt',
      logout: 'fa-sign-out-alt',
      profile_update: 'fa-user-edit',
      security_change: 'fa-shield-alt',
      password_change: 'fa-key'
    };
    return icons[type] || 'fa-info-circle';
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  }

  initializeCharts() {
    // Simple activity chart using CSS animations
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach((bar, index) => {
      setTimeout(() => {
        bar.style.height = `${Math.random() * 80 + 20}%`;
      }, index * 100);
    });
  }

  setupNotifications() {
    // Check for browser notification support
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }

  showNotification(title, message, type = 'info') {
    // Show in-app notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <div>
        <strong>${title}</strong>
        <p>${message}</p>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/static/favicon.ico'
      });
    }
  }

  async handleLogout(e) {
    e.preventDefault();
    
    try {
      const response = await fetch('/logout', { method: 'POST' });
      if (response.ok) {
        this.showNotification('Logged Out', 'You have been successfully logged out.', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      this.showNotification('Error', 'Failed to logout. Please try again.', 'error');
    }
  }

  async handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div> Updating...</div>';
    submitBtn.disabled = true;

    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        this.showNotification('Profile Updated', 'Your profile has been updated successfully.', 'success');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      this.showNotification('Update Failed', error.message, 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  async handleSecurityUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div> Updating...</div>';
    submitBtn.disabled = true;

    try {
      const response = await fetch('/api/update-security', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        this.showNotification('Security Updated', 'Your security settings have been updated.', 'success');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      this.showNotification('Update Failed', error.message, 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  startRealTimeUpdates() {
    // Update stats every 30 seconds
    setInterval(() => {
      this.loadUserStats();
    }, 30000);

    // Update activity every 60 seconds
    setInterval(() => {
      this.loadRecentActivity();
    }, 60000);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});