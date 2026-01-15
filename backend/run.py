#!/usr/bin/env python
"""Entry point for running the Flask application"""
import os
from app import create_app

# Determine environment
env = os.getenv('FLASK_ENV', 'development')
app = create_app(config_name=env)

if __name__ == '__main__':
    app.run(debug=env == 'development', port=5001, use_reloader=False)
