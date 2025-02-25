import os
from flask import Flask, redirect, render_template, url_for
from config import Config
from extensions import db, login_manager
from routes import routes

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
login_manager.init_app(app)
# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRES_URL', "sqlite:///fallback.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# Security settings
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Configurations (if using instance folder)
app.config.from_pyfile('config.py', silent=True)

# Register routes
app.register_blueprint(routes)

@app.route("/")
def home():
    return render_template("index.html")
    # return redirect(url_for("login"))

@app.route("/login")
def login():
    return render_template("login.html")  # Make sure you have a login.html file in your templates folder

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
