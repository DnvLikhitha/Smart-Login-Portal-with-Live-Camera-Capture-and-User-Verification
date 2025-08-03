from flask import Flask, render_template, request, redirect, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import cv2
import os
import base64
from datetime import datetime
from db_setup import get_db_connection

app = Flask(__name__)
app.secret_key = 'supersecretkey'

# Increase maximum request size to handle large image uploads (50MB)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

UPLOAD_FOLDER = 'captured_images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, password FROM users WHERE username=%s', (username,))
        user = cur.fetchone()
        conn.close()
        if user and check_password_hash(user[1], password):
            session['user_id'] = user[0]
            session['username'] = username
            return redirect('/camera')
        else:
            return 'Invalid credentials'
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_pw = generate_password_hash(password)

        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute('INSERT INTO users (username, password) VALUES (%s, %s)', (username, hashed_pw))
            conn.commit()
        except:
            conn.rollback()
            return 'Username already exists'
        finally:
            conn.close()

        return redirect('/')
    return render_template('register.html')

@app.route('/camera')
def camera():
    if 'user_id' not in session:
        return redirect('/')
    return render_template('camera.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/test')
def test():
    return jsonify({
        'status': 'success',
        'message': 'Server is working',
        'upload_folder': UPLOAD_FOLDER,
        'folder_exists': os.path.exists(UPLOAD_FOLDER),
        'session_user_id': session.get('user_id'),
        'session_username': session.get('username')
    })

@app.route('/upload_image', methods=['POST'])
def upload_image():
    print("=== UPLOAD IMAGE REQUEST RECEIVED ===")
    
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Not authenticated'}), 401
    
    try:
        # Check if image data is present
        if 'image' not in request.form:
            return jsonify({'status': 'error', 'message': 'No image data received'}), 400
        
        image_data = request.form['image']
        
        if not image_data.startswith('data:image'):
            return jsonify({'status': 'error', 'message': 'Invalid image format'}), 400
        
        # Extract base64 data
        try:
            image_data = image_data.split(',')[1]
            img_bytes = base64.b64decode(image_data)
        except Exception as e:
            return jsonify({'status': 'error', 'message': 'Invalid image data'}), 400
        
        # Create filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        username = session.get('username', f'user_{session["user_id"]}')
        filename = f"{username}_{timestamp}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Ensure folder exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save the image
        with open(filepath, 'wb') as f:
            f.write(img_bytes)
        
        print(f"Image saved successfully: {filepath}")
        
        return jsonify({
            'status': 'success', 
            'message': 'Image saved successfully',
            'filename': filename
        })
        
    except Exception as e:
        print(f"Error saving image: {e}")
        return jsonify({'status': 'error', 'message': f'Failed to save image: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)