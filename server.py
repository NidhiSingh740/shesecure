from http.server import SimpleHTTPRequestHandler, HTTPServer
import os
import json
import urllib.parse
import string
import ctypes
# import cgi # Import the cgi module for parsing uploads <-- REMOVED

PORT = 8000
BASE_DIR = os.path.dirname(__file__)

def list_drives():
    """Lists all logical drives on a Windows system (e.g., "C:\\", "D:\\")."""
    drives = []
    bitmask = ctypes.windll.kernel32.GetLogicalDrives()
    for letter in string.ascii_uppercase:
        if bitmask & 1:
            drives.append(f"{letter}:\\")
        bitmask >>= 1
    return drives

def is_hidden_or_system(path):
    """Checks if a file has the HIDDEN or SYSTEM attribute on Windows."""
    try:
        attrs = ctypes.windll.kernel32.GetFileAttributesW(str(path))
        if attrs == -1: # Invalid file handle
            return False
        # FILE_ATTRIBUTE_HIDDEN = 2, FILE_ATTRIBUTE_SYSTEM = 4
        return bool(attrs & 2 or attrs & 4)
    except Exception as e:
        print(f"Error checking attributes for {path}: {e}")
        return False

class FileBrowser(SimpleHTTPRequestHandler):
    """
    HTTP request handler for the file browser API.
    Handles listing drives, listing files, downloading, and uploading.
    """

    def _is_safe_path(self, path, check_exists=True):
        """
        Security check to prevent path traversal attacks.
        Ensures the path is absolute, within a valid drive, and optionally exists.
        """
        try:
            # 1. Get the absolute, normalized path
            abs_path = os.path.abspath(path)
        except Exception:
            return False # Invalid path format (e.g., contains null bytes)

        # 2. Get all valid drive roots (e.g., "C:\\", "D:\\")
        valid_drives = [os.path.abspath(d) for d in list_drives()]

        # 3. Check if the absolute path starts with one of the valid drives
        if not any(abs_path.startswith(drive) for drive in valid_drives):
            return False # Path is not on an allowed drive

        # 4. Optionally, check if the path actually exists
        if check_exists and not os.path.exists(abs_path):
            return False

        return True

    def end_headers(self):
        """Sends CORS headers to allow requests from the React frontend."""
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        return super().end_headers()

    def do_OPTIONS(self):
        """Respond to pre-flight CORS requests."""
        self.send_response(200, "OK")
        self.end_headers()

    def do_GET(self):
        """Handles GET requests for drives, files, and downloads."""
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if parsed.path == '/drives':
            drives = list_drives()
            self._json_response(drives)
            return

        if parsed.path == '/files':
            path = os.path.normpath(params.get('path', [''])[0])

            # Security: Validate path
            if not self._is_safe_path(path, check_exists=True) or not os.path.isdir(path):
                self.send_error(404, "Path not found or is not a directory")
                return

            try:
                dirs = []
                files = []
                for name in os.listdir(path):
                    full_path = os.path.join(path, name)
                    
                    # Skip hidden/system files
                    if is_hidden_or_system(full_path):
                        continue

                    try:
                        # Get file stats
                        is_dir = os.path.isdir(full_path)
                        size = 0
                        if not is_dir:
                            size = os.path.getsize(full_path)
                        
                        item = {"name": name, "is_dir": is_dir, "size": size}
                        
                        if is_dir:
                            dirs.append(item)
                        else:
                            files.append(item)
                    
                    except (FileNotFoundError, PermissionError) as e:
                        # Skip files that are inaccessible or vanish during scan
                        print(f"Skipping {full_path}: {e}")
                        continue
                
                # Sort folders and files alphabetically
                dirs.sort(key=lambda x: x['name'].lower())
                files.sort(key=lambda x: x['name'].lower())
                
                # Combine lists (folders first)
                self._json_response(dirs + files)

            except PermissionError:
                self.send_error(403, "Access denied")
            except Exception as e:
                print(f"Error listing files for {path}: {e}")
                self.send_error(500, "Internal server error")
            return

        if parsed.path == '/download':
            file_path = os.path.normpath(params.get('path', [''])[0])

            # Security: Validate path
            if not self._is_safe_path(file_path, check_exists=True) or not os.path.isfile(file_path):
                self.send_error(404, "File not found")
                return

            try:
                self.send_response(200)
                self.send_header('Content-Type', 'application/octet-stream')
                self.send_header('Content-Disposition',
                                 f'attachment; filename="{os.path.basename(file_path)}"')
                self.end_headers()
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            except PermissionError:
                self.send_error(403, "Access denied")
            except Exception as e:
                print(f"Error downloading {file_path}: {e}")
                self.send_error(500, "Could not read file")
            return

        # Fallback to serving files (if any are in the same directory)
        super().do_GET()

    def do_POST(self):
        """Handles POST requests for file uploads using manual parsing."""
        if self.path != '/upload':
            self.send_error(404, "Not found")
            return

        try:
            content_length = int(self.headers.get('Content-Length', 0))
            content_type = self.headers.get('Content-Type', '')
            
            # 1. Read the raw data
            if not content_type.startswith('multipart/form-data'):
                self.send_error(400, "Bad request: Not multipart/form-data")
                return
                
            boundary = content_type.split('boundary=')[-1].encode()
            data = self.rfile.read(content_length)

            # 2. Split data into parts
            parts = data.split(b'--' + boundary)
            filename, filedata, folderpath = None, None, ''

            # 3. Parse parts
            for part in parts:
                if b'filename="' in part:
                    # This is the file part
                    try:
                        headers, filedata = part.split(b'\r\n\r\n', 1)
                        filedata = filedata.rstrip(b'\r\n--') # Clean trailing boundary chars
                        # Find filename in headers
                        filename_line = [line for line in headers.split(b'\r\n') if b'filename=' in line][0]
                        filename = filename_line.split(b'filename=')[1].split(b'"')[1].decode('utf-8', errors='ignore')
                    except Exception as e:
                        print(f"Error parsing file part: {e}")
                        continue
                elif b'name="path"' in part:
                    # This is the path part
                    try:
                        body = part.split(b'\r\n\r\n', 1)[1].rstrip(b'\r\n--')
                        folderpath = body.decode('utf-8').strip()
                    except Exception as e:
                        print(f"Error parsing path part: {e}")
                        continue

            # 4. Validate and write the file
            if filename and filedata is not None and folderpath:
                target_folder = os.path.normpath(folderpath)

                # Security: Validate upload folder path
                if not self._is_safe_path(target_folder, check_exists=True) or not os.path.isdir(target_folder):
                    self.send_error(403, "Access denied: Invalid upload path")
                    return

                # Sanitize filename and create full destination path
                filename = os.path.basename(filename) # Final sanitization
                target_path = os.path.join(target_folder, filename)

                # Final security check on the *target file path*
                if not self._is_safe_path(target_path, check_exists=False):
                    self.send_error(403, "Access denied: Invalid target file path")
                    return

                # Write the file
                with open(target_path, 'wb') as f:
                    f.write(filedata)
                
                self._text_response("File uploaded successfully")
            else:
                self.send_error(400, "Bad upload request (missing file, filename, or path)")

        except Exception as e:
            print(f"Error during upload: {e}")
            self.send_error(500, f"Error during upload: {e}")

    # --- Helper response methods ---
    def _json_response(self, data):
        """Sends a 200 OK response with JSON data."""
        try:
            body = json.dumps(data).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            print(f"Error sending JSON response: {e}")
            # Try to send an error if headers not already sent
            if not self.headers_sent:
                self.send_error(500, "Error formatting JSON response")

    def _text_response(self, text, code=200):
        """Sends a 200 OK response with plain text."""
        try:
            body = text.encode('utf-8')
            self.send_response(code)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            print(f"Error sending text response: {e}")


if __name__ == "__main__":
    os.chdir(BASE_DIR)
    print(f"✅ File Browser running at http://0.0.0.0:{PORT}")
    print("Serving files from:", BASE_DIR)
    httpd = HTTPServer(("0.0.0.0", PORT), FileBrowser)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()