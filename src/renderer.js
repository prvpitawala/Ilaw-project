import { NotificationManager } from "./Manager/NotificationManager.js";
import { UIManager } from './Manager/UIManager.js';
import { Registration } from  './Sections/Registration.js';
import { Dashbord } from  './Sections/Dashbord.js';

const UIComponents = {
    registerPages:`
    <!-- Page 1: Enter Name -->
    <div id="page1" class="page active">
        <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="User Icon" class="profile-icon">
        <h3>Name</h3>
        <input class="reg-btns" type="text" id="nameInput" placeholder="Enter Name">
        <button onclick="nextPage(2)">Next</button>
    </div>

    <!-- Page 2: Enter Password -->
    <div id="page2" class="page">
        <h3>Password</h3>
        <input class="reg-btns" type="password" id="passwordInput" placeholder="Enter password">
        <button onclick="nextPage(3)">Next</button>
    </div>
        
    <!-- Page 3: Enter API Key -->
    <div id="page3" class="page">
        <h3>API Key</h3>
        <input class="reg-btns" type="text" id="chatgptApiKeyInput" placeholder="Enter ChatGPT API Key (requirde)">
        <button id="registerPageRegisterBtn"onclick="register()">Sign Up</button>
    </div>`,
    collection_selector:`
    <div class="tags-title">Collections</div>
    <div class="tags-container" id="tagsContainer"></div>`,
    collection_delete_section: `
    <section class="collection-delete-section">
        <div class="collection-delete-section-container">
            <div class="back-button" id="backButton" data="collection-delete-section" onclick="backTo(event)">
                <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
            </div>
            <div class="collection-delete-container">
                <div class="collection-delete-btn-container">   
                    <font class="collection-delete-btn-title">Confarm delete</font>
                    <div class="collection-delete-btn-action-container">
                        <button del-data='yes' class='collection-delete-action-btn'>Yes</button>
                        <button del-data='no' class='collection-delete-action-btn'>No</button>
                    </div>
                </div>
            </div>
        </div>
    </section>`,
    userbutton:`
    <div class="user-button-section">
        <div id="user-button"></div>
        <div id="userButtonDropbox" class="user-button-dropbox hide">
            <div class="user-button-dropbox-item" onclick="setting()">Setting</div>     
        </div>
    </div>`,
    document_upload:`
    <div class="document-upload-container">
        <div class="back-button" id="backButton" onclick="dashboard()">
            <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
        </div>
        <div class="fileupbox">
            <div class="label">Pick Files</div>
            <div class="file-upload-box" onclick="document.getElementById('fileInput').click()">
                <div class="plus-icon">+</div>
                <div class="file-text" id="fileNamesText">Drag the files or Paste the files</div>
                
                <input type="file" id="fileInput" style="display: none;" accept=".txt,.pdf,.docx,.odt" multiple onchange="displayFileNames()">
            </div>
            <div class="file-format">Supported file format (TXT, PDF, DOCX, ODT)</div>
        </div>
        <div class="collection-name-section">
            <div class="label">Collection Name</div>
            <input type="text" class="input-box" id="collectionSelect" placeholder="Enter collection name" onclick="getCollections()" onkeyup="showSuggestionsCallection()">
            <img src="" id="collectionAvailabilityImg" class="document-upload-collection-availability-img">
        </div>
        <button class="upload-button" ID="docUplordSectionUplordButton" onclick="uploadDocument()">Upload</button>
    </div>`,
    sidebar:`
    <div class="sidebar show" id="sideBar">
        <div class="back-btn-sec">
            <img src="../public/icons/side-bar-hide.png" class="side-bar-hide-button-img" id="sideBarActionButton" alt="Send" onclick="sideBar('hide')">
        </div>
        <ul class="file-list" id="fileList"></ul>
        <span id="sidebarAddFileButton" class="add-tag-title" title="Update files">
            <div class="add-document-in-side-bar">
                <button onclick="collectionDocumentUpdateSection()" class="chat-section-document-add-btn"> + </button>
            </div>
        </span>
    </div>`,
    mainChat: `
    <div class="main-content">
        <div class="chatHeader">
            <div class="back-button" id="backButton" onclick="dashboard()">
                <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
            </div>
            <div class="chatTitle" id="chatTitle"></div>
        </div>
        <div class="content-box">
            <div class="result-show" id="resultDisplay"></div>
        </div>
        <!-- Chat Input -->
        <div class="messageBox" id="messageBox">
            <div class="chat-send-button" id="chatSendButton" onclick="submitQuery()">
                <img src="../public/icons/send-icon.png" class="send-button" alt="Send">
            </div>
        </div>
    </div>`,
    userSettingSection: `
    <section class="user-setting-section">
        <div class="setting-section-container">
            <!-- Tab Navigation -->
            <div class="settings-tabs-container">
                <div class="settings-tabs">
                    <div class="settings-tab active" data-tab="details">Persanal Details</div>
                    <div class="settings-tab" data-tab="model-switch">Models</div>
                </div>
            </div>
            <div class="back-button" id="backButton" data="user-setting-section" onclick="backTo(event)">
                <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
            </div>
            <div class="setting-container active" data-tab="details">
                <div class="setting-user-pic-container">
                    <div class="setting-user-pic">
                        <font class="setting-defult-user-pic" id="settingDefaltUserPic">Ra</font>
                    </div>
                </div>
                <div class="setting-user-all-details-container">
                    <div class="setting-user-one-detail-section">
                        <font class="setting-detaile-title">Name</font>
                        <div class="setting-user-detail-container">
                            <div class="setting-defult-user-name">
                                <font id="settingUserName">Raveen</font>
                            </div>
                            <div class="setting-user-details-edit-button" data="userName" onclick="passwordAutonticationSection(event)">
                                <img src="../public/icons/edit.png" class="edit-button-img" alt="edit">
                            </div>
                        </div>
                    </div>
                    <div class="setting-user-one-detail-section">
                        <font class="setting-detaile-title">Api Key</font>
                        <div class="setting-user-detail-container">
                            <div class="setting-defult-user-apikey">
                                <font id="settingUserApikey">.......................</font>
                            </div>
                            <div class="setting-user-details-edit-button" data="userAPIKey" onclick="passwordAutonticationSection(event)">
                                <img src="../public/icons/edit.png" class="edit-button-img" alt="edit">
                            </div>
                        </div>
                    </div>
                    <div class="setting-user-password-edit" id="settingUserPasswordEdit" data="userPassword" onclick="passwordAutonticationSection(event)">
                        <font>Change Password</font>
                        <img src="../public/icons/edit.png" class="edit-button-img" alt="edit">
                    </div>
                </div>
            </div>     
            <div class="setting-container" data-tab="model-switch">
                <div class="model-switch-container">
                    <div class="model-switch-section">
                        <font class="setting-detaile-title">LLM Model Switch</font>
                        <div class="model-switch-options">
                            <div class="switch-container" model="llm">
                                <div class="switch-head inactive"></div>
                                <div class="switch-lable" data-switch="inactive" model-data="chatGPT">
                                    <font class="switch-label-text">ChatGPT</font>
                                </div>
                                <div class="switch-lable" data-switch="active" model-data="gemini">
                                    <font class="switch-label-text">Gemini</font>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="model-switch-section" style="display:none;">
                        <font class="setting-detaile-title">Embedding Model Switch</font>
                        <div class="model-switch-options">
                            <div class="switch-container" model="embid">
                                <div class="switch-head embid inactive"></div>
                                <div class="switch-lable" data-switch="inactive" model-data="miniLm">
                                    <font class="switch-label-text">Mini-LM-V2</font>
                                </div>
                                <div class="switch-lable" data-switch="active" model-data="txtMbid">
                                    <font class="switch-label-text">TXT-Embid-S</font>
                                </div>
                            </div>                   
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`,
    userAuthonticationSection: `
    <section class="user-password-Authontication-section">
        <div class="user-password-Authontication-section-container">
            <div class="back-button" id="backButton" data="user-password-Authontication-section" onclick="backTo(event)">
                <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
            </div>
            <div class="user-password-Authontication-container">
                <div class="Authontication-password-container">   
                    <font class="Authontication-password-title">Password</font>
                    <div class="Authontication-password-input-container">
                        <input type="password" id="checkpasswordInput" placeholder="Enter Password" class="Authontication-password-input">
                    </div>
                    <button id="athonticationPasswordSubmit" onclick="userDataEditSection(event)">Next</button>
                </div>
            </div>
        </div>
    </section>`,
    userNameEditSection:`
    <section class="user-name-edit-section">
        <div class="user-name-edit-section-container">
            <div class="back-button" id="backButton" data="user-name-edit-section" onclick="backTo(event)">
                <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
            </div>
            <div class="user-name-edit-container">
                <div class="name-edit-container">   
                    <font class="name-edit-title">Edit User Name</font>
                    <div class="name-edit-input-container">
                        <input type="text" id="nameEditInput" placeholder="Enter User Name" class="name-edit-input">
                    </div>
                    <button id="userNameEditButton">Update</button>
                </div>
            </div>
        </div>
    </section>`,
    userAPIKeyEditSection:`
    <section class="user-apikey-edit-section">
        <div class="user-apikey-edit-section-container">
            <div class="back-button" id="backButton" data="user-apikey-edit-section" onclick="backTo(event)">
                <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
            </div>
            <div class="user-apikey-edit-container">
                <div class="apikey-edit-container">   
                    <font class="apikey-edit-title">Edit API Keys</font>
                    <div class="apikey-edit-input-container">
                        <font class="apikey-edit-models-title">Gemini API Key</font>
                        <input type="text" id="geminiapikeyEditInput" placeholder="Enter Gemini API Key" class="apikey-edit-input">
                        <font class="apikey-edit-models-title">Chat GPT API Key</font>
                        <input type="text" id="chatGPTapikeyEditInput" placeholder="Enter Chat GPT API Key" class="apikey-edit-input">
                    </div>
                    <button id="userApikeyEditButton">Update</button>
                </div>
            </div>
        </div>
    </section>`,
    userPasswordEditSection:`
    <section class="user-password-edit-section">
        <div class="user-password-edit-section-container">
            <div class="back-button" id="backButton" data="user-password-edit-section" onclick="backTo(event)">
                <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
            </div>
            <div class="user-password-edit-container">
                <div class="password-edit-container">   
                    <font class="password-edit-title">Edit Password</font>
                    <div class="password-edit-input-container">
                        <font class="password-edit-input-title">Enter Password</font>
                        <input type="password" id="passwordEditInput" class="password-edit-input">
                        <font class="password-edit-input-title">Re Enter Password</font>
                        <input type="password" id="passwordEditReInput" class="password-edit-input">
                    </div>
                    <button id="userPasswordEditButton">Update</button>
                </div>
            </div>
        </div>
    </section>`,
    collectionDocuentUpdataSection:`
    <section class="collection-document-update-section">
        <div class="collection-document-upload-section-container">
            <div class="collection-document-upload-container">
                <div class="back-button" id="backButton" data="collection-document-update-section" onclick="backToMessage(event)">
                    <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
                </div>
                <div class="fileupbox">
                    <div class="label">Pick Files</div>
                    <div class="file-upload-box" onclick="document.getElementById('fileInput').click()">
                        <div class="plus-icon">+</div>
                        <div class="file-text" id="fileNamesText">Drag the files or Paste the files</div>
                        <input type="file" id="fileInput" style="display: none;" accept=".txt,.pdf,.docx,.odt" multiple onchange="displayFileNames()">
                    </div>
                    <div class="file-format">Supported file format (TXT, PDF, DOCX, ODT)</div>
                </div>
                <div>
                    <div class="label">Collection Name</div>
                    <div class="input-box" id="collectionName"></div>
                </div>
                <button id="collectionDocumentUploadSectionContainer" class="upload-button" data="collection-document-update-section" onclick="updateCollectionDocuments(event)">Update</button>
            </div>     
        </div>
    </section>`,
    contextMenu: `
    <div id="custom-context-menu" class="custom-context-menu hide">
        <div class="context-menu-item" data-action="cut">Cut</div>
        <div class="context-menu-item" data-action="copy">Copy</div>
        <div class="context-menu-item" data-action="paste">Paste</div>
        <div class="context-menu-item" data-action="selectAll">Select All</div>
    </div>`
};

