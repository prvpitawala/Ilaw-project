import hashlib
# from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
#backend
from flask import Flask, request, render_template, jsonify
import google.generativeai as genai
from sentence_transformers import SentenceTransformer, CrossEncoder 
from utill import *

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# In-memory document store
# Structure: { collection_name: {doc name: document_content, ...} }
profile_data_store = {"userName": "", "password" : "", "apiKey": ""}
document_store = {}
doc_store = {}
#Structure : {collection_name: embedding,...}
embedding_store = {}

# OpenAI API Key (replace with your actual key)
openai.api_key = "your-api-key"

###############################################################################

def initialize():

    global chat_session
    global embedding_model
    global doc_store
    global embedding_store

    genai.configure(api_key='AIzaSyBfFtmf5-de0x0O3Tibyc4anGaioF4Uqj0')

        # This section for generate Gemini response
    generation_config = {
        "temperature": 0.15, #0.15
        "top_p": 0.6, #0.6
        "top_k": 20, #20
        "max_output_tokens": 1024,
        "response_mime_type": "text/plain",
        }


    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        system_instruction="""

        Act as an AI assistant.
        01. find the answers only in the given context and provide answers base on that.
        02. Provide attractive structured answers
        03. Use colourfull simboles 
        04. If answers not in the context appologice like this 'Sorry. I have no details about that please try again. '
        05. Avoid to tell user giving answer based on a context""" 
        )
    
    chat_session = model.start_chat()
    print("\n")
    print("Step_1 : Gemini setup completed. \n")

    embedding_model = SentenceTransformer('./models/embedding_models/all-MiniLM-L12-v2')
    print("Step_2 : Embedding model load completed. \n")

        # extract the documents from zip file.
    file_path = './files'
    text_files_list = read_text_files_from_directory(file_path)
    print("Step_3 : Document extracted completed. \n")


    # add the text files into document list
    for subdir in text_files_list.keys():
        doc_store[subdir] = []
        for idx, content in enumerate(text_files_list[subdir]):
            doc_store[subdir].append(content)


    # length of the document
    print(f"Step_4 : Available documents count : {len(doc_store)} \n")

    for subdir in text_files_list.keys():    
        # Build the index using the document list
        index = build_index(doc_store[subdir], embedding_model)
        embedding_store[subdir] = index
        print(f"Step_5 :{subdir} Document indexing completed. \n")

    print("Step_6 : All the components are initialized\n")



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

    initialize()

    return jsonify({"message": f"Uploaded {userName}'s details"}), 200

# Get Profile Endpoint
@app.route("/get/profile", methods=["POST"])
def get_profile_document():
    return jsonify({"message": {"userName":profile_data_store["userName"],"apiKey":profile_data_store['apiKey']}}), 200

# Get Profile Name Endpoint
@app.route("/get/profile/name", methods=["POST"])
def get_profile_name():
    return jsonify({"message": {"userName":profile_data_store["userName"]}}), 200

# Check Password Endpoint
@app.route('/check/password', methods=['POST'])
def check_password():
    try:
        data = request.get_json()  # Get JSON data from request
        password = data.get("password")  # Extract password

        if not password:
            return jsonify({"success": False, "message": "Password is required"}), 400

        if hash_password(password) == profile_data_store['password']:
            return jsonify({"success": True, "message": "Password is correct"}), 200
        else:
            return jsonify({"success": False, "message": "Incorrect password"}), 401

    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500


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


def get_response(quary, collection):
    # Extract the user's message
    user_message = quary

    # Print the user's message to the console
    print("----------------")
    print(f"User message: {user_message}")
    print("----------------\n")


    # Here you can integrate your chatbot logic
    if user_message:

        # Retrive relevent documents 
        print("----------------")
        retrived_doc_list = retrieve_documents(user_message, embedding_store[collection], embedding_model, doc_store[collection],  2)
        
        # Print retrived documents.
        print("Retrived documents :")
        for doc in retrived_doc_list:
            print("-"*10)
            print(doc)
            print("-"*10)
        print("----------------")


        # Get the final response
        Prompt_for_llm = f'<context>\n\n{retrived_doc_list[0]}\n\n</context>\n\n' + "User message : " + user_message
     
        print("\nThis is the prompt for LLM :")
        print("----------------")
        print(Prompt_for_llm)
        print("----------------\n\n")

        # Get the llm response
        final_response =  chat_session.send_message(Prompt_for_llm)
        bot_response = final_response.text

        print("This is the LLM response :")
        print("----------------")
        print(bot_response)
        print("----------------")

        #bot_response = convert_to_list_items(bot_response) 
        bot_response = format_text(bot_response)
        
        print("##"*40)
    # Return the response as JSON
    return bot_response


# Query Endpoint
@app.route("/query", methods=["POST"])
def query():
    data = request.json
    query_text = data.get("query")
    collection = data.get("collection")  # Default collection
    if not query_text:
        return jsonify({"error": "Query is required"}), 123

    response = get_response(quary=query_text,collection=collection)

    return jsonify({"response": response}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
