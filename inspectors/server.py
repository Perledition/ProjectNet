# DataService
import json
from inspectors.structure_inspection import *
from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


@app.route('/projectInspection', methods=['POST'])
def project_inspection():
    if request.method == 'POST':
        path = request.get_json()['url']
        files = all_files(path)
        data = project_to_data(files)
        data['dependencie'] = identify_connections(data)
        links = dependencie_links(data)
        tree = get_directory_structure(path)
        return jsonify({'connections': links, 'tree': tree})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True, threaded=True)