const notificationManager = new NotificationManager();
const uiManager = new UIManager(notificationManager);

const registerComponant = new Registration(notificationManager);
const dashboardComponant = new dashboard(notificationManager);
var collections;
var curruntpage; //'dashbord','message','userSetting'
var previouspage;
let contextMenuController;

// Create a global event manager
const eventManager = {
    // Store listeners by element and event type
    listeners: new Map(),
    
    // Add an event listener and track it
    addEventListener(element, type, callback, options) {
      // Get the unique ID for this element (for tracking purposes)
      if (!element._eventId) {
        element._eventId = Symbol('eventId');
      }
      
      // Initialize maps for this element if needed
      if (!this.listeners.has(element._eventId)) {
        this.listeners.set(element._eventId, new Map());
      }
      
      // Get or create the array of listeners for this event type
      const elementListeners = this.listeners.get(element._eventId);
      if (!elementListeners.has(type)) {
        elementListeners.set(type, []);
      }
      
      // Add this callback to our tracking array
      const callbacks = elementListeners.get(type);
      callbacks.push(callback);
      
      // Actually add the event listener to the element
      element.addEventListener(type, callback, options);
      
      // Return a function that can remove this specific listener
      return () => this.removeEventListener(element, type, callback);
    },
    
    // Remove a specific event listener
    removeEventListener(element, type, callback) {
      if (!element._eventId || !this.listeners.has(element._eventId)) {
        return false;
      }
      
      const elementListeners = this.listeners.get(element._eventId);
      if (!elementListeners.has(type)) {
        return false;
      }
      
      const callbacks = elementListeners.get(type);
      const index = callbacks.indexOf(callback);
      
      if (index !== -1) {
        callbacks.splice(index, 1);
        element.removeEventListener(type, callback);
        return true;
      }
      
      return false;
    },
    
    // Remove all event listeners of a specific type
    removeAllEventListeners(element, type) {
      if (!element._eventId || !this.listeners.has(element._eventId)) {
        return;
      }
      
      const elementListeners = this.listeners.get(element._eventId);
      
      if (type) {
        // Remove listeners of a specific type
        if (elementListeners.has(type)) {
          const callbacks = elementListeners.get(type);
          callbacks.forEach(callback => {
            element.removeEventListener(type, callback);
          });
          elementListeners.delete(type);
        }
      } else {
        // Remove all listeners from this element
        elementListeners.forEach((callbacks, eventType) => {
          callbacks.forEach(callback => {
            element.removeEventListener(eventType, callback);
          });
        });
        this.listeners.delete(element._eventId);
      }
    }
};

