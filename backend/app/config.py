"""Flask configuration classes for different environments"""
import os
from datetime import timedelta


class Config:
    """Base configuration"""
    # Database
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'change-this-secret-key-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)

    # CORS
    CORS_HEADERS = 'Content-Type'

    # Twilio
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
    TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER', '')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_ECHO = True

    # Use SQLite for local development
    database_url = os.getenv('DATABASE_URL', 'sqlite:///volunsched.db')
    # Support both sqlite and postgresql
    if database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+psycopg2://', 1)
    SQLALCHEMY_DATABASE_URI = database_url


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

    # Must use PostgreSQL in production
    database_url = os.getenv('DATABASE_URL', '')
    # Convert postgresql:// to postgresql+psycopg2://
    if database_url:
        SQLALCHEMY_DATABASE_URI = database_url.replace('postgresql://', 'postgresql+psycopg2://', 1)
    else:
        SQLALCHEMY_DATABASE_URI = ''
