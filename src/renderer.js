const UIComponents = {
    registerPages:`
    <!-- Page 1: Enter Name -->
    <div id="page1" class="page active">
        <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="User Icon" class="profile-icon">
        <h3>Name</h3>
        <input type="text" id="nameInput" placeholder="Enter Name">
        <button onclick="nextPage(2)">Next</button>
    </div>

    <!-- Page 2: Enter Password -->
    <div id="page2" class="page">
        <h3>Password</h3>
        <input type="password" id="passwordInput" placeholder="Enter password">
        <button onclick="nextPage(3)">Next</button>
    </div>
        
    <!-- Page 3: Enter API Key -->
    <div id="page3" class="page">
        <h3>API Key</h3>
        <div class="register-page-input-container">
            <input type="text" id="chatgptApiKeyInput" placeholder="Enter ChatGPT API Key (requirde)">
            <input type="text" id="geminiApiKeyInput" placeholder="Enter Gemini API Key (optional)">
        </div>
        <button onclick="register()">Sign Up</button>
    </div>`,
    collection_selector:`
    <div class="tags-container" id="tagsContainer"></div>`,
    userbutton:`
    <div class="user-button-section">
        <div id="user-button" onclick="showUserDropDown()"></div>
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
                
                <input type="file" id="fileInput" style="display: none;" multiple onchange="displayFileNames()">
            </div>
            <div class="file-format">Supported file format (Text)</div>
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
        <div class="add-document-in-side-bar">
            <button onclick="collectionDocumentUpdateSection()" class="chat-section-document-add-btn"> + </button>
        </div>
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
    userSettingEditSection: `
    <section class="user-password-Authontication-section">
        <div class="user-password-Authontication-section-container">
            <div class="back-button" id="backButton" data="user-password-Authontication-section" onclick="backTo(event)">
                <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
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
                        <input type="text" id="checkpasswordInput" placeholder="Enter Password" class="Authontication-password-input">
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
                        <input type="text" id="passwordEditInput" class="password-edit-input">
                        <font class="password-edit-input-title">Re Enter Password</font>
                        <input type="text" id="passwordEditReInput" class="password-edit-input">
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
                        <input type="file" id="fileInput" style="display: none;" multiple onchange="displayFileNames()">
                    </div>
                    <div class="file-format">Supported file format (Text)</div>
                </div>
                <div>
                    <div class="label">Collection Name</div>
                    <div class="input-box" id="collectionName"></div>
                </div>
                <button class="upload-button" data="collection-document-update-section" onclick="updateCollectionDocuments(event)">Update</button>
            </div>     
        </div>
    </section>`,
};

var collections;

window.onload = async function() {
    profile = await getProfile();
    
    if (profile.userName || profile.apiKey) {
        document.getElementsByTagName('body')[0].innerHTML += UIComponents.userbutton;
        document.getElementById('user-button').innerHTML = `<font class="user-title">${profile.userName[0].toUpperCase()}${profile.userName[1]}</font>`;
        dashboard();
    } else {
        loadUI("renderContainer","registerPages");   
    }
};

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
    const GeminiApiKeyInput = document.getElementById('geminiApiKeyInput').value;
    const ChatGPTApiKeyInput = document.getElementById('chatgptApiKeyInput').value;

    if(!ChatGPTApiKeyInput){
        return nextPage(1);
    }

    const formData = new FormData();
    formData.append('userName', nameInput);
    formData.append('password', passwordInput);
    formData.append('geminiApiKey', GeminiApiKeyInput);
    formData.append('chatGPTApiKey', ChatGPTApiKeyInput);
    try {
        const response = await fetch('http://127.0.0.1:5000/register', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        username = (await getProfile()).userName;
        document.getElementsByTagName('body')[0].innerHTML += UIComponents.userbutton;
        document.getElementById('user-button').innerHTML = `<font class="user-title">${username[0].toUpperCase()}${username[1]}</font>`;
        dashboard();
    } catch (error) {
        console.error("Error uploading file:", error);
        //alert("Upload failed. See console for details.");
        nextPage(1);
    }
}

async function setCollectionToUI() {
    collections_List = await getCollections()
    document.getElementById('tagsContainer').innerHTML = collections_List.map(letter => `<div class="tag" onclick="messageSection('${letter}')">${letter}</div>\n`).join("") + `<div class="add-tag show" id="addTag" onclick="addDocument()">+</div>`;
}

function showUserDropDown() {
    try {
        let dropdown = document.getElementById('userButtonDropbox');
        if (dropdown.classList.contains('show')) {
            hideShow('userButtonDropbox', 'hide');
        } else {
            hideShow('userButtonDropbox', 'show');
        }
    } catch (error) {
        console.error("Error in showUserDropDown:", error);
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
            return  // Call dashboard function if upload is successful
        }
    } catch (error) {
        console.error("Error uploading files:", error);
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
    document.getElementsByTagName('body')[0].innerHTML += UIComponents.userSettingSection;
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
            
            updateLlmModel(swhMod);

            swh.parentElement.querySelector('.switch-head').classList.remove('inactive');
            swh.parentElement.querySelector('.switch-head').classList.remove('active');
            swh.parentElement.querySelector('.switch-head').classList.add(swhAct);
        });
    });
}

async function collectionDocumentUpdateSection() {
    document.getElementsByTagName('body')[0].innerHTML += UIComponents.collectionDocuentUpdataSection;
    collectionName = document.getElementById('chatTitle').innerText;
    document.getElementById('collectionName').innerText = collectionName;
}

async function updateCollectionDocuments(event) {
    let myevent={'currentTarget':event.currentTarget};
    const clicktarget = event.currentTarget;
    const fileInput = document.getElementById('fileInput');
    collectionName = document.getElementById('chatTitle').innerText;

    document.getElementsByClassName('upload-button')[0].innerHTML = `<img src="../public/icons/uploading.gif" class="collection-upload-lording-gif">`;

    if (!fileInput.files.length) {
        //alert("Please select at least one file.");
        return;
    }
    
    // Initialize FormData
    const formData = new FormData();
    formData.append('collection', collectionName);

    // Append each file with key as "files"
    Array.from(fileInput.files).forEach((file) => {
        formData.append('files', file);  // Append each file separately
    });

    try {
        const response = await fetch('http://127.0.0.1:5000/update/doc', {
            method: 'POST',
            body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
        });

        const result = await response.json();

        if (response.ok) {
            backToMessage(myevent);  // Call dashboard function if upload is successful
        } else {
            //alert(`Upload failed: ${result.error}`);
        }
    } catch (error) {
        console.error("Error uploading files:", error);
        //alert("Upload failed. See console for details.");
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
    const password = document.getElementById('checkpasswordInput').value;
    const isValide = await checkPassword(password);
    var Section = document.querySelector(`.user-password-Authontication-section`);
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
    } else {}
}

function userNameEditSection() {
    document.getElementsByTagName('body')[0].innerHTML += UIComponents.userNameEditSection;
    document.getElementById("userNameEditButton").addEventListener("click", async () => {
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
                    console.log(response);
                }
            }
        } catch (error) {
            console.log(error);
        }
    });
}

async function userAPIKeyEditSection() {
    document.getElementsByTagName('body')[0].innerHTML += UIComponents.userAPIKeyEditSection;
    const apiData = await getProfileAPI()
    document.getElementById('geminiapikeyEditInput').value = apiData.geminiApiKey;
    document.getElementById('chatGPTapikeyEditInput').value = apiData.chatGPTApiKey;
    document.getElementById("userApikeyEditButton").addEventListener("click", async () => {
        try {
            const geminiApiKey = document.getElementById('geminiapikeyEditInput').value;
            const chatGPTApiKey = document.getElementById('chatGPTapikeyEditInput').value;
            if(geminiApiKey) {
                const formData = new FormData();
                formData.append('geminiApiKey', geminiApiKey);
                formData.append('chatGPTApiKey', chatGPTApiKey);

                const response = await fetch('http://127.0.0.1:5000/update/profile/api', {
                    method: 'POST',
                    body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
                });

                const result = await response.json();

                if (response.ok) {
                    var editSection = document.querySelector(`.user-apikey-edit-section`);
                    if (editSection) {
                        editSection.parentNode.removeChild(editSection);
                    }
                } else {
                    console.log(response);
                }
            }
        } catch (error) {
            console.log(error);
        }
    });
    // chatGPTapikeyEditInput , geminiapikeyEditInput

    
}

function userPasswordEditSection() {
    document.getElementsByTagName('body')[0].innerHTML += UIComponents.userPasswordEditSection;
    document.getElementById("userPasswordEditButton").addEventListener("click", async () => {
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
                        var editSection = document.querySelector(`.user-password-edit-section`);
                        if (editSection) {
                            editSection.parentNode.removeChild(editSection);
                        }
                    } else {
                        console.log(response);
                    }
                }
            }  
        } catch (error) {
            console.log(error);
        }
    });
}

function passwordAutonticationSection(event) {
    let clickedElement = event.currentTarget;
    let userData = clickedElement.getAttribute("data");
    document.getElementsByTagName('body')[0].innerHTML += UIComponents.userAuthonticationSection;
    document.getElementById('athonticationPasswordSubmit').setAttribute('data',userData);
}

function addDocument() {
    loadUI("renderContainer","document_upload");
    hideShow('userButtonDropbox','hide');
}

function getFileExtension(filename) {
    return filename.split('.').pop();
}

async function messageSection(collectionName) {
    hideShow('sideContainer','show');
    hideShow('userButtonDropbox','hide');
    loadUI("renderContainer","mainChat");
    loadUI("sideContainer","sidebar");
    document.getElementById('chatTitle').innerHTML = collectionName;
    fileList = await getfileNames(collectionName);
    document.getElementById('fileList').innerHTML = fileList.map(file => `
        <li class="file-item" onclick="fileview('${file}')">
        <img src="../public/icons/${getFileExtension(file)}.png" class="file-extention-img" alt="${getFileExtension(file)}-file">
        <font class="file-title">${file}</font>
        </li>\n
        `).join("");
    document.getElementById('messageBox').innerHTML = `<input type="text" class="messageInput" id="messageInput" placeholder="Type your question" onclick="this.focus()">` + document.getElementById('messageBox').innerHTML;

    document.getElementById('messageInput').addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            submitQuery();
        }
    });
}

function sideBar(visibility){
    if (visibility === 'show') {
        document.getElementById('sideBarActionButton').setAttribute('src',"../public/icons/side-bar-hide.png");
        document.getElementById('sideBarActionButton').setAttribute('onclick',"sideBar('hide')");
        document.getElementById('sideContainer').style.width = '20%';
        document.getElementById('bodeContainer').style.width = '60%';
        hideShow('userButtonDropbox','hide');
        document.querySelectorAll('.file-title').forEach(file => {
            file.classList.remove('hidden'); // Smoothly fades out
        });
    } else {
        document.getElementById('sideBarActionButton').setAttribute('src',"../public/icons/side-bar-show.png");
        document.getElementById('sideBarActionButton').setAttribute('onclick',"sideBar('show')");
        document.getElementById('sideContainer').style.width = '6%';
        document.getElementById('bodeContainer').style.width = '75%';
        hideShow('userButtonDropbox','hide');
        document.querySelectorAll('.file-title').forEach(file => {
            file.classList.add('hidden'); // Smoothly fades out
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

async function uploadDocument() {
    const fileInput = document.getElementById('fileInput');
    const collection = document.getElementById('collectionSelect').value;

    document.getElementsByClassName('upload-button')[0].innerHTML = `<img src="../public/icons/uploading.gif" class="collection-upload-lording-gif">`;

    if (!fileInput.files.length) {
        //alert("Please select at least one file.");
        return;
    }
    
    // Initialize FormData
    const formData = new FormData();
    formData.append('collection', collection);

    // Append each file with key as "files"
    Array.from(fileInput.files).forEach((file) => {
        formData.append('files', file);  // Append each file separately
    });

    try {
        const response = await fetch('http://127.0.0.1:5000/upload/doc', {
            method: 'POST',
            body: formData,  // Send FormData directly (DO NOT use JSON.stringify)
        });

        const result = await response.json();

        if (response.ok) {
            dashboard();  // Call dashboard function if upload is successful
        } else {
            //alert(`Upload failed: ${result.error}`);
        }
    } catch (error) {
        console.error("Error uploading files:", error);
        //alert("Upload failed. See console for details.");
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