function addKeyEventInElement(addEventElement, visibleElement, keyName) {
    if (visibleElement) {    
        if (isElementVisibleToUser(visibleElement)) {
            eventManager.removeAllEventListeners(addEventElement,"keypress");
            eventManager.addEventListener(addEventElement,"keypress", function(event) {
                if (event.key === keyName) {
                    if (isElementVisibleToUser(visibleElement)) {
                        event.preventDefault();
                        visibleElement.click();
                    }
                }
            });
        }
    }
}

// notification section

function showNotification(type, title, content, showingTimeMS) {
    const container = document.getElementById('notification-container');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create notification structure
    notification.innerHTML = `
        <div class="notification-header">
            <div class="notification-title">${title}</div>
            <span class="notification-close">&times;</span>
        </div>
        <div class="notification-content" title="${content}">${content}</div>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Show notification with slight delay for animation
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    
    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto close after specified time, unless hovered
    let timeoutId;
    
    const startAutoCloseTimer = () => {
        timeoutId = setTimeout(() => {
            closeNotification(notification);
        }, showingTimeMS);
    };
    
    startAutoCloseTimer();
    
    // Pause auto close on hover
    notification.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
    });
    
    // Resume auto close when mouse leaves
    notification.addEventListener('mouseleave', () => {
        startAutoCloseTimer();
    });
}

function closeNotification(notification) {
    notification.classList.remove('visible');
    
    // Wait for animation to complete before removing
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 400); // Match the CSS transition time
}

// Function to initialize the custom context menu for text inputs
function initCustomContextMenu() {
    // Add the context menu element to the DOM
    document.body.insertAdjacentHTML('beforeend', UIComponents.contextMenu);
    
    const contextMenu = document.getElementById('custom-context-menu');
    let activeElement = null;
    
    // Function to apply context menu to text inputs
    function applyContextMenuToInputs() {
        const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"], textarea');
        
        textInputs.forEach(input => {
            // Prevent default context menu
            eventManager.addEventListener(input, 'contextmenu', function(e) {
            e.preventDefault();
            activeElement = this;
            showContextMenu(e.clientX, e.clientY);
            });
        });
    }
    
    // Add event listeners for the context menu items
    document.querySelectorAll('.context-menu-item').forEach(item => {
        eventManager.addEventListener(item, 'click', function() {
            if (!activeElement) return;
            
            const action = this.getAttribute('data-action');
            executeAction(action, activeElement);
            hideContextMenu();
        });
    });
    
    // Click outside to hide menu
    eventManager.addEventListener(document, 'click', function(e) {
        if (!contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });
    
    // Key events to hide menu on Escape
    eventManager.addEventListener(document, 'keydown', function(e) {
        if (e.key === 'Escape') {
            hideContextMenu();
        }
    });
    
    // Show the context menu at the given position
    function showContextMenu(x, y) {
        // Ensure menu stays within viewport bounds
        const menuWidth = 120; // Approximate width
        const menuHeight = 150; // Approximate height
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust x position if menu would go off screen
        if (x + menuWidth > viewportWidth) {
            x = viewportWidth - menuWidth - 5;
        }
        
        // Adjust y position if menu would go off screen
        if (y + menuHeight > viewportHeight) {
            y = viewportHeight - menuHeight - 5;
        }
        
        // Position the menu
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        
        // Update menu options based on selection
        updateMenuOptions();
        
        // Show the menu
        contextMenu.classList.remove('hide');
    }
    
    // Hide the context menu
    function hideContextMenu() {
        contextMenu.classList.add('hide');
    }
    
    // Update menu options based on current state
    function updateMenuOptions() {
      const hasSelection = activeElement && 
                          activeElement.selectionStart !== undefined && 
                          activeElement.selectionStart !== activeElement.selectionEnd;
      
      document.querySelector('.context-menu-item[data-action="cut"]').style.display = 
        hasSelection ? 'block' : 'none';
      
      document.querySelector('.context-menu-item[data-action="copy"]').style.display = 
        hasSelection ? 'block' : 'none';
    }
    
    // Execute the selected action
    async function executeAction(action, element) {
        switch(action) {
            case 'cut':
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    try {
                        // First copy the selected text
                        const selectedText = element.value.substring(element.selectionStart, element.selectionEnd);
                        await navigator.clipboard.writeText(selectedText);
                        
                        // Then delete the selected text
                        const start = element.selectionStart;
                        const end = element.selectionEnd;
                        element.value = element.value.substring(0, start) + element.value.substring(end);
                        element.setSelectionRange(start, start);
                    } catch (err) {
                        // Fallback to deprecated method if permission denied
                        document.execCommand('cut');
                    }
                } else {
                    // Fallback for browsers that don't support clipboard API
                    document.execCommand('cut');
                }
                break;
                
            case 'copy':
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    try {
                        const selectedText = element.value.substring(element.selectionStart, element.selectionEnd);
                        await navigator.clipboard.writeText(selectedText);
                    } catch (err) {
                        document.execCommand('copy');
                    }
                } else {
                    document.execCommand('copy');
                }
                break;
                
            case 'paste':
                if (navigator.clipboard && navigator.clipboard.readText) {
                    try {
                        const text = await navigator.clipboard.readText();
                        const start = element.selectionStart;
                        const end = element.selectionEnd;
                        element.value = element.value.substring(0, start) + text + element.value.substring(end);
                        element.setSelectionRange(start + text.length, start + text.length);
                    } catch (err) {
                        document.execCommand('paste');
                    }
                } else {
                    document.execCommand('paste');
                }
                break;
                
            case 'selectAll':
                element.select();
                break;
        }
    }
    
    // Apply to all existing text inputs initially
    applyContextMenuToInputs();
    
    // Return a function that can be called to apply to dynamically added inputs
    return {
        applyToNewInput: function(input) {
            eventManager.addEventListener(input, 'contextmenu', function(e) {
            e.preventDefault();
            activeElement = this;
            showContextMenu(e.clientX, e.clientY);
            });
        }
    };
}

function addContextMenuToInputs() {
    try {
        newInputs = document.querySelectorAll('input');

        newInputs.forEach(input => {
            contextMenuController.applyToNewInput(input);
        });
    } catch {}
}

// other section 

function pageUpdater(cPage) {
    previouspage = curruntpage;
    curruntpage = cPage;
}

window.onload = async function() {
    uiManager.registerComponent(registerComponant,'registration-card');
    uiManager.registerComponent()
    
    const profile = await isHaveProfile();
    
    if (profile.exists) {
        loadUserButton(profile);
        dashboard();
    } else {
        uiManager.navigateToView('registration-card','register');
        // loadUI("renderContainer","registerPages");   
        // // user name input part (input element focus and key event trigged)
        // document.querySelector("#nameInput").focus();
        // addKeyEventInElement(document,document.querySelector(`#page1`).querySelector("button"),"Enter");
    }
 
    // Initialize custom context menu
    // contextMenuController = initCustomContextMenu();
    
    // addContextMenuToInputs()
};

function loadUserButton(profile) {
    document.body.insertAdjacentHTML('beforeend', UIComponents.userbutton);
    document.getElementById('user-button').innerHTML = `<font class="user-title">${profile.userName[0].toUpperCase()}${profile.userName[1]}</font>`;
    
    // Add click event to user button using event manager
    eventManager.addEventListener(
        document.getElementById('user-button'), 
        'click', 
        function(event) {
            event.stopPropagation(); // Prevent the click from bubbling up to document
            const dropbox = document.getElementById('userButtonDropbox');
            dropbox.classList.toggle('hide');
        }
    );
    
    // Add click event to document to hide dropdown when clicking elsewhere
    eventManager.addEventListener(
        document, 
        'click', 
        function() {
            const dropbox = document.getElementById('userButtonDropbox');
            if (!dropbox.classList.contains('hide')) {
                dropbox.classList.add('hide');
            }
        }
    );
}


