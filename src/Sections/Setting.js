export class Setting {
    /**
     * @param {import("../Manager/NotificationManager.js").NotificationManager} notificationManager
     * @param {import("../Manager/OverlayManager.js").OverlayManager} overlayManager
     * @param {import("../Manager/UIManager.js").UIManager} uiManager
     */
    constructor(notificationManager,overlayManager,uiManager) {
        this.main = {    
            componant: function() {
                return `
                <div class="setting-section-container">
                    <!-- Back button -->
                    <div class="back-button-setting" id="backButtonSettingPage" data="user-setting-section">
                        <img src="https://img.icons8.com/ios-filled/50/ffffff/chevron-left.png" class="back-button-img" alt="back">
                    </div>
                    
                    <!-- Tab Navigation -->
                    <div class="settings-tabs-container">
                        <div class="settings-tabs">
                            <div class="settings-tab active" data-tab="details" id='settingPageTabDetails'>Personal Details</div>
                            <div class="settings-tab" data-tab="model-switch" id='settingPageTabModelSwitch'>Models</div>
                        </div>
                    </div>
                    
                    <!-- Personal Details Tab -->
                    <div class="setting-container active" data-tab="details">
                        <div class="setting-user-pic-container" id='setting-user-pic-ev'>
                            <div class="setting-user-pic">
                                <span class="setting-defult-user-pic" id="settingDefaltUserPic"><img src='.././public/icons/profile.png'/></span>
                                <!-- <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="User Icon" class="profile-icon" id='settingProfilePic'> -->
                            </div>
                            <div class="setting-user-pic-edit-btn-container" id='settingUserPicEditBtnContainer'>
                                <img src="" class="setting-user-pic-edit-img" alt="edit">
                            </div>
                        </div>
                        <div class="setting-user-all-details-container">
                            <div class="setting-user-one-detail-section">
                                <span class="setting-detaile-title">Name</span>
                                <div class="setting-user-detail-container">
                                    <div class="form-input" type="text" id="input-name">
                                        <span id="settingUserName"></span>
                                    </div>
                                    <div class="setting-user-details-edit-button" id="settingPageEditName" data="userName">
                                        <img src="" class="edit-button-img" alt="edit">
                                    </div>
                                </div>
                            </div>
                            <div class="setting-user-one-detail-section">
                                <span class="setting-detaile-title">API Key</span>
                                <div class="setting-user-detail-container">
                                    <div class="form-input" type="text" id="input-api" placeholder="Raveen">
                                        <span>&#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226; &#8226;</span>
                                    </div>
                                    <div class="setting-user-details-edit-button" id="settingPageEditAPIKey" data="userAPIKey">
                                        <img src="" class="edit-button-img" alt="edit">
                                    </div>
                                </div>
                            </div>
                            <div class="setting-user-password-edit" id="settingPageEditPassword" data="userPassword">
                                <span>Change Password</span>
                                <!-- <img src="/edit.png" class="edit-button-img" alt="edit"> -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Models Tab -->
                    <div class="setting-container" data-tab="model-switch">
                        <div class="model-switch-container">
                            <div class="model-switch-section">
                                <span class="setting-detaile-title">LLM Model Selection</span>
                                <div class="model-switch-options">
                                    <div class="switch-container" model="llm">
                                        <div class="switch-head inactive"></div>
                                        <div class="switch-lable" id='settingPageModelLLMChatGPT' data-switch="inactive" model-data="chatGPT">
                                            <span class="switch-label-text">ChatGPT</span>
                                        </div>
                                        <div class="switch-lable" id='settingPageModelLLMGemini' data-switch="active" model-data="gemini">
                                            <span class="switch-label-text">Gemini</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="model-switch-section">
                                <span class="setting-detaile-title">Embedding Model Selection</span>
                                <div class="model-switch-options">
                                    <div class="switch-container" model="embid">
                                        <div class="switch-head inactive"></div>
                                        <div class="switch-lable" id='settingPageModelEmbeddingsMiniLM' data-switch="inactive" model-data="miniLm">
                                            <span class="switch-label-text">Mini-LM-V2</span>
                                        </div>
                                        <div class="switch-lable" id='settingPageModelEmbeddingsTXT' data-switch="active" model-data="txtMbid">
                                            <span class="switch-label-text">TXT-Embid-S</span>
                                        </div>
                                    </div>                   
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `
            },
        
            event: function() {
                return [
                    {
                        element: document.querySelector("#backButtonSettingPage"),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: function() {
                            const UBcontainer = document.querySelector('#user-button-container');
                            const preView = UBcontainer.getAttribute('data');
                            if (preView === 'message-card') {
                                const preMsgName = UBcontainer.getAttribute('data_ops');
                                return uiManager.navigateToView(helperFunctions.baseView, uiManager.eventgroup(helperFunctions.baseView), {'collectionName': preMsgName, 'reset': false});
                            } else {
                                uiManager.navigateToView(helperFunctions.baseView, uiManager.eventgroup(helperFunctions.baseView));
                            }
                        }
                    },
                    {
                        element: document,
                        eventType: 'keydown',
                        eventGroup: 'setting',
                        handler: function(event) {
                            if (event.key === 'Escape') {
                                const UBcontainer = document.querySelector('#user-button-container');
                                const preView = UBcontainer.getAttribute('data');
                                if (preView === 'message-card') {
                                    const preMsgName = UBcontainer.getAttribute('data_ops');
                                    return uiManager.navigateToView(helperFunctions.baseView, uiManager.eventgroup(helperFunctions.baseView), {'collectionName': preMsgName, 'reset': false});
                                } else {
                                    uiManager.navigateToView(helperFunctions.baseView, uiManager.eventgroup(helperFunctions.baseView));
                                }
                            }
                            else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't') {
                                helperFunctions.themeInit();
                            }
                        }
                    },
                    {
                        element: document.querySelector("#settingDefaltUserPic"),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: function() {
                            overlayManager.askImage({
                                title: { text: "" },
                                src: helperFunctions.profileImageUrl,
                                alt: "User profile picture",
                                allowZoom: false,
                                allowDownload: false
                            });
                        }
                    },
                    {
                        element: document.querySelector("#setting-user-pic-ev"),
                        eventType: 'mouseover',
                        eventGroup: 'setting',
                        handler: function() {
                            document.querySelector('.setting-user-pic-edit-btn-container').style.opacity = 1;
                        }
                    },
                    {
                        element: document.querySelector("#setting-user-pic-ev"),
                        eventType: 'mouseleave',
                        eventGroup: 'setting',
                        handler: function() {
                            document.querySelector('.setting-user-pic-edit-btn-container').style.opacity = 0;
                        }
                    },
                    {
                        element: document.querySelector("#settingUserPicEditBtnContainer"),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: async function() {
                            // Create an invisible file input element
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept = 'image/*'; // Only allow image files
                            fileInput.style.display = 'none';

                            // Listen for file selection
                            fileInput.addEventListener('change', async (event) => {
                                profilePictureManager.handleFileSelection(event);
                                const result = await profilePictureManager.displayPreview(profilePictureManager.selectedFile);
                                // const pictureData = await profilePictureManager.prepareProfilePictureData();
                                // console.log(pictureData);   
                                if (result && result === true) {

                                    // Handle profile picture if selected
                                    const profilePictureData = await profilePictureManager.prepareProfilePictureData();
                                    if (profilePictureData) {
                                        const response = await api.updateProfilePicture(helperFunctions.userName, profilePictureData);
                                        if (response.ok) {
                                            helperFunctions.initPage();
                                        } else {
                                            notificationManager.error('have some error check now');
                                        }
                                    } else {
                                        notificationManager.error('Not have any image');
                                    }
                                }
                            });

                            // Trigger the file input
                            document.body.appendChild(fileInput);
                            fileInput.click();

                            // Clean up after opening
                            fileInput.remove();
                        }
                    },

                    {
                        element: document.querySelector("#settingPageTabDetails"),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: function() {
                            const tab = document.querySelector("#settingPageTabDetails");
                            const tabContents = document.querySelectorAll('.setting-container');
                            helperFunctions.tabsSwitch(tab, tabContents);
                        }
                    },
                    {
                        element: document.querySelector("#settingPageTabModelSwitch"),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: function() {
                            const tab = document.querySelector("#settingPageTabModelSwitch");
                            const tabContents = document.querySelectorAll('.setting-container');
                            helperFunctions.tabsSwitch(tab, tabContents);
                        }
                    },
                    {
                        element: document.querySelector('#settingPageModelLLMChatGPT'),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: function() {
                            const switchLLM = document.querySelector('#settingPageModelLLMChatGPT');
                            helperFunctions.modelTabSwitches(switchLLM);
                        }
                    },
                    {
                        element: document.querySelector('#settingPageModelLLMGemini'),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: function() {
                            const switchLLM = document.querySelector('#settingPageModelLLMGemini');
                            helperFunctions.modelTabSwitches(switchLLM);
                        }
                    },
                    {
                        element: document.querySelector('#settingPageModelEmbeddingsMiniLM'),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: function() {
                            const switchEmbedding = document.querySelector('#settingPageModelEmbeddingsMiniLM');
                            helperFunctions.modelTabSwitches(switchEmbedding);
                        }
                    },
                    {
                        element: document.querySelector('#settingPageModelEmbeddingsTXT'),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: function() {
                            const switchEmbedding = document.querySelector('#settingPageModelEmbeddingsTXT');
                            helperFunctions.modelTabSwitches(switchEmbedding);
                        }
                    },
                    {
                        element: document.querySelector('#settingPageEditName'),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: async function() {
                            if (!await overlayFunctions.askPasswordConfirmation() === false) {
                                await overlayFunctions.askNewName();
                            }
                        }
                    },
                    {
                        element: document.querySelector('#settingPageEditAPIKey'),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: async function() {
                            if (!await overlayFunctions.askPasswordConfirmation() === false) {
                                await overlayFunctions.askNewApiKey();
                            }
                        }
                    },
                    {
                        element: document.querySelector('#settingPageEditPassword'),
                        eventType: 'click',
                        eventGroup: 'setting',
                        handler: async function() {
                            const passwordConfirmation = await overlayFunctions.askPasswordConfirmation();
                            if (!passwordConfirmation === false) {
                                await overlayFunctions.askNewPassword(passwordConfirmation);
                            }
                        }
                    },

                ]
            },

            style: function() {
                return `
                    .settings-card {
                        display: flex;
                        position: fixed;
                        width: 100%;
                        height: calc(-31px + 100vh);
                        left: 0px;
                        backdrop-filter: blur(var(--blur-standard));
                        background-color: var(--color-background);
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: center;
                        z-index: 10;
                    }

                    @keyframes cardAppear {
                        from {
                            opacity: 0;
                            transform: translateY(20px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    .setting-section-container {
                        display: flex;
                        flex-direction: column;
                        border: 0px solid var(--color-border);
                        border-radius: var(--radius-large);
                        padding: 40px;
                        background-color: var(--color-background);
                        box-shadow: var(--shadow-large);
                        max-width: 430px;
                        width: 90%;
                        position: relative;
                    }

                    /**
                     * Back button
                     */
                    .back-button-setting {
                        display: flex;
                        width: 20px;
                        height: 20px;
                        margin-left: 0px;
                        margin-right: 7px;
                        cursor: pointer;
                    }

                    .back-button {
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        width: 36px;
                        height: 36px;
                        background-color: var(--color-surface-light);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all var(--transition-standard);
                        z-index: 10;
                        box-shadow: var(--shadow-small);
                        color: var(--color-text-primary);
                        opacity: 0;
                        animation: elementAppear var(--transition-spring) 0.4s forwards;
                    }

                    .back-button-img {
                        width: 20px;
                        height: 20px;
                        transition: transform var(--transition-fast);
                    }

                    .back-button-img:hover {
                        transform: scale(1.1);
                    }

                    .setting-user-pic-edit-btn-container {
                        opacity: 0;
                        position: absolute;
                        display: flex;
                        bottom: 1px;
                        right: 1px;
                        background: var(--color-surface-light);
                        padding: 2px;
                        border-radius: 20px;
                        border: 0px solid;
                        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    .setting-user-pic-edit-btn-container:hover {
                        background: var(--color-primary-hover);
                    }

                    img.setting-user-pic-edit-img {
                        width: 20px;
                        height: 20px;
                        filter: invert(1);
                    }

                    /**
                     * Settings Tabs
                     */
                    .settings-tabs-container {
                        position: relative;
                        width: 100%;
                        margin-bottom: 0px;
                        opacity: 0;
                        animation: elementAppear var(--transition-spring) 0.2s forwards;
                    }

                    .settings-tabs {
                        display: flex;
                        justify-content: center;
                        width: 100%;
                        border-bottom: 1px solid var(--color-border);
                        padding-bottom: 0px;
                        margin-bottom: 20px;
                    }

                    .settings-tab {
                        margin: 0 20px;
                        padding: 10px 0;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 500;
                        color: var(--color-text-secondary);
                        position: relative;
                        transition: all var(--transition-standard);
                    }

                    .settings-tab.active {
                        color: var(--color-text-primary);
                    }

                    .settings-tab.active::after {
                        content: '';
                        position: absolute;
                        bottom: 0px;
                        left: 0;
                        width: 100%;
                        height: 2px;
                        background-color: var(--color-primary);
                        animation: tabLineAppear var(--transition-spring) forwards;
                    }

                    @keyframes tabLineAppear {
                        from {
                            transform: scaleX(0);
                        }
                        to {
                            transform: scaleX(1);
                        }
                    }

                    /**
                     * Setting Containers
                     */
                    .setting-container {
                        display: none;
                        flex-direction: column;
                        align-items: center;
                        width: 100%;
                        animation: fadeIn var(--transition-standard) forwards;
                    }

                    .setting-container.active {
                        display: flex;
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes elementAppear {
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    /**
                     * User Profile Section
                     */
                    .setting-user-pic-container {
                        display: flex;
                        justify-content: center;
                        margin: 11px 0px 16px 0px;
                        opacity: 0;
                        /* transform: translateY(10px); */
                        animation: elementAppear var(--transition-spring) 0.3s forwards;
                    }

                    .setting-user-pic {
                        width: 90px;
                        height: 90px;
                        background-color: var(--color-surface-light);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        /* box-shadow: var(--shadow-medium); */
                        transition: transform var(--transition-spring);
                        cursor: pointer;
                        position: relative;
                        overflow: hidden;
                    }

                    .setting-user-pic:hover {
                        transform: scale(1.05);
                    }

                    .setting-defult-user-pic {
                        display: flex;
                        font-size: 48px;
                        height: 100px;
                        font-weight: bold;
                        color: var(--color-text-primary);
                        text-transform: uppercase;
                    }

                    .setting-user-all-details-container {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        opacity: 0;
                        transform: translateY(10px);
                        animation: elementAppear var(--transition-spring) 0.4s forwards;
                    }

                    .setting-user-one-detail-section {
                        margin-bottom: 10px;
                    }

                    .setting-detaile-title {
                        display: block;
                        margin-bottom: 8px;
                        font-weight: 600;
                        font-size: 14px;
                        color:var(--color-text-secondary);
                    }

                    .setting-user-detail-container {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    }

                    .setting-defult-user-name, 
                    .setting-defult-user-apikey {
                        flex: 1;
                        padding: 12px 16px;
                        background-color: var(--color-surface-light);
                        color: var(--color-text-primary);
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-medium);
                        font-size: 16px;
                        text-align: left;
                        box-shadow: var(--shadow-small);
                    }

                    .setting-user-details-edit-button {
                        width: 47px;
                        height: 41px;
                        padding: 0px;
                        border-radius: 25px;
                        background-color: var(--color-surface-light);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all var(--transition-standard);
                        box-shadow: var(--shadow-small);
                    }

                    .setting-user-details-edit-button:hover {
                        background-color: var(--color-primary);
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(90, 99, 172, 0.3);
                    }

                    .edit-button-img {
                        width: 20px;
                        height: 20px;
                        filter: invert(1);
                    }

                    .profile-icon {
                        width: 64px;
                        height: 64px;
                        margin-bottom: 20px;
                        filter: invert(1);
                        opacity: 0.9;
                        transform: translateZ(0);
                        animation: iconFloat 6s ease-in-out infinite;
                    }

                    .setting-user-password-edit {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 14px 20px;
                        background-color: var(--color-primary);
                        color: var(--color-text-fixed-primary-light);
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-medium);
                        cursor: pointer;
                        font-size: 16px;
                        width: fit-content;
                        margin-top: 8px;
                        transition: all var(--transition-standard);
                        box-shadow: var(--shadow-small);
                    }

                    .setting-user-password-edit:hover {
                        background-color: var(--color-primary-hover);
                        /* transform: translateY(-2px); */
                        box-shadow: 0 5px 15px rgba(90, 99, 172, 0.3);
                    }

                    /**
                     * Models Switch Section
                     */
                    .model-switch-container {
                        width: 100%;
                        opacity: 0;
                        transform: translateY(10px);
                        animation: elementAppear var(--transition-spring) 0.3s forwards;
                    }

                    .model-switch-section {
                        margin-bottom: 30px;
                    }

                    .model-switch-options {
                        margin-top: 15px;
                    }

                    .switch-container {
                        position: relative;
                        display: flex;
                        background-color: var(--color-surface-light);
                        border-radius: var(--radius-medium);
                        padding: 4px;
                        overflow: hidden;
                        box-shadow: var(--shadow-small);
                        margin-top: 10px;
                    }

                    .switch-head {
                        position: absolute;
                        top: 4px;
                        height: calc(100% - 8px);
                        background-color: var(--color-primary);
                        border-radius: calc(var(--radius-medium) - 4px);
                        z-index: 1;
                        transition: all var(--transition-spring);
                        box-shadow: var(--shadow-small);
                    }

                    .switch-head.inactive {
                        left: 4px;
                        width: calc(50% - 8px);
                    }

                    .switch-head.active {
                        left: calc(50% + 4px);
                        width: calc(50% - 8px);
                    }

                    .form-input {
                        width: 100%;
                        padding: 12px 16px;
                        background-color: rgb(26 26 34 / 0%);
                        color: var(--color-text-primary);
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-medium);
                        font-size: 16px;
                        text-align: left;
                        outline: none;
                        transition: all var(--transition-standard);
                        box-shadow: var(--shadow-small);
                    }

                    .form-input:focus {
                        border-color: var(--color-primary);
                        box-shadow: 0 0 0 4px rgba(90, 99, 172, 0.2), var(--shadow-small);
                        transform: translateY(-1px);
                    }

                    .form-input::placeholder {
                        color: var(--color-text-tertiary);
                    }

                    .switch-lable {
                        position: relative;
                        z-index: 2;
                        flex: 1;
                        text-align: center;
                        padding: 14px 20px;
                        cursor: pointer;
                        transition: all var(--transition-standard);
                        user-select: none;
                    }

                    .switch-label-text {
                        font-weight: 500;
                        font-size: 16px;
                    }

                    [data-switch="active"] .switch-label-text {
                        color: var(--color-text-primary);
                    }

                    [data-switch="inactive"] .switch-label-text {
                        color: var(--color-text-secondary);
                    }

                    @media (max-width: 400px) {
                        .setting-section-container {
                            padding: 0px;
                        }
                    }

                    .--hidden {
                        display: none;
                    }
                `
            },

            navigator: function(options) {
                uiManager.userProfileButtonVisibility(false);
                helperFunctions.baseView = options.baseView || 'dashboard';
                helperFunctions.initPage();
                helperFunctions.themeInit();
            }
        }
        const helperFunctions = {
            baseView: '',
            profileImageUrl: '',
            userName: '',

            themeInit: function() {
                if (document.documentElement.getAttribute('data-theme') === 'dark') {
                    document.querySelector('#backButtonSettingPage').querySelector('img').setAttribute('src','../public/icons/chevron-left-50-ffffff.png')
                    document.querySelector('#settingUserPicEditBtnContainer').querySelector('img').setAttribute('src','../public/icons/icons8-edit-40-1a1a1a.png')
                    document.querySelector('#settingPageEditName').querySelector('img').setAttribute('src','../public/icons/icons8-edit-40-1a1a1a.png')
                    document.querySelector('#settingPageEditAPIKey').querySelector('img').setAttribute('src','../public/icons/icons8-edit-40-1a1a1a.png')
                } else {
                    document.querySelector('#backButtonSettingPage').querySelector('img').setAttribute('src','../public/icons/chevron-left-50-1a1a1a.png')
                    document.querySelector('#settingUserPicEditBtnContainer').querySelector('img').setAttribute('src','../public/icons/icons8-edit-40-ffffff.png')
                    document.querySelector('#settingPageEditName').querySelector('img').setAttribute('src','../public/icons/icons8-edit-40-ffffff.png')
                    document.querySelector('#settingPageEditAPIKey').querySelector('img').setAttribute('src','../public/icons/icons8-edit-40-ffffff.png')
                }
            },

            /**
             * Create a new tag element
             * @param {string} name - The name of the tag
             * @returns {HTMLElement} - The created tag element
             */
            tabsSwitch: function(tab, tabContents) {
                const tabId = tab.getAttribute('data-tab');     
                // Apply exit animation to active tab content
                tabContents.forEach(tc => {
                    if (tc.classList.contains('active')) {
                        tc.style.opacity = '0';
                        tc.style.transform = 'translateY(10px)';
                    }
                });
                
                // Remove active class from all tabs
                document.querySelectorAll(".settings-tab").forEach(t => t.classList.remove('active'));

                // Add active class to clicked tab
                tab.classList.add('active');
                
                // After short delay, switch tab content with animation
                setTimeout(() => {
                    tabContents.forEach(tc => {
                        tc.classList.remove('active');
                        tc.style.opacity = '';
                        tc.style.transform = '';
                    });
                    
                    const activeContent = document.querySelector(`.setting-container[data-tab="${tabId}"]`);
                    activeContent.classList.add('active');
                    
                    // Apply entrance animation
                    activeContent.style.animation = 'fadeIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                }, 200);
            },
            
            modelTabSwitches: function(swh) {
                const switchAction = swh.getAttribute('data-switch');
                const switchModel = swh.getAttribute('model-data');
                const switchType = swh.parentElement.getAttribute('model');
                const switchHead = swh.parentElement.querySelector('.switch-head');
                
                // Apply animation effect
                switchHead.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                
                // Remove both classes and add the appropriate one
                switchHead.classList.remove('inactive', 'active');
                switchHead.classList.add(switchAction);
                
                // Apply scaling effect
                switchHead.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    switchHead.style.transform = 'scale(1)';
                }, 300);
                
                // Handle specific model changes
                if (switchModel === "chatGPT") {
                    // updateLlmModel("chatGPT"); // Uncomment when function is available
                    notificationManager.success("Changed to ChatGPT model");
                } else if (switchModel === "gemini" || switchModel === "txtMbid" || switchModel === "miniLm") {
                    notificationManager.error(`Switching to ${switchModel} is not supported at this stage. This feature will be implemented in Stage 3.`);
                    
                    // Reset switch to inactive position after error
                    setTimeout(() => {
                        switchHead.classList.remove('inactive', 'active');
                        switchHead.classList.add('inactive');
                    }, 500);
                }
            },
            
            /**
             * Fetch and display the list of collections
             * @returns {Promise<void>}
             */
            getProfile: async function() {
                return await api.getProfile('token Raveen2244');
            },

            /**
             * Collection list handler
             * Fetches the list of collections and handles different response statuses
             * @returns {Promise<Array>} - List of collections or an empty array on error   
             */
            getProfileHandler: async function() {
                try {
                    const profile = await this.getProfile();
                    // Handle different response statuses
                    if (profile.status === 401) {
                        notificationManager.error('Authorization header required. Please log in again.');
                        return null;
                    }
                    if (profile.status === 500) {
                        notificationManager.error('Server error. Please try again later.');
                        return null;
                    }
                    if (profile.status === 204) {
                        notificationManager.info('No profile found.');
                        return null;
                    }
                    if (profile.status === 200 && profile.data.message.length > 0) {
                        return profile.data.message;
                    }
                    if (profile.status !== 200) {
                        notificationManager.error(`Error fetching profile: ${profile.status}`);
                        return null;
                    }
                } catch (error) {
                    notificationManager.error(`Error fetching profile: ${error.message}`);
                    return null;
                }
            },

            /**
             * Initialize the profile UI
             */
            initProfile: async function() {
                const settingUserImgContainer = document.querySelector('#settingDefaltUserPic');
                const profile = await this.getProfileHandler();
                if (profile) {
                    // Update the profile icon with the first two letters of the username
                    this.initProfileUI(profile);
                    this.initUserPic(settingUserImgContainer, profile);
                } else {
                    // Fallback to default profile icon
                    settingUserImgContainer.querySelector('img').src = '.././public/icons/profile.png';
                    document.getElementById('settingDefaltUserPic').textContent = 'U';
                    document.getElementById('settingUserName').textContent = 'User';
                }
            },

            initUserPic: async function(userImgContainer, userName) {

                const res = await api.getProfilePicture(userName);
                var url = null;
                if (res.ok) {
                    const blob = new Blob([res.data], { type: res.contentType });
                    url = URL.createObjectURL(blob); 
                }
                this.profileImageUrl = url? url : '.././public/icons/profile.png';
                userImgContainer.querySelector('img').src = url? url : '.././public/icons/profile.png';
            },

            initProfileUI: function(username) {
                if (username && username.length >= 1) {
                    helperFunctions.userName = username;
                    document.getElementById('settingUserName').textContent = username;
                }
            },

            initModel: async function() {
                const model = await api.getModelLLm();
                if (model.data.message) {
                    this.initModelUI(model.data.message);
                }
            },

            initModelUI: function(model) {
                if (model === "chatGPT") {
                    const switchHead = document.querySelector('.switch-container[model="llm"] .switch-head');
                    switchHead.classList.remove('active');
                    switchHead.classList.add('inactive');
                }
            },

            initPage: async function() {
                await this.initProfile();
                await this.initModel();
            }

        }

        /**
         * Profile Picture Manager
         * Handles profile picture selection, validation, and processing
         */
        const profilePictureManager = {
            selectedFile: null,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],

            /**
             * Handle file selection from input
             * @param {Event} event - File input change event
             */
            handleFileSelection: function(event) {
                const file = event.target.files[0];
                if (!file) return;

                if (!this.validateFile(file)) {
                    return;
                }

                this.selectedFile = file;
            },

            /**
             * Validate selected file
             * @param {File} file - Selected file
             * @returns {boolean} - Validation result
             */
            validateFile: function(file) {
                // Check file type
                if (!this.allowedTypes.includes(file.type)) {
                    notificationManager.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
                    return false;
                }

                // Check file size
                if (file.size > this.maxFileSize) {
                    notificationManager.error('File size should be less than 5MB');
                    return false;
                }

                return true;
            },

            /**
             * Display image preview
             * @param {File} file - Selected image file
             */
            displayPreview: async function(file) {
                const reader = new FileReader();
                // const previewImg = document.getElementById('profile-preview-img');
                return new Promise((resolve) => {
                    reader.onload = async function(e) {
                        const reSrc = e.target.result;
                        const result = await overlayManager.askImage({
                            title: { text: "" },
                            src: reSrc,
                            alt: "new profile picture",
                            actions: [
                                { name: "Save", return: true, type: "primary" },
                                { name: "Cancel", return: false, type: "secondary" }
                            ],
                            allowZoom: false,
                            allowDownload: false
                        });
                        resolve(result);
                    };
                    reader.readAsDataURL(file);
                });
            },

            /**
             * Animate successful selection
             */
            animateSuccessSelection: function() {
                const preview = document.getElementById('profile-picture-preview');
                preview.classList.add('profile-picture-success');
                
                setTimeout(() => {
                    preview.classList.remove('profile-picture-success');
                }, 600);

                notificationManager.success('Profile picture selected!');
            },

            /**
             * Clear selected profile picture
             */
            clearProfilePicture: function() {
                this.selectedFile = null;
                const previewImg = document.getElementById('profile-preview-img');
                const fileInput = document.getElementById('input-profile-picture');
                
                previewImg.src = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
                fileInput.value = '';
            },

            /**
             * Convert file to base64 for backend transmission
             * @returns {Promise<string|null>} Base64 encoded file or null
             */
            getFileAsBase64: async function() {
                if (!this.selectedFile) return null;

                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(this.selectedFile);
                });
            },

            /**
             * Get file metadata
             * @returns {Object|null} File metadata or null
             */
            getFileMetadata: function() {
                if (!this.selectedFile) return null;

                return {
                    name: this.selectedFile.name,
                    size: this.selectedFile.size,
                    type: this.selectedFile.type,
                    lastModified: this.selectedFile.lastModified
                };
            },

            /**
             * Prepare profile picture data for backend transmission
             * @returns {Promise<Object|null>} Profile picture data or null
             */
            prepareProfilePictureData: async function() {
                const base64Data = await this.getFileAsBase64();
                const metadata = this.getFileMetadata();

                if (!base64Data || !metadata) {
                    return null;
                }

                return {
                    data: base64Data,
                    filename: metadata.name,
                    size: metadata.size,
                    type: metadata.type,
                    uploadTimestamp: Date.now()
                };
            }
        };

        const editingHelperFunctions = {
            /**
             * name editing function
             * @param {string} value - The new name to set
             * @return {Promise<void>} - A promise that resolves when the name is set
             */
            editName: async function(value) {
                const result = await api.updateProfileName(value.trim(), 'Raveen2244@');
                if (result.status === 200 && result.ok) {
                    notificationManager.success('Name updated successfully');
                    helperFunctions.initProfileUI(value.trim());
                } else {
                    notificationManager.error(`Error updating name: ${result.status}`);
                }
            },

            /**
             * API Key editing function
             * @param {string} value - The new API key to set
             * @return {Promise<void>} - A promise that resolves when the API key is set 
             */
            editAPIKey: async function(value) {
                const result = await api.updateProfileApiKey(value.trim(), 'Raveen2244@');
                if (result.status === 200 && result.ok) {
                    notificationManager.success('API Key updated successfully');
                } else {
                    notificationManager.error(`Error updating API Key: ${result.status}`);
                }
            },

            /**
             * Password editing function
             * @param {Object} values - The new password values
             * @param {string} values.newPassword - The new password to set
             * @param {string} values.confirmPassword - The confirmation password
             * @return {Promise<void>} - A promise that resolves when the password is set
             */
            editPassword: async function(current_password, values) {
                const result = await api.updatePassword(current_password, values.newPassword, 'Raveen2244@');
                if (result.status === 200 && result.ok) {
                    notificationManager.success('Password updated successfully');
                } else {
                    notificationManager.error(`Error updating Password: ${result.status}`);
                }
            }
        }

        const overlayFunctions = {
            askPasswordConfirmation: async function() {
                return await overlayManager.askMultipleInputs({
                    title: { text: "Password confermation", color: "#2d3748" },
                    content: ``,
                    inputs: [
                        {
                            name: 'password',
                            label: 'Conform password',
                            placeholder: "Enter password...",
                            type: "password",
                            validation: async(value) => value && value.trim().length > 0
                        }
                    ],
                    actions: [
                        { name: "conform", color: "var(--color-text-fixed-primary-light)", return: true, type: "primary" },
                        { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
                    ],
                    validation: async(value) => {
                         return value.password && value.password.trim().length > 0 && await this.getValidationHandler(value.password) ? true : false;
                    },
                    handler: async (value) => {
                        return value;
                    }
                });
            },

            getValidationHandler: async function(value) {
                try {
                    const result = await api.checkPassword(value.trim(), 'Raveen2244@');
                    // Handle different response statuses
                    if (result.status === 401) {
                        notificationManager.error('Authorization header required. Please log in again.');
                        return false;
                    }
                    if (result.status === 500) {
                        notificationManager.error('Server error. Please try again later.');
                        return false;
                    }
                    if (result.status === 204) {
                        notificationManager.info('No profile found.');
                        return false;
                    }

                    if (result.status !== 200) {
                        notificationManager.error(`Error checking password: ${result.status}`);
                        return false;
                    }

                    if (result.status === 200 && result.data.success) {
                        return true;
                    } else {
                        notificationManager.error('Password incorrect. Please try again.');
                        return false;
                    }
                } catch (error) {
                    notificationManager.error(`Error checking password: ${error.message}`);
                    return false;
                }
            },

            askNewName: async function() {
                return await overlayManager.askInput({
                    title: { text: "Edit name", color: "#2d3748" },
                    content: `Please enter your new name :`,
                    placeholder: "New name...",
                    actions: [
                        { name: "Save changes", color: "#10b981", return: true, type: "primary" },
                        { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
                    ],
                    validation: async(value) => {return value && value.trim().length > 0 ? true : false},
                    handler: async (value) => {
                        return await editingHelperFunctions.editName(value);
                    }
                });
            },

            askNewApiKey: async function() {
                return await overlayManager.askInput({
                    title: { text: "Edit API key", color: "#2d3748" },
                    content: `Please enter your new API key :`,
                    placeholder: "New API key...",
                    validation: async(value) => { return value && value.trim().length > 0 ? true : false; },
                    handler: async (value) => {
                        return await editingHelperFunctions.editAPIKey(value);
                    }
                });
            },

            askNewPassword: async function(current_password) {
                return await overlayManager.askMultipleInputs({
                    title: { text: "Edit Password", color: "#2d3748" },
                    content: `Please enter your new Password :`,
                    inputs: [
                        {
                            name: 'newPassword',
                            label: 'New password',
                            placeholder: "New password...",
                            type: "password",
                            validation: async(value) => value && value.trim().length > 0
                        },
                        {
                            name: 'confirmPassword',
                            label: 'Confirm password',
                            placeholder: "Confirm new password...",
                            type: "password",
                            validation: async(value) => value && value.trim().length > 0
                        }
                    ],
                    actions: [
                        { name: "Save changes", color: "#10b981", return: true, type: "primary" },
                        { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
                    ],
                    validation: async function(values) {
                        if (values.newPassword && values.confirmPassword && values.newPassword.trim() === values.confirmPassword.trim()) {
                            return true;
                        } else {
                            notificationManager.error('Passwords do not match. Please try again.');
                            return false;
                        }
                    },
                    handler: async (values) => {
                        return await editingHelperFunctions.editPassword(current_password,values);
                    }
                });
            }
        } 
    }
}

