import subprocess
import os
from flask import Flask, request, Response, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def stream_rsync(src, dst):
    if not os.path.isabs(src) or not os.path.isabs(dst):
        yield "Error: Source and destination must be absolute paths.\n"
        return
    if not os.path.exists(src):
        yield f"Error: Source directory '{src}' does not exist.\n"
        return
    dst_parent = os.path.dirname(dst)
    if not os.path.exists(dst_parent):
        yield f"Error: Parent directory of destination '{dst_parent}' does not exist.\n"
        return

    cmd = ["rsync", "-aHAXxh", "--progress", "--stats", src + "/", dst + "/"]
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    for line in process.stdout:
        yield line
    process.wait()
    yield f"\n--- Exit code: {process.returncode} ---\n"

@app.route('/api/rsync', methods=['POST'])
def rsync_endpoint():
    data = request.get_json()
    src = data.get('src')
    dst = data.get('dst')
    if not src or not dst:
        return jsonify({'error': 'source and destination required'}), 400
    return Response(stream_rsync(src, dst), mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