function loadUI(section,UIname) {
    if (UIComponents[UIname]) {
        document.getElementById(section).innerHTML = UIComponents[UIname];
    } else {
        //alert(`UI element "${UIname}" not found.`);
    }

}

function nextPage(pageNumber) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`page${pageNumber}`).classList.add('active');

    document.querySelector(`#page${pageNumber}`).querySelector("input").focus();

    addKeyEventInElement(document,document.querySelector(`#page${pageNumber}`).querySelector("button"),"Enter");

    if (document.querySelector(`#page${pageNumber -1}`).querySelector('input').value === '') {
        showNotification('Error', 'Empty inputs', 'Input your details', 3000);
        nextPage(pageNumber-1);
    }
}

function hideShow(id,visibility) {
    try{
        if (visibility === 'show') {
            document.getElementById(id).classList.replace('hide','show');
        } else {
            document.getElementById(id).classList.replace('show','hide');
        }
    } catch {}
}

async function register() {
    const nameInput = document.getElementById('nameInput').value;
    const passwordInput = document.getElementById('passwordInput').value;
    // const GeminiApiKeyInput = document.getElementById('geminiApiKeyInput').value;
    const ChatGPTApiKeyInput = document.getElementById('chatgptApiKeyInput').value;

    if(!ChatGPTApiKeyInput){
        showNotification('Error', 'Empty inputs', 'Input your API Key', 3000);
        return nextPage(3);
    }

    const formData = new FormData();
    formData.append('userName', nameInput);
    formData.append('password', passwordInput);
    formData.append('geminiApiKey', "GeminiApiKeyInput");
    formData.append('chatGPTApiKey', ChatGPTApiKeyInput);

    document.getElementById('registerPageRegisterBtn').innerHTML = `<img src="../public/icons/uploading.gif" class="collection-upload-lording-gif">`;

    try {
        const response = await fetch('http://127.0.0.1:5000/register', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        if (response.ok) {
            showNotification("Done", `Registration successful`, '', 3000);
            loadUserButton(await getProfile());
            dashboard();
        } else {
            showNotification("Error", `Registration error`, response, 3000); 
            nextPage(1);
        }
    } catch (error) {
        showNotification('Error', 'Other error',`${error}`, 3000);
        nextPage(1);
    }
}

async function setCollectionToUI() {
    const collections_List = await getCollections();

    document.getElementById('tagsContainer').innerHTML = 
        collections_List.map(letter => `
            <div class="tag" data-letter="${letter}">
                <div class="collection-dropbox hide">
                    <div class="user-button-dropbox-item">Delete</div>     
                </div>
                <font class="collection-tag-title">${letter}</font>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg" class="tag-icon-md">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z"
                        fill="currentColor"></path>
                </svg>
            </div>
        `).join("") 
        + `<span class="add-tag-title" title="Create new file collection"><div class="add-tag show" id="addTag" onclick="addDocument()">+</div></span>`;

    // Add event listeners to each tag
    const tagElements = Array.from(document.getElementsByClassName("tag"));

    tagElements.forEach(tag => {
        const icon = tag.querySelector('.tag-icon-md');
        const dropbox = tag.querySelector('.collection-dropbox');
        const deleteBtn = tag.querySelector('.user-button-dropbox-item');
        const letter = tag.dataset.letter;
        const tagwidth = tag.getBoundingClientRect().width;
        const titleElement = tag.querySelector('.collection-tag-title');
        tag.style.width = tagwidth + "px";

        // Hover to show/hide icon
        tag.addEventListener("mouseover", () => {
            icon.style.opacity = '100%';
            tag.style.width = tagwidth + 15 + "px";
            titleElement.style.left = -20 + "px";
        });

        tag.addEventListener("mouseout", () => {
            icon.style.opacity = '0%';
            tag.style.width = tagwidth + "px";
            titleElement.style.left = 0 + "px";
        });

        // Click icon to toggle dropbox
        icon.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent bubbling to outer click
            document.querySelectorAll('.collection-dropbox').forEach(box => {
                if (box !== dropbox) {
                    if (box.classList.contains('show')) {
                        box.classList.replace('show', 'hide');
                    }
                }
            });

            dropbox.classList.toggle('hide');
            dropbox.classList.toggle('show');
        });

        // Click delete option
        deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation(); // In case there's outer click handling
            await collectionDeleteSection(letter);
        });

        // Optional: clicking anywhere else on tag runs messageSection()
        tag.addEventListener("click", () => {
            messageSection(letter);
        });

        // Prevent click on dropbox from closing itself or triggering tag click
        dropbox.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    });

    document.addEventListener("click", () => {
        document.querySelectorAll('.collection-dropbox.show').forEach(box => {
            box.classList.replace('show', 'hide');
        });
    });
}

async function collectionDeleteSection(letter) {
    document.body.insertAdjacentHTML('beforeend', UIComponents.collection_delete_section);
    // document.getElementsByTagName('body')[0].innerHTML += UIComponents.co;
    const colldeleteBtn = Array.from(document.getElementsByClassName("collection-delete-action-btn"));
    colldeleteBtn.forEach(actBtn => {
        actBtn.addEventListener('click', async () => {
            const deleteData = actBtn.getAttribute('del-data');
            if (deleteData === 'yes') {
                await deleteCollection(letter);
                var Section = document.querySelector(`.collection-delete-section`);
                if (Section) {
                    Section.parentNode.removeChild(Section);
                }
            } else {
                var Section = document.querySelector(`.collection-delete-section`);
                if (Section) {
                    Section.parentNode.removeChild(Section);
                }
            }
        });
    });
}

async function deleteCollection(letter) {
    try {
        const formData = new FormData();
        formData.append('collection', letter);

        const response = await fetch('http://127.0.0.1:5000/delete/document/collection', {
            method: 'POST',
            body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification("Done", `The collection has been deleted`, '', 3000);
            dashboard()
            return  // Call dashboard function if upload is successful
        } else {
            showNotification("Error", `Unable to delete collection`, response, 3000);
        }
    } catch (error) {
        showNotification("Error", "Other error", error, 3000);
    }
}

async function dashboard() {
    hideShow('sideContainer','hide');
    loadUI("renderContainer","collection_selector");
    try {
        document.getElementById('fileList').innerHTML = '';
        document.getElementById('sideContainer').style.width = '20%';    
    } catch (error) {}
    document.getElementById('bodeContainer').style.width = '60%';
    hideShow('userButtonDropbox','hide')
    await setCollectionToUI()
}

async function updateLlmModel(modelName) {
    try {
        const formData = new FormData();
        formData.append('modelName', modelName);


        const response = await fetch('http://127.0.0.1:5000/update/model/llm', {
            method: 'POST',
            body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification("Done", `LLM model has been changed`, '', 3000);
            return  // Call dashboard function if upload is successful
        } else {
            showNotification("Error", `Unable to change LLM model`, response, 3000);
        }
    } catch (error) {
        showNotification("Error", "Other error", error, 3000);
    }
}

async function getLLMModel() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get/model/llm', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();

        return result.message.llm_model;

    } catch (error) {
        console.error("Error fetching LLM Model:", error);
        //alert("Failed to retrieve profile. See console for details.");
        return null;
    }    
}

