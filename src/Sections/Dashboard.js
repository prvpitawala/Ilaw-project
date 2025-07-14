export class Dashboard {
    /**
     * @param {import("../Manager/NotificationManager.js").NotificationManager} notificationManager
     * @param {import("../Manager/OverlayManager.js").OverlayManager} overlayManager
     * @param {import("../Manager/UIManager.js").UIManager} uiManager
     */
    constructor(notificationManager,overlayManager,uiManager) {
        this.main = {    
            componant: function() {
                return `
                <div class="tags-title">Collections</div>
                <div class="search-container">
                    <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input type="text" class="search-input" placeholder="Search" id="searchInput" autocomplete="off">
                </div>
                <div class="tags-container" id="tagsContainer">
                    <span class="add-tag-title" title="Create new file collection"><div class="add-tag show" id="addTag">+</div></span> 
                    <div class="collection-dropbox hide" id="collection-dropbox" data=''>
                        <div id='dashboardDropboxView' class="collection-dropbox-item" action="view">Go chat</div>
                        <div id='dashboardDropboxDelete' class="collection-dropbox-item red" action="delete">Delete</div>    
                    </div>      
                </div>
                `
            },
        
            event: function() {
                return [
                    {
                        element: document,
                        eventType: 'click',
                        eventGroup: 'dashboard',
                        handler: function(event) {
                            // Hide collection dropbox if clicked outside
                            const collectionDropboxes = document.querySelectorAll('.collection-dropbox');
                            collectionDropboxes.forEach((dropbox) => {
                                if (!dropbox.contains(event.target)) {
                                    dropbox.classList.replace('show', 'hide');
                                }
                            });
                        }
                    },
                    {
                        element: document.querySelector('#user-button-container'),
                        eventType: 'click',
                        eventGroup: 'dashboard',
                        handler: function(event) {
                            // Hide collection dropbox if clicked outside
                            const UBcontainer = document.querySelector('#user-button-container')
                            UBcontainer.setAttribute('data', uiManager.currentView)
                            return uiManager.navigateToView('settings-card', "setting",{'baseView': uiManager.currentView});
                        }
                    },
                    {
                        element: document,
                        eventType: 'keydown',
                        eventGroup: 'system',
                        handler: function(event) {
                            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                                if (uiManager.currentView !== 'message-card' && uiManager.currentView !== 'settings-card') {
                                    const UBcontainer = document.querySelector('#user-button-container')
                                    UBcontainer.setAttribute('data', uiManager.currentView)
                                    return uiManager.navigateToView('settings-card', "setting",{'baseView': uiManager.currentView});
                                }
                            }
                        }
                    },
                    {
                        element: document.querySelector('#collection-dropbox').querySelector(".collection-dropbox-item[action='delete']"),
                        eventType: 'click',
                        eventGroup: 'dashboard',
                        handler: async function(event) {
                            event.stopPropagation(); // Prevent the tag click event from firing
                            const dropbox = document.querySelector('#collection-dropbox');
                            const collectionName = dropbox.getAttribute('data');
                            if (await overlayFunctions.askDeleteConfirmation()) {    
                                try {
                                    const response = await api.deleteCollection(collectionName, 'token Raveen2244');
                                    if (response.status === 200) {
                                        const tagToRemove = document.querySelector(`.tag[data-letter="${collectionName}"]`);
                                        tagToRemove.remove();
                                        notificationManager.success(`Collection "${collectionName}" deleted successfully.`);
                                    } else {
                                        notificationManager.error(`Failed to delete collection: ${response.status}`);
                                    }
                                } catch (error) {
                                    notificationManager.error(`Error deleting collection: ${error.message}`);
                                }
                            }
                        }
                    },
                    {
                        element: document.querySelector('#collection-dropbox').querySelector(".collection-dropbox-item[action='view']"),
                        eventType: 'click',
                        eventGroup: 'dashboard',
                        handler: function() {
                            const dropbox = document.querySelector('#collection-dropbox');
                            const collectionName= dropbox.getAttribute('data');
                            return uiManager.navigateToView('message-card', 'massage', {'collectionName': collectionName, 'reset': true});
                        }
                    },
                    {
                        element: document.getElementById('searchInput'),
                        eventType: 'input',
                        eventGroup: 'dashboard',
                        handler: function(event) {
                            const query = event.target.value.toLowerCase().trim();
                            helperFunctions.tagHider(helperFunctions.searchTags(query));   
                        }
                    }
                ]
            },

            style: function() {
                return `

                    .user-button-pic-img {
                        width: 40px;
                        height: 40px;
                        border-radius: 25px;
                    }

                    .search-container {
                        position: relative;
                        width: 100%;
                        max-width: 500px;
                        margin-bottom: 0px;
                    }

                    .search-input {
                        width: 100%;
                        padding: 10px 18px 10px 41px;
                        background: var(--color-surface);
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-large);
                        color: var(--color-text-primary);
                        font-size: 1rem;
                        outline: none;
                        transition: all var(--transition-fast);
                        backdrop-filter: blur(10px);
                    }

                    .search-input:focus {
                        border-color: var(--color-primary);
                    }

                    .search-input::placeholder {
                        color: var(--color-text-secondary);
                    }

                    .search-icon {
                        position: absolute;
                        left: 13px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 1.25rem;
                        height: 1.25rem;
                        color: var(--color-text-secondary);
                        pointer-events: none;
                    }


                    .container {
                        display: flex;
                        position: relative;
                        text-align: center;
                        width: 100%;
                        height: 50%;
                        max-width: 600px;
                        height: calc(100vh - 31px);
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        background-color: var(--color-backgound);
                        backdrop-filter: blur(var(--blur-standard));
                        -webkit-backdrop-filter: blur(var(--blur-standard));
                        border-radius: var(--radius-large);
                        padding: 40px 20px;
                        box-shadow: var(--shadow-large);
                        transform: translateZ(0);
                        will-change: transform, opacity;
                        animation: cardAppear var(--transition-bounce) forwards;
                    }

                    .tags-container {
                        width: 100%;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        justify-content: center;
                        margin-top: 20px;
                    }

                    .tags-title {
                        font-size: 18px;
                        margin: 0 0 10px 0px;
                        color: var(--color-text-primary);
                    }

                    @keyframes cardSlideIn {
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }

                    .tag {
                        display: flex;
                        padding: 8px 12px;
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-large);
                        font-size: 14px;
                        color: var(--color-text-primary);
                        cursor: pointer;
                        flex-direction: row-reverse;
                        background-color: var(--color-surface);
                        align-items: center;
                        text-align: center;
                        transform: translateY(10px);
                        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
                        opacity: 0;
                    }

                    .tag:hover {
                        .tag-icon-md {
                            opacity: 100%;
                        }
                        font.collection-tag-title {
                            margin-right:24px;
                            margin-left: 0px;
                        }
                        color: var(--color-text-fixed-primary-light);
                        background: var(--color-primary);
                    }   
                        
                    

                    .collection-dropbox-item {
                        padding: 6px 6px;
                        display:flex;
                        justify-content: center;
                        border-radius: 8px;
                        color:var(--color-text-primary);
                        transition: background-color var(--transition-fast);
                    }

                    .collection-dropbox-item.red {
                        padding: 6px 6px;
                        display:flex;
                        justify-content: center;
                        border-radius: 8px;
                        color: #af6565;
                        transition: background-color var(--transition-fast);
                    }

                    .collection-dropbox-item:hover {
                        background-color: #30304dc2;
                    }

                    .collection-dropbox-item.red:hover {
                        background-color: #ff000017;
                    }

                    font.collection-tag-title {
                        left: 0;
                        margin-left: 12px;
                        margin-right: 12px; 
                        position: relative;
                        transition: margin var(--transition-standard);
                    }

                    svg.tag-icon-md {
                        display: block;
                        opacity: 0%;
                        top: 8px;
                        right: 14px;
                        position: absolute;
                        background-color: transparent;
                        margin: -1px -6px -8px -14px;
                        backdrop-filter: blur(var(--blur-standard));
                       border-radius: 5px;
                        transition: opacity var(--transition-fast);
                        color: var(--color-text-fixed-primary-light);
                    }

                    .tag-icon-md {
                        cursor: pointer;
                    }

                    .tag-icon-md:hover {
                        box-shadow: inset -6px 0px 9px 11px rgb(26 26 34 / 40%);
                        border-radius: var(--radius-xsmall);
                    }

                    .collection-dropbox {
                        position: absolute;
                        display:flex;
                        top:0px;
                        left:0px;
                        padding: 3px;
                        background-color: rgb(40 40 63);
                        border-radius: var(--radius-small);
                        box-shadow: var(--shadow-medium);
                        z-index: 10;
                        min-width: 100px;
                        overflow: hidden;
                        justify-content: center;
                        flex-direction: column;
                    }

                    span.add-tag-title {
                        z-index: 1;
                    }   

                    .add-tag {
                        padding: 8px 12px;
                        border: 1px solid var(--color-border);
                        border-radius: 50%;
                        font-size: 16px;
                        cursor: pointer;
                        opacity: 0;
                        transform: translateY(10px);
                        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
                        background-color: var(--color-primary);
                        color: var(--color-text-fixed-primary-light);
                    }

                    .add-tag:hover {
                        background: var(--color-primary-hover);
                    }

                    .hide {
                        display: none;
                    }

                    .show {
                        display: flex;
                    }
                    
                    .--hidden {
                        display: none;
                    }

                    @media (max-width: 400px) {
                        .search-container {
                            margin-bottom: 0px;
                        }
                        
                        .search-input {
                            padding: 10px 4px 10px 42px;
                        }
                        
                        .search-icon {
                            left: 12px;
                        }

                        .tags-container {
                            width: 100%;
                            display: flex;
                            gap: 10px;
                            margin-top: 20px;
                            align-content: stretch;
                            flex-direction: column;
                            align-items: center;
                        }

                        .tag {
                            display: flex;
                            width: inherit;
                            padding: 8px 12px;
                            border: 1px solid var(--color-border);
                            border-radius: var(--radius-large);
                            font-size: 14px;
                            color: var(--color-text-primary);
                            cursor: pointer;
                            flex-direction: row-reverse;
                            background-color: var(--color-surface);
                            align-items: center;
                            text-align: center;
                            transition: opacity 0.4s ease-out, transform 0.4s ease-out;
                            justify-content: center;
                        }

                        .tag:hover {
                            .tag-icon-md {
                                opacity: 100%;
                            }
                            font.collection-tag-title {
                                margin-right:0px;
                            }
                            background: var(--color-primary);
                        }

                        .collection-dropbox.show {
                            display: flex;
                            position: absolute;
                            padding: 3px;
                            top:0px;
                            left:0px;
                            background-color: rgb(40 40 63);
                            border-radius: var(--radius-small);
                            box-shadow: var(--shadow-medium);
                            z-index: 10;
                            min-width: 100px;
                            overflow: hidden;
                            justify-content: center;
                            flex-direction: column;
                        }

                        span.add-tag-title {
                            z-index: 1;
                            width: fit-content;
                        }
                    }
                `
            },

            navigator: function() {
                uiManager.userProfileButtonVisibility(true);
                const collectionDropBox = document.querySelector('#collection-dropbox');
                collectionDropBox.classList.contains('show') === true ? collectionDropBox.classList.replace('show', 'hide') : null ;
                helperFunctions.initCollectionTags();
                helperFunctions.userButton();
            }
        }
        const helperFunctions = {
            collectionList: [],
            /**
             * Create a new tag element
             * @param {string} name - The name of the tag
             * @returns {HTMLElement} - The created tag element
             */
            createTagElement: function(name) {
                const tag = document.createElement('div');
                tag.className = 'tag';
                tag.dataset.letter = name;
                tag.innerHTML = `
                <font class="collection-tag-title">${name}</font>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg" class="tag-icon-md">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z"
                        fill="currentColor"></path>
                </svg>`;
                return tag;
            },
            
            /**
             * Add a new collection tag to the UI
             * @param {string} name - The name of the collection
             */
            addCollectionTag: function(name) {
                const tagsContainer = document.getElementById('tagsContainer');
                const newTag = this.createTagElement(name);
                tagsContainer.insertAdjacentElement('afterbegin', newTag);
                // tagsContainer.appendChild(newTag);
            },

            /**
             * Remove all tags to the UI
             */
            removeAllTags: function() {
                const tagsContainer = document.getElementById('tagsContainer');
                const removeTags = document.querySelectorAll('.tag');
                removeTags.forEach((tag) => {
                    tag.remove();
                });
                // tagsContainer.innerHTML = `
                //     <span class="add-tag-title" title="Create new file collection"><div class="add-tag show" id="addTag">+</div></span>
                //     <div class="collection-dropbox hide" id="collection-dropbox" data=''>
                //         <div class="collection-dropbox-item" action="view">Go chat</div>
                //         <div class="collection-dropbox-item red" action="delete">Delete</div>    
                //     </div>
                // `;
            },

            searchTags: function(searchInput) {
                const hiddenTags = [];
                const tags = document.querySelectorAll('.tag');
                tags.forEach((tag) => {
                    if (!tag.innerText.toLowerCase().includes(searchInput.toLowerCase())) {
                        hiddenTags.push(tag);
                    }
                });
                return hiddenTags;
            },

            tagHider: function(hiddenTagsList) {
                // Hide matching tags
                hiddenTagsList.forEach(tag => {
                    tag.style.display = 'none';
                });

                // Show non-hidden tags
                const visibleTags = this.generateVisibleTags(hiddenTagsList);
                visibleTags.forEach(tag => {
                    tag.style.display = 'flex';
                });
            },

            /**
             * @param {HTMLElement[]} hiddenTagsList
             * @returns {HTMLElement[]}
             */
            generateVisibleTags: function(hiddenTagsList) {
                const visibleTags = [];
                const tags = document.querySelectorAll('.tag');
                tags.forEach((tag) => {
                    if (!hiddenTagsList.includes(tag)) {
                        visibleTags.push(tag);
                    }
                });
                return visibleTags;
            },

            /**
             * Fetch and display the list of collections
             * @returns {Promise<void>}
             */
            getCollectionList: async function() {
                return await api.getCollections('token Raveen2244');
            },
            /**
             * Collection list handler
             * Fetches the list of collections and handles different response statuses
             * @returns {Promise<Array>} - List of collections or an empty array on error   
             */
            collectionListHandler: async function() {
                try {
                    const collections = await this.getCollectionList();
                    // Handle different response statuses
                    if (collections.status === 401) {
                        notificationManager.error('Authorization header required. Please log in again.');
                        return [];
                    }
                    if (collections.status === 500) {
                        notificationManager.error('Server error. Please try again later.');
                        return [];
                    }
                    if (collections.status === 204) {
                        notificationManager.info('No collections found. Click "+" to create a new collection.');
                        return [];
                    }
                    if (collections.status === 200 && collections.data.message.length > 0) {
                        return collections.data.message;
                    }
                    if (collections.status !== 200) {
                        notificationManager.error(`Error fetching collections: ${collections.status}`);
                        return [];
                    }
                } catch (error) {
                    notificationManager.error(`Error fetching collections: ${error.message}`);
                    return [];
                }
            },
            /**
             * Initialize the collection tags UI
             */
            initCollectionTags: async function() {
                const collections = await this.collectionListHandler();
                // collection container cleaning
                this.removeAllTags();

                // If collections are successfully fetched, display them with animation
                if (collections.length > 0) {
                    collections.forEach((collection) => {
                        this.addCollectionTag(collection);
                        helperFunctions.collectionList.push(collection);
                    });
                    uiEffectsManager.tagAppearAnimation();
                }
                uiEffectsManager.addbuttonAppearAnimation(collections);
                this.tagEventInit();
            },
            /**
             * Initialize events for collection tags
             */
            tagEventInit: function() {
                const tags = document.querySelectorAll('.tag');
                tags.forEach((tag) => {
                    this.assingTagEvents(tag).forEach(eventitems => {
                        uiManager.eventManager.registerEvent(
                            eventitems.element,
                            eventitems.eventType,
                            eventitems.handler,
                            eventitems.eventGroup
                        );
                    });
                });

                uiManager.eventManager.registerEvent(
                    document.querySelector('.add-tag-title'),
                    'click',
                    function() {
                        uiManager.navigateToView('collection-add-card', 'collectionAdd',{'collectionList':helperFunctions.collectionList});
                    },
                    'dashboard'
                )
            },

            showCollectionDropbox: function(event) {
                const contextBox = document.querySelector('#collection-dropbox');
                const clientX = event.clientX;
                const clientY = event.clientY;
                
            },

            /**
             * Initialize events for collection given tag
             */
            assingTagEvents: function(tag) {
                return [
                    {
                        element: tag,
                        eventType: 'click',
                        eventGroup: 'dashboard',
                        handler: function() {
                            const collectionName= tag.querySelector('.collection-tag-title').innerText;
                            return uiManager.navigateToView('message-card', 'massage', {'collectionName': collectionName, 'reset': true});
                        }
                    },
                    
                    {
                        element: tag,
                        eventType: 'contextmenu',
                        eventGroup: 'dashboard',
                        handler: function(event) {
                            event.preventDefault();                            
                            const collectionDropBox = helperFunctions.fitCollectionDropboxPos(tag);
                            // Show it
                            collectionDropBox.classList.replace('hide', 'show');
                            collectionDropBox.setAttribute('data', tag.innerText)
                        }
                    },
                    {
                        element: tag.querySelector('.tag-icon-md'),
                        eventType: 'click',
                        eventGroup: 'dashboard',
                        handler: function(event) {
                            const collectionDropBox = document.querySelector('#collection-dropbox');
                            if (collectionDropBox.classList.contains('show') && collectionDropBox.getAttribute('data')===tag.innerText) {
                                event.stopPropagation();
                                collectionDropBox.classList.replace('show','hide');
                                collectionDropBox.setAttribute('data', '');
                            } else {
                                event.stopPropagation();
                                const dropboxEle = helperFunctions.fitCollectionDropboxPos(tag);
                                dropboxEle.classList.replace('hide','show');
                                collectionDropBox.setAttribute('data', tag.innerText);
                            }

                        }
                    }
                ]
            },

            fitCollectionDropboxPos: function(tag) {
                const collectionDropBox = document.querySelector('#collection-dropbox');
                collectionDropBox.style = '';
                // Get the position of the tag element
                const rect = tag.querySelector('.tag-icon-md').getBoundingClientRect();
                const dashboardRect = document.querySelector('#dashboard').getBoundingClientRect();
                // Set dropbox position
                if (rect.left-dashboardRect.left+100 > window.innerWidth) {
                    collectionDropBox.style.position = 'absolute';
                    collectionDropBox.style.top = `${rect.bottom-dashboardRect.top}px`;
                    collectionDropBox.style.left = `${window.innerWidth-100}px`;
                } else {
                    collectionDropBox.style.position = 'absolute';
                    collectionDropBox.style.top = `${rect.bottom-dashboardRect.top}px`;
                    collectionDropBox.style.left = `${rect.left-dashboardRect.left}px`;
                }
                return collectionDropBox;
            },

            userButton: function() {
                const userbuttonContainer = document.querySelector('#user-button-container');
                this.initUserPic(userbuttonContainer);
                userbuttonContainer.style.zIndex = 1;
            },

            initUserPic: async function(userbuttonContainer) {
                const userName = await api.getProfileName();
                const res = await api.getProfilePicture(userName.data.message.userName);
                var url = null;
                if (res.ok) {
                    const blob = new Blob([res.data], { type: res.contentType });
                    url = URL.createObjectURL(blob);
                } 
                userbuttonContainer.querySelector('img').src = url? url : '.././public/icons/profile.png';
            }
        }

        const overlayFunctions = {
            askDeleteConfirmation: async function() {
                return await overlayManager.askConfirmation({
                    title: { text: "Delete Collection?", color: "#e53e3e" },
                    content: `Are you sure you want to delete this collection?`,
                    actions: [
                        { name: "Delete", color: "#e53e3e", return: true, type: "danger" },
                        { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
                    ],
                    size: { width: "400px", height: "auto" }
                });
            }
        }

        /**
         * UI Effects Manager
         * Handles visual effects and interactions
         */
        const uiEffectsManager = {
            tagAppearAnimation: function() {
                const newTags = document.querySelectorAll('.tag');
                // Then animate visibility one by one
                newTags.forEach((tag, index) => {
                    setTimeout(() => {
                        tag.style.opacity = '1';
                        tag.style.transform = 'translateY(0)';
                    }, (index+1) * 20); // 150ms delay between each visibility
                });
            },
            addbuttonAppearAnimation: function(collections) {
                const addbutton = document.getElementById('addTag');
                setTimeout(() => {
                    addbutton.style.opacity = '1';
                    addbutton.style.transform = 'translateY(0)';
                }, collections.length*30);
            }
        };  
    }
}

