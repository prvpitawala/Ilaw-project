export class Registration {
    /**
     * @param {import("../Manager/NotificationManager.js").NotificationManager} notificationManager
     * @param {import("../Manager/UIManager.js").UIManager} uiManager
     */
    constructor(notificationManager,uiManager) {
        //notificationManager;
        this.main = {    
            componant: function() {
                return `
                <!-- Page 1: Enter Name -->
                <div id="page-name" class="form-page form-page--active">
                    <!-- <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="User Icon" class="profile-icon"> -->
                    <h3 class="form-title">What's your name?</h3>
                    <div class="form-group">
                        <input class="form-input" type="text" id="input-name" placeholder="Enter your name">
                    </div>
                    <button class="btn" id="btn-continue-to-password">Continue</button>
                    <div class="progress-dots">
                        <div class="progress-dot progress-dot--active" data='page-name'></div>
                        <div class="progress-dot" data='page-password'></div>
                        <div class="progress-dot" data='page-profile'></div>
                        <div class="progress-dot" data='page-api'></div>
                    </div>
                </div>
                
                <!-- Page 2: Enter Password -->
                <div id="page-password" class="form-page">
                    <!-- <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="User Icon" class="profile-icon"> -->
                    <h3 class="form-title">Create a password</h3>
                    <div class="form-group">
                        <input class="form-input" type="password" id="input-password" placeholder="Enter your password">
                    </div>
                    <button class="btn" id="btn-continue-to-profile">Continue</button>
                    <div class="progress-dots">
                        <div class="progress-dot" data='page-name'></div>
                        <div class="progress-dot progress-dot--active" data='page-password'></div>
                        <div class="progress-dot" data='page-profile'></div>
                        <div class="progress-dot" data='page-api'></div>
                    </div>
                </div>
                
                <!-- Page 3: Add Profile Picture -->
                <div id="page-profile" class="form-page">
                    <div class="profile-picture-container">
                        <div class="profile-picture-preview" id="profile-picture-preview">
                            <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="Profile Preview" id="profile-preview-img">
                            <div class="profile-picture-overlay">
                                <span class="profile-picture-text">Click to upload</span>
                            </div>
                        </div>
                    </div>
                    <h3 class="form-title">Add your profile picture</h3>
                    <div class="form-group">
                        <input type="file" id="input-profile-picture" accept="image/*" class="profile-file-input" hidden>
                        <!-- <button class="btn btn-secondary" id="btn-select-picture">Choose Picture</button> -->
                        <button class="btn btn-tertiary" id="btn-skip-picture">Skip for now</button>
                    </div>
                    <button class="btn" id="btn-continue-to-api">Continue</button>
                    <div class="progress-dots">
                        <div class="progress-dot" data='page-name'></div>
                        <div class="progress-dot" data='page-password'></div>
                        <div class="progress-dot progress-dot--active" data='page-profile'></div>
                        <div class="progress-dot" data='page-api'></div>
                    </div>
                </div>
                
                <!-- Page 4: Enter API Key -->
                <div id="page-api" class="form-page">
                    <!-- <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="User Icon" class="profile-icon"> -->
                    <h3 class="form-title">API Key</h3>
                    <div class="form-group">
                        <input class="form-input" type="text" id="input-api-key" placeholder="Enter ChatGPT API Key">
                    </div>
                    <button class="btn" id="btn-register">Sign Up</button>
                    <div class="progress-dots">
                        <div class="progress-dot" data='page-name'></div>
                        <div class="progress-dot" data='page-password'></div>
                        <div class="progress-dot" data='page-profile'></div>
                        <div class="progress-dot progress-dot--active" data='page-api'></div>
                    </div>
                </div>
                `
            },
            event: function() {
                return [
                    {
                        element: document,
                        eventType: 'keypress',
                        eventGroup: 'register',
                        handler: function(event) {
                            if (event.key === 'Enter') {
                                if (helperFunctions.isElementVisibleToUser(document.querySelector(`#page-name`).querySelector("button"))) {
                                    event.preventDefault();
                                    document.querySelector("#input-name").value ? formNavigation.navigateToPage('page-password') : notificationManager.error('Fill name field');
                                }
                                
                                if (helperFunctions.isElementVisibleToUser(document.querySelector(`#page-password`).querySelector("button"))) {
                                    event.preventDefault();
                                    document.querySelector("#input-password").value ? formNavigation.navigateToPage('page-profile') : notificationManager.error('Fill password field');
                                }

                                if (helperFunctions.isElementVisibleToUser(document.querySelector(`#page-profile`).querySelector("#btn-continue-to-api"))) {
                                    event.preventDefault();
                                    formNavigation.navigateToPage('page-api');
                                }
        
                                if (helperFunctions.isElementVisibleToUser(document.querySelector(`#page-api`).querySelector("button"))) {
                                    event.preventDefault();
                                    registrationManager.submitRegistration();
                                }  
                            }
                        }
                    },
                    {
                        element: document.querySelector("#btn-continue-to-password"),
                        eventType: 'click',
                        eventGroup: 'register',
                        handler: function() {
                            document.querySelector("#input-name").value ? formNavigation.navigateToPage('page-password') : notificationManager.info('Fill name field');
                        } 
                    },
                    {
                        element: document.querySelector("#btn-continue-to-profile"),
                        eventType: 'click',
                        eventGroup: 'register',
                        handler: function() {
                            document.querySelector("#input-password").value ? formNavigation.navigateToPage('page-profile') : notificationManager.info('Fill password field');
                        } 
                    },
                    {
                        element: document.querySelector("#input-profile-picture"),
                        eventType: 'change',
                        eventGroup: 'register',
                        handler: function(event) {
                            profilePictureManager.handleFileSelection(event);
                        } 
                    },
                    {
                        element: document.querySelector("#profile-picture-preview"),
                        eventType: 'click',
                        eventGroup: 'register',
                        handler: function() {
                            document.querySelector("#input-profile-picture").click();
                        } 
                    },
                    {
                        element: document.querySelector("#btn-skip-picture"),
                        eventType: 'click',
                        eventGroup: 'register',
                        handler: function() {
                            profilePictureManager.clearProfilePicture();
                            notificationManager.info('Profile picture skipped');
                        } 
                    },
                    {
                        element: document.querySelector("#btn-continue-to-api"),
                        eventType: 'click',
                        eventGroup: 'register',
                        handler: function() {
                            formNavigation.navigateToPage('page-api');
                        } 
                    },
                    {
                        element: document.querySelector("#btn-register"),
                        eventType: 'click',
                        eventGroup: 'register',
                        handler: function() {
                            registrationManager.submitRegistration();
                        } 
                    },
                    {
                        element: document,
                        eventType: 'click',
                        eventGroup: 'register',
                        handler: function(event) {
                            const targetELE = event.target;
                            if (targetELE.classList.contains('progress-dot')) {
                                return formNavigation.navigateToPage(targetELE.getAttribute('data'));
                            }
                        } 
                    }
                    
                ]
            },
            style: function() {
                return `/**
                         * ==============================================
                         * Dot Flashing
                         * ==============================================
                         */
                        .dot-flashing {
                            position: relative;
                            width: 10px;
                            height: 10px;
                            border-radius: 5px;
                            background-color: #9880ff;
                            color: #9880ff;
                            animation: dot-flashing 1s infinite linear alternate;
                            animation-delay: 0.5s;
                        }
                        .dot-flashing::before, .dot-flashing::after {
                            content: "";
                            display: inline-block;
                            position: absolute;
                            top: 0;
                        }
                        .dot-flashing::before {
                            left: -15px;
                            width: 10px;
                            height: 10px;
                            border-radius: 5px;
                            background-color: #9880ff;
                            color: #9880ff;
                            animation: dot-flashing 1s infinite alternate;
                            animation-delay: 0s;
                        }
                        .dot-flashing::after {
                            left: 15px;
                            width: 10px;
                            height: 10px;
                            border-radius: 5px;
                            background-color: #9880ff;
                            color: #9880ff;
                            animation: dot-flashing 1s infinite alternate;
                            animation-delay: 1s;
                        }

                        @keyframes dot-flashing {
                            0% {
                                background-color: #9880ff;
                            }
                            50%, 100% {
                                background-color: rgba(152, 128, 255, 0.2);
                            }
                        }

                        /**
                         * ==============================================
                         * Profile Picture Styles
                         * ==============================================
                         */
                        .profile-picture-container {
                            display: flex;
                            justify-content: center;
                            margin-bottom: 20px;
                        }

                        .profile-picture-preview {
                            position: relative;
                            width: 120px;
                            height: 120px;
                            border-radius: 50%;
                            overflow: hidden;
                            border: 3px solid #e0e0e0;
                            cursor: pointer;
                            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                            background: #f8f9fa;
                        }

                        .profile-picture-preview:hover {
                            border-color: #9880ff;
                            transform: scale(1.05);
                            box-shadow: 0 8px 25px rgba(152, 128, 255, 0.3);
                        }

                        .profile-picture-preview img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            transition: opacity 0.3s ease;
                        }

                        .profile-picture-overlay {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(152, 128, 255, 0.8);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            opacity: 0;
                            transition: opacity 0.3s ease;
                        }

                        .profile-picture-preview:hover .profile-picture-overlay {
                            opacity: 1;
                        }

                        .profile-picture-text {
                            color: white;
                            font-size: 12px;
                            font-weight: 500;
                            text-align: center;
                        }

                        .btn-secondary {
                            background: #6c757d;
                            margin-right: 10px;
                        }

                        .btn-secondary:hover {
                            background: #5a6268;
                        }

                        .btn-tertiary {
                            background: transparent;
                            color: #6c757d;
                            border: 1px solid #dee2e6;
                            margin-top: 0px;
                        }

                        .btn-tertiary:hover {
                            background: #f8f9fa;
                            border-color: #adb5bd;
                        }

                        .profile-file-input {
                            display: none;
                        }

                        /* Animation for profile picture selection */
                        @keyframes profilePictureSuccess {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                            100% { transform: scale(1); }
                        }

                        .profile-picture-success {
                            animation: profilePictureSuccess 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                            border-color: #28a745 !important;
                        }`
            },
            navigator: function() {
                uiManager.userProfileButtonVisibility(false);
                document.querySelector("#input-name").focus();
            }
        }
        const helperFunctions = {
            isElementVisibleToUser: function(element) {
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
                this.displayPreview(file);
                this.animateSuccessSelection();
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
            displayPreview: function(file) {
                const reader = new FileReader();
                const previewImg = document.getElementById('profile-preview-img');

                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                };

                reader.readAsDataURL(file);
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
            }
        };
        
        /**
                 * Form Navigation Controller
                 * Handles transitions between form pages
                 */
        const formNavigation = {
            currentPageId: 'page-name',
            pageNumbers: ['page-name','page-password','page-profile','page-api'],
            
            /**
             * Navigate to a specific page with animations
             * @param {string} targetPageId - The ID of the page to navigate to
             */
            navigateToPage: function(targetPageId) {
                // Current page exit animation
                const currentPage = document.getElementById(this.currentPageId);
                this.animatePageExit(currentPage);
                setTimeout(() => {
                    // Hide current page after animation
                    currentPage.classList.remove('form-page--active');
                    currentPage.style.transform = '';
                    
                    // Prepare next page for entrance
                    const nextPage = document.getElementById(targetPageId);
                    this.preparePageEntrance(nextPage);
                    
                    // Focus appropriate element based on page
                    const focusElement = this.getFocusElement(targetPageId);
                    if (focusElement) {
                        focusElement.focus();
                    }
                    
                    // Trigger entrance animation after a short delay
                    setTimeout(() => {
                        this.animatePageEntrance(nextPage);
                        this.applyCardEffect();
                    }, 50);
                    
                    this.currentPageId = targetPageId;
                }, 400);
            },

            /**
             * Get the element to focus for a given page
             * @param {string} pageId - The page ID
             * @returns {HTMLElement|null} Element to focus
             */
            getFocusElement: function(pageId) {
                const focusMap = {
                    'page-name': document.querySelector("#input-name"),
                    'page-password': document.querySelector("#input-password"),
                    'page-profile': document.querySelector("#btn-select-picture"),
                    'page-api': document.querySelector("#input-api-key")
                };
                return focusMap[pageId] || null;
            },
            
            /**
             * Apply exit animation to a page
             * @param {HTMLElement} pageElement - The page element to animate
             */
            animatePageExit: function(pageElement) {
                pageElement.style.transition = 'opacity 0.4s cubic-bezier(0.55, 0, 0.1, 1), transform 0.4s cubic-bezier(0.55, 0, 0.1, 1)';
                pageElement.style.opacity = '0';
                pageElement.style.transform = 'translateX(-30px)';
            },
            
            /**
             * Prepare a page for entrance animation
             * @param {HTMLElement} pageElement - The page element to prepare
             */
            preparePageEntrance: function(pageElement) {
                pageElement.classList.add('form-page--active');
                pageElement.style.opacity = '0';
                pageElement.style.transform = 'translateX(30px)';
            },
            
            /**
             * Apply entrance animation to a page
             * @param {HTMLElement} pageElement - The page element to animate
             */
            animatePageEntrance: function(pageElement) {
                pageElement.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                pageElement.style.opacity = '1';
                pageElement.style.transform = 'translateX(0)';
            },
            
            /**
             * Apply subtle animation effect to the card container
             */
            applyCardEffect: function() {
                const container = document.getElementById('registration-card');
                container.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                container.style.transform = 'scale(1.02)';
                
                setTimeout(() => {
                    container.style.transform = 'scale(1)';
                }, 300);
            }
        };
        
        /**
         * Registration Manager
         * Handles form submission and validation
         */
        const registrationManager = {
            /**
             * Submit registration form
             */
            submitRegistration: async function() {
                const name = document.getElementById('input-name').value;
                const password = document.getElementById('input-password').value;
                const apiKey = document.getElementById('input-api-key').value;
                
                if (!this.validateInputs(name, password, apiKey)) {
                    notificationManager.error('Please fill in all fields');
                    return;
                }

                // Process successful registration
                await this.processSuccessfulRegistration(name, password, apiKey);
            },
            
            /**
             * Validate input fields
             * @param {string} name - User name
             * @param {string} password - User password
             * @param {string} apiKey - API key
             * @returns {boolean} - Validation result
             */
            validateInputs: function(name, password, apiKey) {
                return Boolean(name && password && apiKey);
            },
            
            /**
             * Show validation error with shake animation
             */
            showValidationError: function() {
                const container = document.getElementById('registration-card');
                container.style.transition = 'transform 0.1s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
                container.style.transform = 'translateX(20px)';
                
                let shakeCount = 0;
                const maxShakes = 5;
                const shakeInterval = setInterval(() => {
                    shakeCount++;
                    if (shakeCount >= maxShakes) {
                        clearInterval(shakeInterval);
                        container.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                        container.style.transform = 'translateX(0)';
                        return;
                    }
                    
                    container.style.transform = `translateX(${shakeCount % 2 === 0 ? 20 : -20}px)`;
                }, 50);
            },
            
            /**
             * Process successful registration with animation
             * @param {string} name - User name
             * @param {string} password - User password
             * @param {string} apiKey - API key
             * @returns {void}
             */
            processSuccessfulRegistration: async function(name, password, apiKey) {
                // Success animation
                const container = document.getElementById('registration-card');
                const button = document.getElementById('btn-register');
                
                this.animateLoadingButton(button);
                
                try {
                    // Prepare form data
                    const userData = {
                        userName: name,
                        password: password,
                        chatGPTApiKey: apiKey,
                        geminiApiKey: ''
                    };

                    // Handle profile picture if selected
                    const profilePictureData = await this.prepareProfilePictureData();
                    if (profilePictureData) {
                        userData.profilePicture = profilePictureData;
                    }
                    
                    // Send registration data to the server                 
                    setTimeout(async () => {
                        this.animateCardExit(container);
                        const response = await api.register(userData);
                        console.log(response);
                        if (response.error) {
                            notificationManager.error(response.message);
                            this.resetButton(button);
                            return;
                        }
                        if (response.data.message.includes("Uploaded")) {
                            this.animateSuccessButton(button);
                            notificationManager.success('Registration successful!');
                            return uiManager.navigateToView('dashboard', 'dashboard');
                        }          
                        // Handle other response statuses
                    }, 1000);
                } catch (error) {
                    console.error('Registration error:', error);
                    notificationManager.error('Registration failed. Please try again.');
                    this.resetButton(button);
                }
            },

            /**
             * Prepare profile picture data for backend transmission
             * @returns {Promise<Object|null>} Profile picture data or null
             */
            prepareProfilePictureData: async function() {
                const base64Data = await profilePictureManager.getFileAsBase64();
                const metadata = profilePictureManager.getFileMetadata();

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
            },

            /**
             * Reset button to original state
             * @param {HTMLElement} button - The button element
             */
            resetButton: function(button) {
                button.innerHTML = 'Sign Up';
                button.style.width = '';
                button.style.borderRadius = '';
                button.disabled = false;
            },
            
            /**
             * Animate success button
             * @param {HTMLElement} button - The button element
             */
            animateSuccessButton: function(button) {
                button.innerText = '✓';
                button.style.width = '70px';
                button.style.borderRadius = '30px';
                button.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            },

            animateLoadingButton: function(button) {
                button.innerHTML = `<div class="dot-flashing"></div>`;
                button.style.display = 'flex';
                button.style.justifyContent = 'center';
                button.style.width = '70px';
                button.style.borderRadius = '30px';
                button.disabled = true;
            },  
            
            /**
             * Animate card exit after registration
             * @param {HTMLElement} container - The card container element
             */
            animateCardExit: function(container) {
                container.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
                container.style.transform = 'scale(0.95) translateY(10px)';
                container.style.opacity = '0';
            }
        };
                
        /**
         * UI Effects Manager
         * Handles visual effects and interactions
         */
        const uiEffectsManager = {
            /**
             * Initialize UI effects
             */
            init: function() {
                // this.setupParallaxEffect();
                // this.setupInitialAnimations();
            },
            
            /**
             * Set up parallax effect on mouse movement
             */
            setupParallaxEffect: function() {
                const container = document.getElementById('registration-card');
                
                document.addEventListener('mousemove', (e) => {
                    const xAxis = (window.innerWidth / 2 - e.pageX) / 100;
                    const yAxis = (window.innerHeight / 2 - e.pageY) / 100;
                    container.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateZ(0)`;
                });
                
                // Reset transform when mouse leaves
                document.addEventListener('mouseleave', () => {
                    container.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    container.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
                });
            },
            
            /**
             * Set up initial animations for page elements
             */
            setupInitialAnimations: function() {
                window.addEventListener('load', () => {
                    const elements = document.querySelectorAll('#page-name > *:not(.profile-icon)');
                    elements.forEach((el, index) => {
                        el.style.opacity = '0';
                        el.style.transform = 'translateY(10px)';
                        el.style.animation = `elementAppear 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${0.2 + index * 0.2}s forwards`;
                    });
                });
            }
        };
        
        // Initialize UI effects
        // uiEffectsManager.init();
    }
}