async function setting() {
    // pageUpdater('userSetting');
    document.body.insertAdjacentHTML('beforeend', UIComponents.userSettingSection);
    // document.getElementsByTagName('body')[0].innerHTML += UIComponents.;
    username = (await getProfileName()).userName;
    document.getElementById('settingDefaltUserPic').innerHTML = `${username[0].toUpperCase()}${username[1]}`;

    document.getElementById('settingUserName').innerHTML = `${username}`;

    llm_model = getLLMModel();
    if (llm_model === "chatGPT") {
                
    } else {
        
    }
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.setting-container');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and tab contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.querySelector(`.setting-container[data-tab="${tabId}"]`).classList.add('active');
        });
    });

    // switching button
    const switches = document.querySelectorAll('.switch-lable');

    switches.forEach(swh => {
        swh.addEventListener('click', () => {
            const swhAct = swh.getAttribute('data-switch');
            // const modTyp = swh.parentElement.getAttribute('data');
            const swhMod = swh.getAttribute('model-data')

            swh.parentElement.querySelector('.switch-head').classList.remove('inactive');
            swh.parentElement.querySelector('.switch-head').classList.remove('active');
            swh.parentElement.querySelector('.switch-head').classList.add(swhAct);
            
            // updateLlmModel(swhMod);
            if (swhMod === "chatGPT") {
                updateLlmModel("chatGPT");
            } else {
                showNotification("Error", `Unable to change`, `Switching to ${swhMod} is not supported at this stage. \nThis feature will be implemented in Stage 3.`, 3000);
                swh.parentElement.querySelector('.switch-head').classList.remove('inactive');
                swh.parentElement.querySelector('.switch-head').classList.remove('active');
                swh.parentElement.querySelector('.switch-head').classList.add('inactive');
            }
        });
    });
}

async function collectionDocumentUpdateSection() {
    document.body.insertAdjacentHTML('beforeend', UIComponents.collectionDocuentUpdataSection);
    // document.getElementsByTagName('body')[0].innerHTML += UIComponents.;
    collectionName = document.getElementById('chatTitle').innerText;
    document.getElementById('collectionName').innerText = collectionName;

    collectionSectionUpdateBTN = document.getElementById('collectionDocumentUploadSectionContainer');
    collectionSectionUpdateBTN.focus();
    addKeyEventInElement(document, collectionSectionUpdateBTN, "Enter");

    addContextMenuToInputs()
}

async function updateCollectionDocuments(event) {
    let myevent={'currentTarget':event.currentTarget};
    const clicktarget = event.currentTarget;
    const fileInput = document.getElementById('fileInput');
    collectionName = document.getElementById('chatTitle').innerText;

    if (!fileInput.files.length) {
        //alert("Please select at least one file.");
        showNotification('Error', 'Empty inputs', 'No file selected', 3000);
        // document.getElementsByClassName('upload-button')[0].innerHTML = `<span class="add-tag-title" title="Not any file is picked">Error</span>`;
        return;
    }

    // Check if collection name is empty
    if (!collectionName || collectionName.trim() === '') {
        showNotification('Error', 'Empty inputs', 'Collection name is empty', 3000);
        // document.getElementsByClassName('upload-button')[0].innerHTML = `<span class="add-tag-title" title="No collection selected">Error</span>`;
        return;
    }

    // List of allowed file extensions
    const allowedExtensions = ['pdf', 'txt', 'docx', 'odt']; // Adjust this list as needed

    // Check each file's extension
    let hasInvalidExtension = false;
    let invalidefilename = "";
    for (let i = 0; i < fileInput.files.length; i++) {
        const filename = fileInput.files[i].name;
        const extension = getFileExtension(filename).toLowerCase();
        
        if (!allowedExtensions.includes(extension)) {
            hasInvalidExtension = true;
            invalidefilename = filename;
        }
    }

    // Optional: Show error message if invalid extensions were found
    if (hasInvalidExtension) {
        showNotification('Error', 'Invalid type inputs', `Invalid file type detected in : ${invalidefilename}`, 3000);
        // document.getElementsByClassName('upload-button')[0].innerHTML = `<span class="add-tag-title" title="Invalid file type detected in : ${invalidefilename}">Error</span>`;
        return;
    }
    
    // Initialize FormData
    const formData = new FormData();
    formData.append('collection', collectionName);

    // Append each file with key as "files"
    Array.from(fileInput.files).forEach((file) => {
        formData.append('files', file);  // Append each file separately
    });

    document.getElementsByClassName('upload-button')[0].innerHTML = `<img src="../public/icons/uploading.gif" class="collection-upload-lording-gif">`;

    try {
        const response = await fetch('http://127.0.0.1:5000/update/doc', {
            method: 'POST',
            body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification("Done", `File uploaded successfully`, '', 3000);
            backToMessage(myevent);  // Call dashboard function if upload is successful
        } else {
            showNotification("Error", `File upload error`, response, 3000);
        }
    } catch (error) {
        showNotification('Error', 'Other error',`${error}`, 3000);
    }
}

function backTo(event) {
    let clickedElement = event.currentTarget;
    let userData = clickedElement.getAttribute("data");
    var Section = document.querySelector(`.${userData}`);
    if (Section) {
        Section.parentNode.removeChild(Section);
    }
    hideShow('userButtonDropbox','hide');
    try {
        document.getElementById('messageInput').addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                submitQuery();
            }
        });
    } catch {}
}

function backToMessage(event) {
    let clickedElement = event.currentTarget;
    let userData = clickedElement.getAttribute("data");
    var Section = document.querySelector(`.${userData}`);
    if (Section) {
        Section.parentNode.removeChild(Section);
    }
    collection_name = document.getElementById('chatTitle').innerText;
    messageSection(collectionName);
}

async function userDataEditSection(event) {
    let clickedElement = event.currentTarget;
    let userData = clickedElement.getAttribute("data");
    var Section = document.querySelector(`.user-password-Authontication-section`);
    const password = document.getElementById('checkpasswordInput').value;
    if (password == '') {
        showNotification("Error", "Password cannot be empty", "", 3000);
        Section.parentNode.removeChild(Section);
        return;
    }
    const isValide = await checkPassword(password);
    if (Section) {
        Section.parentNode.removeChild(Section);
    }
    if (isValide.success) {
        switch (userData) {
            case 'userName':
                userNameEditSection();
                break;
            case 'userAPIKey':
                userAPIKeyEditSection();
                break;
            case 'userPassword':
                userPasswordEditSection();
                break;
            default:
                    break;
        }
    } else {
        showNotification("Error", "Incorrect password",'', 3000);
    }
}

function userNameEditSection() {
    document.body.insertAdjacentHTML('beforeend', UIComponents.userNameEditSection);
    usernamesubmitBTN = document.getElementById("userNameEditButton");
    document.querySelector("#nameEditInput").focus();

    addKeyEventInElement(document, usernamesubmitBTN, "Enter");

    // document.getElementsByTagName('body')[0].innerHTML += UIComponents.;
    usernamesubmitBTN.addEventListener("click", async () => {
        try {
            const userName = document.getElementById("nameEditInput").value;
            if(userName) {
                const formData = new FormData();
                formData.append('userName', userName);

                const response = await fetch('http://127.0.0.1:5000/update/profile/name', {
                    method: 'POST',
                    body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
                });

                const result = await response.json();

                if (response.ok) {
                    showNotification("Done", "User name has been changed", '', 3000);
                    var settingSection = document.querySelector(`.user-setting-section`);
                    if (settingSection) {
                        settingSection.parentNode.removeChild(settingSection);
                    }
                    document.getElementById('user-button').innerHTML = `<font class="user-title">${userName[0].toUpperCase()}${userName[1]}</font>`;
                    setting();
                    var editSection = document.querySelector(`.user-name-edit-section`);
                    if (editSection) {
                        editSection.parentNode.removeChild(editSection);
                    }
                } else {
                    showNotification("Error", "Unable to change username", response, 3000);
                }
            }
        } catch (error) {
            showNotification("Error", "Other error", error, 3000);
        }
    });

    addContextMenuToInputs()
}

