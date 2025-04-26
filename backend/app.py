import hashlib
from flask_cors import CORS
#backend
import os
import shutil
from flask import Flask, request, jsonify
import google.generativeai as genai
from sentence_transformers import SentenceTransformer#, CrossEncoder 
from utill import *
import sys
import io

import chromadb
import shutil
from typing import List, Dict, Any, Tuple
from tqdm import tqdm
import openai
from dotenv import load_dotenv
import dotenv as dt
import requests
import json
# from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2
from flask import request, jsonify

# from pdfminer.high_level import extract_text

# Add near the top of your file
def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

# Modify your get_app_data_dir function to ensure it works in EXE mode
def get_app_data_dir():
    app_data_dir = os.path.join(os.environ['APPDATA'], "Ilaw System")
    if not os.path.exists(app_data_dir):
        os.makedirs(app_data_dir)
    return app_data_dir

# def get_app_data_dir():
#     app_data_dir = os.path.join(os.environ['APPDATA'], "Rag Doc System")
#     if not os.path.exists(app_data_dir):
#         os.makedirs(app_data_dir)
#     return app_data_dir

def fileFolderPathGen(relativePath):
    return os.path.join(get_app_data_dir(), relativePath)


sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

chroma_client = chromadb.PersistentClient(path=fileFolderPathGen(r"database\.chroma_db"))
# In-memory document store
# Structure: { collection_name: {doc name: document_content, ...} }
profile_data_store = {"userName": "", "password" : "", "geminiApiKey": "", "chatGPTApiKey": ""}
document_store = {}
doc_store = {}
BASE_SAVE_DIR = fileFolderPathGen("files")# r"../files"
ENV_DIR = fileFolderPathGen(".env") #r"../.env"
#Structure : {collection_name: embedding,...}
embedding_store = {}
selectedLLMModel = "chatGPT"  #gemini / chatGPT
embedding_model = "text-embedding-3-small" #all-MiniLM-L12-v2 / text-embedding-3-small
###############################################################################

def initialize():
    
    global chat_session
    global embedding_model
    global doc_store
    global embedding_store
    # global chroma_client

    # BASE_SAVE_DIR = r"../files"
    
    # Create directory if it doesn't exist
    if not os.path.exists(BASE_SAVE_DIR):
        os.makedirs(BASE_SAVE_DIR)


    remove_subdirectories(BASE_SAVE_DIR)

    # genai.configure(api_key='AIzaSyBfFtmf5-de0x0O3Tibyc4anGaioF4Uqj0')
    # Load environment variables from .env file
    load_dotenv(dotenv_path=ENV_DIR)
    #genai.configure(api_key=profile_data_store['geminiApiKey']) 
    # genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    genai.configure(api_key=dt.get_key(ENV_DIR,"GEMINI_API_KEY"))
    # Configure OpenAI API key
    # openai.api_key = profile_data_store['chatGPTApiKey']   
    # openai.api_key = os.getenv("OPENAI_API_KEY")
    openai.api_key = dt.get_key(ENV_DIR,"OPENAI_API_KEY")
     
    print(os.getenv("GEMINI_API_KEY"))
    print(os.getenv("OPENAI_API_KEY"))
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


    # model_rel_path = r"../models/embedding_models/all-MiniLM-L12-v2"
    # embedding_model = SentenceTransformer(model_rel_path)
    print("Step_2 : Embedding model load completed. \n")

    print("Step_3 : All the components are initialized\n")

    # chroma_client = chromadb.PersistentClient(path="../database/.chroma_db")

def process_documents_and_save_embeddings(
        file_root,
        collection_name,
        embedding_model,
        chroma_client,
        retrive_method: str = 'fileNames',
        file_names: List[str] = None,
        folder_name: str = None
        ):
    
    """
    process documents and save embeddings.
    
    Args:
        file_root (str): root path in saved documents
        collection_name (str): collection name 
        embedding_model (str): embedding model name
        chroma_client (ClientAPI): chroma DB client
        retrive_method (str): file retrivel methode (fileNames/folderName)
        file_names (List[str], optional): files name list, when use only retrive_methode="fileNames"
        folder_name (str, optional): collection folder name, when use only retrive_methode="folderName"

    Returns:
    """
    
    if retrive_method == "fileNames":
        documents = get_documents_from_filenames(file_root, file_names, collection_name)
    elif retrive_method == "folderName":
        clear_chroma_database(folder_name)
        documents = get_documents_from_folder(rf"{file_root}\{folder_name}")

    # documents = get_documents_from_filenames("files", file_names, collection_name)
    #documents = get_documents_from_folder("files\cars")
    #documents = extract_documents_from_zip(zip_path)

    #save_documents_as_text_files_in_folder(documents)

    chunks = chunk_text(chunk_size=1000, chunk_overlap=100, documents=documents)
    #save_chunks_as_text_files(chunks=chunks)
    
    get_and_save_embedings(batch_size=10, chunks=chunks, embedding_model=embedding_model, chroma_client=chroma_client, collection_name=collection_name)

