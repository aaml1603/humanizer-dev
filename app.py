from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
import datetime
import functools
from modules import dbhandle 
from bson import ObjectId
import openai
import os
import threading
import time

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}})
Bcrypt = Bcrypt(app)

app.config['JWT_SECRET_KEY'] = 'jdksahjdklasjkdaskjdasjkhdkjash'  # Change this to a strong secret key
jwt = JWTManager(app)

db = dbhandle.MongoDB()

# Get OpenAI API key from environment variable
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', 'your-default-key-here')

def auth_middleware(fn):
    @functools.wraps(fn)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        g.user_id = get_jwt_identity()  # Store user_id in Flask global context
        return fn(*args, **kwargs)
    return decorated_function

def admin_middleware(fn):
    @functools.wraps(fn)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        g.user_id = user_id
        
        # Get the JWT claims
        claims = get_jwt()
        print(f"JWT claims for user {user_id}: {claims}")  # Debug print
        
        is_admin = claims.get("is_admin", False)
        
        # If not in claims, check from database
        if not is_admin:
            is_admin = db.is_admin(user_id)
            print(f"Database admin check for user {user_id}: {is_admin}")  # Debug print
        
        if not is_admin:
            return jsonify({"message": "Access denied. Admin privileges required."}), 403
            
        return fn(*args, **kwargs)
    return decorated_function

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    full_name = data.get('full_name')
    email = data.get("email")
    password = data.get("password")

    registration = db.register_account(full_name, email, password)
    if registration[1] == True:
        return jsonify({"message": registration[0]}), 200
    else:
        return jsonify({"message": registration[0]}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    message, success, user_id = db.login_account(email, password)
    if success:
        # Get user info including admin status
        user_info = db.get_user_info(user_id)
        # Include admin status in the JWT claims
        is_admin = user_info.get("is_admin", False)
        
        # Debug print to verify admin status
        print(f"User {user_id} is_admin: {is_admin}, type: {type(is_admin)}")
        
        # Ensure is_admin is a boolean
        if isinstance(is_admin, str):
            is_admin = is_admin.lower() == 'true'
        
        additional_claims = {"is_admin": bool(is_admin)}
        access_token = create_access_token(
            identity=user_id, 
            expires_delta=datetime.timedelta(hours=1),
            additional_claims=additional_claims
        )
        return jsonify({"message": message, "access_token": access_token}), 200
    else:
        return jsonify({"message": message}), 401

@app.route('/get-info', methods=['GET'])
@auth_middleware
def get_info():
    try:
        user_id = g.user_id
        user_data = db.get_user_info(user_id)
        if user_data:
            return jsonify({"user_info": user_data})
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/change-password', methods=['POST'])
@auth_middleware
def change_password():
    try:
        user_id = g.user_id
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({"message": "Current password and new password are required"}), 400
            
        # Check if current password is correct and update to new password
        result, success = db.change_password(user_id, current_password, new_password)
        
        if success:
            return jsonify({"message": result}), 200
        else:
            return jsonify({"message": result}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/humanize', methods=['POST'])
@auth_middleware
def humanize_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        description = data.get('description', 'Text humanization')
        
        # Count words in the text
        word_count = len(text.split())
        
        # Get user info to check word limit
        user_id = g.user_id
        user_info = db.get_user_info(user_id)
        
        # Check if user has enough words remaining
        words_remaining = user_info['word_limit'] - user_info['words_used']
        if word_count > words_remaining:
            return jsonify({
                "error": "Word limit exceeded",
                "message": f"You have {words_remaining} words remaining, but your text contains {word_count} words."
            }), 400
        
        # Set up OpenAI API
        openai.api_key = OPENAI_API_KEY
        
        # The specific prompt for humanization
        prompt = """When it comes to writing content, two factors are crucial, "perplexity" and "burstiness". 
        Perplexity measures the complexity of text. Separately, burstiness compares the variations of sentences. 
        Humans tend to write with greater burstiness, for example, with some longer or complex sentences alongside shorter ones. 
        AI sentences tend to be more uniform. Therefore, when writing the following content, I am going to ask you to create, 
        I need it to have a good amount of perplexity and burstiness. Using the concepts written previously, 
        rewrite this text with a high degree of perplexity and burstiness:

        """ + text
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that humanizes text."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2048,
            temperature=0.7
        )
        
        # Extract the humanized text from the response
        humanized_text = response.choices[0].message.content.strip()
        
        # Record the activity
        db.record_activity(user_id, word_count, description)
        
        return jsonify({
            "humanized_text": humanized_text,
            "word_count": word_count,
            "words_remaining": words_remaining - word_count
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recent-activities', methods=['GET'])
@auth_middleware
def get_recent_activities():
    try:
        user_id = g.user_id
        limit = request.args.get('limit', 10, type=int)
        activities = db.get_recent_activities(user_id, limit)
        
        return jsonify({"activities": activities}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reset-usage', methods=['POST'])
@auth_middleware
def reset_usage():
    try:
        # This would typically be an admin-only endpoint
        # or run as a scheduled task at the beginning of each month
        user_id = g.user_id
        db.reset_monthly_usage(user_id)
        
        return jsonify({"message": "Monthly usage reset successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Admin routes
@app.route('/admin/users', methods=['GET'])
@admin_middleware
def get_all_users():
    try:
        users = db.get_all_users()
        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/users/<user_id>', methods=['GET'])
@admin_middleware
def get_user_by_id(user_id):
    try:
        user = db.get_user_by_id(user_id)
        if user:
            return jsonify({"user": user}), 200
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add the missing endpoint for user activities
@app.route('/admin/users/<user_id>/activities', methods=['GET'])
@admin_middleware
def get_user_activities(user_id):
    try:
        limit = request.args.get('limit', 10, type=int)
        activities = db.get_recent_activities(user_id, limit)
        return jsonify({"activities": activities}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/update-subscription', methods=['POST'])
@admin_middleware
def update_subscription():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        membership = data.get('membership')
        membership_type = data.get('membership_type')
        word_limit = data.get('word_limit')
        status = data.get('status')
        reset_usage = data.get('reset_usage', False)
        
        if not user_id or not membership:
            return jsonify({"message": "User ID and membership are required"}), 400
            
        db.update_subscription(user_id, membership, membership_type, word_limit, status, reset_usage)
        
        return jsonify({"message": "Subscription updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/reset-usage/<user_id>', methods=['POST'])
@admin_middleware
def reset_user_usage(user_id):
    try:
        db.reset_monthly_usage(user_id)
        return jsonify({"message": "User usage reset successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/check-expired-memberships', methods=['POST'])
@admin_middleware
def check_expired_memberships():
    try:
        downgraded_count = db.check_all_expired_memberships()
        return jsonify({
            "message": f"Checked all memberships. {downgraded_count} users were downgraded to free tier."
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add this endpoint to your existing app.py file
@app.route('/api-call-stats', methods=['GET'])
@auth_middleware
def get_api_call_stats():
    try:
        days = request.args.get('days', 7, type=int)
        stats = db.get_api_call_stats(days)
        
        return jsonify({"api_call_stats": stats}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add a global OPTIONS route handler to handle preflight requests for all routes
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 200

# Background task to check for expired memberships
def check_expired_memberships_task():
    while True:
        try:
            print("Checking for expired memberships...")
            downgraded_count = db.check_all_expired_memberships()
            print(f"Checked all memberships. {downgraded_count} users were downgraded to free tier.")
        except Exception as e:
            print(f"Error checking expired memberships: {str(e)}")
        
        # Sleep for 24 hours
        time.sleep(24 * 60 * 60)

if __name__ == '__main__':
    # Start background task for checking expired memberships
    membership_checker = threading.Thread(target=check_expired_memberships_task)
    membership_checker.daemon = True
    membership_checker.start()
    
    app.run(debug=True)

