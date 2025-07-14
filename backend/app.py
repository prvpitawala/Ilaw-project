import time

server_state = {
    "start_time": time.time(),
    "ready": False,
    "shutting_down": False
}

import hashlib
from flask_cors import CORS
#backend
import os
import shutil
from flask import Flask, request, jsonify, Response, stream_template
import google.generativeai as genai
from sentence_transformers import SentenceTransformer#, CrossEncoder 
from utill import *
import sys
import io
import logging

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

import threading
import uuid
import json
import time
from collections import defaultdict

import base64
from datetime import datetime
from werkzeug.utils import secure_filename

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

def fileFolderPathGen(relativePath):
    return os.path.join(get_app_data_dir(), relativePath)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('flask_backend.log')
    ]
)
logger = logging.getLogger('flask_backend')

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB limit
CORS(app)  # Allow cross-origin requests

# Track server state


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

# Add these imports at the top of your file if not already present
UPLOAD_FOLDER = fileFolderPathGen(r"uploads\profile_pictures") #r'D:\GitHub\Ilaw-project\uploads\profile_pictures'  # Configure your upload directory
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
###############################################################################

progress_data = defaultdict(dict)
server_state["ready"] = True
logger.info("Backend initialization complete and ready to serve requests")


def initialize():
    """Perform any necessary backend initialization"""
    logger.info("Initializing backend services...")
    
    global chat_session
    global embedding_model
    global doc_store
    global embedding_store

    try:
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
        return True

    except Exception as e:
        logger.error(f"Backend initialization failed: {str(e)}")
        return False

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

def get_embedding_of_the_text(text: str, embedding_model) -> List[float] | str:
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


    try:
        client = openai.OpenAI(api_key=dt.get_key(ENV_DIR,"OPENAI_API_KEY"))

        
        response = client.embeddings.create(
            model= embedding_model,  # or your embedding_model
            input= text
        )

    except Exception as e:
        logger.error(f"Error getting embedding: {str(e)}")        
        return e.code
    
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
    openai.api_key = dt.get_key(ENV_DIR,"OPENAI_API_KEY")
    logger.info(f"Using OpenAI API key: {openai.api_key}")
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

def retrieve_relevant_documents(chroma_client, collection_name, embedding_model, query: str, top_k: int = 5, ) -> List[Dict[str, Any]] | str:
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
    if isinstance(query_embedding, str):
        return query_embedding
    
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
# Function to verify passwords
def verify_password(password, hashed_password):
    return hash_password(password) == hashed_password

def remove_subdirectories(parent_folder):
    # Iterate through items in the parent folder
    for item in os.listdir(parent_folder):
        item_path = os.path.join(parent_folder, item)

        # Check if it's a directory (subfolder)
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)  # Remove the entire subdirectory
            print(f"Removed folder: {item_path}")

def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_profile_picture(profile_picture_data, user_name):
    """
    Save profile picture from base64 data
    Returns the saved file path or None if failed
    """
    try:
        if not profile_picture_data:
            return None
            
        # Extract base64 data and metadata
        base64_data = profile_picture_data.get('data', '')
        filename = profile_picture_data.get('filename', 'profile.jpg')
        file_type = profile_picture_data.get('type', 'image/jpeg')
        file_size = profile_picture_data.get('size', 0)
        
        # Validate file size
        if file_size > MAX_FILE_SIZE:
            logger.error(f"File size too large: {file_size} bytes")
            return None
            
        # Remove data URL prefix if present
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
            
        # Decode base64 data
        try:
            image_data = base64.b64decode(base64_data)
        except Exception as e:
            logger.error(f"Failed to decode base64 data: {str(e)}")
            return None
            
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Generate secure filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
        secure_name = f"{secure_filename(user_name)}_{timestamp}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, secure_name)
        
        # Save the image file
        with open(file_path, 'wb') as f:
            f.write(image_data)
            
        logger.info(f"Profile picture saved: {file_path}")
        return file_path
        
    except Exception as e:
        logger.error(f"Error saving profile picture: {str(e)}")
        return None


