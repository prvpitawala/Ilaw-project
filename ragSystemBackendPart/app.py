from flask import Flask, request, render_template, jsonify
import google.generativeai as genai
from sentence_transformers import SentenceTransformer, CrossEncoder 
from utill import *

# this is the flask app
app = Flask(__name__)

# thos is for check the index are initialized or not
is_component_initialized = False

# this part for initialize the components before requests
@app.before_request
def initialize():

    # set gloabal variables
    global is_component_initialized
    global chat_session
    global embedding_model
    global documents
    global index

    # chek components are initialzed or not
    if not is_component_initialized:
        # API configureation
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


        # Load available embeding mdels 

        #embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        #embedding_model = SentenceTransformer('all-MiniLM-L12-v2')
        #embedding_model = SentenceTransformer('distiluse-base-multilingual-cased-v2')

        embedding_model = SentenceTransformer('./models/embedding_models/all-MiniLM-L12-v2')
        print("Step_2 : Embedding model load completed. \n")


        # extract the documents from zip file.
        zip_file_path = './data/text_files.zip'
        text_files_list = extract_and_read_zip(zip_file_path)
        print("Step_3 : Document extracted completed. \n")

        # initialize the document list
        documents = []

        # add the text files into document list
        for idx, content in enumerate(text_files_list):
            documents.append(content)

        # length of the document
        print(f"Step_4 : Available documents count : {len(documents)} \n")
    

        # Build the index using the document list
        index = build_index(documents, embedding_model)
        print("Step_5 : Document indexing completed. \n")

        # set in component initialized variable to true 
        is_component_initialized = True
        print("Step_6 : All the components are initialized\n")




# root route
@app.route('/')
def index_html():
    return render_template('index_1.html')

# this rout for handle user response
@app.route('/get_response', methods=['POST'])
def get_response():

    # get requested data
    data = request.get_json()

    # Extract the user's message
    user_message = data.get('message')

    # Print the user's message to the console
    print("----------------")
    print(f"User message: {user_message}")
    print("----------------\n")


    # Here you can integrate your chatbot logic
    if user_message:

        # Retrive relevent documents 
        print("----------------")
        retrived_doc_list = retrieve_documents(user_message, index, embedding_model, documents,  2)
        
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
    return jsonify({'response': bot_response})



if __name__ == '__main__':
    app.run(debug=True)

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)