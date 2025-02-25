from datetime import datetime
from flask import Blueprint, render_template, request, redirect, session, url_for, flash, jsonify
import requests
from flask_login import login_user, logout_user, login_required, current_user
from models import Notification, Transaction, User
from extensions import db
from config import Config

routes = Blueprint('routes', __name__)

SITE_A_API_URL = "http://127.0.0.1:5000/accounts/api/login"


from flask import request, redirect, url_for

@routes.route('/login', methods=['GET', 'POST'])
def login():
    next_page = request.args.get("next")  # Get 'next' parameter if exists
    
    if request.method == 'POST':
        username_or_email = request.form.get('username')
        password = request.form.get('password')

        try:
            # Send login request to Site_A's API with a timeout
            response = requests.post(SITE_A_API_URL, json={
                "username_or_email": username_or_email,
                "password": password
            }, timeout=10)  # 10 seconds timeout

            data = response.json()  # Parse JSON response

        except requests.exceptions.Timeout:
            flash("Login request timed out. Please refresh and try again.", "error")
            return render_template('login.html')

        except requests.exceptions.ConnectionError:
            flash("Cannot connect to the authentication server. Please refresh and try again later.", "error")
            return render_template('login.html')

        except requests.exceptions.JSONDecodeError:
            flash("Invalid response from the server.", "error")
            return render_template('login.html')

        if response.status_code == 200:
            # Store user info in session
            session["user_id"] = data.get("user_id")
            session["username"] = data.get("username")
            session["auth_token"] = data.get("token")  # Store token if needed
            session["withdrawn_balance"] = "{:,.2f}".format(float(data.get("withdrawn_balance", 0)))
            # Fetch user object from database
            user = User.query.filter_by(id=data.get("user_id")).first()

            if user:
                login_user(user)  # Pass the user object
                flash("Login successful!", "success")
                return redirect(next_page or url_for("routes.dashboard"))
            else:
                flash("User not found in the database.", "error")

        else:
            error = data.get("error", "Invalid credentials")
            flash(f"Login failed: {error}", "error")
            return render_template('login.html')

    return render_template('login.html')


# OperationalError
# sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) SSL connection has been closed unexpectedly

# [SQL: SELECT users.id AS users_id, users.username AS users_username, users.email AS users_email, users.acc_balance AS users_acc_balance 
# FROM users 
# WHERE users.id = %(pk_1)s]
# [parameters: {'pk_1': 1}]
# (Background on this error at: https://sqlalche.me/e/20/e3q8)

# Dashboard
@routes.route('/dashboard')
@login_required
def dashboard():
    if "user_id" not in session:
        flash("You must log in first.", "danger")
        return redirect("/login")

    user_info = {
        "username": session.get("username"),
        "email": session.get("email"),
        "user_id": session.get("user_id"),
        "withdrawn_balance": float(session.get("withdrawn_balance", "0").replace(",", ""))
        # "withdrawn_balance": session.get("withdrawn_balance")  # Include acc_balance
    }

    current_date = datetime.now().strftime("on %d %b %Y")
    
    # Fetch user withdrawal transactions with 'Withdrawal from SSE' as recipient_details
    withdrawal_transactions = Transaction.query.filter_by(
        user_id=current_user.id, recipient_details="Withdrawal from SSE"
    ).all()

    # Calculate total withdrawn amount
    total_withdrawn = sum(t.amount for t in withdrawal_transactions)

    
    if current_user.is_authenticated:
        notifications = Notification.query.filter_by(user_id=current_user.id).all()
    else:
        notifications = []
        
    return render_template("dashboard.html", user=user_info, notifications=notifications,  withdrawals=withdrawal_transactions, total_withdrawn=total_withdrawn, current_date=current_date)


@routes.route("/notifications", methods=["GET"])
def get_notifications():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify([])

    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.timestamp.desc()).all()
    return jsonify([{"message": n.message, "timestamp": n.timestamp.strftime("%d %b %Y %H:%M")} for n in notifications])


# Receive Notification from Site_A
@routes.route('/receive_notification', methods=['POST'])
def receive_notification():
    data = request.get_json()
    message = data.get("message")
    print(f"New notification: {message}")
    return jsonify({"status": "Notification received"})


# Update Balance when Withdrawal is Completed
# @routes.route('/update_balance', methods=['POST'])
# def update_balance():
#     data = request.get_json()
#     username = data.get("username")
#     new_balance = data.get("new_balance")

#     user = User.query.filter_by(username=username).first()
#     if user:
#         user.balance = new_balance
#         db.session.commit()
#         return jsonify({"status": "Balance updated"})
#     return jsonify({"status": "User not found"}), 404


# Logout
@routes.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()  # Clear all session data
    flash("You have been logged out.", "success")
    return redirect('/login')  # Redirect to login page

