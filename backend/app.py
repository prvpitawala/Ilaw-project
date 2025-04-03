import time
t_start = time.time()
import hashlib
from flask_cors import CORS
# import openai
#backend
import os
import shutil
from flask import Flask, request, jsonify
import google.generativeai as genai
from sentence_transformers import SentenceTransformer #, CrossEncoder 
from utill import *
print('library lorded time : ',time.time()-t_start)
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests


# In-memory document store
# Structure: { collection_name: {doc name: document_content, ...} }
profile_data_store = {"userName": "", "password" : "", "apiKey": ""}
document_store = {}
doc_store = {}
#Structure : {collection_name: embedding,...}
embedding_store = {}

###############################################################################

def initialize():

    global chat_session
    global embedding_model
    global doc_store
    global embedding_store

    BASE_SAVE_DIR = r"../files"

    # Create directory if it doesn't exist
    if not os.path.exists(BASE_SAVE_DIR):
        os.makedirs(BASE_SAVE_DIR)

    remove_subdirectories(BASE_SAVE_DIR)

    # genai.configure(api_key='AIzaSyBfFtmf5-de0x0O3Tibyc4anGaioF4Uqj0')
    genai.configure(api_key=profile_data_store['apiKey'])

    print(profile_data_store['apiKey'])
        # This section for generate Gemini response
    generation_config = {
        "temperature": 0, #0.15
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
    1. Don't tell you are giving answers frpm context. 
    1. Find answers only from the provided context.
    3. Need structured answers when neccesory.
    2. Enhance readability with attractive symbols.
    3. Need most explainable answers it is must. 
    4. Keep answers concise and directly address the user's question.
    """
        )
    
    chat_session = model.start_chat()
    print("\n")
    print("Step_1 : Gemini setup completed. \n")


    model_rel_path = r"../models/embedding_models/all-MiniLM-L12-v2"
    embedding_model = SentenceTransformer(model_rel_path)
    print("Step_2 : Embedding model load completed. \n")

    print("Step_3 : All the components are initialized\n")


def fileEmbeddings():
    # extract the documents from zip file.
    BASE_SAVE_DIR = r"../files"
    text_files_list = read_text_files_from_directory(BASE_SAVE_DIR)
    print("Step_1 : Document extracted completed. \n")


    # add the text files into document list
    for subdir in text_files_list.keys():
        doc_store[subdir] = []
        for idx, content in enumerate(text_files_list[subdir]):
            doc_store[subdir].append(content)


    # length of the document
    print(f"Step_2 : Available documents count : {len(doc_store)} \n")

    for subdir in text_files_list.keys():    
        # Build the index using the document list
        index = build_index(doc_store[subdir], embedding_model)
        embedding_store[subdir] = index
        print(f"Step_3 :{subdir} Document indexing completed. \n")


# Function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def remove_subdirectories(parent_folder):
    # Iterate through items in the parent folder
    for item in os.listdir(parent_folder):
        item_path = os.path.join(parent_folder, item)

        # Check if it's a directory (subfolder)
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)  # Remove the entire subdirectory
            print(f"Removed folder: {item_path}")


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


"""# Upload Document Endpoint
@app.route("/upload/doc", methods=["POST"])
def upload_document():
    collection = request.form.get("collection")

    # Ensure collection is provided
    if not collection:
        return jsonify({"error": "Collection is required"}), 400

    # Initialize collection if it doesn't exist
    if collection not in document_store:
        document_store[collection] = {}

    # Get all uploaded files
    uploaded_files = request.files.getlist("files")

    # Ensure at least one file is uploaded
    if not uploaded_files:
        return jsonify({"error": "No files were uploaded"}), 400


    for file in uploaded_files:
        file_name = file.filename
        try:
            # Read file content
            content = file.read()
            
            # Check if it's a text file (attempt UTF-8 decoding)
            try:
                content_str = content.decode("utf-8")  # Text file
            except UnicodeDecodeError:
                content_str = "<Binary File>"  # Mark as binary file

            # Save content in the collection
            document_store[collection][file_name] = content_str

        except Exception as e:
            return jsonify({"error": f"Could not process file {file_name}: {e}"}), 400
        
    return jsonify({"message": f"Uploaded {len(uploaded_files)} files to {collection}"}), 200
"""

@app.route("/upload/doc", methods=["POST"])
def upload_document():
    BASE_SAVE_DIR = r"../files"
    collection = request.form.get("collection")

    # Ensure collection is provided
    if not collection:
        return jsonify({"error": "Collection is required"}), 400

    base_dir = os.path.join(BASE_SAVE_DIR)
    os.makedirs(base_dir,exist_ok=True)

    # Define collection directory
    collection_dir = os.path.join(BASE_SAVE_DIR, collection)

    # Create collection directory if it does not exist
    os.makedirs(collection_dir, exist_ok=True)

    # Get all uploaded files
    uploaded_files = request.files.getlist("files")

    # Ensure at least one file is uploaded
    if not uploaded_files:
        return jsonify({"error": "No files were uploaded"}), 400

    saved_files = []
    for file in uploaded_files:
        file_name = file.filename
        file_path = os.path.join(collection_dir, file_name)

        try:
            # Save file to the collection directory
            file.save(file_path)
            saved_files.append(file_name)
        except Exception as e:
            return jsonify({"error": f"Could not save file {file_name}: {e}"}), 400
        
    fileEmbeddings()

    return jsonify({"message": f"Uploaded {len(saved_files)} files to '{collection}'", "files": saved_files}), 200



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



"""# Get Document Collections Endpoint
@app.route("/get/document/collections", methods=["POST"])
def get_document_collections():
    if not document_store:  # Correctly checks if the dictionary is empty
        return jsonify({"message": []}), 200

    return jsonify({"message": list(document_store.keys())}), 200

"""

# Get Document Collections Endpoint
@app.route("/get/document/collections", methods=["POST"])
def get_document_collections():
    # Ensure the base directory exists
    BASE_SAVE_DIR = r"../files"
    if not os.path.exists(BASE_SAVE_DIR):
        return jsonify({"message": []}), 200

    # Get list of collections (subdirectories inside BASE_SAVE_DIR)
    collections = [name for name in os.listdir(BASE_SAVE_DIR) if os.path.isdir(os.path.join(BASE_SAVE_DIR, name))]

    return jsonify({"message": collections}), 200

# Get File names


"""@app.route("/get/document/filenames", methods=["POST"])
def get_file_names():
    collection = request.form.get("collection")
    if not document_store:  # Correctly checks if the dictionary is empty
        return jsonify({"message": []}), 200
    if not document_store[collection]:  # Correctly checks if the collection is empty
        return jsonify({"message": []}), 200
    fileNameList = list(document_store[collection].keys())
    print("file name is ",fileNameList)
    return jsonify({"message": fileNameList}), 200
"""


@app.route("/get/document/filenames", methods=["POST"])
def get_file_names():
    BASE_SAVE_DIR = r"../files"

    collection = request.form.get("collection")
    
    # Ensure the collection name is provided
    if not collection:
        return jsonify({"error": "Collection name is required"}), 400

    collection_path = os.path.join(BASE_SAVE_DIR, collection)

    # Check if the collection folder exists
    if not os.path.exists(collection_path) or not os.path.isdir(collection_path):
        return jsonify({"message": []}), 200  # Return empty if the collection does not exist

    # Get list of files in the collection directory
    file_name_list = [f for f in os.listdir(collection_path) if os.path.isfile(os.path.join(collection_path, f))]

    print("File names:", file_name_list)
    return jsonify({"message": file_name_list}), 200

# Get Database Endpoint
# @app.route("/get/database", methods=["POST"])
# def get_database():
#     return jsonify({"message": f"""profile : name = {profile_data_store['userName']}
#                     password = {profile_data_store['password']}
#                     api key = {profile_data_store['apiKey']} 
#                     document : collections {[i for i in document_store.keys()]}
#                     {[f"collection : {i}, fils : {[f"name: {j},  content : {document_store[i][j]} " for j in document_store[i].keys()]}" for i in document_store.keys()]}"""}), 200







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
        print(f"{collection}")
        retrived_doc_list = retrieve_documents(user_message, embedding_store[collection], embedding_model, doc_store[collection],  2)
        
        # Print retrived documents.
        print("Retrived documents :")
        for doc in retrived_doc_list:
            print("-"*10)
            print(doc)
            print("-"*10)
        print("----------------")


        # Get the final response
        Prompt_for_llm = create_prompt_with_tagged_contexts(retrived_doc_list, user_message, 2)
        #Prompt_for_llm = f'<context>\n\n{retrived_doc_list[0]}\n\n</context>\n\n' + "User message : " + user_message
     
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
    query_text = request.form.get("query")
    collection = request.form.get("collection")

    if not query_text:
        return jsonify({"error": "Query is required"}), 123


    # Retrieve documents from the specified collection
    # docs = document_store.get(collection, [])
    # if not docs:
    #     return jsonify({"error": f"No documents found in collection '{collection}'"}), 404

    # For demonstration, we'll simply pass all documents to the LLM
    # In a real scenario, you might add logic to select relevant docs.
    # response = openai.ChatCompletion.create(
    #     model="gpt-4",
    #     messages=[{
    #         "role": "system",
    #         "content": f"Query: {query_text}\nDocuments: {docs}"
    #     }]
    # )
    response = get_response(quary=query_text,collection=collection)

    return jsonify({"response": response}), 200

if __name__ == "__main__":
    app.run(debug=False, port=5000)
