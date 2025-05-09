export class Dashbord {
    constructor(notificationManager) {
        //notificationManager;
        this.main = {    
            componant: function() {
                return `
                <div class="tags-title">Collections</div>
                <div class="tags-container" id="tagsContainer">
                    <span class="add-tag-title" title="Create new file collection"><div class="add-tag show" id="addTag" onclick="addDocument()">+</div></span>       
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
                                    document.querySelector("#input-password").value ? formNavigation.navigateToPage('page-api') : notificationManager.error('Fill password field');
                                }
        
                                if (helperFunctions.isElementVisibleToUser(document.querySelector(`#page-api`).querySelector("button"))) {
                                    event.preventDefault();
                                    registrationManager.submitRegistration();
                                    // document.querySelector("#input-api-key").value ? formNavigation.navigateToPage('page-password') : notificationManager.error('Fill API key field');
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
                        element: document.querySelector("#btn-continue-to-api"),
                        eventType: 'click',
                        eventGroup: 'register',
                        handler: function() {
                            document.querySelector("#input-password").value ? formNavigation.navigateToPage('page-api') : notificationManager.info('Fill password field');
                        } 
                    },
                    {
                        element: document.querySelector("#btn-register"),
                        eventType: 'click',
                        eventGroup: 'register',
                        handler: function() {
                            registrationManager.submitRegistration();
                            // document.querySelector("#input-name").value ?  : notificationManager.info('ewrre');
                        } 
                    }
                ]
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
                 * Form Navigation Controller
                 * Handles transitions between form pages
                 */
        const formNavigation = {
            currentPageId: 'page-name',
            
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
                    
                    // Trigger entrance animation after a short delay
                    setTimeout(() => {
                        this.animatePageEntrance(nextPage);
                        this.applyCardEffect();
                    }, 50);
                    
                    this.currentPageId = targetPageId;
                }, 400);
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
            submitRegistration: function() {
                const name = document.getElementById('input-name').value;
                const password = document.getElementById('input-password').value;
                const apiKey = document.getElementById('input-api-key').value;
                
                if (!this.validateInputs(name, password, apiKey)) {
                    notificationManager.error('Please fill in all fields');
                    // this.showValidationError(); not working
                    return;
                }
                
                // Process successful registration
                this.processSuccessfulRegistration();
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
             */
            processSuccessfulRegistration: function() {
                notificationManager.success('Registration successful!');
                
                // Success animation
                const container = document.getElementById('registration-card');
                const button = document.getElementById('btn-register');
                
                this.animateSuccessButton(button);
                
                setTimeout(() => {
                    this.animateCardExit(container);
                    
                    // Redirect or further action would go here
                    setTimeout(() => {
                        // window.location.href = 'dashboard.html';
                    }, 700);
                }, 1000);
            },
            
            /**
             * Animate success button
             * @param {HTMLElement} button - The button element
             */
            animateSuccessButton: function(button) {
                button.innerText = '✓';
                button.style.width = '60px';
                button.style.borderRadius = '30px';
                button.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
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

