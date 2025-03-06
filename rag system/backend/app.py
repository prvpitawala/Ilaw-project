import hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# In-memory document store
# Structure: { collection_name: {doc name: document_content, ...} }
profile_data_store = {"userName": "", "password" : "", "apiKey": ""}
document_store = {}

# OpenAI API Key (replace with your actual key)
openai.api_key = "your-api-key"

# Function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# register Profile Endpoint    
@app.route("/register", methods=["POST"])
def upload_profile_document():
    userName = request.form.get("userName")
    password = request.form.get("password")
    apiKey = request.form.get("apiKey")

    if not(userName and password and apiKey):
        return jsonify({"error": "name and password and apikey are required"}), 400
    
    # if not userName or not password or not apiKey:
    #     return jsonify({"error": "Username and password and api key are required"}), 400


    profile_data_store["userName"] = userName
    profile_data_store["password"] = hash_password(password)
    profile_data_store["apiKey"] = apiKey

    return jsonify({"message": f"Uploaded {userName}'s details"}), 200

# Get Profile Endpoint
@app.route("/get/profile", methods=["POST"])
def get_profile_document():
    return jsonify({"message": {"userName":profile_data_store["userName"],"apiKey":profile_data_store['apiKey']}}), 200

# Upload Document Endpoint
@app.route("/upload/doc", methods=["POST"])
def upload_document():
    file = request.files.get("file")
    fileName = request.form.get("fileName")
    collection = request.form.get("collection")
    print("uplord cofddsfojsnfsdjnff")
    if not file or not collection:
        return jsonify({"error": "File and collection are required"}), 400

    try:
        content = file.read().decode("utf-8")
    except Exception as e:
        return jsonify({"error": f"Could not decode file: {e}"}), 400
    
    # Add document to the specified collection in our dict
    if collection not in document_store.keys():
        document_store[collection] = dict({})
    document_store[collection][fileName] = content

    return jsonify({"message": f"Uploaded {fileName} to {collection} to {document_store[collection][fileName]}"}), 200

# Get Document Endpoint
@app.route("/get/doc", methods=["POST"])
def get_document():
    collection = request.form.get("collection")
    fileName = request.form.get("fileName")
    
    if collection not in document_store.keys():
        return jsonify({"error": "collection not found"}), 400
    elif fileName not in document_store[collection].keys():
        return jsonify({"error": "file not found in this collection"}), 400

    try:
        content = document_store[collection][fileName]
    except Exception as e:
        return jsonify({"error": f"Could not get content in this file: {e}"}), 400

    return jsonify({"message": f"filename:{fileName}, collection :{collection},content :{content}"}), 200

# Get Document Collections Endpoint
@app.route("/get/document/collections", methods=["POST"])
def get_document_collections():
    if not document_store:  # Correctly checks if the dictionary is empty
        return jsonify({"message": []}), 200

    return jsonify({"message": list(document_store.keys())}), 200

# Get File names
@app.route("/get/document/filenames", methods=["POST"])
def get_file_names():
    collection = request.form.get("collection")
    if not document_store:  # Correctly checks if the dictionary is empty
        return jsonify({"message": []}), 200
    if not document_store[collection]:  # Correctly checks if the collection is empty
        return jsonify({"message": []}), 200
    fileNameList = list(document_store[collection].keys())
    print("file name is ",fileNameList)
    return jsonify({"message": fileNameList}), 200

# Get Database Endpoint
@app.route("/get/database", methods=["POST"])
def get_database():
    return jsonify({"message": f"""profile : name = {profile_data_store['userName']}
                    password = {profile_data_store['password']}
                    api key = {profile_data_store['apiKey']} 
                    document : collections {[i for i in document_store.keys()]}
                    {[f"collection : {i}, fils : {[f"name: {j},  content : {document_store[i][j]} " for j in document_store[i].keys()]}" for i in document_store.keys()]}"""}), 200


# Query Endpoint
@app.route("/query", methods=["POST"])
def query():
    data = request.json
    query_text = data.get("query")
    collection = data.get("collection", "general")  # Default collection
    if not query_text:
        return jsonify({"error": "Query is required"}), 123

    # Retrieve documents from the specified collection
    docs = document_store.get(collection, [])
    if not docs:
        return jsonify({"error": f"No documents found in collection '{collection}'"}), 404

    # For demonstration, we'll simply pass all documents to the LLM
    # In a real scenario, you might add logic to select relevant docs.
    # response = openai.ChatCompletion.create(
    #     model="gpt-4",
    #     messages=[{
    #         "role": "system",
    #         "content": f"Query: {query_text}\nDocuments: {docs}"
    #     }]
    # )
    response = {"choices":[{"message":{"content":"halooo oyata kooomadaaa"}}]}

    return jsonify({"response": response["choices"][0]["message"]["content"]}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
