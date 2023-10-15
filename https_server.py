import http.server
import ssl

httpd = http.server.HTTPServer(('localhost', 8100), http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,
                               keyfile="server.key", 
                               certfile="server.crt", server_side=True)

print("Serving HTTPS on port 8100... https://localhost:8100")
httpd.serve_forever()
