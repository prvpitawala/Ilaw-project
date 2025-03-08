const UIComponents = {
    registerPages: `
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
            <input type="text" id="apiKeyInput" placeholder="Enter API Key">
            <button onclick="register()">Sign Up</button>
        </div>`,

    collection_selector: `
        <div class="tags-container" id="tagsContainer">
        </div>`,
    userbutton:`<div class="user-button-section">
        <div id="user-button" onclick="showUserDropDown()">
            
        </div>
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
                <div class="file-text">Drag the files or Paste the files</div>
                
                <input type="file" id="fileInput" style="display: none;">
            </div>
            <div class="file-format">Supported file format (Docx, Pdf, Odt)</div>
        </div>

        <div>
            <div class="label">Select Collection</div>
            <input type="text" class="input-box" id="collectionSelect" placeholder="Enter collection name" onkeyup="showSuggestionsCallection()">
            <ul id="suggestionList" class="suggestions"></ul>
        </div>

        <button class="upload-button" onclick="uploadDocument()">Upload</button>
    </div>`,

    sidebar:`
    <div class="sidebar show" id="sideBar">
        <div class="back-btn-sec">
            <img src="../public/icons/side-bar-hide.png" class="side-bar-hide-button-img" id="sideBarActionButton" alt="Send" onclick="sideBar('hide')">
        </div>
        <ul class="file-list" id="fileList">
        </ul>
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
            <div class="result-show" id="resultDisplay">
                
            </div>
        </div>

        <!-- Chat Input -->
        <div class="messageBox">
            <input type="text" class="messageInput" id="messageInput" placeholder="Type your question">
            <div class="chat-send-button" onclick="submitQuery()">
                <img src="../public/icons/send-icon.png" class="send-button" alt="Send">
            </div>
        </div>
    </div>`,
    userSettingSection: `
    <section class="user-setting-section">
        <div class="setting-section-container">
            <div class="back-button" id="backButton" data="user-setting-section" onclick="backTo(event)">
                <img src="../public/icons/back-icon.png" class="back-button-img" alt="back">
            </div>
            <div class="setting-container">
                <div class="setting-user-pic-container">
                    <div class="setting-user-pic">
                        <font class="setting-defult-user-pic" id="settingDefaltUserPic"></font>
                    </div>
                </div>
                <div class="setting-user-all-details-container">
                    <div class="setting-user-one-detail-section">
    <font class="setting-detaile-title">Name</font>
                        <div class="setting-user-detail-container">
    <div class="setting-defult-user-name">
        <font id="settingUserName"></font>
    </div>
    <div class="setting-user-details-edit-button" data="userName" onclick="passwordAutonticationSection()">
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
    <div class="setting-user-details-edit-button">
        <img src="../public/icons/edit.png" class="edit-button-img" alt="edit">
    </div>
        </div>
    </div>

                    <div class="setting-user-password-edit"  id="settingUserPasswordEdit"><font>Change Password</font><img src="../public/icons/edit.png" class="edit-button-img" alt="edit"></div>
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
    </section>
    `
};


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


document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        console.log("Selected file:", file.name);
    }
});

function loadUI(section,UIname) {
    if (UIComponents[UIname]) {
        document.getElementById(section).innerHTML = UIComponents[UIname];
    } else {
        alert(`UI element "${UIname}" not found.`);
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
    const apiKeyInput = document.getElementById('apiKeyInput').value;

    const formData = new FormData();
    formData.append('userName', nameInput);
    formData.append('password', passwordInput);
    formData.append('apiKey', apiKeyInput);
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
        alert("Upload failed. See console for details.");
        nextPage(1);
    }
}

async function setCollectionToUI() {
    collections_List = await getCollections()
    document.getElementById('tagsContainer').innerHTML = collections_List.map(letter => `<div class="tag" onclick="messageSection('${letter}')">${letter}</div>\n`).join("") + `<div class="add-tag" onclick="addDocument()">+</div>`;
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

async function setting() {
    document.getElementsByTagName('body')[0].innerHTML += UIComponents.userSettingSection;
    username = (await getProfileName()).userName;
    document.getElementById('settingDefaltUserPic').innerHTML = `${username[0].toUpperCase()}${username[1]}`;

    document.getElementById('settingUserName').innerHTML = `${username}`;

}

function backTo(event) {
    let clickedElement = event.currentTarget;
    let userData = clickedElement.getAttribute("data");
    var Section = document.querySelector(`.${userData}`);
    if (Section) {
        Section.parentNode.removeChild(Section);
    }
    hideShow('userButtonDropbox','hide');
}

function userDataEditSection(event) {

    let clickedElement = event.currentTarget;
    let userData = clickedElement.getAttribute("data");
    document.getElementsByTagName('body')[0].innerHTML += UIComponents.userSettingEditSection;
    
}

function passwordAutonticationSection() {
    document.getElementsByTagName('body')[0].innerHTML += UIComponents.userSettingEditSection;
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
    const suggestionList = document.getElementById("suggestionList");
    const query = input.value.toLowerCase();
    suggestionList.innerHTML = ""; // Clear previous suggestions

    if (query) {
        collections_List = await getCollections()
        const filtered = collections_List.filter(item => item.toLowerCase().includes(query));
        filtered.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            li.onclick = () => {
                input.value = item;
                suggestionList.innerHTML = ""; // Hide suggestions after selection
            };
            suggestionList.appendChild(li);
        });
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
        alert("Failed to retrieve profile. See console for details.");
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
        alert("Failed to retrieve profile. See console for details.");
        return { userName: null, apiKey: null };
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

        // if (!response.ok) {
        //     throw new Error(`HTTP error! Status: ${response.status}`);
        // }

        let data = await response.json();  // Assuming the server responds with JSON

        console.log("Server Response:", data);
        return data; // Return the server response for further handling
    } catch (error) {
        console.error("Error checking password:", error);
    }
}



async function uploadDocument() {
    const fileInput = document.getElementById('fileInput');
    const collection = document.getElementById('collectionSelect').value;

    if (!fileInput.files.length) {
        alert("Please select a file first.");
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('collection', collection);
    try {
        const response = await fetch('http://127.0.0.1:5000/upload/doc', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        dashboard()
    } catch (error) {
        console.error("Error uploading file:", error);
        alert("Upload failed. See console for details.");
    }
}

async function getCollections() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get/document/collections', {
            method: 'POST',
        });
        const result = await response.json();
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
        alert("Upload failed. See console for details.");
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
        alert("Upload failed. See console for details.");
    }
}



async function submitQuery() {
    const query = document.getElementById('messageInput').value;
    const collection = document.getElementById('chatTitle').value; // or add separate collection selection if needed

    if (!query.trim()) {
        alert("Please enter a query.");
        return;
    }

    document.getElementById('resultDisplay').innerHTML = `<p><strong>Response:</strong> Processing query...</p>`;

    try {
        const response = await fetch('http://127.0.0.1:5000/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, collection })
        });
        const result = await response.json();
        document.getElementById('resultDisplay').innerHTML = `${result.response || result.error}`;
    } catch (error) {
        console.error("Error submitting query:", error);
        alert("Query failed. See console for details.");
    }
}

