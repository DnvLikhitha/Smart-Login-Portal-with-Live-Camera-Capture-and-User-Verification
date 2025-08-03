# Smart Login Portal with Advanced Security Features

A modern, secure web application built with Flask featuring advanced authentication, user management, and security monitoring capabilities. Perfect for demonstrating full-stack development skills and security best practices.

## 🚀 Features

### Authentication & Security
- **Secure User Registration & Login** with password hashing
- **Password Strength Validation** with real-time feedback
- **Session Management** with secure session handling
- **Biometric Authentication Support** (WebAuthn API)
- **Two-Factor Authentication Ready** infrastructure
- **Activity Logging** for security monitoring
- **IP Address Tracking** and session management

### User Experience
- **Modern Responsive Design** with glassmorphism effects
- **Interactive Dashboard** with real-time statistics
- **User Profile Management** with update capabilities
- **Activity Timeline** showing recent user actions
- **Security Score Monitoring** 
- **Dark Mode Support** (system preference based)

### Technical Features
- **PostgreSQL Database** with comprehensive schema
- **RESTful API Endpoints** for frontend interactions
- **Error Handling** with custom 404/500 pages
- **Security Headers** and CSRF protection
- **Input Validation** and sanitization
- **Logging System** for debugging and monitoring

## 🛠️ Technology Stack

- **Backend**: Python Flask 2.3.3
- **Database**: PostgreSQL with psycopg2
- **Frontend**: HTML5, CSS3 (Modern CSS Grid/Flexbox), Vanilla JavaScript
- **Security**: Werkzeug password hashing, secure sessions
- **Styling**: Custom CSS with CSS variables, animations, and responsive design
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Inter font family for modern typography

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Modern web browser with JavaScript enabled

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-login-portal
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb face_login
   
   # Run schema setup
   psql -d face_login -f db/schema.sql
   ```

4. **Configure database connection**
   Update `db_setup.py` with your PostgreSQL credentials:
   ```python
   conn = psycopg2.connect(
       dbname="face_login",
       user="your_username",
       password="your_password",
       host="localhost",
       port="5432"
   )
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## 🏗️ Project Structure

```
smart-login-portal/
├── app.py                 # Main Flask application
├── db_setup.py           # Database connection configuration
├── requirements.txt      # Python dependencies
├── README.md            # Project documentation
├── db/
│   └── schema.sql       # Database schema and initial data
├── static/
│   ├── style.css        # Modern CSS with animations
│   ├── auth.js          # Authentication functionality
│   └── dashboard.js     # Dashboard interactions
├── templates/
│   ├── login.html       # Login page with security features
│   ├── register.html    # Registration with validation
│   ├── dashboard.html   # User dashboard
│   ├── 404.html         # Custom 404 error page
│   └── 500.html         # Custom 500 error page
├── logs/                # Activity logs (auto-created)
└── user_data/           # User data storage (auto-created)
```

## 🔐 Security Features

### Password Security
- Minimum 8 characters with complexity requirements
- Real-time strength meter with visual feedback
- Secure hashing using Werkzeug's PBKDF2
- Password confirmation validation

### Session Security
- Secure session configuration with random secret keys
- Session timeout management (24-hour default)
- Session ID regeneration on login
- IP address and user agent tracking

### Activity Monitoring
- Comprehensive logging of user activities
- Failed login attempt tracking
- Security event monitoring
- Real-time activity timeline in dashboard

### Input Validation
- Server-side and client-side validation
- SQL injection prevention
- XSS protection through proper escaping
- CSRF token implementation ready

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following tables:

- **users**: Core user information with security fields
- **user_sessions**: Session management and tracking
- **activity_logs**: User activity monitoring
- **security_events**: Security incident tracking
- **user_preferences**: User customization settings

## 🎨 Design Features

### Modern UI/UX
- Glassmorphism design with backdrop filters
- Smooth animations and micro-interactions
- Responsive design for all device sizes
- Gradient backgrounds with animated shifts
- Interactive hover states and transitions

### Accessibility
- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- High contrast color schemes
- Screen reader friendly

## 🚀 API Endpoints

- `GET /` - Login page
- `POST /` - Process login
- `GET /register` - Registration page
- `POST /register` - Process registration
- `GET /dashboard` - User dashboard
- `GET /logout` - Logout user
- `GET /api/user-stats` - Get user statistics
- `GET /api/recent-activity` - Get recent activity
- `POST /api/update-profile` - Update user profile
- `POST /api/verify-biometric` - Biometric verification
- `GET /system-info` - System information

## 🔮 Future Enhancements

- Email verification system
- Password reset functionality
- OAuth integration (Google, GitHub)
- Advanced biometric authentication
- Real-time notifications
- Admin dashboard
- API rate limiting
- Advanced security analytics

## 🤝 Contributing

This project is designed as a portfolio piece demonstrating modern web development practices. Feel free to fork and enhance!

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

Created as a portfolio project showcasing:
- Full-stack web development skills
- Security best practices implementation
- Modern UI/UX design principles
- Database design and management
- API development and integration
- Responsive web design
- JavaScript ES6+ features
- Python Flask framework expertise

Perfect for demonstrating technical skills to potential employers in the software development field.