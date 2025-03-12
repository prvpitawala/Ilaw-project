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