def get_embedding_of_the_text(text: str, embedding_model) -> List[float]:
    """
    Get embedding for text using OpenAI's text-embedding-3 model
    
    Args:
        text: The text to embed
        
    Returns:
        Embedding vector
    """
    # Clean and truncate text if needed
    if not text.strip():
        text = "Empty text"
        
    # Get embedding from OpenAI API
    response = openai.embeddings.create(
        model=embedding_model,
        input=text
    )
    
    return response.data[0].embedding

def get_chatgpt_response(prompt, system_prompt=None, model="gpt-3.5-turbo"):
    """
    Send a query to ChatGPT 3.5 and get the response.
    
    Parameters:
    prompt (str): The query text to send to ChatGPT
    api_key (str): Your OpenAI API key
    system_prompt (str, optional): System instructions for ChatGPT
    model (str): OpenAI model to use (default: gpt-3.5-turbo)
    
    Returns:
    str: The response from ChatGPT
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai.api_key}"
    }
    
    # Start with an empty messages list
    messages = []
    
    # Add system prompt if provided
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    
    # Add user prompt
    messages.append({"role": "user", "content": prompt})
    
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.2
    }
    
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload)
        )
        
        # Check if the request was successful
        response.raise_for_status()
        
        # Parse the response
        response_data = response.json()
        
        # Extract the message content
        return response_data["choices"][0]["message"]["content"]
    
    except requests.exceptions.HTTPError as e:
        return f"HTTP Error: {e}"
    except requests.exceptions.ConnectionError:
        return "Error: Connection failed"
    except KeyError:
        return f"Error: Unexpected response format: {response_data}"
    except Exception as e:
        return f"Error: {str(e)}"

def retrieve_relevant_documents(chroma_client, collection_name, embedding_model, query: str, top_k: int = 5, ) -> List[Dict[str, Any]]:
    """
    Retrieve relevant documents for a query
    
    Args:
        query: The query text
        top_k: Number of documents to retrieve
        
    Returns:
        List of relevant documents with metadata
    """

    try:
        collection = chroma_client.get_collection(collection_name)
        print("Using existing collection 'documents'")
    except:
        collection = chroma_client.create_collection(collection_name)
        print("Created new collection 'documents'")

    # Get query embedding
    query_embedding = get_embedding_of_the_text(query, embedding_model)
    
    # Search in vector store
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    
    documents = []
    for i in range(len(results["ids"][0])):
        documents.append({
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "id": results["ids"][0][i]
        })
        
    return documents

def get_and_save_embedings(batch_size, chunks, embedding_model, chroma_client, collection_name):
    try:
        collection = chroma_client.get_collection(collection_name)
        print(f"Using existing collection {collection_name}")
    except:
        collection = chroma_client.create_collection(collection_name)
        print(f"Created new collection {collection_name}")

    for i in tqdm(range(0, len(chunks), batch_size), desc="Generating embeddings"):
        batch = chunks[i:min(i+batch_size, len(chunks))]
        
        ids = [chunk["id"] for chunk in batch]
        texts = [chunk["text"] for chunk in batch]
        metadatas = [chunk["metadata"] for chunk in batch]
        
        # Generate embeddings
        
        embeddings = [get_embedding_of_the_text(text, embedding_model) for text in texts]
        
    
        # Add to vector store
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )

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
    geminiApiKey = request.form.get("geminiApiKey")
    chatGPTApiKey = request.form.get("chatGPTApiKey")

    if not(userName and password and (geminiApiKey or chatGPTApiKey)):
        return jsonify({"error": "name and password and apikey are required"}), 400
    
    # if not userName or not password or not apiKey:
    #     return jsonify({"error": "Username and password and api key are required"}), 400


    profile_data_store["userName"] = userName
    profile_data_store["password"] = hash_password(password)
    profile_data_store['geminiApiKey'] = geminiApiKey
    profile_data_store['chatGPTApiKey'] = chatGPTApiKey

    # os.putenv("OPENAI_API_KEY",profile_data_store['chatGPTApiKey'])
    # os.putenv("GEMINI_API_KEY",profile_data_store['geminiApiKey'])
    
    with open(ENV_DIR,'w') as dotenvFile:
        pass
    #     dotenvFile.writelines(f"OPENAI_API_KEY={profile_data_store['chatGPTApiKey']}\n")
    #     dotenvFile.writelines(f"GEMINI_API_KEY={profile_data_store['geminiApiKey']}\n")

    dt.set_key(ENV_DIR,"OPENAI_API_KEY",chatGPTApiKey)
    dt.set_key(ENV_DIR,"GEMINI_API_KEY",geminiApiKey)

    # Store user profile in ChromaDB
    try:
        collection = chroma_client.get_collection("llam_app_details")
    except:
        collection = chroma_client.create_collection("llam_app_details")
        collection.add(
            ids=['profile'],  # id must be unique
            metadatas=[{
                "userName": userName,
                "password": hash_password(password)
            }],
            documents=[f"User profile for {userName}"]
        )

    initialize()

    return jsonify({"message": f"Uploaded {userName}'s details"}), 200

@app.route("/verify", methods=["GET"])
def server_running_verify():
    return jsonify({"status": "success", "message": "Flask server is running"}), 200

# Get Profile Endpoint
@app.route("/get/profile", methods=["POST"])
def get_profile_document():
    return jsonify({"message": {"userName":profile_data_store["userName"],"geminiApiKey":profile_data_store['geminiApiKey'],"chatGPTApiKey":profile_data_store['chatGPTApiKey']}}), 200

# Get Profile Name Endpoint
@app.route("/get/profile/name", methods=["POST"])
def get_profile_name():
    try:
        collection = chroma_client.get_collection("llam_app_details")
        result = collection.get(ids=['profile'])

        # Check if the result is valid and contains metadatas
        if not result or "metadatas" not in result or not result["metadatas"]:
            return jsonify({"error": "Profile not found"}), 404

        user_name = result["metadatas"][0].get("userName")

        if not user_name:
            return jsonify({"error": "User name not available in profile data"}), 400

        return jsonify({"message": {"userName": user_name}}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Get Profile APIKey Endpoint
@app.route("/get/profile/api", methods=["POST"])
def get_profile_api():
    return jsonify({"message": {"geminiApiKey":dt.get_key(ENV_DIR,"GEMINI_API_KEY"), "chatGPTApiKey":dt.get_key(ENV_DIR,"OPENAI_API_KEY")}}), 200

# Update Profile Name Endpoint
@app.route("/update/profile/name", methods=["POST"])
def update_profile_name():
    try:
        data = request.form
        userName = data.get("userName") if data else None
        if not userName:
            return jsonify({"success": False, "error": "User name is required"}), 400

        collection = chroma_client.get_collection("llam_app_details")

        # Retrieve the existing profile to preserve the password
        result = collection.get(ids=['profile'])
        if not result or not result["metadatas"]:
            return jsonify({"success": False, "error": "Profile not found"}), 404

        existing_metadata = result["metadatas"][0]
        password = existing_metadata.get("password")

        # Update the profile with the new username and existing password
        collection.update(
            ids=['profile'],
            metadatas=[{
                "userName": userName,
                "password": password
            }],
            documents=[f"User profile for {userName}"]
        )

        return jsonify({"success": True, "message": "Updated User Name"}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"An error occurred: {str(e)}"}), 500


# Update Profile APIKey Endpoint
@app.route("/update/profile/api", methods=["POST"])
def update_profile_api():
    geminiApiKey = request.form.get("geminiApiKey")
    chatGPTApiKey = request.form.get("chatGPTApiKey")
    if not(geminiApiKey or chatGPTApiKey):
        return jsonify({"success": False, "error": "at least one apikey are required"}), 400
    
    profile_data_store["geminiApiKey"] = geminiApiKey
    profile_data_store["chatGPTApiKey"] = chatGPTApiKey
    dt.set_key(ENV_DIR,"OPENAI_API_KEY",chatGPTApiKey)
    dt.set_key(ENV_DIR,"GEMINI_API_KEY",geminiApiKey)

    return jsonify({"success": True, "message": "Updated User API Keys"}), 200

# Update Profile Password Endpoint

@app.route("/update/profile/password", methods=["POST"])
def update_profile_password():
    try:
        data = request.form
        password = data.get("password") if data else None
        repassword = data.get("repassword") if data else None

        if not password or not repassword:
            return jsonify({"success": False, "error": "Both password fields are required"}), 400

        if password != repassword:
            return jsonify({"success": False, "error": "Passwords do not match"}), 400

        collection = chroma_client.get_collection("llam_app_details")
        result = collection.get(ids=['profile'])

        if not result or not result["metadatas"]:
            return jsonify({"success": False, "error": "Profile not found"}), 404

        existing_metadata = result["metadatas"][0]
        userName = existing_metadata.get("userName")

        collection.update(
            ids=['profile'],
            metadatas=[{
                "userName": userName,
                "password": hash_password(password)
            }],
            documents=[f"User profile for {userName}"]
        )

        return jsonify({"success": True, "message": "Password updated successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"An error occurred: {str(e)}"}), 500


# Check Password Endpoint
@app.route('/check/password', methods=['POST'])
def check_password():
    try:
        data = request.get_json()
        password = data.get("password") if data else None

        if not password:
            return jsonify({"success": False, "message": "Password is required"}), 400

        collection = chroma_client.get_collection("llam_app_details")
        result = collection.get(ids=['profile'])

        if not result or not result["metadatas"]:
            return jsonify({"success": False, "message": "Profile not found"}), 404

        stored_password = result["metadatas"][0].get("password")
        if not stored_password:
            return jsonify({"success": False, "message": "Stored password missing"}), 500

        if hash_password(password) == stored_password:
            return jsonify({"success": True, "message": "Password is correct"}), 200
        else:
            return jsonify({"success": False, "message": "Incorrect password"}), 401

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500


# Update LLM model Endpoint
@app.route('/update/model/llm', methods=['POST'])
def update_model_llm():
    global selectedLLMModel

    modelname = request.form.get("modelName")
    if modelname not in ["gemini", "chatGPT"]:
        return jsonify({"success": False, "error": "invalid llm model name"}), 400
    
    if selectedLLMModel != modelname:
        selectedLLMModel = modelname

    return jsonify({"success": True, "message": "Updated llm model"}), 200

# Get LLM model Endpoint
@app.route('/get/model/llm', methods=['POST'])
def get_model_llm():
    return jsonify({"message": {"llm_model": selectedLLMModel}}), 200

# Upload Document Endpoint
@app.route("/upload/doc", methods=["POST"])
def upload_document():
    # BASE_SAVE_DIR = r"../files"
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
        
    # fileEmbeddings()
    process_documents_and_save_embeddings(BASE_SAVE_DIR,collection,embedding_model,chroma_client,"folderName",folder_name=collection)

    return jsonify({"message": f"Uploaded {len(saved_files)} files to '{collection}'", "files": saved_files}), 200

@app.route("/update/doc", methods=["POST"])
def update_document():
    # BASE_SAVE_DIR = r"../files"
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
        
    # fileEmbeddings()
    process_documents_and_save_embeddings(BASE_SAVE_DIR,collection,embedding_model,chroma_client,"fileNames",file_names=saved_files)

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

# Get Document Collections Endpoint
@app.route("/get/document/collections", methods=["POST"])
def get_document_collections():
    # Ensure the base directory exists
    # BASE_SAVE_DIR = r"../files"
    if not os.path.exists(BASE_SAVE_DIR):
        return jsonify({"message": []}), 200
    
    db_collections = chroma_client.list_collections()

    # Get list of collections (subdirectories inside BASE_SAVE_DIR)
    # file_collections = [name for name in os.listdir(BASE_SAVE_DIR) if os.path.isdir(os.path.join(BASE_SAVE_DIR, name))]

    #create folders if not exist
    collection_list = []
    for collection in db_collections:
        if collection.name != "llam_app_details":
            collection_name = collection.name
            # collection_path = os.path.join(BASE_SAVE_DIR, collection_name)
            collection_list.append(collection_name)
            # if not os.path.exists(collection_path):
            #     os.makedirs(collection_path)

    return jsonify({"message": collection_list}), 200

@app.route("/delete/document/collection", methods=["POST"])
def delete_document_collection():
    # Ensure the base directory exists
    # BASE_SAVE_DIR = r"../files"
    if not os.path.exists(BASE_SAVE_DIR):
        return jsonify({"message": []}), 200

    collection = request.form.get("collection")
    
    # Ensure the collection name is provided
    if not collection:
        return jsonify({"error": "Collection name is required"}), 400

    collection_path = os.path.join(BASE_SAVE_DIR, collection)

    # Check if the collection folder exists
    if not os.path.exists(collection_path) or not os.path.isdir(collection_path):
        return jsonify({"error": "Collection does not exist"}), 400

    # Remove the collection directory
    shutil.rmtree(collection_path)
    # Clear the corresponding database in ChromaDB
    clear_chroma_database(chroma_client, collection)
    
    return jsonify({"message": f"Deleted collection '{collection}'"}), 200

@app.route("/delete/document/files", methods=["POST"])
def delete_document_files():
    # Ensure the base directory exists
    # BASE_SAVE_DIR = r"../files"
    if not os.path.exists(BASE_SAVE_DIR):
        return jsonify({"message": []}), 200

    collection = request.form.get("collection")
    fileName = request.form.get("fileName")
    
    # Ensure the collection name is provided
    if not (collection and fileName):
        return jsonify({"error": "Collection name and File name is required"}), 400

    collection_path = os.path.join(BASE_SAVE_DIR, collection)
    file_path = os.path.join(collection_path, fileName)
    # Check if the collection file exists
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return jsonify({"error": "File does not exist"}), 400

    # Remove the file
    os.remove(file_path)
    # Clear the corresponding database in ChromaDB
    numberofdeletefiles=remove_data_by_filenames(chroma_client,collection,[fileName])
    
    return jsonify({"message": f"Deleted file '{fileName}, {numberofdeletefiles}'"}), 200

# Get File names
@app.route("/get/document/filenames", methods=["POST"])
def get_file_names():
    # BASE_SAVE_DIR = r"../files"

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

# # Get Database Endpoint
# @app.route("/get/database", methods=["POST"])
# def get_database():
#     return jsonify({"message": f"""profile : name = {profile_data_store['userName']}
#                     password = {profile_data_store['password']}
#                     api key = {profile_data_store['geminiApiKey']} 
#                     document : collections {[i for i in document_store.keys()]}
#                     {[f"collection : {i}, fils : {[f"name: {j},  content : {document_store[i][j]} " for j in document_store[i].keys()]}" for i in document_store.keys()]}"""}), 200

