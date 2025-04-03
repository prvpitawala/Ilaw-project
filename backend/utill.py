import pandas as pd
import zipfile
import faiss
import time
from functools import partial
from multiprocessing import Pool, cpu_count
import numpy as np
import re
from multiprocessing.pool import ThreadPool
import os



# This function for get the chatHistory as text
def get_chat_as_text(chat_history):
    chat_text = ""
    for chat in chat_history[-6:]:
        for role, message in chat.items():
            chat_text += f"{role}: {message}\n"
    return chat_text

# this is for update the csv file
def update_csv(file_path, new_data):
    # Read the existing CSV file
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        # If the file doesn't exist, create a new DataFrame with columns
        df = pd.DataFrame(columns=['ChatHistory', 'Response'])

    # Convert new data to DataFrame
    new_df = pd.DataFrame(new_data, columns=['ChatHistory', 'Response'])

    # Append the new data
    updated_df = pd.concat([df, new_df], ignore_index=True)

    # Save back to the same CSV file
    updated_df.to_csv(file_path, index=False)
    print(f"CSV file updated")


# Function to extract and read text files from a zip file
def extract_and_read_zip(zip_file_path):
    # List to store the contents of all text files
    text_files_content = []

    # Extract the zip file
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        # Get the list of all files inside the zip
        zip_ref.extractall()  # Extracts to the current directory
        for file_name in zip_ref.namelist():
            # Check if the file is a text file
            if file_name.endswith('.txt'):
                # Open and read the text file
                with open(file_name, 'r', encoding='utf-8') as file:
                    content = file.read()
                    text_files_content.append(content)

    return text_files_content


def read_text_files_from_directory(directory_path):
    text_files_content = {}

    # Iterate through subdirectories (e.g., 'car', 'van')
    for subdir in os.listdir(directory_path):
        subdir_path = os.path.join(directory_path, subdir)

        # Check if it's a directory
        if os.path.isdir(subdir_path):
            subdir_texts = []  # List to store text file contents for this subdir
            
            # Iterate through files in the subdirectory
            for file_name in os.listdir(subdir_path):
                file_path = os.path.join(subdir_path, file_name)

                # Check if it's a text file
                if os.path.isfile(file_path) and file_name.endswith('.txt'):
                    with open(file_path, 'r', encoding='utf-8') as file:
                        subdir_texts.append(file.read())

            # Store the text content in the dictionary
            text_files_content[subdir] = subdir_texts

    return text_files_content



# this function for build the index
def build_index(documents, model):
    # Encode the documents into embeddings
    #global doc_embeddings
    doc_embeddings = model.encode(documents, convert_to_tensor=True, clean_up_tokenization_spaces=True)

    # Convert to NumPy array and build the Faiss index
    doc_embeddings_np = doc_embeddings.cpu().numpy()
    index = faiss.IndexFlatL2(doc_embeddings_np.shape[1])  # Using L2 distance
    index.add(doc_embeddings_np)  # Add document embeddings to the index
    return index


# THis function for score the documents 
def score_document(pair, model):
    # Use the provided model to predict relevance score for the query-document pair
    return model.predict([pair])[0]  # Assuming predict returns a list


def re_rank_documents_02(query, retrieved_docs, model, batch_size=32):
    # set timer
    print('Start')
    start_time = time.time()
    
    # Pair the query with each retrieved document
    query_doc_pairs = [[query, doc] for doc in retrieved_docs]

    # Create a partial function with the model passed in as a fixed argument
    score_document_with_model = partial(score_document, model=model)

    # Use multiprocessing Pool to parallelize the scoring across multiple CPU cores
    with Pool(cpu_count()) as pool:
        relevance_scores = pool.map(score_document_with_model, query_doc_pairs, chunksize=batch_size)
    
    # Convert to numpy array for efficient sorting
    relevance_scores = np.array(relevance_scores)

    # Sort documents based on relevance scores
    sorted_doc_indices = np.argsort(-relevance_scores)  # negative for descending order

    
    time_duration = time.time() - start_time
    print('end')
    print("rerank duration : ", time_duration)

    # Return documents in re-ranked order
    return [retrieved_docs[i] for i in sorted_doc_indices]


