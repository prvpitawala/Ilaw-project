export class DocumentAdd {
    /**
     * @param {import("../Manager/NotificationManager.js").NotificationManager} notificationManager
     * @param {import("../Manager/OverlayManager.js").OverlayManager} overlayManager
     * @param {import("../Manager/UIManager.js").UIManager} uiManager
     */
    constructor(notificationManager,overlayManager,uiManager) {
        this.main ={
            componant: function() {
                return `
                    <div class="document-upload-section-container">
                        <div class="document-upload-container">
                            <div class="back-button-document" id="backButton-document" data="document-update-section">
                                <img src="https://img.icons8.com/ios-filled/50/ffffff/chevron-left.png" class="back-button-img" alt="back">
                            </div>
                            <br>
                            <div class="fileupbox" >
                                <div class="label">Pick Files</div>
                                <div class="file-upload-box" id='DocumentUploadBox'>
                                    <div class="plus-icon">+</div>
                                    <div class="file-text" id="fileNamesText">Drag the files or Paste the files</div>
                                    <input type="file" id="fileInputDocument" style="display: none;" accept=".txt,.pdf,.docx,.odt" multiple>
                                </div>
                                <div class="file-format">Supported file format (TXT, PDF, DOCX, ODT)</div>
                            </div>
                            <div>
                                <div class="label">Collection Name</div>
                                <!-- <div class="input-box" id="collectionName"></div> -->
                                <div class="collection-name" id="collection-name"></div>
                            </div>
                            <button id="documentUploadButton" class="upload-document-button" data="document-update-section">Update</button>
                        </div>     
                    </div>
                `
            },
            style: function() {
                return `
                    .collection-name {
                        flex: 1;
                        background-color: var(--color-surface);
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-medium);
                        color: var(--color-text-primary);
                        padding: 12px 16px;
                        font-size: 16px;
                        outline: none;
                        transition: border-color var(--transition-fast);
                        width: 100%;
                        
                    }

                    .upload-document-button {
                        display: block;
                        margin: 20px auto;
                        padding: 12px 24px;
                        background: var(--color-primary);
                        color: var(--color-text-fixed-primary-light);
                        border: none;
                        border-radius: var(--radius-medium);
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        box-shadow: var(--shadow-small);
                    }

                    button:hover {
                        background: var(--color-primary-hover);
                        box-shadow: 0 5px 15px rgba(90, 99, 172, 0.4);
                    }

                    button:active {
                        transform: translateY(0);
                        background: var(--color-primary-active);
                    }

                    .document-add-card {
                        display: flex;
                        position: fixed;
                        width: 100%;
                        height: calc(100vh - 31px);
                        left: 0;
                        backdrop-filter: blur(var(--blur-standard));
                        background-color: var(--color-background);
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: center;
                        z-index: 10;
                    }

                    .document-upload-section-container {
                        display: flex;
                        flex-direction: column;
                        border: 0px solid var(--color-border);
                        border-radius: var(--radius-large);
                        padding: 40px;
                        background-color: var(--color-background);
                        box-shadow: var(--shadow-large);
                        max-width: 500px;
                        width: 90%;
                        position: relative;
                    }

                    .label {
                        text-align: left;
                        margin-bottom: 8px;
                        font-size: 14px;
                        color: var(--color-text-secondary);
                        font-weight: 600;
                    }


                    .file-upload-box {
                        border: 2px dashed var(--color-border);
                        border-radius: var(--radius-medium);
                        padding: 30px 20px;
                        cursor: pointer;
                        text-align: center;
                        background-color: var(--color-surface-light);
                        margin-bottom: 10px;
                        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    .file-upload-box:hover {
                        border-color: var(--color-primary);
                        background-color: rgba(90, 99, 172, 0.1);
                    }

                    .plus-icon {
                        font-size: 32px;
                        color: var(--color-primary);
                        margin-bottom: 10px;
                    }

                    .file-text {
                        color: var(--color-text-secondary);
                        margin-bottom: 8px;
                        display: flex;
                        gap: 2px;
                        overflow-y: scroll;
                        scroll-behavior: smooth;
                        scrollbar-width: none;
                        max-height: 102px;
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .file-nameview-tag {
                        display: flex;
                        border: 1px solid var(--color-border);
                        padding: 3px 12px;
                        border-radius: 12px;
                    }

                    .file-format {
                        font-size: 12px;
                        color: var(--color-text-tertiary);
                        margin-bottom: 24px;
                    }

                    .document-upload-container {
                        display: flex;
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .back-button-document {
                        display: flex;
                        width: 20px;
                        height: 20px;
                        margin-left: 0px;
                        margin-right: 7px;
                        cursor: pointer;
                    }

                    .back-button-img {
                        width: 20px;
                        height: 20px;
                        transition: transform var(--transition-fast);
                    }

                    .back-button-img:hover {
                        transform: scale(1.1);
                    }

                    .fileupbox {
                        margin-bottom: 20px;
                    }

                    @media (max-width: 400px) {
                        .document-upload-section-container {
                            padding: 0px;
                        }
                    }

                    .--hidden {
                        display: none;
                    }
                `
            },
            event: function() {
                return [
                    {
                        element: document.querySelector('#DocumentUploadBox'),
                        eventType: 'click',
                        eventGroup: 'documentAdd',
                        handler: function(event) {
                            event.stopImmediatePropagation();
                            const documentInputElement = document.querySelector('#fileInputDocument');
                            documentInputElement.click();
                        }
                    },
                    {
                        element: document.querySelector('.file-upload-box'),
                        eventType: 'dragover',
                        eventGroup: 'documentAdd',
                        handler: function(event) {
                            event.preventDefault();
                            const fileUploadBox = document.querySelector('.file-upload-box');
                            fileUploadBox.style.borderColor = 'var(--color-primary)';
                            fileUploadBox.style.backgroundColor = 'rgba(90, 99, 172, 0.1)';
                        }
                    },
                    {
                        element: document.querySelector('.file-upload-box'),
                        eventType: 'dragleave',
                        eventGroup: 'documentAdd',
                        handler: function(event) {
                            event.preventDefault();
                            const fileUploadBox = document.querySelector('.file-upload-box');
                            fileUploadBox.style.borderColor = 'var(--color-border)';
                            fileUploadBox.style.backgroundColor = 'var(--color-surface-light)';
                        }
                    },
                    {
                        element: document.querySelector('.file-upload-box'),
                        eventType: 'drop',
                        eventGroup: 'documentAdd',
                        handler: function(event) {
                            event.preventDefault();
                            const fileUploadBox = document.querySelector('.file-upload-box');
                            const fileInput = document.getElementById('fileInputDocument');
                            fileInput.files = event.dataTransfer.files;
                            halperFunctions.displayFileNames();
                            fileUploadBox.style.borderColor = 'var(--color-border)';
                            fileUploadBox.style.backgroundColor = 'var(--color-surface-light)';
                        }
                    },
                    {
                        element: document.getElementById('backButton-document'),
                        eventType: 'click',
                        eventGroup: 'documentAdd',
                        handler: function() {
                            return uiManager.navigateToView('message-card', 'massage', {'collectionName': halperFunctions.collectionName});
                        }
                    },
                    {
                        element: document.querySelector('#documentUploadButton'),
                        eventType: 'click',
                        eventGroup: 'documentAdd',
                        handler: function(event) {
                            return halperFunctions.newDocumentUpdate();
                        }
                    },
                    {
                        element: document,
                        eventType: 'keydown',
                        eventGroup: 'documentAdd',
                        handler: function(event) {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                return halperFunctions.newDocumentUpdate();
                            }
                            else if (event.key === 'Escape') {
                                event.preventDefault();
                                return uiManager.navigateToView('message-card', 'massage', {'collectionName': halperFunctions.collectionName});
                            }
                            else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't') {
                                halperFunctions.themeInit();
                            }
                        }
                    }
                ]
            },
            navigator: function(options) {
                uiManager.userProfileButtonVisibility(false);
                halperFunctions.themeInit();
                halperFunctions.collectionName = options.collectionName;
                halperFunctions.collectionNameUploder();
            }
        }

        const halperFunctions = {
            collectionName : '',

            themeInit: function() {
                if (document.documentElement.getAttribute('data-theme') === 'dark') {
                    document.querySelector('#backButton-document').querySelector('img').setAttribute('src','../public/icons/chevron-left-50-ffffff.png')
                } else {
                    document.querySelector('#backButton-document').querySelector('img').setAttribute('src','../public/icons/chevron-left-50-1a1a1a.png')
                }
            },

            collectionNameUploder: function() {
                const collectionNameElement = document.querySelector('#collection-name');
                collectionNameElement.innerHTML = this.collectionName;
            },

            displayFileNames: function() {
                function fileNameViewTemplate(name) {
                    const element = document.createElement('div');
                    element.className = 'file-nameview-tag';
                    element.innerText = name;
                    return element;
                }
                
                const fileInput = document.getElementById('fileInputDocument');
                const fileNamesText = document.getElementById('fileNamesText');
                
                if (fileInput.files.length > 0) {
                    fileNamesText.innerHTML = '';
                    for (let i = 0; i < fileInput.files.length; i++) {
                        fileNamesText.insertAdjacentElement('afterbegin',fileNameViewTemplate(fileInput.files[i].name));
                    }
                } else {
                    fileNamesText.textContent = 'Drag the files or Paste the files';
                }
            },

            newDocumentUpdate: async function() {
                const fileInputElement = document.getElementById('fileInputDocument');
                const collectionName = halperFunctions.collectionName;

                if (!collectionName) {
                    notificationManager.warning('Collection Name is needed');
                    return;
                }

                if (!fileInputElement.files.length) {
                    notificationManager.warning('File needed');
                    return;
                }

                // List of allowed file extensions
                const allowedExtensions = ['pdf', 'txt', 'docx', 'odt']; // Adjust this list as needed

                // Check each file's extension
                let hasInvalidExtension = false;
                let invalidefilename = "";
                for (let i = 0; i < fileInputElement.files.length; i++) {
                    const filename = fileInputElement.files[i].name;
                    const extension = halperFunctions.getFileExtension(filename).toLowerCase();
                    
                    if (!allowedExtensions.includes(extension)) {
                        hasInvalidExtension = true;
                        invalidefilename = filename;
                    }
                }

                // Optional: Show error message if invalid extensions were found
                if (hasInvalidExtension) {
                    notificationManager.warning(`Invalid document type : ${invalidefilename}`);
                    return;
                }

                // Show progress UI
                this.showProgressUI();

                const formData = new FormData();
                formData.append('collection', collectionName);

                // Append each file with key as "files"
                Array.from(fileInputElement.files).forEach((file) => {
                    formData.append('files', file);  // Append each file separately
                });

                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/documents/${collectionName}`, {
                        headers: {
                            Authorization: 'Bearer Raveen2244'
                        },
                        method: 'PUT',
                        body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
                    });

                    const result = await response.json();
                    const taskId = result.task_id;

                    // Now listen to progress events
                    this.listenToProgress(taskId, collectionName);

                    if (response.ok) {
                        // showNotification("Done", `File uploaded successfully`, '', 3000);
                        // backToMessage(myevent);  // Call dashboard function if upload is successful
                        notificationManager.success('Successfully added Documents');
                        if (uiManager.currentView === 'document-add-card') {
                            uiManager.navigateToView('message-card', 'massage', {'collectionName': collectionName});
                        }  
                    } else {
                        // showNotification("Error", `File upload error`, response, 3000);
                        notificationManager.error('Have some error response not ok');
                    }
                } catch (error) {
                    this.hideProgressUI();
                    // showNotification('Error', 'Other error',`${error}`, 3000);
                    notificationManager.error('Upload failed: ' + error.message);
                }
                // api.createCollection(newCollectionName, fileData, "token Raveen2244");
            }, 

            showProgressUI: function() {
                // Create or show progress bar UI
                let progressContainer = document.getElementById('progress-container');
                if (!progressContainer) {
                    progressContainer = document.createElement('div');
                    progressContainer.id = 'progress-container';
                    progressContainer.innerHTML = `
                        <div class="progress-overlay">
                            <div class="progress-modal">
                                <h3>Processing Collection...</h3>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="progress-bar">
                                        <div class="progress-fill" id="progress-fill"></div>
                                    </div>
                                    <div class="progress-text" id="progress-text">0%</div>
                                </div>
                                <div class="progress-status" id="progress-status">Uploading files...</div>
                                <div class="progress-details" id="progress-details"></div>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(progressContainer);
                }
                progressContainer.style.display = 'block';
            },

            hideProgressUI: function() {
                const progressContainer = document.getElementById('progress-container');
                this.resetProgress();
                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }
            },

            updateProgress: function(percentage, status, details = '') {
                const progressFill = document.getElementById('progress-fill');
                const progressText = document.getElementById('progress-text');
                const progressStatus = document.getElementById('progress-status');
                const progressDetails = document.getElementById('progress-details');

                if (progressFill) progressFill.style.width = percentage + '%';
                if (progressText) progressText.textContent = Math.round(percentage) + '%';
                if (progressStatus) progressStatus.textContent = status;
                if (progressDetails) progressDetails.textContent = details;
            },

            resetProgress: function() {
                const progressFill = document.getElementById('progress-fill');
                const progressText = document.getElementById('progress-text');
                const progressStatus = document.getElementById('progress-status');
                const progressDetails = document.getElementById('progress-details');

                if (progressFill) progressFill.style.width = '0%';
                if (progressText) progressText.textContent = '0%';
                if (progressStatus) progressStatus.textContent = 'Starting...';
                if (progressDetails) progressDetails.textContent = '';
            },

            listenToProgress: function(taskId, collectionName) {
                const eventSource = new EventSource(`http://127.0.0.1:5000/api/documents/${collectionName}/progress/${taskId}`);

                eventSource.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    
                    switch(data.type) {
                        case 'progress':
                            this.updateProgress(data.percentage, data.status, data.details);
                            break;
                        case 'complete':
                            this.updateProgress(100, 'Complete!', 'Collection created successfully');
                            setTimeout(() => {
                                this.hideProgressUI();
                                notificationManager.success('Successfully added Documents');
                                if (uiManager.currentView === 'document-add-card') {
                                    uiManager.navigateToView('message-card', 'massage', {'collectionName': collectionName});
                                }
                            }, 2000);
                            eventSource.close();
                            break;
                        case 'error':
                            this.hideProgressUI();
                            notificationManager.error('Error: ' + data.message);
                            eventSource.close();
                            break;
                    }
                };

                eventSource.onerror = (error) => {
                    console.error('EventSource failed:', error);
                    this.hideProgressUI();
                    notificationManager.error('Connection to server lost');
                    eventSource.close();
                };
            },

            getFileExtension: function(filename) {
                return filename.split('.').pop();
            }

        }

    }
}