async function userAPIKeyEditSection() {
    document.body.insertAdjacentHTML('beforeend', UIComponents.userAPIKeyEditSection);
    // document.getElementsByTagName('body')[0].innerHTML += UIComponents.;
    const apiData = await getProfileAPI()
    document.getElementById('geminiapikeyEditInput').value = apiData.geminiApiKey;
    document.getElementById('chatGPTapikeyEditInput').value = apiData.chatGPTApiKey;

    userapisubmitBTN = document.getElementById("userApikeyEditButton");
    document.querySelector("#chatGPTapikeyEditInput").focus();

    addKeyEventInElement(document, userapisubmitBTN, "Enter");

    userapisubmitBTN.addEventListener("click", async () => {
        try {
            const geminiApiKey = document.getElementById('geminiapikeyEditInput').value;
            const chatGPTApiKey = document.getElementById('chatGPTapikeyEditInput').value;
            if(geminiApiKey || chatGPTApiKey) {
                const formData = new FormData();
                formData.append('geminiApiKey', geminiApiKey);
                formData.append('chatGPTApiKey', chatGPTApiKey);

                const response = await fetch('http://127.0.0.1:5000/update/profile/api', {
                    method: 'POST',
                    body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
                });

                const result = await response.json();

                if (response.ok) {
                    showNotification("Done", "API key has been changed", '', 3000);
                    var editSection = document.querySelector(`.user-apikey-edit-section`);
                    if (editSection) {
                        editSection.parentNode.removeChild(editSection);
                    }
                } else {
                    showNotification("Error", "Unable to change API key", response, 3000);
                }
            }
        } catch (error) {
            showNotification("Error", "Other error", error, 3000);
        }
    });
    // chatGPTapikeyEditInput , geminiapikeyEditInput

    addContextMenuToInputs()
}

function userPasswordEditSection() {
    document.body.insertAdjacentHTML('beforeend', UIComponents.userPasswordEditSection);

    userpasswordsubmitBTN = document.getElementById("userPasswordEditButton");
    document.querySelector("#passwordEditInput").focus();

    addKeyEventInElement(document, userpasswordsubmitBTN, "Enter");

    // document.getElementsByTagName('body')[0].innerHTML += UIComponents.;
    userpasswordsubmitBTN.addEventListener("click", async () => {
        try {
            const password = document.getElementById('passwordEditInput').value;
            const repassword = document.getElementById('passwordEditReInput').value;
            if(password) {
                if(password === repassword) {
                    const formData = new FormData();
                    formData.append('password', password);
                    formData.append('repassword', repassword);
    
                    const response = await fetch('http://127.0.0.1:5000/update/profile/password', {
                        method: 'POST',
                        body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
                    });
    
                    const result = await response.json();
    
                    if (response.ok) {
                        showNotification("Done", "Password has been changed", '', 3000);
                        var editSection = document.querySelector(`.user-password-edit-section`);
                        if (editSection) {
                            editSection.parentNode.removeChild(editSection);
                        }
                    } else {
                        showNotification("Error", "Other error", response, 3000);
                    }
                } else {
                    showNotification("Error", "Password mismatch detected", '', 3000);
                }
            } else {
                showNotification("Error", "Password cannot be empty", '', 3000);
            } 
        } catch (error) {
            console.log(error);
            showNotification("Error", "Other error", error, 3000);
        }
    });

    addContextMenuToInputs()
}

function passwordAutonticationSection(event) {
    let clickedElement = event.currentTarget;
    let userData = clickedElement.getAttribute("data");
    document.body.insertAdjacentHTML('beforeend', UIComponents.userAuthonticationSection);
    // document.getElementsByTagName('body')[0].innerHTML += UIComponents.userAuthonticationSection;
    document.getElementById('athonticationPasswordSubmit').setAttribute('data',userData);

    passwordsubmitBTN = document.querySelector("#athonticationPasswordSubmit");
    document.querySelector("#checkpasswordInput").focus();

    addKeyEventInElement(document, passwordsubmitBTN, "Enter");

    addContextMenuToInputs()
}

function addDocument() {
    loadUI("renderContainer","document_upload");
    hideShow('userButtonDropbox','hide');

    uploadCollectionBTN = document.querySelector("#docUplordSectionUplordButton");
    uploadCollectionBTN.focus();

    addKeyEventInElement(document, uploadCollectionBTN, "Enter");

    addContextMenuToInputs()
    
}

function getFileExtension(filename) {
    return filename.split('.').pop();
}

async function messageSection(collectionName) {
    pageUpdater('message');
    hideShow('sideContainer','show');
    hideShow('userButtonDropbox','hide');
    loadUI("renderContainer","mainChat");
    loadUI("sideContainer","sidebar");
    document.getElementById('chatTitle').innerHTML = collectionName;
    fileList = await getfileNames(collectionName);
    document.getElementById('fileList').innerHTML = fileList.map(file => `
        <li class="file-item" data-letter="${file}">
            <img src="../public/icons/${getFileExtension(file)}.png" class="file-extention-img" alt="${getFileExtension(file)}-file">
            <span class="file-title" title="${file}">${file}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" class="file-icon-md" style="display: none;">
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z"
                    fill="currentColor"></path>
            </svg>
            <div class="file-dropbox hide">
                <div class="user-button-dropbox-item">Delete</div>     
            </div>
        </li>\n
        `).join("");

    inputMessageBox = document.getElementById('messageBox');
    inputMessageBox.innerHTML = `<input type="text" class="messageInput" id="messageInput" placeholder="Type your question">` + inputMessageBox.innerHTML;
    
    messageInput = document.querySelector("#messageInput");
    messageInput.focus();


    messageSendBTN = document.getElementById("chatSendButton");

    addKeyEventInElement(document, messageSendBTN, "Enter");

    // Add event listeners to each tag
    const fileElements = Array.from(document.getElementsByClassName("file-item"));

    fileElements.forEach(fileEL => {
        const icon = fileEL.querySelector('.file-icon-md');
        const dropbox = fileEL.querySelector('.file-dropbox');
        const deleteBtn = fileEL.querySelector('.user-button-dropbox-item');
        const filename = fileEL.dataset.letter;

        // Hover to show/hide icon
        fileEL.addEventListener("mouseover", () => {
            icon.style.display = 'block';
        });

        fileEL.addEventListener("mouseout", () => {
            icon.style.display = 'none';
        });

        icon.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent bubbling to outer click
            
            // Close any other open dropboxes
            document.querySelectorAll('.file-dropbox').forEach(box => {
                if (box !== dropbox) {
                    if (box.classList.contains('show')) {
                        box.classList.replace('show', 'hide');
                    }
                }
            });
            
            // Calculate and set position of the dropbox relative to the icon
            const iconRect = icon.getBoundingClientRect();
            
            // Position the dropbox next to the 3-dot button
            dropbox.style.position = 'absolute';
            dropbox.style.top = (iconRect.y - 12) + 'px';
            dropbox.style.left = (iconRect.x) + 'px';
            dropbox.style.width = 47 + 'px';
            
            // Toggle visibility classes
            dropbox.classList.toggle('hide');
            dropbox.classList.toggle('show');
        });

        // Click delete option
        deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation(); // In case there's outer click handling
            await fileDeleteSection(filename,collectionName);
        });

        // Optional: clicking anywhere else on tag runs messageSection()
        fileEL.addEventListener("click", () => {
            // messageSection(letter); file view funcion
        });

        // Prevent click on dropbox from closing itself or triggering tag click
        dropbox.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    });

    // Close all dropboxes when clicking elsewhere
    document.addEventListener("click", () => {
        document.querySelectorAll('.collection-dropbox.show, .file-dropbox.show').forEach(box => {
            box.classList.replace('show', 'hide');
        });
    });

    // Handle both scroll events and wheel events (for touchpad two-finger scrolling)
    window.addEventListener("scroll", closeAllDropboxes);
    window.addEventListener("wheel", closeAllDropboxes);

    // Function to close all open dropboxes
    function closeAllDropboxes() {
        document.querySelectorAll('.collection-dropbox.show, .file-dropbox.show').forEach(box => {
            box.classList.replace('show', 'hide');
        });
    }

    addContextMenuToInputs()
}