@app.before_request
def before_first_request():
    """Run before the first request is processed."""
    if not server_state["ready"]:
        logger.info("First request received, backend already initializing")

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint used by Electron to verify server status"""
    if server_state["shutting_down"]:
        return jsonify({
            "status": "shutting_down",
            "message": "Server is shutting down"
        }), 503
    
    if not server_state["ready"]:
        return jsonify({
            "status": "initializing",
            "message": "Server is starting up"
        }), 503
    
    # Add more health checks here (DB connectivity, dependent services, etc.)
    health_data = {
        "status": "healthy",
        "uptime": time.time() - server_state["start_time"],
        "version": "1.0.0"  # You might want to pull this from a version file
    }
    
    return jsonify(health_data), 200

@app.route("/api/setColorTheme", methods=["PATCH"])
def changeAppColorTheme():
    try:
        # Check if authorization header is present
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header required"}), 401
        
        # Extract token from Bearer format if needed
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        # Add your token validation logic here if needed
        # if not validate_token(token):
        #     return jsonify({"error": "Invalid or expired token"}), 401

        # Get JSON data from request body
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        # Get the API key from request
        colorTheme = data.get("theme")
        if not colorTheme:
            return jsonify({"error": "color theme is required"}), 400
        
        # Basic validation
        if not isinstance(colorTheme, str) or not colorTheme.strip():
            return jsonify({"error": "color theme must be a non-empty string"}), 400

        # Get the profile collection from ChromaDB
        try:
            collection = chroma_client.get_collection("llam_app_details")
        except Exception as db_error:
            return jsonify({"error": "Database connection failed", "details": str(db_error)}), 404
        
        # Retrieve existing profile data
        try:
            result = collection.get(ids=['profile'])
        except Exception as query_error:
            return jsonify({"error": "Failed to retrieve profile data", "details": str(query_error)}), 500
        
        # Check if the result is valid and contains metadatas
        if not result or "metadatas" not in result or not result["metadatas"]:
            return jsonify({"error": "Profile not found"}), 404
        
        # Get existing metadata and preserve other fields
        existing_metadata = result["metadatas"][0]
        
        # Update the API key field (assuming you're storing OpenAI API key)
        existing_metadata["colorTheme"] = colorTheme.strip()
        
        # Update the profile in ChromaDB
        try:
            collection.update(
                ids=['profile'],
                metadatas=[existing_metadata],
                documents=[f"app color theme updated"]
            )
            return jsonify({"message": "App color theme updated successfully"}), 200
        except Exception as update_error:
            return jsonify({"error": "Failed to update color theme", "details": str(update_error)}), 500
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error in update color theme: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route("/api/getColorTheme", methods=["GET"])
def getAppColorTheme():
    try:
        # Check if authorization header is present
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header required"}), 401
        
        # Extract token from Bearer format if needed
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        # Add your token validation logic here if needed
        # if not validate_token(token):
        #     return jsonify({"error": "Invalid or expired token"}), 401

        # Get the profile collection from ChromaDB
        try:
            collection = chroma_client.get_collection("llam_app_details")
        except Exception as db_error:
            return jsonify({"error": "Database connection failed", "details": str(db_error)}), 404
        
        # Retrieve existing profile data
        try:
            result = collection.get(ids=['profile'])
        except Exception as query_error:
            return jsonify({"error": "Failed to retrieve profile data", "details": str(query_error)}), 500
        
        # Check if the result is valid and contains metadatas
        if not result or "metadatas" not in result or not result["metadatas"]:
            return jsonify({"error": "Profile not found"}), 404
        
        # Extract app color theme from metadata
        colorTheme = result["metadatas"][0].get("colorTheme")
        if not colorTheme:
            colorTheme = None
        
        return jsonify({"message": {"theme": colorTheme}}), 200



    except Exception as e:
        # Log the error for debugging
        print(f"Error in update color theme: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route("/api/status", methods=["GET"])
def api_status():
    """Example API endpoint for the application"""
    if not server_state["ready"]:
        return jsonify({
            "error": "Service not ready"
        }), 503
    
    return jsonify({
        "status": "running",
        "message": "API is operational"
    }), 200

# register Profile Endpoint    
@app.route("/api/auth/register", methods=["POST"])
def upload_profile_document():
    try:
        # Handle both form data and JSON data
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json()
            userName = data.get("userName")
            password = data.get("password")
            geminiApiKey = data.get("geminiApiKey", "")
            chatGPTApiKey = data.get("chatGPTApiKey")
            profile_picture_data = data.get("profilePicture")
        else:
            userName = request.form.get("userName")
            password = request.form.get("password")
            geminiApiKey = request.form.get("geminiApiKey", "")
            chatGPTApiKey = request.form.get("chatGPTApiKey")
            
            # Handle profile picture from form data
            profile_picture_data = None
            if 'profilePicture' in request.form:
                try:
                    profile_picture_data = json.loads(request.form.get("profilePicture"))
                except json.JSONDecodeError:
                    logger.warning("Invalid profile picture data format")
        
        # Validate required fields
        if not(userName and password and (geminiApiKey or chatGPTApiKey)):
            logger.error("Missing required fields")
            return jsonify({"error": "name and password and apikey are required"}), 400
        
        # Store basic profile data
        profile_data_store["userName"] = userName
        profile_data_store["password"] = hash_password(password)
        profile_data_store['geminiApiKey'] = geminiApiKey
        profile_data_store['chatGPTApiKey'] = chatGPTApiKey
        
        # Handle profile picture upload
        profile_picture_path = None
        if profile_picture_data:
            profile_picture_path = save_profile_picture(profile_picture_data, userName)
            if profile_picture_path:
                profile_data_store['profilePicturePath'] = profile_picture_path
                logger.info(f"Profile picture saved for user: {userName}")
            else:
                logger.warning(f"Failed to save profile picture for user: {userName}")
        
        # Update environment variables
        dt.set_key(ENV_DIR, "OPENAI_API_KEY", chatGPTApiKey)
        dt.set_key(ENV_DIR, "GEMINI_API_KEY", geminiApiKey)
        
        # Store user profile in ChromaDB
        try:
            collection = chroma_client.get_collection("llam_app_details")
        except:
            collection = chroma_client.create_collection("llam_app_details")
            
        # Prepare metadata for ChromaDB
        metadata = {
            "userName": userName,
            "password": hash_password(password),
            "registrationDate": datetime.now().isoformat()
        }
        
        # Add profile picture path to metadata if available
        if profile_picture_path:
            metadata["profilePicturePath"] = profile_picture_path
            
        collection.add(
            ids=['profile'],  # id must be unique
            metadatas=[metadata],
            documents=[f"User profile for {userName} - Registered on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"]
        )
        
        # Initialize the application
        initialize()
        
        # Prepare response message
        response_message = f"Uploaded {userName}'s details"
        if profile_picture_path:
            response_message += " with profile picture"
            
        return jsonify({
            "message": response_message,
            "data": {
                "userName": userName,
                "hasProfilePicture": bool(profile_picture_path),
                "profilePicturePath": profile_picture_path if profile_picture_path else None
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({
            "error": "Registration failed",
            "message": "An internal error occurred during registration"
        }), 500
    
# Optional: Add endpoint to serve profile pictures
@app.route("/api/profile-picture/<username>")
def get_profile_picture(username):
    """Serve profile picture for a user"""
    try:
        # Get user's profile picture path from your data store or database
        # This is a simplified example - adjust based on your data storage method
        try:
            collection = chroma_client.get_collection("llam_app_details")
        except Exception as db_error:
            return jsonify({"error": "Database connection failed", "details": str(db_error)}), 404
        
        # Retrieve profile data
        try:
            result = collection.get(ids=['profile'])
        except Exception as query_error:
            return jsonify({"error": "Failed to retrieve profile data", "details": str(query_error)}), 500
        
        # Check if the result is valid and contains metadatas
        if not result or "metadatas" not in result or not result["metadatas"]:
            return jsonify({"error": "Profile not found"}), 404
        
        # Extract user name from metadata
        user_name = result["metadatas"][0].get("userName")
        picture_path = result["metadatas"][0].get("profilePicturePath")
        if not user_name:
            return jsonify({"error": "User name not available in profile data"}), 404
        if not picture_path:
            return jsonify({"error": "Profile picture not found"}), 404
        
        dir = r"D:\GitHub\Ilaw-project"
        abs_dir = os.path.join(dir,picture_path)
        
        if not abs_dir or not os.path.exists(abs_dir):
            return jsonify({"error": "Profile picture file not found"}), 404
            
        # Serve the file
        from flask import send_file

        

        return send_file(abs_dir, mimetype='image/jpeg')
        
    except Exception as e:
        logger.error(f"Error serving profile picture: {str(e)}")
        return jsonify({"error": "Failed to load profile picture"}), 500

# Optional: Add endpoint to update profile picture
@app.route("/api/auth/update-profile-picture", methods=["POST"])
def update_profile_picture():
    """Update user's profile picture"""
    try:
        # Get user authentication (implement your auth logic)
        # This is a simplified example
        
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json()
            userName = data.get("userName")  # Or get from auth token
            profile_picture_data = data.get("profilePicture")
        else:
            userName = request.form.get("userName")
            profile_picture_data = None
            if 'profilePicture' in request.form:
                try:
                    profile_picture_data = json.loads(request.form.get("profilePicture"))
                except json.JSONDecodeError:
                    return jsonify({"error": "Invalid profile picture data format"}), 400
        
        if not userName or not profile_picture_data:
            return jsonify({"error": "Username and profile picture data are required"}), 400
            
        # Remove old profile picture if exists
        try:
            collection = chroma_client.get_collection("llam_app_details")
        except Exception as db_error:
            return jsonify({"error": "Database connection failed", "details": str(db_error)}), 404
        
        # Retrieve profile data
        try:
            result = collection.get(ids=['profile'])
        except Exception as query_error:
            return jsonify({"error": "Failed to retrieve profile data", "details": str(query_error)}), 500
        
        # Check if the result is valid and contains metadatas
        if not result or "metadatas" not in result or not result["metadatas"]:
            return jsonify({"error": "Profile not found"}), 404
        
        # Extract user name from metadata
        user_name = result["metadatas"][0].get("userName")
        picture_path = result["metadatas"][0].get("profilePicturePath")
        if not user_name:
            return jsonify({"error": "User name not available in profile data"}), 404
        if not picture_path:
            return jsonify({"error": "Profile picture not found"}), 404
        
        dir = r"D:\GitHub\Ilaw-project"
        abs_dir = os.path.join(dir,picture_path)
        
        old_picture_path = abs_dir

        if old_picture_path and os.path.exists(old_picture_path):
            try:
                os.remove(old_picture_path)
                logger.info(f"Removed old profile picture: {old_picture_path}")
            except Exception as e:
                logger.warning(f"Failed to remove old profile picture: {str(e)}")
        
        # Save new profile picture
        new_picture_path = save_profile_picture(profile_picture_data, userName)
        
        if new_picture_path:
            
            # Update ChromaDB record if needed
            try:
                # Get existing metadata and preserve other fields
                existing_metadata = result["metadatas"][0]
                
                # Update only the userName field
                existing_metadata["profilePicturePath"] = new_picture_path
                
                # Update the profile in ChromaDB
                try:
                    collection.update(
                        ids=['profile'],
                        metadatas=[existing_metadata],
                        documents=[f"User profile for {user_name} - update profile picture on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"]
                    )
                except Exception as update_error:
                    return jsonify({"error": "Failed to update profile", "details": str(update_error)}), 500
                # Update the metadata - this might need adjustment based on your ChromaDB usage
                # collection.update(...) - implement based on your needs
            except Exception as e:
                logger.warning(f"Failed to update ChromaDB: {str(e)}")
            
            return jsonify({
                "message": "Profile picture updated successfully",
                "profilePicturePath": new_picture_path
            }), 200
        else:
            return jsonify({"error": "Failed to save profile picture"}), 500
            
    except Exception as e:
        logger.error(f"Profile picture update error: {str(e)}")
        return jsonify({"error": "Failed to update profile picture"}), 500