def get_response(quaryText, collection):
    # Extract the user's message
    user_message = quaryText

    # Print the user's message to the console
    print("----------------")
    print(f"User message: {user_message}")
    print("----------------\n")


    # Here you can integrate your chatbot logic
    if user_message:

        # Retrive relevent documents 
        print("----------------")
        print(f"{collection}")
        try:
            retrived_doc_list = retrieve_relevant_documents(
                chroma_client=chroma_client,
                collection_name=collection,
                embedding_model=embedding_model,
                query=quaryText, 
                top_k=5
            )
        except openai.APIConnectionError as e:
            return "Error: Connection failed"

            
        print(f"\nFound {len(retrived_doc_list)} relevant documents\n")
        # retrived_doc_list = retrieve_documents(user_message, embedding_store[collection], embedding_model, doc_store[collection],  2)
        
        # Print retrived documents.
        print("Retrived documents :")
        for doc in retrived_doc_list:
            print("-"*10)
            print(doc)
            print("-"*10)
        print("----------------")


        # Get the final response
        prompt_to_llm = format_Prompt_to_LLM(3, retrived_doc_list, quaryText)
        print("ChatGPT promt :\n", prompt_to_llm)
        chatGPT_system_prompt = "Work as assistant. Provide answers only using the given context. Give explainable answers. don't tell you are providing answers from context this is a must. Please use markdown formatting in your responses"
        # Prompt_for_llm = create_prompt_with_tagged_contexts(retrived_doc_list, user_message, 2)
        #Prompt_for_llm = f'<context>\n\n{retrived_doc_list[0]}\n\n</context>\n\n' + "User message : " + user_message
     
        if selectedLLMModel == "gemini":
            modelResponse =  chat_session.send_message(prompt_to_llm)
            modelResponse = modelResponse.text
        elif selectedLLMModel == "chatGPT":
            modelResponse = get_chatgpt_response(prompt_to_llm, chatGPT_system_prompt)
        print(f"{selectedLLMModel} response :\n", modelResponse)

        # print("\nThis is the prompt for LLM :")
        # print("----------------")
        # print(Prompt_for_llm)
        # print("----------------\n\n")

        # Get the llm response
        
        # bot_response = final_response.text
        bot_response = modelResponse

        print("This is the LLM response :")
        print("----------------")
        print(bot_response)
        print("----------------")

        # bot_response = convert_to_list_items(bot_response) 
        bot_response = format_text(bot_response)
        print("This is the formated LLM response :")
        print("----------------")
        print(bot_response)
        print("----------------")
        
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

    response = get_response(quaryText=query_text,collection=collection)

    return jsonify({"response": response}), 200

if __name__ == "__main__":
    try:
        app.run(debug=False, port=5000)
    except Exception as e:
        import traceback
        with open("error_log.txt", "w", encoding="utf-8") as f:
            f.write(traceback.format_exc())
        input("An error occurred. Press Enter to exit...")