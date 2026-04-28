#!/usr/bin/env python3
"""
Local development server for Calendar PWA
Runs on http://localhost:8000
"""

import http.server
import socketserver
import os
import webbrowser
from threading import Timer

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with proper MIME types"""
    
    def end_headers(self):
        # Add headers for PWA
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        http.server.SimpleHTTPRequestHandler.end_headers(self)
    
    def guess_type(self, path):
        """Override to ensure correct MIME types"""
        mimetype = http.server.SimpleHTTPRequestHandler.guess_type(self, path)
        
        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.json'):
            return 'application/json'
        elif path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.html'):
            return 'text/html'
        
        return mimetype

def open_browser():
    """Open browser after a short delay"""
    webbrowser.open(f'http://localhost:{PORT}')

def main():
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create server
    Handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("=" * 60)
        print("🚀 Calendar PWA - Development Server")
        print("=" * 60)
        print(f"\n✓ Server running at: http://localhost:{PORT}")
        print("\nPress Ctrl+C to stop the server\n")
        print("=" * 60)
        
        # Open browser after 1 second
        Timer(1.0, open_browser).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n" + "=" * 60)
            print("Server stopped.")
            print("=" * 60)
            httpd.shutdown()

if __name__ == "__main__":
    main()
