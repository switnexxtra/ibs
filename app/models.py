from datetime import datetime
from extensions import db, login_manager
from flask_login import UserMixin

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    acc_balance = db.Column(db.Float, default=0.0)  # Balance updated from Site_A
    successful_transfer = db.Column(db.Float, default=0.0)  # New field to track withdrawn balance

    def __repr__(self):
        return f'<User {self.username}>'



class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # Either 'bank' or 'crypto'
    recipient_details = db.Column(db.String(255), nullable=False)  # Bank details or crypto wallet address
    transaction_status = db.Column(db.String(20), default='pending')  # Status: 'pending', 'completed', etc.
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='transactions', lazy=True)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Ensure correct table name
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

