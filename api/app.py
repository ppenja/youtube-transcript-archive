import os
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    
    # Import routes after app is created to avoid circular imports
    from routes import register_routes
    register_routes(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5328))
    app.run(host='0.0.0.0', port=port, debug=True)
