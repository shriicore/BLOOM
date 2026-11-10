import hmac
import hashlib
import json
import base64
import time
from functools import wraps
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db

SECRET_KEY = "bloom-menstrual-health-secret-key-2026"

def create_token(user_id, email, name, expires_in=86400 * 30):
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "exp": int(time.time()) + expires_in
    }
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_token(token):
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        # Pad base64 if needed
        sig_padding = len(sig_b64) % 4
        if sig_padding:
            sig_b64 += "=" * (4 - sig_padding)
        actual_sig = base64.urlsafe_b64decode(sig_b64.encode())
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        
        payload_padding = len(payload_b64) % 4
        if payload_padding:
            payload_b64 += "=" * (4 - payload_padding)
        payload_data = json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())
        if payload_data.get("exp", 0) < time.time():
            return None
        return payload_data
    except Exception:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization token is missing"}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization header format. Expected 'Bearer <token>'"}), 401
        
        token = parts[1]
        decoded = verify_token(token)
        if not decoded:
            return jsonify({"error": "Token is invalid or expired"}), 401
        
        # Verify user exists in database
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email FROM users WHERE id = ?", (decoded["user_id"],))
        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({"error": "User no longer exists"}), 401

        request.current_user = {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
        return f(*args, **kwargs)
    return decorated