# Legacy endpoint - keep for backward compatibility
@app.route("/verify", methods=["GET"])       
def server_running_verify():
    """Legacy verification endpoint"""
    logger.warning("Legacy /verify endpoint called, consider migrating to /health")
    if server_state["ready"]:
        return jsonify({"status": "success", "message": "Flask server is running"}), 200
    else:
        return jsonify({"status": "initializing", "message": "Flask server is starting"}), 503

# Get Profile Endpoint
@app.route("/api/profile", methods=["GET"])  #use
def get_profile_document():
    try:
        collection = chroma_client.get_collection("llam_app_details")
    except Exception as db_error:
        return jsonify({"error": "Database connection failed", "details": str(db_error)}), 503
    # Retrieve profile data
    try:
        result = collection.get(ids=['profile'])
    except Exception as query_error:
        return jsonify({"error": "Failed to retrieve profile data", "details": str(query_error)}), 500
    
    return jsonify({"message": result['metadatas'][0]['userName']}), 200

@app.route("/api/profile/name", methods=["GET"])  #use
def get_profile_name_new():
    try:
        # Check if authorization header is present
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header required"}), 401
        
        # Extract token from Bearer format if needed
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        # Add your token validation logic here if needed
        # if not validate_token(token):
        #     return jsonify({"error": "Invalid or expired token"}), 401
        
        # Get the profile collection from ChromaDB
        try:
            collection = chroma_client.get_collection("llam_app_details")
        except Exception as db_error:
            return jsonify({"error": "Database connection failed", "details": str(db_error)}), 404
        
        # Retrieve profile data
        try:
            result = collection.get(ids=['profile'])
        except Exception as query_error:
            return jsonify({"error": "Failed to retrieve profile data", "details": str(query_error)}), 500
        
        # Check if the result is valid and contains metadatas
        if not result or "metadatas" not in result or not result["metadatas"]:
            return jsonify({"error": "Profile not found"}), 404
        
        # Extract user name from metadata
        user_name = result["metadatas"][0].get("userName")
        if not user_name:
            return jsonify({"error": "User name not available in profile data"}), 404
        
        return jsonify({"message": {"userName": user_name}}), 200
        
    except Exception as e:
        # Log the error for debugging (you might want to use proper logging)
        print(f"Error in get_profile_name: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# Update profile name Endpoint
@app.route("/api/profile/name", methods=["PATCH"]) #use
def update_profile_name():
    try:
        # Check if authorization header is present
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header required"}), 401
        
        # Extract token from Bearer format if needed
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        # Add your token validation logic here if needed
        # if not validate_token(token):
        #     return jsonify({"error": "Invalid or expired token"}), 401
        
        # Check if request has JSON data
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        # Get JSON data from request body
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        # Get the new name from request
        new_name = data.get("name")
        if not new_name:
            return jsonify({"error": "Name field is required"}), 400
        
        # Basic validation
        if not isinstance(new_name, str) or not new_name.strip():
            return jsonify({"error": "Name must be a non-empty string"}), 400
        
        # Get the profile collection from ChromaDB
        try:
            collection = chroma_client.get_collection("llam_app_details")
        except Exception as db_error:
            return jsonify({"error": "Database connection failed", "details": str(db_error)}), 404
        
        # Retrieve existing profile data
        try:
            result = collection.get(ids=['profile'])
        except Exception as query_error:
            return jsonify({"error": "Failed to retrieve profile data", "details": str(query_error)}), 500
        
        # Check if the result is valid and contains metadatas
        if not result or "metadatas" not in result or not result["metadatas"]:
            return jsonify({"error": "Profile not found"}), 404
        
        # Get existing metadata and preserve other fields
        existing_metadata = result["metadatas"][0]
        
        # Update only the userName field
        existing_metadata["userName"] = new_name.strip()
        
        # Update the profile in ChromaDB
        try:
            collection.update(
                ids=['profile'],
                metadatas=[existing_metadata],
                documents=[f"User profile for {new_name.strip()}"]
            )
        except Exception as update_error:
            return jsonify({"error": "Failed to update profile", "details": str(update_error)}), 500
        
        return jsonify({"message": "Profile name updated successfully"}), 200
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error in update_profile_name: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500 
   
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
        return jsonify({"error": f"An error occurred: {str(e)}"}), 404 

# Get Profile APIKey Endpoint
@app.route("/get/profile/api", methods=["POST"])
def get_profile_api():
    return jsonify({"message": {"geminiApiKey":dt.get_key(ENV_DIR,"GEMINI_API_KEY"), "chatGPTApiKey":dt.get_key(ENV_DIR,"OPENAI_API_KEY")}}), 200

# Update Profile Name Endpoint
@app.route("/update/profile/name", methods=["POST"])
def update_profile_name_Old():
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
@app.route("/api/profile/api-key", methods=["PATCH"])  #use
def update_profile_api_key():
    try:
        global profile_data_store
        # Check if authorization header is present
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header required"}), 401
        
        # Extract token from Bearer format if needed
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        # Add your token validation logic here if needed
        # if not validate_token(token):
        #     return jsonify({"error": "Invalid or expired token"}), 401
        
        # Check if request has JSON data
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        # Get JSON data from request body
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        # Get the API key from request
        api_key = data.get("apiKey")
        if not api_key:
            return jsonify({"error": "API key is required"}), 400
        
        # Basic validation
        if not isinstance(api_key, str) or not api_key.strip():
            return jsonify({"error": "API key must be a non-empty string"}), 400
        
        # Get the profile collection from ChromaDB
        try:
            collection = chroma_client.get_collection("llam_app_details")
        except Exception as db_error:
            return jsonify({"error": "Database connection failed", "details": str(db_error)}), 404
        
        # Retrieve existing profile data
        try:
            result = collection.get(ids=['profile'])
        except Exception as query_error:
            return jsonify({"error": "Failed to retrieve profile data", "details": str(query_error)}), 500
        
        # Check if the result is valid and contains metadatas
        if not result or "metadatas" not in result or not result["metadatas"]:
            return jsonify({"error": "Profile not found"}), 404
        
        # Get existing metadata and preserve other fields
        existing_metadata = result["metadatas"][0]
        
        # Update the API key field (assuming you're storing OpenAI API key)
        existing_metadata["chatGPTApiKey"] = api_key.strip()
        
        # Update the profile in ChromaDB
        try:
            collection.update(
                ids=['profile'],
                metadatas=[existing_metadata],
                documents=[f"User profile with updated API key"]
            )
        except Exception as update_error:
            return jsonify({"error": "Failed to update profile", "details": str(update_error)}), 500
        
        # Update environment variable (if you're still using dt.set_key)
        try:
            dt.set_key(ENV_DIR, "OPENAI_API_KEY", api_key.strip())
        except Exception as env_error:
            print(f"Warning: Failed to update environment variable: {str(env_error)}")
            # Continue execution - don't fail the request for this
        
        # Update profile data store if you're still using it
        try:
            profile_data_store["chatGPTApiKey"] = api_key.strip()
        except Exception as store_error:
            print(f"Warning: Failed to update profile data store: {str(store_error)}")
            # Continue execution - don't fail the request for this
        
        return jsonify({"message": "API key updated successfully"}), 200
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error in update_profile_api_key: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# Update Profile APIKey Endpoint
@app.route("/update/profile/api", methods=["POST"])
def update_profile_api_old():
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

@app.route("/api/profile/password", methods=["PATCH"])  #use
def update_profile_password():
    try:
        # Check if authorization header is present
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header required"}), 401
        
        # Extract token from Bearer format if needed
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        # Add your token validation logic here if needed
        # if not validate_token(token):
        #     return jsonify({"error": "Invalid or expired token"}), 401
        
        # Check if request has JSON data
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        # Get JSON data from request body
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        # Get the passwords from request (matching IPC handler format)
        current_password = data.get("currentPassword")
        new_password = data.get("newPassword")
        
        if not current_password or not new_password:
            return jsonify({"error": "Both currentPassword and newPassword fields are required"}), 400
        
        # Validate new password (add your password validation rules here)
        if len(new_password) < 8:  # Example validation
            return jsonify({"error": "New password must be at least 8 characters long"}), 400
        
        # Get the profile collection from ChromaDB
        try:
            collection = chroma_client.get_collection("llam_app_details")
        except Exception as db_error:
            return jsonify({"error": "Database connection failed", "details": str(db_error)}), 404
        
        # Retrieve existing profile data
        try:
            result = collection.get(ids=['profile'])
        except Exception as query_error:
            return jsonify({"error": "Failed to retrieve profile data", "details": str(query_error)}), 500
        
        # Check if the result is valid and contains metadatas
        if not result or "metadatas" not in result or not result["metadatas"]:
            return jsonify({"error": "Profile not found"}), 404
        
        # Get existing metadata
        existing_metadata = result["metadatas"][0]
        
        # Verify current password
        stored_password = existing_metadata.get("password")
        if not stored_password:
            return jsonify({"error": "No password found in profile"}), 400
        
        # Verify the current password matches (assuming you have a verify_password function)
        if not verify_password(current_password, stored_password):
            return jsonify({"error": "Current password is incorrect"}), 401
        
        # Hash the new password
        hashed_new_password = hash_password(new_password)
        
        # Update the password field
        existing_metadata["password"] = hashed_new_password
        
        # Update the profile in ChromaDB
        try:
            collection.update(
                ids=['profile'],
                metadatas=[existing_metadata],
                documents=[f"User profile with updated password"]
            )
            return jsonify({"success": True, "message": "Password updated successfully"}), 200
        except Exception as update_error:
            return jsonify({"error": "Failed to update profile", "details": str(update_error)}), 500
            
    except Exception as e:
        # Log the error for debugging
        print(f"Error in update_profile_password: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500    
        

@app.route("/update/profile/password", methods=["POST"])
def update_profile_password_old():
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
@app.route('/api/auth/password/check', methods=['POST'])    #use
def check_password():
    try:
        # Check for Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header required"}), 401

        data = request.headers.get('password')
        password = data if data else None

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
            return jsonify({"success": False, "message": "Incorrect password"}), 200

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
@app.route('/api/models/llm', methods=['GET'])
def get_model_llm():
    return jsonify({"message": selectedLLMModel}), 200

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

# Get Collection Endpoint
@app.route("/api/collections", methods=["GET"])  #use
def get_collections():
    try:
        # Check if authorization header is present
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header required"}), 401
        
        # Extract token from Bearer format if needed
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        # Add your token validation logic here if needed
        # if not validate_token(token):
        #     return jsonify({"error": "Invalid or expired token"}), 401
        
        # Get list of collections from ChromaDB
        try:
            db_collections = chroma_client.list_collections()
        except Exception as db_error:
            return jsonify({"error": "Database connection failed", "details": str(db_error)}), 503
        
        # Create collection list, excluding system collections
        collection_list = []
        for collection in db_collections:
            if collection.name != "llam_app_details":
                collection_name = collection.name
                collection_list.append(collection_name)
                
                # Optionally create corresponding directories if needed
                # collection_path = os.path.join(BASE_SAVE_DIR, collection_name)
                # if not os.path.exists(collection_path):
                #     os.makedirs(collection_path, exist_ok=True)
        
        # Return appropriate response based on whether collections exist
        if not collection_list:
            return "", 204  # No Content - empty response body for 204
        
        return jsonify({"message": collection_list, "count": len(collection_list)}), 200
        
    except Exception as e:
        # Log the error for debugging (you might want to use proper logging)
        print(f"Error in get_collections: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500    

# Delete Collection Endpoint
@app.route("/api/collections/<collection_name>", methods=["DELETE"])   #use
def delete_collection(collection_name):
    # Check for Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header required"}), 401
    
    if not os.path.exists(BASE_SAVE_DIR):
        return "", 204
    
    # Ensure the collection name is provided
    if not collection_name:
        return jsonify({"error": "Collection name is required"}), 400

    collection_path = os.path.join(BASE_SAVE_DIR, collection_name)

    # Check if the collection folder exists
    if not os.path.exists(collection_path) or not os.path.isdir(collection_path):
        return jsonify({"error": "Collection does not exist"}), 400

    # Optionally: validate token here

    # Remove from ChromaDB
    try:
        clear_chroma_database(chroma_client, collection_name)
    except Exception as e:
        return jsonify({"error": f"Failed to delete collection in DB: {str(e)}"}), 500

    # Remove from filesystem
    collection_path = os.path.join(BASE_SAVE_DIR, collection_name)
    if os.path.exists(collection_path) and os.path.isdir(collection_path):
        try:
            shutil.rmtree(collection_path)
        except Exception as e:
            return jsonify({"error": f"Failed to delete collection folder: {str(e)}"}), 500

    return jsonify({"message": f"Deleted collection '{collection_name}'"}), 200

# Create Collection Endpoint
@app.route("/api/collections/<collection_name>", methods=["POST"])   #use
def create_collection(collection_name):
        
    # Check for Authorization header
    ###########################################################################
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header required"}), 401
    
    if not os.path.exists(BASE_SAVE_DIR):
        return "", 204
    
    # Ensure the collection name is provided
    if not collection_name:
        return jsonify({"error": "Collection name is required"}), 400

    base_dir = os.path.join(BASE_SAVE_DIR)
    os.makedirs(base_dir, exist_ok=True)

    # Define collection directory
    collection_dir = os.path.join(BASE_SAVE_DIR, collection_name)

    # Create collection directory if it does not exist
    os.makedirs(collection_dir, exist_ok=True)

    # Get all uploaded files
    documentData = request.files.getlist("files")

    # Ensure at least one file is uploaded
    if not documentData:
        return jsonify({"error": "No document were uploaded"}), 400
    

    # Generate unique task ID
    task_id = str(uuid.uuid4())
    
    # Initialize progress
    progress_data[task_id] = {
        'percentage': 0,
        'status': 'Starting...',
        'details': '',
        'complete': False,
        'error': None
    }

    saved_files = []
    for i, file in enumerate(documentData): #for file in documentData:
        file_name = file.filename
        file_path = os.path.join(collection_dir, file_name)

        try:
            # Save file to the collection directory
            file.save(file_path)
            saved_files.append(file_name)

            # Update progress for file saving
            progress_percentage = ((i + 1) / len(documentData)) * 20  # 20% for file saving
            progress_data[task_id].update({
                'percentage': progress_percentage,
                'status': f'Saving files... ({i + 1}/{len(documentData)})',
                'details': f'Saved: {file_name}'
            })

        except Exception as e:
            progress_data[task_id].update({
                'error': f"Could not save file {file_name}: {e}",
                'complete': True
            })

            return jsonify({"error": f"Could not save file {file_name}: {e}"}), 400
        
    # fileEmbeddings()
    # Start background processing
    thread = threading.Thread(
        target=process_documents_background,
        args=(BASE_SAVE_DIR, collection_name, embedding_model, chroma_client, "folderName", task_id, len(saved_files)),
        kwargs={"folder_name": collection_name}
    )
    thread.daemon = True
    thread.start()

    return jsonify({
        "message": f"Started processing {len(saved_files)} files for '{collection_name}'",
        "files": saved_files,
        "task_id": task_id
    }), 200

    # process_documents_and_save_embeddings(BASE_SAVE_DIR, collection_name, embedding_model, chroma_client, "folderName", folder_name=collection_name)

    # return jsonify({"message": f"Uploaded {len(saved_files)} files to '{collection_name}'", "files": saved_files}), 200


@app.route("/api/collections/<collection_name>/progress/<task_id>", methods=["GET"])
def get_progress(collection_name, task_id):
    def generate():
        while True:
            if task_id not in progress_data:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Task not found'})}\n\n"
                break
            
            progress = progress_data[task_id]
            
            if progress.get('error'):
                yield f"data: {json.dumps({'type': 'error', 'message': progress['error']})}\n\n"
                break
            elif progress.get('complete'):
                yield f"data: {json.dumps({'type': 'complete', 'message': 'Processing completed successfully'})}\n\n"
                # Clean up progress data
                del progress_data[task_id]
                break
            else:
                yield f"data: {json.dumps({'type': 'progress', 'percentage': progress['percentage'], 'status': progress['status'], 'details': progress['details']})}\n\n"
            
            time.sleep(0.5)  # Send updates every 500ms
    
    return Response(generate(), mimetype='text/event-stream')

def process_documents_background(file_root, collection_name, embedding_model, chroma_client, retrive_method, task_id, total_files, file_names: List[str] = None,folder_name: str = None):

    """Background function to process documents and generate embeddings with progress tracking"""
    try:
        # Update progress - starting document processing
        progress_data[task_id].update({
            'percentage': 25,
            'status': 'Loading documents...',
            'details': f'Processing {total_files} files'
        })

        if retrive_method == "fileNames":
            documents = get_documents_from_filenames(file_root, file_names, collection_name)
        elif retrive_method == "folderName":
            clear_chroma_database(folder_name)
            documents = get_documents_from_folder(rf"{file_root}\{folder_name}")
        
        progress_data[task_id].update({
            'percentage': 35,
            'status': 'Documents loaded, creating chunks...',
            'details': f'Found {len(documents)} documents'
        })

        # Create chunks
        chunks = chunk_text(chunk_size=1000, chunk_overlap=100, documents=documents)
        
        progress_data[task_id].update({
            'percentage': 45,
            'status': 'Text chunking complete',
            'details': f'Created {len(chunks)} chunks'
        })

        # Generate embeddings with progress tracking
        get_and_save_embedings_with_progress(
            batch_size=10, 
            chunks=chunks, 
            embedding_model=embedding_model, 
            chroma_client=chroma_client, 
            collection_name=collection_name,
            task_id=task_id
        )

        # Mark as complete
        progress_data[task_id].update({
            'percentage': 100,
            'status': 'Processing complete!',
            'details': f'Successfully processed {len(chunks)} chunks',
            'complete': True
        })

    except Exception as e:
        progress_data[task_id].update({
            'error': str(e),
            'complete': True
        })

def get_and_save_embedings_with_progress(batch_size, chunks, embedding_model, chroma_client, collection_name, task_id):
    """Generate embeddings with progress tracking"""
    try:
        collection = chroma_client.get_collection(collection_name)
        print(f"Using existing collection {collection_name}")
    except:
        collection = chroma_client.create_collection(collection_name)
        print(f"Created new collection {collection_name}")

    total_batches = (len(chunks) + batch_size - 1) // batch_size
    
    for i, batch_start in enumerate(range(0, len(chunks), batch_size)):
        batch_end = min(batch_start + batch_size, len(chunks))
        batch = chunks[batch_start:batch_end]
        
        # Update progress
        batch_progress = (i / total_batches) * 50  # 50% of total progress for embeddings
        total_progress = 50 + batch_progress  # Start from 50% (after chunking)
        
        progress_data[task_id].update({
            'percentage': total_progress,
            'status': f'Generating embeddings... ({i + 1}/{total_batches})',
            'details': f'Processing batch {i + 1} of {total_batches} (chunks {batch_start + 1}-{batch_end})'
        })
        
        ids = [chunk["id"] for chunk in batch]
        texts = [chunk["text"] for chunk in batch]
        metadatas = [chunk["metadata"] for chunk in batch]
        
        # Generate embeddings for this batch
        embeddings = []
        for j, text in enumerate(texts):
            try:
                embedding = get_embedding_of_the_text(text, embedding_model)
                embeddings.append(embedding)
                
                # Update progress within batch
                within_batch_progress = (j + 1) / len(texts) * (50 / total_batches)
                current_progress = 50 + (i * (50 / total_batches)) + within_batch_progress
                
                progress_data[task_id].update({
                    'percentage': current_progress,
                    'status': f'Generating embeddings... ({i + 1}/{total_batches})',
                    'details': f'Batch {i + 1}: Processing chunk {j + 1}/{len(texts)}'
                })
                
            except Exception as e:
                print(f"Error generating embedding for chunk {j}: {e}")
                # Use a default embedding or skip
                continue
        
        # Add to vector store
        if embeddings:
            collection.add(
                ids=ids[:len(embeddings)],
                embeddings=embeddings,
                documents=texts[:len(embeddings)],
                metadatas=metadatas[:len(embeddings)]
            )


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

# Delete Document
@app.route("/api/documents/<collection_name>/<document_name>", methods=["DELETE"])  #use
def delete_document(collection_name,document_name):
    try:
        # Check if authorization header is present
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header required"}), 401
        
        # Extract token from Bearer format if needed
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
            
            # Add your token validation logic here if needed
            # if not validate_token(token):
            #     return jsonify({"error": "Invalid or expired token"}), 401

        # Ensure the collection name is provided
        if not collection_name:
            return jsonify({"error": "Collection name is required"}), 400
        
        # Ensure the file name is provided
        if not document_name:
            return jsonify({"error": "Document name is required"}), 400
        
        collection_path = os.path.join(BASE_SAVE_DIR, collection_name)

        # Check if the collection folder exists
        if not os.path.exists(collection_path) or not os.path.isdir(collection_path):
            return jsonify({"error": "Collection is not found"}), 404  # collection is not fount
        
        document_path = os.path.join(collection_path, document_name)

        # Check if the collection file exists
        if not os.path.exists(document_path) or not os.path.isfile(document_path):
            return jsonify({"error": "Document is not found"}), 404 # Document is not found
        
        # Remove the file
        os.remove(document_path)
        # Clear the corresponding database in ChromaDB
        remove_data_by_filenames(chroma_client,collection_name,[document_name])

        return jsonify({"message": f"Deleted file '{document_name}'"}), 200
    except Exception as e:
        print(f"Error in delete_document: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# Get Document names
@app.route("/api/documents/<collection_name>", methods=["GET"])   #use
def get_document_names(collection_name):
    
    # Check if authorization header is present
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header required"}), 401
    
    # Extract token from Bearer format if needed
    token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        # Add your token validation logic here if needed
        # if not validate_token(token):
        #     return jsonify({"error": "Invalid or expired token"}), 401

    # Ensure the collection name is provided
    if not collection_name:
        return jsonify({"error": "Collection name is required"}), 400

    collection_path = os.path.join(BASE_SAVE_DIR, collection_name)

    # Check if the collection folder exists
    if not os.path.exists(collection_path) or not os.path.isdir(collection_path):
        return jsonify({"message": []}), 200  # Return empty if the collection does not exist

    # Get list of files in the collection directory
    file_name_list = [f for f in os.listdir(collection_path) if os.path.isfile(os.path.join(collection_path, f))]

    return jsonify({"message": file_name_list}), 200

# Put Documents 
@app.route("/api/documents/<collection_name>", methods=["PUT"])
def update_documents(collection_name):
    # Check for Authorization header
    ###########################################################################
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header required"}), 401

    if not os.path.exists(BASE_SAVE_DIR):
        return "", 204

    # Ensure collection is provided
    if not collection_name:
        return jsonify({"error": "Collection is required"}), 400

    base_dir = os.path.join(BASE_SAVE_DIR)
    os.makedirs(base_dir,exist_ok=True)

    # Define collection directory
    collection_dir = os.path.join(BASE_SAVE_DIR, collection_name)

    if not os.path.exists(collection_dir):
        return "", 204

    # Get all uploaded files
    uploaded_files = request.files.getlist("files")

    # Ensure at least one file is uploaded
    if not uploaded_files:
        return jsonify({"error": "No files were uploaded"}), 400
    
    # Generate unique task ID
    task_id = str(uuid.uuid4())
    
    # Initialize progress
    progress_data[task_id] = {
        'percentage': 0,
        'status': 'Starting...',
        'details': '',
        'complete': False,
        'error': None
    }

    saved_files = []
    for i, file in enumerate(uploaded_files): #for file in uploaded_files:
        file_name = file.filename
        file_path = os.path.join(collection_dir, file_name)

        try:
            # Save file to the collection directory
            file.save(file_path)
            saved_files.append(file_name)

            # Update progress for file saving
            progress_percentage = ((i + 1) / len(uploaded_files)) * 20  # 20% for file saving
            progress_data[task_id].update({
                'percentage': progress_percentage,
                'status': f'Saving files... ({i + 1}/{len(uploaded_files)})',
                'details': f'Saved: {file_name}'
            })

        except Exception as e:
            progress_data[task_id].update({
                'error': f"Could not save file {file_name}: {e}",
                'complete': True
            })

            return jsonify({"error": f"Could not save file {file_name}: {e}"}), 400
        
    # fileEmbeddings()
    # Start background processing
    thread = threading.Thread(
        target=process_documents_background,
        args=(BASE_SAVE_DIR, collection_name, embedding_model, chroma_client, "fileNames", task_id, len(saved_files)),
        kwargs={"file_names": saved_files}
    )
    thread.daemon = True
    thread.start()

    return jsonify({
        "message": f"Started processing {len(saved_files)} files for '{collection_name}'",
        "files": saved_files,
        "task_id": task_id
    }), 200

    # process_documents_and_save_embeddings(BASE_SAVE_DIR,collection_name,embedding_model,chroma_client,"fileNames",file_names=saved_files)

    # return jsonify({"message": f"Uploaded {len(saved_files)} files to '{collection_name}'", "files": saved_files}), 200

@app.route("/api/documents/<collection_name>/progress/<task_id>", methods=["GET"])
def get_progress_document(collection_name, task_id):
    def generate():
        while True:
            if task_id not in progress_data:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Task not found'})}\n\n"
                break
            
            progress = progress_data[task_id]
            
            if progress.get('error'):
                yield f"data: {json.dumps({'type': 'error', 'message': progress['error']})}\n\n"
                break
            elif progress.get('complete'):
                yield f"data: {json.dumps({'type': 'complete', 'message': 'Processing completed successfully'})}\n\n"
                # Clean up progress data
                del progress_data[task_id]
                break
            else:
                yield f"data: {json.dumps({'type': 'progress', 'percentage': progress['percentage'], 'status': progress['status'], 'details': progress['details']})}\n\n"
            
            time.sleep(0.5)  # Send updates every 500ms
    
    return Response(generate(), mimetype='text/event-stream')

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

            if isinstance(retrived_doc_list, str):
                return {"responce":retrived_doc_list, "status": 403}
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
        chatGPT_system_prompt = "You are an AI assistant. Answer all questions strictly based on the provided context. If the answer is not available within the context, politely apologize without attempting to fabricate information. Provide clear and explainable answers. Never mention that your responses are based on the context — this is mandatory. Format all responses using Markdown for better readability."
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

@app.route("/api/query", methods=["POST"])
def query():
    query_text = request.form.get("query")  # Note: 'query', not 'quaryText'
    collection = request.form.get("collection")

    if not query_text:
        return jsonify({"error": "Query is required"}), 400  # Should be 400, not 123

    response = get_response(quaryText=query_text, collection=collection)  # Fixed typo

    if isinstance(response, dict) and "responce" in response:
        # If the response is a dictionary with 'responce' key, return it directly
        return jsonify({"response": response["responce"]}), 403
    elif isinstance(response, str):
        # If the response is a string, return it directly
        return jsonify({"response": response}), 200

if __name__ == "__main__":
    try:
        app.run(debug=False, port=5000)
    except Exception as e:
        import traceback
        logger.info(f"Some error in Flask server")
        with open("error_log.txt", "w", encoding="utf-8") as f:
            f.write(traceback.format_exc())
        input("An error occurred. Press Enter to exit...")