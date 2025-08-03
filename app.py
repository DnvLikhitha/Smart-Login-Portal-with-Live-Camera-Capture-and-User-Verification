from flask import Flask, render_template, request, redirect, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import os
import base64
from datetime import datetime, timedelta
from db_setup import get_db_connection
import secrets
import hashlib
import json

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)  # More secure secret key

# Security configurations
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

# Create necessary directories
UPLOAD_FOLDER = 'user_data'
LOGS_FOLDER = 'logs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(LOGS_FOLDER, exist_ok=True)

def log_activity(user_id, activity_type, details=""):
    """Log user activity for security monitoring"""
    timestamp = datetime.now().isoformat()
    log_entry = {
        'timestamp': timestamp,
        'user_id': user_id,
        'activity': activity_type,
        'details': details,
        'ip_address': request.remote_addr,
        'user_agent': request.headers.get('User-Agent', '')
    }
    
    log_file = os.path.join(LOGS_FOLDER, f"activity_{datetime.now().strftime('%Y%m%d')}.log")
    with open(log_file, 'a') as f:
        f.write(json.dumps(log_entry) + '\n')

def get_user_stats(user_id):
    """Get user statistics for dashboard"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get user creation date
    cur.execute('SELECT created_at FROM users WHERE id=%s', (user_id,))
    user_data = cur.fetchone()
    
    if user_data:
        created_at = user_data[0] if user_data[0] else datetime.now()
        account_age = (datetime.now() - created_at).days
    else:
        account_age = 0
    
    conn.close()
    
    return {
        'login_count': session.get('login_count', 1),
        'account_age': account_age,
        'security_score': 85,  # Calculate based on security features enabled
        'last_login': session.get('last_login', 'Today')
    }

@app.route('/', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if not username or not password:
            error = 'Please fill in all fields'
            return render_template('login.html', error=error)
        
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, username, password, created_at, login_count FROM users WHERE username=%s', (username,))
        user = cur.fetchone()
        conn.close()
        
        if user and check_password_hash(user[1], password):
            # Update login count
            conn = get_db_connection()
            cur = conn.cursor()
            new_login_count = (user[4] or 0) + 1
            cur.execute('UPDATE users SET login_count=%s, last_login=%s WHERE id=%s', 
                       (new_login_count, datetime.now(), user[0]))
            conn.commit()
            conn.close()
            
            # Set session data
            session.permanent = True
            session['user_id'] = user[0]
            session['username'] = user[1]
            session['login_count'] = new_login_count
            session['login_time'] = datetime.now().isoformat()
            session['session_id'] = secrets.token_hex(16)
            
            # Log successful login
            log_activity(user[0], 'login', f'Successful login for {username}')
            
            return redirect('/dashboard')
        else:
            error = 'Invalid username or password'
            # Log failed login attempt
            log_activity(0, 'failed_login', f'Failed login attempt for {username}')
    
    return render_template('login.html', error=error)

@app.route('/register', methods=['GET', 'POST'])
def register():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        email = request.form.get('email', '')
        password = request.form['password']
        confirm_password = request.form.get('confirm_password', '')
        
        # Validation
        if not username or not password:
            error = 'Please fill in all required fields'
        elif len(username) < 3:
            error = 'Username must be at least 3 characters long'
        elif len(password) < 8:
            error = 'Password must be at least 8 characters long'
        elif password != confirm_password:
            error = 'Passwords do not match'
        
        if error:
            return render_template('register.html', error=error)
        
        hashed_pw = generate_password_hash(password)

        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute('''INSERT INTO users (username, email, password, created_at, login_count) 
                          VALUES (%s, %s, %s, %s, %s)''', 
                       (username, email, hashed_pw, datetime.now(), 0))
            conn.commit()
            
            # Log successful registration
            cur.execute('SELECT id FROM users WHERE username=%s', (username,))
            user_id = cur.fetchone()[0]
            log_activity(user_id, 'registration', f'New user registered: {username}')
            
        except:
            conn.rollback()
            error = 'Username already exists or registration failed'
            return render_template('register.html', error=error)
        finally:
            conn.close()

        return redirect('/')
    return render_template('register.html', error=error)

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect('/')
    
    user_stats = get_user_stats(session['user_id'])
    
    return render_template('dashboard.html', 
                         username=session.get('username'),
                         current_time=datetime.now().strftime('%B %d, %Y at %I:%M %p'),
                         user_ip=request.remote_addr,
                         session_id=session.get('session_id'),
                         login_time=session.get('login_time'),
                         **user_stats)

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    user_id = session.get('user_id')
    username = session.get('username')
    
    if user_id:
        log_activity(user_id, 'logout', f'User {username} logged out')
    
    session.clear()
    return redirect('/')

# API Routes for enhanced functionality
@app.route('/api/user-stats')
def api_user_stats():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    stats = get_user_stats(session['user_id'])
    return jsonify(stats)

@app.route('/api/recent-activity')
def api_recent_activity():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Mock activity data - in a real app, this would come from the database
    activities = [
        {
            'type': 'login',
            'title': 'Successful Login',
            'timestamp': datetime.now().isoformat()
        },
        {
            'type': 'profile_update',
            'title': 'Profile Updated',
            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat()
        },
        {
            'type': 'security_change',
            'title': 'Security Settings Changed',
            'timestamp': (datetime.now() - timedelta(days=1)).isoformat()
        }
    ]
    
    return jsonify(activities)

@app.route('/api/update-profile', methods=['POST'])
def api_update_profile():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
    
    display_name = request.form.get('display_name')
    email = request.form.get('email')
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('UPDATE users SET email=%s WHERE id=%s', (email, session['user_id']))
        conn.commit()
        conn.close()
        
        log_activity(session['user_id'], 'profile_update', 'Profile information updated')
        
        return jsonify({'success': True, 'message': 'Profile updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to update profile'}), 500

@app.route('/api/verify-biometric', methods=['POST'])
def api_verify_biometric():
    # Mock biometric verification - in a real app, this would verify the credential
    credential_id = request.json.get('credential')
    
    if credential_id:
        # In a real implementation, verify the credential against stored biometric data
        return jsonify({'success': True, 'message': 'Biometric authentication successful'})
    else:
        return jsonify({'success': False, 'message': 'Invalid biometric credential'}), 400

@app.route('/system-info')
def system_info():
    """System information endpoint for debugging"""
    return jsonify({
        'status': 'success',
        'message': 'Smart Login Portal is running',
        'version': '2.0.0',
        'features': [
            'Enhanced Security',
            'Activity Monitoring', 
            'User Dashboard',
            'Biometric Support',
            'Real-time Updates'
        ],
        'upload_folder': UPLOAD_FOLDER,
        'folder_exists': os.path.exists(UPLOAD_FOLDER),
        'session_user_id': session.get('user_id'),
        'session_username': session.get('username'),
        'timestamp': datetime.now().isoformat()
    })

# Legacy camera route (redirects to dashboard)
@app.route('/camera')
def camera():
    if 'user_id' not in session:
        return redirect('/')
    return redirect('/dashboard')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)