async function fileDeleteSection(filename,collectionname) {
    document.body.insertAdjacentHTML('beforeend', UIComponents.collection_delete_section);
    // document.getElementsByTagName('body')[0].innerHTML += UIComponents.co;
    const colldeleteBtn = Array.from(document.getElementsByClassName("collection-delete-action-btn"));
    colldeleteBtn.forEach(actBtn => {
        actBtn.addEventListener('click', async () => {
            const deleteData = actBtn.getAttribute('del-data');
            if (deleteData === 'yes') {
                await deleteFile(filename,collectionname);
                var Section = document.querySelector(`.collection-delete-section`);
                if (Section) {
                    Section.parentNode.removeChild(Section);
                }
                return;
            } else {
                var Section = document.querySelector(`.collection-delete-section`);
                if (Section) {
                    Section.parentNode.removeChild(Section);
                }
                return;
            }
        });
    });
}

async function deleteFile(filename,collectionname) {
    try {
        const formData = new FormData();
        formData.append('collection', collectionname);
        formData.append('fileName', filename);
        console.log("fileName: ",filename)
        const response = await fetch('http://127.0.0.1:5000/delete/document/files', {
            method: 'POST',
            body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification("Done", `The file has been deleted`, '', 3000);
            return messageSection(collectionname);
              // Call dashboard function if upload is successful
        } else {
            showNotification("Error", `Unable to delete file`, response, 3000);
        }
    } catch (error) {
        showNotification("Error", "Other error", error, 3000);
        return;
    }
}

function sideBar(visibility) {
    if (visibility === 'show') {
        document.getElementById('sideBarActionButton').setAttribute('src', "../public/icons/side-bar-hide.png");
        document.getElementById('sideBarActionButton').setAttribute('onclick', "sideBar('hide')");
        document.getElementById('sideContainer').style.width = '20%';
        document.getElementById('bodeContainer').style.width = '60%';  // Note: Possible typo 'bode' instead of 'body'
        hideShow('userButtonDropbox', 'hide');
        
        // Start fileList animation
        document.getElementById('fileList').style.opacity = '0';
        document.getElementById('fileList').style.display = 'block';

        // Start fileList animation
        document.getElementById('sidebarAddFileButton').style.opacity = '0';
        document.getElementById('sidebarAddFileButton').style.display = 'block';
        
        // Use setTimeout to create animation effect after a tiny delay
        setTimeout(() => {
            document.getElementById('fileList').style.opacity = '100%';
            document.getElementById('sideBar').style.borderRight = '1px solid #cccccc';
            document.getElementById('sidebarAddFileButton').style.opacity = '100%';
        }, 10);
        
        
        
        document.querySelectorAll('.file-title').forEach(file => {
            file.classList.remove('hidden');
        });
    } else {
        document.getElementById('sideBarActionButton').setAttribute('src', "../public/icons/side-bar-show.png");
        document.getElementById('sideBarActionButton').setAttribute('onclick', "sideBar('show')");
        document.getElementById('sideContainer').style.width = '6%';
        document.getElementById('bodeContainer').style.width = '75%';  // Possible typo 'bode' instead of 'body'
        hideShow('userButtonDropbox', 'hide');
        
        // Start fading out the fileList
        document.getElementById('fileList').style.opacity = '0';
        document.getElementById('sidebarAddFileButton').style.opacity = '0';
        
        // Wait for the fade out animation to complete before hiding
        setTimeout(() => {
            document.getElementById('fileList').style.display = 'none';
            document.getElementById('sideBar').style.borderRight = '1px solid #cccccc00';
            document.getElementById('sidebarAddFileButton').style.display = 'none';
        }, 300); // Match this to your CSS transition duration
        
        
        
        document.querySelectorAll('.file-title').forEach(file => {
            file.classList.add('hidden');
        });
    }
}

async function showSuggestionsCallection() {
    const input = document.getElementById("collectionSelect");
    const query = input.value.toLowerCase();
    const availability = document.getElementById('collectionAvailabilityImg');
    const uplord_button = document.getElementById("docUplordSectionUplordButton");
    if (query) {
        if (collections.includes(query)) {
            availability.setAttribute('src','../public/icons/unavailable.png');
            uplord_button.disabled = true;
            return;
        } else {
            availability.setAttribute('src','../public/icons/available.png');
            uplord_button.disabled = false;
        }
    }
}

async function getProfile() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get/profile', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();

        return { 
            userName: result.message.userName, 
            apiKey: result.message.apiKey
        };

    } catch (error) {
        console.error("Error fetching profile:", error);
        //alert("Failed to retrieve profile. See console for details.");
        return { userName: null, apiKey: null };
    }
}

async function getProfileName() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get/profile/name', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();

        return { 
            userName: result.message.userName, 
        };

    } catch (error) {
        console.error("Error fetching profile:", error);
        //alert("Failed to retrieve profile. See console for details.");
        return { userName: null, apiKey: null };
    }
}

async function isHaveProfile() {
    try {
        const response = await fetch("http://127.0.0.1:5000/get/profile/name", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                exists: true,
                userName: data.message.userName
            };
        } else if (response.status === 404) {
            return {
                exists: false,
                userName: null
            };
        } else {
            const errorData = await response.json();
            console.error("Error:", errorData.error || "Unknown error");
            return {
                exists: false,
                error: errorData.error || "Unexpected error"
            };
        }
    } catch (err) {
        console.error("Request failed:", err);
        return {
            exists: false,
            error: "Network error or server is unreachable"
        };
    }
}

async function getProfileAPI() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get/profile/api', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();

        return { 
            geminiApiKey: result.message.geminiApiKey, 
            chatGPTApiKey: result.message.chatGPTApiKey, 
        };

    } catch (error) {
        console.error("Error fetching profile:", error);
        //alert("Failed to retrieve profile. See console for details.");
        return {geminiApiKey: null ,chatGPTApiKey: null};
    }
}

async function checkPassword(password) {
    // let password = document.getElementById(uiElementId)?.value;
    
    if (!password) {
        console.error("Password field is empty or element not found!");
        return;
    }

    try {
        let response = await fetch("http://127.0.0.1:5000/check/password", {
            method: "POST",  // Adjust method as per API (usually POST for password checks)
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password: password })
        });

        let data = await response.json();  // Assuming the server responds with JSON

        return data // Return the server response for further handling
    } catch (error) {
        console.error("Error checking password:", error);
    }
}