# Modified re-rank_documents function
def re_rank_documents_01(query, retrieved_docs, model):

    # set timer
    start_time = time.time()

    # Pair the query with each retrieved document based on its index
    query_doc_pairs = [[query, doc] for doc in retrieved_docs]

    # Use the cross-encoder to score each query-document pair
    relevance_scores = model.predict(query_doc_pairs)

    # Sort the documents based on the relevance scores (higher is better)
    sorted_doc_indices = sorted(range(len(retrieved_docs)), key=lambda i: relevance_scores[i], reverse=True)

    time_duration = time.time() - start_time
    print("rerank duration : ", time_duration)

    # Return the document indices in re-ranked order
    return [retrieved_docs[i] for i in sorted_doc_indices]




def re_rank_documents_03(query, retrieved_docs, model, batch_size=32):

    query_doc_pairs = [[query, doc] for doc in retrieved_docs]
    score_document_with_model = partial(score_document, model=model)

    # Using ThreadPool instead of Pool
    num_threads = min(cpu_count(), len(query_doc_pairs) // batch_size)

    with ThreadPool(num_threads) as pool:
        relevance_scores = pool.map(score_document_with_model, query_doc_pairs, chunksize=batch_size)

    relevance_scores = np.array(relevance_scores)
    sorted_doc_indices = np.argsort(-relevance_scores)

    return [retrieved_docs[i] for i in sorted_doc_indices]




# this is for extract the relevent part form the retrived documents 
def extract_context(text):
    # Use regex to find the content between <startcontext> and <endcontext>
    match = re.search(r'<startcontext>(.*?)<endcontext>', text, re.DOTALL)
    if match:
        return match.group(1).strip()  # Return the matched text
    else:
        return None  # Return None if no match is found
    

    

# Function to retrieve documents based on the query using the index
def retrieve_documents(query, index, model, documents, top_k=1):

    # set timer
    start_time = time.time()

    # Encode the query into a vector (embedding)
    query_embedding = model.encode(query, convert_to_tensor=True).cpu().numpy()

    # Reshape the query embedding to have shape (1, d)
    query_embedding = query_embedding.reshape(1, -1)

    # Perform the search on the index
    distances, indices = index.search(query_embedding, k=top_k)  # top_k results

    time_duration = time.time() - start_time
    print("retrival duration : ", time_duration)

    return [documents[idx] for idx in indices[0]]


def format_text(text):
    # Replace **bold** with <b>bold</b>
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    # Replace newline characters \n with <br> tags
    text = text.replace('\n', '<br>')
   
    # Replace * with <li>
    text = text.replace('* ', '<li>').replace('\n', '</li>\n')
    
    # Wrap the whole package descriptions in <ul> tags for better HTML structure
    #text = '<ul>\n' + text + '</li>\n</ul>'

    while text.endswith('<br>'):
        text = text[:-4] 
        
    return text


def create_prompt_with_tagged_contexts(retrived_doc_list, user_message, num_docs=3):
    # Make sure we don't try to access more docs than are available
    num_docs = min(num_docs, len(retrived_doc_list))
    
    # Create individually tagged context sections
    context_parts = []
    
    for i in range(num_docs):
        if i < len(retrived_doc_list):
            # Create a tagged context for each document
            tagged_context = f"<context_{i+1}>\n{retrived_doc_list[i]}\n</context_{i+1}>"
            context_parts.append(tagged_context)
    
    # Join all context sections with newlines
    combined_contexts = "\n\n".join(context_parts)
    
    # Create the final prompt
    prompt_for_llm = f'{combined_contexts}\n\n' + "User message : " + user_message
    
    return prompt_for_llm



#########################################################################################
#stage2 impliments
############################################################################################
# Load environment variables from .env file
import os
import zipfile
import tempfile
import shutil
from typing import List, Dict, Any, Tuple
from tqdm import tqdm
import openai
from dotenv import load_dotenv
import chromadb
from langchain.text_splitter import RecursiveCharacterTextSplitter

import requests
import json

from pdfminer.high_level import extract_text


ENV_DIR = r"../.env"
load_dotenv(dotenv_path=ENV_DIR)

# Configure OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def get_documents_from_folder(folder_path: str) -> Dict[str, str]:
    """
    Extract text documents from a folder
    
    Args:
        folder_path: Path to the folder containing documents
        
    Returns:
        Dictionary mapping filenames to their content
    """
    documents = {}
    
    # Process each file in the folder and its subfolders
    for root, _, files in os.walk(folder_path):
        for file in files:
            # Focus on text files
            if file.endswith(('.txt')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                        content = f.read()
                        relative_path = os.path.relpath(file_path, folder_path)
                        documents[relative_path] = content
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")

            # Focus on pdf files 
            if file.endswith(('.pdf')):
                file_path = os.path.join(root, file)
                try:
                    content = extract_text(file_path)
                    relative_path = os.path.relpath(file_path, folder_path)
                    txt_filename = f"{os.path.splitext(relative_path)[0]}.txt"

                    # save in the document dic as .txt
                    documents[txt_filename] = content
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")
    
    return documents


def get_documents_from_filenames(root: str, filenames: List[str], collection_name: str) -> Dict[str, str]:
    """
    Extract text documents from specific files in a folder
    
    Args:
        folder_path: Path to the root folder
        filenames: List of file names to extract
        
    Returns:
        Dictionary mapping filenames to their content
    """
    folder_path = os.path.join(root, collection_name)

    documents = {}
    
    for filename in filenames:
        file_path = os.path.join(folder_path, filename)
        
        try:
            # Handle text files
            if filename.endswith('.txt'):
                with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                    content = f.read()
                    documents[filename] = content
            
            # Handle PDF files
            elif filename.endswith('.pdf'):
                content = extract_text(file_path)
                txt_filename = f"{os.path.splitext(filename)[0]}.txt"
                documents[txt_filename] = content
            
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
    
    return documents

    

def save_documents_as_text_files_in_folder(documents, output_dir="extracted_documents"):
    """
    Given a dictionary of documents, save each document as a text file in the output directory.
    
    Args:
        documents (dict): Dictionary where keys are filenames and values are file content.
        output_dir (str): The directory where the text files will be saved.
    """
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Iterate over the dictionary
    for filename, content in documents.items():
        # Get the full path for the output text file
        output_path = os.path.join(output_dir, filename)
        
        # Create the necessary directories if they don't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        try:
            # Open the file in write mode and save the content
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Saved: {output_path}")
        except Exception as e:
            print(f"Error saving {filename}: {e}")




def chunk_text(chunk_size, chunk_overlap, documents: Dict[str, str]) -> List[Dict[str, Any]]:
    """
    Split documents into chunks suitable for embedding
    
    Args:
        documents: Dictionary mapping document names to their content
        
    Returns:
        List of document chunks with metadata
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    
    chunks = []
    for doc_name, content in documents.items():
        splits = text_splitter.split_text(content)
        
        for i, chunk_text in enumerate(splits):
            chunks.append({
                "id": f"{doc_name}_chunk_{i}",
                "text": chunk_text,
                "metadata": {
                    "source": doc_name,
                    "chunk": i
                }
            })
    return chunks



def save_chunks_as_text_files(chunks: List[Dict[str, Any]], output_dir: str = "chunks") -> None:
    """
    Save each document chunk as a separate text file
    
    Args:
        chunks: List of document chunks with metadata
        output_dir: Directory to save the chunk files
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Saving {len(chunks)} chunks to {output_dir}...")
    
    for chunk in chunks:
        # Create a filename based on the chunk ID
        filename = f"{chunk['id'].replace('/', '_').replace('\\', '_')}.txt"
        file_path = os.path.join(output_dir, filename)
        
        # Write the chunk content to a file
        with open(file_path, 'w', encoding='utf-8') as f:
            # Add metadata as a header
            f.write(f"Source: {chunk['metadata']['source']}\n")
            f.write(f"Chunk: {chunk['metadata']['chunk']}\n")
            f.write(f"ID: {chunk['id']}\n")
            f.write("-" * 50 + "\n\n")
            
            # Write the actual chunk text
            f.write(chunk['text'])
    
    print(f"Successfully saved {len(chunks)} chunk files to {output_dir}")



# def get_embedding_of_the_text(text: str, embedding_model) -> List[float]:
#     """
#     Get embedding for text using OpenAI's text-embedding-3 model
    
#     Args:
#         text: The text to embed
        
#     Returns:
#         Embedding vector
#     """
#     # Clean and truncate text if needed
#     if not text.strip():
#         text = "Empty text"
        
#     # Get embedding from OpenAI API
#     response = openai.embeddings.create(
#         model=embedding_model,
#         input=text
#     )
    
#     return response.data[0].embedding



# def get_and_save_embedings(batch_size, chunks, embedding_model, chroma_client, collection_name):
#     try:
#         collection = chroma_client.get_collection(collection_name)
#         print(f"Using existing collection {collection_name}")
#     except:
#         collection = chroma_client.create_collection(collection_name)
#         print(f"Created new collection {collection_name}")

#     for i in tqdm(range(0, len(chunks), batch_size), desc="Generating embeddings"):
#         batch = chunks[i:min(i+batch_size, len(chunks))]
        
#         ids = [chunk["id"] for chunk in batch]
#         texts = [chunk["text"] for chunk in batch]
#         metadatas = [chunk["metadata"] for chunk in batch]
        
#         # Generate embeddings
        
#         embeddings = [get_embedding_of_the_text(text, embedding_model) for text in texts]
        
    
#         # Add to vector store
#         collection.add(
#             ids=ids,
#             embeddings=embeddings,
#             documents=texts,
#             metadatas=metadatas
#         )


# def retrieve_relevant_documents(chroma_client, collection_name, embedding_model, query: str, top_k: int = 5, ) -> List[Dict[str, Any]]:
#     """
#     Retrieve relevant documents for a query
    
#     Args:
#         query: The query text
#         top_k: Number of documents to retrieve
        
#     Returns:
#         List of relevant documents with metadata
#     """

#     try:
#         collection = chroma_client.get_collection(collection_name)
#         print("Using existing collection 'documents'")
#     except:
#         collection = chroma_client.create_collection(collection_name)
#         print("Created new collection 'documents'")

#     # Get query embedding
#     query_embedding = get_embedding_of_the_text(query, embedding_model)
    
#     # Search in vector store
#     results = collection.query(
#         query_embeddings=[query_embedding],
#         n_results=top_k
#     )
    
#     documents = []
#     for i in range(len(results["ids"][0])):
#         documents.append({
#             "text": results["documents"][0][i],
#             "metadata": results["metadatas"][0][i],
#             "id": results["ids"][0][i]
#         })
        
#     return documents


def clear_chroma_database(collection_name=None):
    """
    Clear data from ChromaDB
    
    Args:
        collection_name: Name of the collection to clear. If None, all collections will be deleted.
    """
    chroma_client = chromadb.Client()
    
    try:
        if collection_name:
            # Delete a specific collection
            try:
                chroma_client.delete_collection(collection_name)
                print(f"Collection '{collection_name}' has been deleted")
            except ValueError as e:
                print(f"Collection '{collection_name}' has been not deleted")
                return
        else:
            # Get all collections
            all_collections = chroma_client.list_collections()
            
            # Delete each collection
            for collection in all_collections:
                chroma_client.delete_collection(collection.name)
                print(f"Deleted collection: {collection.name}")
            
            print(f"All collections have been deleted")
    except Exception as e:
        print(f"Error clearing database: {e}")


# def get_chatgpt_response(prompt, system_prompt=None, model="gpt-3.5-turbo"):
#     """
#     Send a query to ChatGPT 3.5 and get the response.
    
#     Parameters:
#     prompt (str): The query text to send to ChatGPT
#     api_key (str): Your OpenAI API key
#     system_prompt (str, optional): System instructions for ChatGPT
#     model (str): OpenAI model to use (default: gpt-3.5-turbo)
    
#     Returns:
#     str: The response from ChatGPT
#     """
#     headers = {
#         "Content-Type": "application/json",
#         "Authorization": f"Bearer {openai.api_key}"
#     }
    
#     # Start with an empty messages list
#     messages = []
    
#     # Add system prompt if provided
#     if system_prompt:
#         messages.append({"role": "system", "content": system_prompt})
    
#     # Add user prompt
#     messages.append({"role": "user", "content": prompt})
    
#     payload = {
#         "model": model,
#         "messages": messages,
#         "temperature": 0.2
#     }
    
#     try:
#         response = requests.post(
#             "https://api.openai.com/v1/chat/completions",
#             headers=headers,
#             data=json.dumps(payload)
#         )
        
#         # Check if the request was successful
#         response.raise_for_status()
        
#         # Parse the response
#         response_data = response.json()
        
#         # Extract the message content
#         return response_data["choices"][0]["message"]["content"]
    
#     except requests.exceptions.HTTPError as e:
#         return f"HTTP Error: {e}"
#     except requests.exceptions.ConnectionError:
#         return "Error: Connection failed"
#     except KeyError:
#         return f"Error: Unexpected response format: {response_data}"
#     except Exception as e:
#         return f"Error: {str(e)}"


def format_Prompt_to_LLM(doc_count, results, user_quary):
    prompt_to_llm = "\n".join([f"\n\n<CONTEXT_{i+1}>\n\n{doc['text']}\n\n</CONTEXT_{i+1}>" for i, doc in enumerate(results[:doc_count])])
    prompt_to_llm = prompt_to_llm + f"\n\nThis is user quary : {user_quary} "
    return prompt_to_llm


# def process_documents_and_save_embeddings(
#         file_root,
#         collection_name,
#         embedding_model,
#         chroma_client,
#         retrive_method: str = 'fileNames',
#         file_names: List[str] = None,
#         folder_name: str = None
#         ):
    
#     """
#     process documents and save embeddings.
    
#     Args:
#         file_root (str): root path in saved documents
#         collection_name (str): collection name 
#         embedding_model (str): embedding model name
#         chroma_client (ClientAPI): chroma DB client
#         retrive_method (str): file retrivel methode (fileNames/folderName)
#         file_names (List[str], optional): files name list, when use only retrive_methode="fileNames"
#         folder_name (str, optional): collection folder name, when use only retrive_methode="folderName"

#     Returns:
#     """
    
#     if retrive_method == "fileNames":
#         documents = get_documents_from_filenames(file_root, file_names, collection_name)
#     elif retrive_method == "folderName":
#         clear_chroma_database(folder_name)
#         documents = get_documents_from_folder(rf"{file_root}\{folder_name}")

#     # documents = get_documents_from_filenames("files", file_names, collection_name)
#     #documents = get_documents_from_folder("files\cars")
#     #documents = extract_documents_from_zip(zip_path)

#     #save_documents_as_text_files_in_folder(documents)

#     chunks = chunk_text(chunk_size=1000, chunk_overlap=100, documents=documents)
#     #save_chunks_as_text_files(chunks=chunks)
    
#     get_and_save_embedings(batch_size=10, chunks=chunks, embedding_model=embedding_model, chroma_client=chroma_client, collection_name=collection_name)



def remove_data_by_filenames(chroma_client, collection_name, file_name_list):
    """
    Remove documents from a Chroma collection based on a list of file names.
    
    Parameters:
    -----------
    chroma_client : ChromaClient
        The initialized Chroma client instance
    collection_name : str
        Name of the collection to remove data from
    file_name_list : list
        List of file names to remove from the collection
    
    Returns:
    --------
    int
        Number of documents removed
    """
    try:
        # Get the collection
        collection = chroma_client.get_collection(collection_name)
        print(f"Accessing collection: {collection_name}")
        
        # Get all documents with their metadata
        results = collection.get(include=["metadatas", "documents", "embeddings"])
        
        # Find IDs of documents that match the file names in file_name_list
        ids_to_remove = []
        for i, metadata in enumerate(results["metadatas"]):
            if metadata.get("file_name") in file_name_list:
                ids_to_remove.append(results["ids"][i])
        
        # Remove the documents if any were found
        if ids_to_remove:
            collection.delete(ids=ids_to_remove)
            print(f"Removed {len(ids_to_remove)} documents from {collection_name}")
            return len(ids_to_remove)
        else:
            print(f"No documents matching the provided file names were found")
            return 0
            
    except Exception as e:
        print(f"Error removing data from collection {collection_name}: {str(e)}")
        return 0