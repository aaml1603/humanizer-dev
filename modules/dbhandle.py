from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
import datetime
from bson import ObjectId

class MongoDB():
  def __init__(self):
      self.client = MongoClient("mongodb+srv://aaml1603:Doral11386.@cluster0.lwei9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
      self.db = self.client["humanize_ai"]
      self.accounts_collection = self.db["accounts"]
      self.activities_collection = self.db["activities"]
      self.bcrypt = Bcrypt()
  
  def check_query(self, query:dict, projection=None):
      return self.accounts_collection.find_one(query, projection)

  def register_account(self, full_name, email, password):
      hashed_password = self.bcrypt.generate_password_hash(password).decode("utf-8")
      
      # Calculate expiration date (1 day from now for free tier)
      expiration_date = datetime.datetime.utcnow() + datetime.timedelta(days=1)
      
      account = {
          "name": full_name,
          "email": email,
          "password": hashed_password,
          "membership": "free",
          "membership_type": "daily",  # Changed from monthly to daily
          "word_limit": 300,  # Changed from 10000 to 300
          "words_used": 0,
          "total_words_humanized": 0,
          "is_admin": False,  # Default to non-admin
          "created_at": datetime.datetime.utcnow(),
          "expiration_date": expiration_date,
          "status": "active"
      }
      check = self.check_query({"email": email}) 
      if check is None:
          self.accounts_collection.insert_one(account)
          return "Account registered successfully.", True
      else:
          return "Email address is already in use.", False
      
  def login_account(self, email, password):
      user = self.check_query({"email": email})  
      if user and self.bcrypt.check_password_hash(user["password"], password):  
          return "Login successful.", True, str(user['_id'])
      return "Invalid email or password.", False, None
  
  def change_password(self, user_id, current_password, new_password):
      """Change user password"""
      user = self.check_query({"_id": ObjectId(user_id)})
      if not user:
          return "User not found.", False
          
      # Verify current password
      if not self.bcrypt.check_password_hash(user["password"], current_password):
          return "Current password is incorrect.", False
          
      # Hash and update new password
      hashed_password = self.bcrypt.generate_password_hash(new_password).decode("utf-8")
      self.accounts_collection.update_one(
          {"_id": ObjectId(user_id)},
          {"$set": {"password": hashed_password}}
      )
      
      return "Password updated successfully.", True
  
  def get_user_info(self, user_id):
      """Get user information including word usage"""
      user = self.check_query({"_id": ObjectId(user_id)})
      if user:
          # Check if membership has expired or daily limit should reset
          self.check_membership_expiration(user_id)
        
          # Get updated user info after potential expiration check
          user = self.check_query({"_id": ObjectId(user_id)})
        
          # Calculate days remaining until expiration
          days_remaining = 0
          if "expiration_date" in user:
              expiration_date = user["expiration_date"]
              if isinstance(expiration_date, str):
                  expiration_date = datetime.datetime.strptime(expiration_date, "%Y-%m-%d")
            
              days_remaining = (expiration_date - datetime.datetime.utcnow()).days
              # For free tier, this will be 0 or 1 since it resets daily
              days_remaining = max(0, days_remaining)
          
          return {
              "name": user.get("name", ""),
              "email": user.get("email", ""),
              "membership": user.get("membership", "free"),
              "membership_type": user.get("membership_type", "monthly"),
              "word_limit": user.get("word_limit", 10000),
              "words_used": user.get("words_used", 0),
              "total_words_humanized": user.get("total_words_humanized", 0),
              "is_admin": user.get("is_admin", False),
              "expiration_date": user.get("expiration_date", datetime.datetime.utcnow() + datetime.timedelta(days=30)).strftime("%Y-%m-%d") if isinstance(user.get("expiration_date"), datetime.datetime) else user.get("expiration_date", ""),
              "days_remaining": days_remaining
          }
      return None
  
  def check_membership_expiration(self, user_id):
      """Check if a user's membership has expired and downgrade if necessary"""
      user = self.check_query({"_id": ObjectId(user_id)})
    
      if not user:
          return False
    
      # For free tier users, check if daily limit should reset
      if user.get("membership", "free") == "free":
          if "expiration_date" in user:
              expiration_date = user["expiration_date"]
            
              # Convert string to datetime if needed
              if isinstance(expiration_date, str):
                  expiration_date = datetime.datetime.strptime(expiration_date, "%Y-%m-%d")
            
              # If daily limit has expired, reset words_used and set new expiration
              if datetime.datetime.utcnow() > expiration_date:
                  self.accounts_collection.update_one(
                      {"_id": ObjectId(user_id)},
                      {"$set": {
                          "words_used": 0,
                          "expiration_date": datetime.datetime.utcnow() + datetime.timedelta(days=1)
                      }}
                  )
                  return True  # Daily limit was reset
          return False
    
      # For paid memberships, check if subscription has expired
      if "expiration_date" in user:
          expiration_date = user["expiration_date"]
        
          # Convert string to datetime if needed
          if isinstance(expiration_date, str):
              expiration_date = datetime.datetime.strptime(expiration_date, "%Y-%m-%d")
        
          # If membership has expired, downgrade to free
          if datetime.datetime.utcnow() > expiration_date:
              self.accounts_collection.update_one(
                  {"_id": ObjectId(user_id)},
                  {"$set": {
                      "membership": "free",
                      "word_limit": 300,
                      # Set new expiration date for free tier (1 day)
                      "expiration_date": datetime.datetime.utcnow() + datetime.timedelta(days=1)
                  }}
              )
              return True  # Membership was expired and user was downgraded
    
      return False  # Membership is still valid
  
  def check_all_expired_memberships(self):
      """Check all users for expired memberships and downgrade as needed"""
      # Find all users with non-free memberships
      users = self.accounts_collection.find({"membership": {"$ne": "free"}})
      
      downgraded_count = 0
      for user in users:
          user_id = str(user["_id"])
          if self.check_membership_expiration(user_id):
              downgraded_count += 1
      
      return downgraded_count
  
  def record_activity(self, user_id, text_length, description="Text humanization"):
      """Record a humanization activity"""
      activity = {
          "user_id": ObjectId(user_id),
          "description": description,
          "word_count": text_length,
          "timestamp": datetime.datetime.utcnow()
      }
      
      # Insert the activity
      self.activities_collection.insert_one(activity)
      
      # Update the user's word usage
      self.accounts_collection.update_one(
          {"_id": ObjectId(user_id)},
          {
              "$inc": {
                  "words_used": text_length,
                  "total_words_humanized": text_length
              }
          }
      )
      
      return True
  
  def reset_monthly_usage(self, user_id=None):
      """Reset monthly word usage for a user or all users"""
      if user_id:
          self.accounts_collection.update_one(
              {"_id": ObjectId(user_id)},
              {"$set": {"words_used": 0}}
          )
      else:
          # Reset for all users
          self.accounts_collection.update_many(
              {},
              {"$set": {"words_used": 0}}
          )
      return True
  
  def get_recent_activities(self, user_id, limit=10):
      """Get recent activities for a user"""
      activities = self.activities_collection.find(
          {"user_id": ObjectId(user_id)}
      ).sort("timestamp", -1).limit(limit)
      
      result = []
      for activity in activities:
          result.append({
              "id": str(activity["_id"]),
              "description": activity["description"],
              "word_count": activity["word_count"],
              "timestamp": activity["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
          })
      
      return result
      
  # Admin functions
  def is_admin(self, user_id):
      """Check if a user is an admin"""
      user = self.check_query({"_id": ObjectId(user_id)})
      
      if not user:
          return False
      
      is_admin_value = user.get("is_admin", False)
      
      # Handle different data types
      if isinstance(is_admin_value, str):
          return is_admin_value.lower() == 'true'
      
      return bool(is_admin_value)
      
  def get_all_users(self):
      """Get all users (admin only)"""
      users = self.accounts_collection.find({})
      
      result = []
      for user in users:
          # Calculate days remaining until expiration
          days_remaining = 0
          if "expiration_date" in user:
              expiration_date = user["expiration_date"]
              if isinstance(expiration_date, str):
                  expiration_date = datetime.datetime.strptime(expiration_date, "%Y-%m-%d")
              
              days_remaining = (expiration_date - datetime.datetime.utcnow()).days
              days_remaining = max(0, days_remaining)  # Ensure non-negative
          
          result.append({
              "id": str(user["_id"]),
              "user_id": str(user["_id"]),
              "user_name": user.get("name", ""),
              "user_email": user.get("email", ""),
              "membership": user.get("membership", "free"),
              "membership_type": user.get("membership_type", "monthly"),
              "word_limit": user.get("word_limit", 10000),
              "words_used": user.get("words_used", 0),
              "total_words_humanized": user.get("total_words_humanized", 0),
              "created_at": user.get("created_at", datetime.datetime.utcnow()).strftime("%Y-%m-%d %H:%M:%S"),
              "expiration_date": user.get("expiration_date", datetime.datetime.utcnow() + datetime.timedelta(days=30)).strftime("%Y-%m-%d") if isinstance(user.get("expiration_date"), datetime.datetime) else user.get("expiration_date", ""),
              "days_remaining": days_remaining,
              "status": user.get("status", "active")
          })
      
      return result
      
  def get_user_by_id(self, user_id):
      """Get a specific user by ID (admin only)"""
      user = self.check_query({"_id": ObjectId(user_id)})
      
      if not user:
          return None
      
      # Calculate days remaining until expiration
      days_remaining = 0
      if "expiration_date" in user:
          expiration_date = user["expiration_date"]
          if isinstance(expiration_date, str):
              expiration_date = datetime.datetime.strptime(expiration_date, "%Y-%m-%d")
          
          days_remaining = (expiration_date - datetime.datetime.utcnow()).days
          days_remaining = max(0, days_remaining)  # Ensure non-negative
          
      return {
          "id": str(user["_id"]),
          "user_id": str(user["_id"]),
          "user_name": user.get("name", ""),
          "user_email": user.get("email", ""),
          "membership": user.get("membership", "free"),
          "membership_type": user.get("membership_type", "monthly"),
          "word_limit": user.get("word_limit", 10000),
          "words_used": user.get("words_used", 0),
          "total_words_humanized": user.get("total_words_humanized", 0),
          "created_at": user.get("created_at", datetime.datetime.utcnow()).strftime("%Y-%m-%d %H:%M:%S"),
          "expiration_date": user.get("expiration_date", datetime.datetime.utcnow() + datetime.timedelta(days=30)).strftime("%Y-%m-%d") if isinstance(user.get("expiration_date"), datetime.datetime) else user.get("expiration_date", ""),
          "days_remaining": days_remaining,
          "status": user.get("status", "active")
      }
      
  def update_subscription(self, user_id, membership, membership_type=None, word_limit=None, status=None, reset_usage=False):
      """Update a user's subscription (admin only)"""
      update_data = {"membership": membership}
      
      if membership_type is not None:
          update_data["membership_type"] = membership_type
          
          # Calculate new expiration date based on membership type
          now = datetime.datetime.utcnow()
          if membership_type == "monthly":
              update_data["expiration_date"] = now + datetime.timedelta(days=30)
          elif membership_type == "yearly":
              update_data["expiration_date"] = now + datetime.timedelta(days=365)
      
      if word_limit is not None:
          update_data["word_limit"] = word_limit
          
      if status is not None:
          update_data["status"] = status
          
      # Update the user's subscription
      self.accounts_collection.update_one(
          {"_id": ObjectId(user_id)},
          {"$set": update_data}
      )
      
      # Reset usage if requested
      if reset_usage:
          self.reset_monthly_usage(user_id)
          
      return True

  def get_api_call_stats(self, days=7):
    """
    Get API call statistics for the specified number of days
    """
    try:
        # Calculate the date range
        end_date = datetime.datetime.now()
        start_date = end_date - datetime.timedelta(days=days)
        
        # Aggregate API calls by date
        pipeline = [
            {
                "$match": {
                    "timestamp": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id": 1}
            }
        ]
        
        result = list(self.db.api_calls.aggregate(pipeline))
        
        # Format the result
        stats = []
        for item in result:
            stats.append({
                "date": item["_id"],
                "count": item["count"]
            })
        
        # Fill in missing dates with zero counts
        date_range = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            date_range.append(date_str)
            current_date += datetime.timedelta(days=1)
        
        # Create a map of existing dates
        existing_dates = {item["date"]: item["count"] for item in stats}
        
        # Create the final result with all dates
        final_stats = []
        for date_str in date_range:
            final_stats.append({
                "date": date_str,
                "count": existing_dates.get(date_str, 0)
            })
        
        return final_stats
    except Exception as e:
        print(f"Error getting API call stats: {str(e)}")
        return []

