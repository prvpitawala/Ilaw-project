export class Massage {
    /**
     * @param {import("../Manager/NotificationManager.js").NotificationManager} notificationManager
     * @param {import("../Manager/OverlayManager.js").OverlayManager} overlayManager
     * @param {import("../Manager/UIManager.js").UIManager} uiManager
     */
    constructor(notificationManager,overlayManager,uiManager) {
        this.main = {
            componant: function () {
                return `
                    <aside id="sideContainer" class="sideContainer slideout">
                        <div class="sidebar" id="sideBar">
                            <div class="back-btn-sec">
                                <img src="" class="side-bar-hide-button-img" id="sideBarActionButton">
                            </div>
                            <ul class="file-list" id="fileList"></ul>
                            <span id="sidebarAddFileButton" class="add-file-button-container" title="Update files">
                                <div class="add-document-in-side-bar">
                                    <button class="chat-section-document-add-btn"> + </button>
                                </div>
                            </span>
                        </div>
                    </aside>
                    <section class="massage_container">
                        <div class="main-content">
                            <div class="chatHeader">
                                <div class="side-bar-show-button slidein" id="sideShowBtn">
                                    <img src="" class="side-bar-show-button-img" alt="back">    
                                </div>
                                <div class="back-button-massage" id="backButton">
                                    <img src="" class="back-button-img" alt="back">
                                </div>
                                <div class="chatTitle" id="chatTitle">AI Assistant</div>
                            </div>
                            <div class="content-box">
                                <div class="result-show" id="resultDisplay">
                                    <!-- Messages will be added here -->
                                </div>
                            </div>
                            <!-- Chat Input -->
                            <div class="messageBox" id="messageBox">
                                <input type="text" class="messageInput" id="messageInput" placeholder="Ask anything">
                                <div class="chat-send-button" id="chatSendButton">
                                    <img src="" class="send-button" alt="Send">
                                </div>
                            </div>
                        </div>
                    </section>
                `
            },

            event: function () {
                return  [
                    {
                        element: document.querySelector('#user-button-container'),
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: function(event) {
                            // Hide collection dropbox if clicked outside
                            const UBcontainer = document.querySelector('#user-button-container')
                            UBcontainer.setAttribute('data', uiManager.currentView)
                            UBcontainer.setAttribute('data_ops', helperFunctions.collectionName)
                            return uiManager.navigateToView('settings-card', "setting",{'baseView': uiManager.currentView});
                        }
                    },
                    {
                        element: document.getElementById('sideBarActionButton'),
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: function() {
                            const sideBarElement =  document.getElementById('sideContainer');
                            const currentWidth = window.innerWidth;
                            if (currentWidth < 550)
                                sideBarElement.setAttribute('user-isSideBar','s-false');
                            else 
                                sideBarElement.setAttribute('user-isSideBar','l-false');

                            // Hide collection dropbox if clicked outside
                            sideBarFunctions.hideSideBar();
                        }
                    },
                    {
                        element: document.getElementById('sideShowBtn'),
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: function() {
                            const sideBarElement =  document.getElementById('sideContainer');
                            const currentWidth = window.innerWidth;
                            if (currentWidth < 550)
                                sideBarElement.setAttribute('user-isSideBar','s-true');
                            else 
                                sideBarElement.setAttribute('user-isSideBar','l-true');
                            
                            // Hide collection dropbox if clicked outside
                            sideBarFunctions.showSideBar();
                        }
                    },
                    {
                        element: document.getElementById('backButton'),
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: function() {
                            return uiManager.navigateToView('dashboard', 'dashboard');
                        }
                    },
                    {
                        element:window,
                        eventType: 'resize',
                        eventGroup: 'massage',
                        handler: function() {
                            return sideBarFunctions.sideBarAutoResizer();
                        }
                    },
                    {
                        element: document,
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: function(event) {
                            event.preventDefault();
                            const files = document.querySelectorAll('.file-item');
                            files.forEach((file) => {
                                file.querySelector('.file-dropbox').classList.replace('show', 'hide');
                            });
                        }
                    },
                    {
                        element: document.querySelector('#chatSendButton'),
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: function(event) {
                            const inputElement = document.querySelector('#messageInput');
                            if (inputElement.value.length>0) {
                                massageFunctions.sendMassage(inputElement.value);
                            } else {
                                notificationManager.info('empty input')
                            } 
                        }
                    },
                    {
                        element: document,
                        eventType: 'keydown',
                        eventGroup: 'massage',
                        handler: function(event) {
                            if (event.key === 'Enter') {
                                const inputElement = document.querySelector('#messageInput');
                                if (inputElement.value.length>0) {
                                    massageFunctions.sendMassage(inputElement.value);
                                } else {
                                    notificationManager.info('empty input')
                                }    
                            } else if (event.key === 'Escape') {
                                event.preventDefault();
                                return uiManager.navigateToView('dashboard', 'dashboard');
                            }else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                                const UBcontainer = document.querySelector('#user-button-container')
                                UBcontainer.setAttribute('data', uiManager.currentView)
                                UBcontainer.setAttribute('data_ops', helperFunctions.collectionName)
                                return uiManager.navigateToView('settings-card', "setting",{'baseView': uiManager.currentView});
                            } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't') {
                                helperFunctions.themeInit();
                            }
                        }
                    },
                    {
                        element: document.querySelector('#sidebarAddFileButton'),
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: function(event) {
                            uiManager.navigateToView('document-add-card', 'documentAdd', {'collectionName': helperFunctions.collectionName});
                        }
                    }
                    

                ]
            },

            style: function () {
                return `
                    :root {
                        --content-max-width: 600px; /* Added max width for content */
                    }
                        
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }

                    .message-card {
                        display: flex;
                        height: calc(100vh - 31px);
                        width: 100%;
                    }

                    .massage_container {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        overflow: hidden;
                    }

                    .sideContainer {
                        width: 0;
                        transition: width var(--transition-standard);
                        z-index: 100;
                        overflow: hidden;
                    }

                    .sideContainer.slidein {
                        display: flex;
                        width: 210px;
                    }

                    .sidebar {
                        width: 210px;
                        height: 100%;
                        background-color: var(--color-surface-light);
                        border-right: 1px solid var(--color-border);
                        display: flex;
                        flex-direction: column;
                        transition: transform var(--transition-standard);
                        backdrop-filter: blur(var(--blur-standard));
                    }

                    .back-btn-sec {
                        padding: 22px 16px;
                        border-bottom: 1px solid var(--color-border);
                        display: flex;
                        justify-content: flex-end;
                    }

                    .side-bar-hide-button-img {
                        width: 20px;
                        height: 20px;
                        cursor: pointer;
                        transition: transform var(--transition-fast);
                    }

                    .side-bar-hide-button-img:hover {
                        transform: scale(1.1);
                    }

                    .side-bar-show-button {
                        width: auto;
                        position: absolute;
                        left: -1px;
                        display: flex;
                        justify-content: flex-end;
                        transition: width var(--transition-fast);

                    }

                    .side-bar-show-button.slideout {
                        width: 0px;
                    }

                    .side-bar-show-button-img {
                        width: 20px;
                        height: 20px;
                        cursor: pointer;
                        transition: width var(--transition-fast);
                    }

                    .side-bar-show-button-img:hover {
                        width: 25px;
                    }

                    

                    .file-list {
                        flex: 1;
                        overflow-y: auto;
                        padding: 6px 6px;
                        list-style: none;
                    }

                    .file-item {
                        display: flex;
                        align-items: center;
                        padding: 8px;
                        font-size: 1em;
                        border-radius: var(--radius-small);
                        background-color: var(--color-surface);
                        cursor: pointer;
                        transition: background-color var(--transition-fast);
                        position: relative;
                    }

                    .file-item:hover {
                        background-color: var(--color-primary);
                        .file-icon-md {
                            color: var(--color-text-fixed-primary-light);
                        }
                        .file-title {
                            color: var(--color-text-fixed-primary-light);
                        }
                    }

                    .file-extention-img {
                        width: 18px;
                        height: 18px;
                        margin-right: 10px;
                    }

                    .file-title {
                        flex: 1;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        color: var(--color-text-primary);
                    }

                    .file-icon-md {
                        color: #0000;
                        cursor: pointer;
                    }

                    .file-icon-md:hover {
                        border: 1px solid var(--color-text-fixed-primary-light);
                        border-radius: var(--radius-xsmall);
                    }

                    .file-dropbox {
                        position: absolute;
                        display:flex;
                        top: 76%;
                        right: -5px;
                        padding: 3px;
                        background-color: rgb(40 40 63);
                        border-radius: var(--radius-small);
                        box-shadow: var(--shadow-medium);
                        z-index: 10;
                        min-width: 100px;
                        overflow: hidden;
                        gap: 3px;
                        justify-content: center;
                        flex-direction: column;
                    }

                    .file-dropbox.hide {
                        display: none;
                    }

                    .file-dropbox-item {
                        padding: 6px 6px;
                        display: flex;
                        justify-content: center;
                        border-radius: 8px;
                        color:var(--color-text-primary);
                        transition: background-color var(--transition-fast);
                    }
                    
                    .file-dropbox-item.red {
                        padding: 6px 6px;
                        display: flex;
                        justify-content: center;
                        border-radius: 8px;
                        color: #af6565;
                        transition: background-color var(--transition-fast);
                    }

                    .file-dropbox-item:hover {
                        background-color: #30304dc2;
                    }

                    .file-dropbox-item.red:hover {
                        background-color: #ff000017;
                    }

                    .add-file-button-container {
                        padding: 20px 16px 16px 16px;
                        border-top: 1px solid var(--color-border);
                    }

                    .add-document-in-side-bar {
                        display: flex;
                        justify-content: center;
                    }

                    .chat-section-document-add-btn {
                        background-color: var(--color-primary);
                        color: var(--color-text-fixed-primary-light);
                        border: none;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                        cursor: pointer;
                        transition: background-color var(--transition-fast);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .chat-section-document-add-btn:hover {
                        background-color: var(--color-primary-hover);
                    }

                    .main-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        height: 100%;
                        padding: 0 20px;
                        max-width: 100%;
                    }

                    .chatHeader {
                        display: flex;
                        align-items: center;
                        padding: 20px 0;
                        border-bottom: 1px solid var(--color-border);
                        width: 100%;
                        max-width: var(--content-max-width);
                        margin: 0 auto;
                    }

                    .back-button-massage {
                        display: flex;
                        margin-left: 26px;
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

                    .chatTitle {
                        font-size: 20px;
                        font-weight: 600;
                        color: var(--color-text-primary);
                    }

                    .content-box {
                        flex: 1;
                        overflow-y: auto;
                        padding: 20px 0;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                    }

                    .result-show {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                        width: 100%;
                        overflow-y: scroll;
                        scrollbar-width: none;
                        max-width: var(--content-max-width);
                    }

                    .message {
                        display: flex;
                        margin-bottom: 16px;
                        width: 100%;
                    }

                    .user-message {
                        justify-content: flex-end;
                    }

                    .bot-message {
                        justify-content: flex-start;
                    }

                    .message-content {
                        max-width: 70%;
                        padding: 12px 16px;
                        border-radius: var(--radius-medium);
                        animation: fadeIn var(--transition-fast);
                        line-height: 1.5;
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

                    .user-message .message-content {
                        background-color: var(--color-primary);
                        color: var(--color-text-primary);
                        border-top-right-radius: 0;
                    }

                    .bot-message .message-content {
                        background-color: var(--color-primary);
                        color: var(--color-text-primary);
                        border-top-left-radius: 0;
                    }

                    .messageBox {
                        display: flex;
                        align-items: center;
                        padding: 16px 0;
                        border-top: 1px solid var(--color-border);
                        margin-bottom: 16px;
                        width: 100%;
                        max-width: var(--content-max-width);
                        margin: 0 auto;
                    }

                    .messageInput {
                        flex: 1;
                        background-color: var(--color-surface);
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-medium);
                        color: var(--color-text-primary);
                        padding: 12px 16px;
                        font-size: 16px;
                        outline: none;
                        transition: border-color var(--transition-fast);
                    }

                    .messageInput:focus {
                        border-color: var(--color-primary);
                    }

                    .chat-send-button {
                        margin-left: 12px;
                        background-color: var(--color-primary);
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: background-color var(--transition-fast);
                    }

                    .chat-send-button:hover {
                        background-color: var(--color-primary-hover);
                    }

                    .send-button {
                        width: 20px;
                        height: 20px;
                    }

                    /* Loading indicator */
                    .typing-indicator {
                        display: flex;
                        padding: 12px 16px;
                        background-color: var(--color-surface);
                        border-radius: var(--radius-medium);
                        border-top-left-radius: 0;
                        max-width: 70px;
                        margin-bottom: 16px;
                    }

                    .typing-dot {
                        width: 8px;
                        height: 8px;
                        margin: 0 2px;
                        background-color: var(--color-text-secondary);
                        border-radius: 50%;
                        animation: typingAnimation 1.5s infinite ease-in-out;
                    }

                    .typing-dot:nth-child(1) {
                        animation-delay: 0s;
                    }

                    .typing-dot:nth-child(2) {
                        animation-delay: 0.2s;
                    }

                    .typing-dot:nth-child(3) {
                        animation-delay: 0.4s;
                    }

                    @keyframes typingAnimation {
                        0% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-5px);
                        }
                        100% {
                            transform: translateY(0);
                        }
                    }

                    @media (max-width: 549px) {
                        .sideContainer.slidein {
                            display: flex;
                            width: 100%;
                            position: absolute;
                            height: 100%;
                            z-index: 100;
                            background-color: #00000091;
                        }

                        .message-content {
                            max-width: 85%;
                        }
                    }

                    @media (max-width: 400px) {
                        .sideContainer.slidein {
                            animation: fadeIn var(--transition-fast);
                            width: 100%;
                            position: absolute;
                            height: 100%;
                            z-index: 100;
                        }
                        
                        .sidebar {
                            width: 100%;
                        }
                        
                        .message-content {
                            max-width: 85%;
                        }
                    }

                    .--hidden {
                        display: none;
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

                    @keyframes fadeOut {
                        from {
                            opacity: 1;
                            transform: translateY(0);
                        }
                        to {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                    }

                    .massage {
                        display:flex;
                        align-items: center;
                        background-color: var(--color-primary);
                        position: relative;
                        border: 0px solid #ffffff4f;
                        border-radius: 22px;
                        height: 44px;
                        width: 60px;
                        padding-left: 16px;
                    }

                    .new-massage {
                        display: flex;
                        align-items: center;
                        background-color: var(--color-primary);
                        position: absolute;
                        border: 0px solid #ffffff4f;
                        border-radius: 22px;
                        height: 44px;
                        width: 587px;
                        bottom: 16px;
                        right: 18px;
                        padding-left: 16px;

                        /* Animate all 4 properties with separate animations */
                        animation:
                            172ms linear 0s 1 normal forwards running fadexIn, 
                            287ms cubic-bezier(0.51, -0.01, 0.6, 1.02) 213ms 1 normal forwards running moveY, 
                            339ms cubic-bezier(0.49, -0.08, 0.48, 1) 161ms 1 normal forwards running shrinkWidth;
                    }

                    /* 1. Opacity animation */
                    @keyframes fadexIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    /* 2. TranslateX animation */
                    @keyframes moveX {
                        from {
                            transform: translateX(0) translateY(0);
                        }
                        to {
                            transform: translateX(542px) translateY(0);
                        }
                    }

                    /* 3. TranslateY animation */
                    @keyframes moveY {
                        from {
                            transform: translateX(0) translateY(0);
                        }
                        to {
                            transform: translateX(0) translateY(-84px);
                        }
                    }

                    /* 4. Width animation */
                    @keyframes shrinkWidth {
                        from {
                            width: 587px;
                        }
                        to {
                            width: 47px;
                        }
                    }

                `
            },

            navigator: function (options) {
                uiManager.userProfileButtonVisibility(true);
                helperFunctions.messagePageInit(options);
                helperFunctions.collectionName = options.collectionName;
                sideBarFunctions.initFileTags(options.collectionName);  
                if(options.reset) {
                    massageFunctions.resetMessagers();
                }
                helperFunctions.themeInit();
                const inputElement = document.querySelector('#messageInput');
                inputElement.focus();  
            }
        }

        const helperFunctions = {
            collectionName: '',

            themeInit: function() {
                if (document.documentElement.getAttribute('data-theme') === 'dark') {
                    sideBarFunctions.changeTagTheme('dark');
                    document.querySelector('#sideBarActionButton').setAttribute('src','../public/icons/chevron-left-50-ffffff.png');
                    document.querySelector('#sideShowBtn').querySelector('img').setAttribute('src','../public/icons/side-bar-show-100-ffffff.png');
                    document.querySelector('#backButton').querySelector('img').setAttribute('src','../public/icons/chevron-left-50-ffffff.png');
                    document.querySelector('#chatSendButton').querySelector('img').setAttribute('src','../public/icons/sent-50-ffffff.png');
                } else {
                    sideBarFunctions.changeTagTheme('light');
                    document.querySelector('#sideBarActionButton').setAttribute('src','../public/icons/chevron-left-50-1a1a1a.png');
                    document.querySelector('#sideShowBtn').querySelector('img').setAttribute('src','../public/icons/side-bar-show-100-1a1a1a.png');
                    document.querySelector('#backButton').querySelector('img').setAttribute('src','../public/icons/chevron-left-50-1a1a1a.png');
                    document.querySelector('#chatSendButton').querySelector('img').setAttribute('src','../public/icons/sent-50-ffffff.png');
                }
            },

            setChatTitle: function(options) {
                document.getElementById('chatTitle').innerText = options.collectionName;
            },

            messagePageInit: function(options) {
                this.setChatTitle(options);
                sideBarFunctions.setSideBarStatus();
            },
        }

        const sideBarFunctions = {
            setSideBarStatus: function() {
                document.querySelector('#sideContainer').setAttribute('user-isSideBar','s-false');
                this.sideBarAutoResizer();
            },

            hideSideBar: function() {
                const sideBarContainer = document.querySelector('#sideContainer');
                const sideBarHideButton = document.querySelector('#sideShowBtn');
                const userbuttonContainer = document.querySelector('#user-button-container');
                userbuttonContainer.style.display = 'flex';
                sideBarContainer.classList.replace('slidein', 'slideout');
                sideBarHideButton.classList.replace('slideout', 'slidein');
            },

            showSideBar: function() {
                const sideBarContainer = document.querySelector('#sideContainer');
                const sideBarshowButton = document.querySelector('#sideShowBtn');
                const userbuttonContainer = document.querySelector('#user-button-container');
                if (window.innerWidth < 400) {
                    userbuttonContainer.style.display = 'none';
                }
                sideBarContainer.classList.replace('slideout', 'slidein');
                sideBarshowButton.classList.replace('slidein', 'slideout');
            },

            sideBarAutoResizer: function() {
                const sideBarContainer = document.querySelector('#sideContainer');
                const userState = sideBarContainer.getAttribute('user-isSideBar');
                const width = window.innerWidth;
                if (width < 550 ) {
                    if (userState === 's-true') {
                        this.showSideBar();
                    } else {
                        this.hideSideBar();
                    }
                } else {
                    if (userState === 'l-false') {
                        this.hideSideBar();
                    } else {
                        this.showSideBar();
                    }
                }
            },

            /**
             * Create a new tag element
             * @param {string} name - The name of the tag
             * @returns {HTMLElement} - The created tag element
             */
            createTagElement: function(name,theme) {
                const li = document.createElement('li');
                li.className = 'file-item';
                li.setAttribute('data-file',name);
                li.innerHTML = `
                <img src="../public/icons/document-50-${theme === 'dark'? 'ffffff':'1a1a1a'}.png" class="file-extention-img" alt="txt-file">
                <span class="file-title" title="${name}">${name}</span>
                <div class="file-icon-cont">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="file-icon-md">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z" fill="currentColor"></path>
                    </svg>
                </div>
                <div class="file-dropbox hide">
                    <div class="file-dropbox-item" action="view">View file</div>
                    <div class="file-dropbox-item red" action="delete">Delete</div>     
                </div>
                `;
                li.addEventListener('mouseover',()=>{
                    li.querySelector('img').setAttribute('src',`../public/icons/document-50-ffffff.png`)
                });
                li.addEventListener('mouseleave',()=>{
                    li.querySelector('img').setAttribute('src',`../public/icons/document-50-${theme === 'dark'? 'ffffff':'1a1a1a'}.png`)
                });
                return li;
            },

            changeTagTheme: function(theme) {
                document.querySelectorAll('.file-item').forEach((tag)=> {
                    tag.querySelector('img').setAttribute('src',`../public/icons/document-50-${theme === 'dark'? 'ffffff':'1a1a1a'}.png`);
                    tag.addEventListener('mouseleave',()=>{
                        tag.querySelector('img').setAttribute('src',`../public/icons/document-50-${theme === 'dark'? 'ffffff':'1a1a1a'}.png`)
                    });
                });
                
            },
            
            /**
             * Add a new collection tag to the UI
             * @param {string} name - The name of the collection
             */
            addFileTag: function(name) {
                const filesContainer = document.getElementById('fileList');
                const newTag = this.createTagElement(name,document.documentElement.getAttribute('data-theme'));
                filesContainer.insertAdjacentElement('afterbegin', newTag);
            },

            /**
             * Remove all tags to the UI
             */
            removeAllTags: function() {
                const filesContainer = document.getElementById('fileList');
                filesContainer.innerHTML = ``;
            },

            /**
             * Fetch and display the list of files
             * @returns {Promise<void>}
             */
            getFileList: async function(collectionName) {
                return await api.getDocumentNames(collectionName, 'token Raveen2244')
            },

            /**
             * Collection list handler
             * Fetches the list of collections and handles different response statuses
             * @returns {Promise<Array>} - List of collections or an empty array on error   
             */
            fileListHandler: async function(collectionName) {
                try {
                    const files = await this.getFileList(collectionName);
                    // Handle different response statuses
                    if (files.status === 401) {
                        notificationManager.error('Authorization header required. Please log in again.');
                        return [];
                    }
                    if (files.status === 500) {
                        notificationManager.error('Server error. Please try again later.');
                        return [];
                    }
                    if (files.status === 204) {
                        notificationManager.info('No File found. Click "+" to add a new File.');
                        return [];
                    }
                    if (files.status === 200 && files.data.message.length > 0) {
                        return files.data.message;
                    }
                    if (files.status !== 200) {
                        notificationManager.error(`Error fetching files: ${files.status}`);
                        return [];
                    }
                } catch (error) {
                    notificationManager.error(`Error fetching files: ${error.message}`);
                    return [];
                }
            },

            /**
             * Initialize the collection tags UI
             */
            initFileTags: async function(collectionName) {
                const files = await this.fileListHandler(collectionName);
                // collection container cleaning
                this.removeAllTags();

                // If collections are successfully fetched, display them with animation
                if (files.length > 0) {
                    files.forEach((file) => {
                        this.addFileTag(file);
                    });
                    // uiEffectsManager.tagAppearAnimation();
                }
                // uiEffectsManager.addbuttonAppearAnimation(collections);

                this.tagEventInit(collectionName);
            },

            /**
             * Initialize events for collection tags
             */
            tagEventInit: function(collectionName) {
                const files = document.querySelectorAll('.file-item');
                files.forEach((file) => {
                    this.assingTagEvents(file, collectionName).forEach(eventitems => {
                        uiManager.eventManager.registerEvent(
                            eventitems.element,
                            eventitems.eventType,
                            eventitems.handler,
                            eventitems.eventGroup
                        );
                    });
                }); 
            },

            /**
             * Initialize events for collection given tag
             */
            assingTagEvents: function(file, collectionName) {
                return [
                    {
                        element: file,
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: function(event) {
                            event.stopPropagation();
                            const fileName= file.getAttribute('data-file');
                            return uiManager.navigateToView('fileview-card', 'fileview', {'fileName': fileName});
                        }
                    },
                    {
                        element: file.querySelector(".file-dropbox-item[action='view']"),
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: function(event) {
                            event.stopPropagation();
                            const fileName= file.getAttribute('data-file');
                            return uiManager.navigateToView('fileview-card', 'fileview', {'fileName': fileName});
                        }
                    },
                    {
                        element: file,
                        eventType: 'contextmenu',
                        eventGroup: 'massage',
                        handler: function(event) {
                            event.preventDefault();
                            const files = document.querySelectorAll('.file-item');
                            files.forEach((file) => {
                                file.querySelector('.file-dropbox').classList.replace('show', 'hide');
                            });
                            const fileDropBox = file.querySelector('.file-dropbox');
                            fileDropBox.classList.replace('hide','show');
                        }
                    },
                    {
                        element: file.querySelector('.file-icon-cont'),
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: function(event) {
                            const fileDropBox = file.querySelector('.file-dropbox');
                            if (fileDropBox.classList.contains('show')) {
                                event.stopPropagation();
                                fileDropBox.classList.replace('show','hide');
                            } else {
                                event.stopPropagation();
                                const files = document.querySelectorAll('.file-item');
                                files.forEach((file) => {
                                    file.querySelector('.file-dropbox').classList.replace('show', 'hide');
                                });
                                fileDropBox.classList.replace('hide','show');
                            }
                        }
                    },
                    {
                        element: file.querySelector(".file-dropbox-item[action='delete']"),
                        eventType: 'click',
                        eventGroup: 'massage',
                        handler: async function(event) {
                            event.stopPropagation(); // Prevent the tag click event from firing
                            const fileName = file.getAttribute('data-file');
                            try {
                                if (await overlayFunctions.askDeleteConfirmation()) {
                                    const response = await api.deleteDocument(collectionName, fileName, 'token Raveen2244');
                                    if (response.status === 200) {
                                        file.remove();
                                        notificationManager.success(`File "${fileName}" deleted successfully.`);
                                    } else {
                                        notificationManager.error(`Failed to delete file: ${response.status}`);
                                    }
                                }
                            } catch (error) {
                                notificationManager.error(`Error deleting file: ${error.message}`);
                            }
                        }
                    }
                ]
            }
        }

        const massageFunctions = {
            sendMassage: async function(value) {
                const messageInput = document.querySelector('#messageInput');

                const query = value.trim();
                if (query === '') return;
                
                // Add user message
                this.addUserMessage(query);
                
                // Clear input
                messageInput.value = '';
                    
                // Show typing indicator
                this.showTypingIndicator();
                
                // Process query (simulate AI response)
                
                setTimeout(async () => {
                    // Remove typing indicator
                    
                    
                    // Generate response based on query and context
                    let response;
                    // response = this.generateGeneralResponse(query);
                    response = await api.query('raveen2244', value, helperFunctions.collectionName);
                    
                    response = this.responseHandler(response);
                    // const result = await response.json();
                    
                    // Add bot message
                    this.removeTypingIndicator();
                    if (response) {
                        this.addBotMessage(response);
                    }
                    // this.addBotMessage(response? response : 'No response found. Please try again.');

                }, 1000 + Math.random() * 2000);
            },

            responseHandler: function(response) {
                // Handle different response statuses
                if (response.status === 401) {
                    notificationManager.error('Authorization header required. Please log in again.');
                    return;
                }
                if (response.status === 403) {
                    notificationManager.error('Invalid credentials.');
                    return;
                }
                if (response.status === 500) {
                    notificationManager.error('Server error. Please try again later.');
                    return;
                }
                if (response.status === 204) {
                    notificationManager.info('No response found.');
                    return;
                }
                if (response.status === 400) {
                    notificationManager.error('Bad request. Please check your input.');
                    return;
                }
                if (response.status === 200 && response.data.response.includes('HTTP Error: 401')) {
                    notificationManager.error('Authorization header required. Please log in again.');
                    return;
                }
                return response.data.response;
            },

            addBotMessage: function (message) {
                const resultDisplay = document.getElementById('resultDisplay');
                const messageElement = document.createElement('div');
                messageElement.className = 'message bot-message';
                // messageElement.innerHTML = `
                //     <div class="message-content">${this.formatMessage(message)}</div>
                // `;
                messageElement.innerHTML = `
                    <div class="message-content">${message}</div>
                `;
                resultDisplay.appendChild(messageElement);
                this.scrollToBottom();
            },

            // Add user message to chat
            addUserMessage: function(message) {
                const resultDisplay = document.getElementById('resultDisplay');
                const messageElement = document.createElement('div');
                messageElement.className = 'message user-message';
                messageElement.innerHTML = `
                    <div class="message-content">${this.escapeHTML(message)}</div>
                `;
                resultDisplay.appendChild(messageElement);
                this.scrollToBottom();
            },

            escapeHTML: function(text) {
                const map = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                };
                return text.replace(/[&<>"']/g, m => map[m]);
            },

            formatMessage: function(message) {
                // Replace URLs with clickable links
                const urlPattern = /(https?:\/\/[^\s]+)/g;
                message = message.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
                
                // Replace code blocks
                const codeBlockPattern = /```([^`]+)```/g;
                message = message.replace(codeBlockPattern, '<pre><code>$1</code></pre>');
                
                // Replace inline code
                const inlineCodePattern = /`([^`]+)`/g;
                message = message.replace(inlineCodePattern, '<code>$1</code>');
                
                // Replace line breaks
                message = message.replace(/\n/g, '<br>');
                
                return message;
            },

            // Scroll chat to bottom
            scrollToBottom: function() {
                const resultBox = document.querySelector('.result-show');
                resultBox.scrollTop = resultBox.scrollHeight;
            },

            showTypingIndicator: function() {
                const indicator = document.createElement('div');
                indicator.className = 'typing-indicator';
                indicator.id = 'typingIndicator';
                indicator.innerHTML = `
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                `;
                resultDisplay.appendChild(indicator);
                this.scrollToBottom();
            },

            // Remove typing indicator
            removeTypingIndicator: function() {
                const indicator = document.getElementById('typingIndicator');
                if (indicator) {
                    indicator.remove();
                }
            },

            resetMessagers: function() {
                const resultDisplay = document.getElementById('resultDisplay');
                resultDisplay.innerHTML = '';
            }
        }

        const overlayFunctions = {
            askDeleteConfirmation: async function() {
                return await overlayManager.askConfirmation({
                    title: { text: "Delete File?", color: "#e53e3e" },
                    content: `Are you sure you want to delete this file?`,
                    actions: [
                        { name: "Delete", color: "#e53e3e", return: true, type: "danger" },
                        { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
                    ],
                    size: { width: "400px", height: "auto" }
                });
            }
        }
    }
}