function displayFileNames() {
    const fileInput = document.getElementById('fileInput');
    const fileNamesText = document.getElementById('fileNamesText');
    
    const files = fileInput.files;
    if (files.length > 0) {
        // Display the names of the selected files
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        fileNamesText.textContent = fileNames; // Update the text with file names
        fileNamesText.style.height = '64px'
    } else {
        fileNamesText.textContent = 'Drag the files or Paste the files'; // Default text
        fileNamesText.style.height = '16px'
    }
}

function validateCollectionName(name) {
    // Check for length requirements (3-63 characters)
    if (name.length < 3 || name.length > 63) {
        return {
            isValid: false,
            error: "Collection name must be between 3 and 63 characters long."
        };
    }
    
    // Check that it only contains allowed characters [a-zA-Z0-9._-]
    const validCharsRegex = /^[a-zA-Z0-9._-]+$/;
    if (!validCharsRegex.test(name)) {
        return {
            isValid: false,
            error: "Collection name can only contain letters, numbers, periods, underscores, and hyphens."
        };
    }
    
    // Check that it starts and ends with alphanumeric characters [a-zA-Z0-9]
    const validStartEndRegex = /^[a-zA-Z0-9].*[a-zA-Z0-9]$/;
    if (!validStartEndRegex.test(name)) {
        return {
            isValid: false, 
            error: "Collection name must start and end with a letter or number."
        };
    }
    
    // If all checks pass
    return {
        isValid: true,
        error: null
    };
}

async function uploadDocument() {
    const fileInput = document.getElementById('fileInput');
    const collection = document.getElementById('collectionSelect').value;

    if (!fileInput.files.length) {
        //alert("Please select at least one file.");
        showNotification('Error', 'Empty inputs', 'No file selected', 3000);
        // document.getElementsByClassName('upload-button')[0].innerHTML = `<span class="add-tag-title" title="Not any file is picked">Error</span>`;
        return;
    }

    // Check if collection name is empty
    if (!collection || collection.trim() === '') {
        showNotification('Error', 'Empty inputs', 'Collection name is empty', 3000);
        // document.getElementsByClassName('upload-button')[0].innerHTML = `<span class="add-tag-title" title="No collection selected">Error</span>`;
        return;
    }

    if (!(validateCollectionName(collection).isValid)) {
        validationResult = validateCollectionName(collection);
        showNotification('Error', 'Invalid collection name', validationResult.error, 3000);
        return
    }

    // List of allowed file extensions
    const allowedExtensions = ['pdf', 'txt', 'docx', 'odt']; // Adjust this list as needed

    // Check each file's extension
    let hasInvalidExtension = false;
    let invalidefilename = "";
    for (let i = 0; i < fileInput.files.length; i++) {
        const filename = fileInput.files[i].name;
        const extension = getFileExtension(filename).toLowerCase();
        
        if (!allowedExtensions.includes(extension)) {
            hasInvalidExtension = true;
            invalidefilename = filename;
        }
    }

    // Optional: Show error message if invalid extensions were found
    if (hasInvalidExtension) {
        showNotification('Error', 'Invalid type inputs', `Invalid file type detected in : ${invalidefilename}`, 3000);
        // document.getElementsByClassName('upload-button')[0].innerHTML = `<span class="add-tag-title" title="Invalid file type detected in : ${invalidefilename}">Error</span>`;
        return;
    }
    
    // Initialize FormData
    const formData = new FormData();
    formData.append('collection', collection);

    // Append each file with key as "files"
    Array.from(fileInput.files).forEach((file) => {
        formData.append('files', file);  // Append each file separately
    });
    
    document.getElementsByClassName('upload-button')[0].innerHTML = `<img src="../public/icons/uploading.gif" class="collection-upload-lording-gif">`;

    try {
        const response = await fetch('http://127.0.0.1:5000/upload/doc', {
            method: 'POST',
            body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification("Done", `Collection added successfully`, '', 3000);
            dashboard();  // Call dashboard function if upload is successful
        } else {
            showNotification("Error", `Unable to add collection`, response, 3000);
            
        }
    } catch (error) {
        showNotification('Error', 'Other error',`${error}`, 3000);
    }
}

async function getCollections() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get/document/collections', {
            method: 'POST',
        });
        const result = await response.json();
        collections = result.message;
        return result.message;

    } catch (error) {
        return [];
    }
}

async function getfileNames(collection) {
    const formData = new FormData();
    formData.append('collection', collection);
    try {
        const response = await fetch('http://127.0.0.1:5000/get/document/filenames', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        return result.message;
    } catch (error) {
        return [];
    }
}

async function getDocument() {
    const fileNameInput = document.getElementById('fileNameInput').value;
    const collection = document.getElementById('collectionSelect').value;

    const formData = new FormData();
    formData.append('fileName', fileNameInput);
    formData.append('collection', collection);

    try {
        const response = await fetch('http://127.0.0.1:5000/get/document', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        document.getElementById('resultDisplay').innerHTML = `<p>${result.message || result.error}</p>`;
    } catch (error) {
        console.error("Error uploading file:", error);
        //alert("Upload failed. See console for details.");
    }
}

async function getDatabase() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get/database', {
            method: 'POST',
        });
        const result = await response.json();
        console.log(result);
        // document.getElementById('resultDisplay').innerHTML = `<p>${result.message || result.error}</p>`;
    } catch (error) {
        console.error("Error uploading file:", error);
        //alert("Upload failed. See console for details.");
    }
}

function isElementVisibleToUser(element) {
    // 1. Basic existence check
    if (!element) return false;
    
    // 2. Check computed style properties
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || 
        style.visibility === 'hidden' || 
        style.opacity === '0') {
      return false;
    }
    
    // 3. Check if element has dimensions
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    
    // 4. Check if element is in viewport
    if (rect.bottom < 0 || rect.top > window.innerHeight ||
        rect.right < 0 || rect.left > window.innerWidth) {
      return false;
    }
    
    // 5. Check if element is covered by other elements (overlay check)
    // Get the center point of the element
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Get the element at this point (the topmost element)
    const elementAtPoint = document.elementFromPoint(centerX, centerY);
    
    // Check if our element or one of its children is the topmost element
    return element.contains(elementAtPoint) || element === elementAtPoint;
}

function checkMessageBoxVisibility() {
    const messageBox = document.querySelector("#messageBox");
    const isVisible = isElementVisibleToUser(messageBox);
    
    if (isVisible) {
      console.log("MessageBox is visible to the user");
      document.addEventListener('keypress', handleKeyPress);
    } else {
      console.log("MessageBox is hidden or covered by an overlay");
      document.removeEventListener('keypress', handleKeyPress);
    }
}

async function submitQuery() {
    const query = document.getElementById('messageInput').value;
    const collection = document.getElementById('chatTitle').innerText; // or add separate collection selection if needed

    if (!query.trim()) {
        //alert("Please enter a query.");
        return;
    }

    const formData = new FormData();
    formData.append('query', query);
    formData.append('collection', collection);

    document.getElementById('resultDisplay').innerHTML = `<img src="../public/icons/think.png" class="ai-thinking">`;
    document.getElementById('messageInput').value = '';
    try {
        const response = await fetch('http://127.0.0.1:5000/query', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        document.getElementById('resultDisplay').innerHTML = `${result.response || result.error}`;
    } catch (error) {
        console.error("Error submitting query:", error);
        //alert("Query failed. See console for details.");
    }
}