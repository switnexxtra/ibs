# import os

# class Config:
#     SECRET_KEY = 'your_secret_key'
#     SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'  # Change to your preferred DB
#     SQLALCHEMY_TRACK_MODIFICATIONS = False

#     # API endpoint of Site_A
#     SITE_A_API_BASE_URL = "https://site_a.com/api"

import os

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.getenv('POSTGRES_URL', "sqlite:///fallback.db")
    

