export class OverlayManager {
    /**
     * @param {import("../Manager/NotificationManager.js").NotificationManager} notificationManager
     */
    constructor(notificationManager) {
        this.overlays = new Map();
        this.overlaySystemContainer = document.getElementById('overlay-system-container');
        this.currentId = 0;
        this.eventListeners = new Map();
        this.toastContainer = null;
        this.notificationManager = notificationManager;
        this.init();
    }

    init() {
        this.addStyle(this.cssStyls(), 'style-overlay-system');
    }

    generateId() {
        return `overlay-${++this.currentId}`;
    }

    addStyle(css, id = null) {
        const styleId = id || `component-style-${this.styleCounter++}`;
        
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = css;
        
        document.head.appendChild(styleElement);
    }

    cssStyls() {
        return `
            /* Overlay Styles */
            .overlay-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .overlay-backdrop.show {
                opacity: 1;
            }

            .overlay-container {
                background-color: rgb(26 26 34);
                background-color: var(--color-background);
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 90vw;
                max-height: 90vh;
                overflow: hidden;
                transform: scale(0.8) translateY(20px);
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                border: 0px solid rgba(255, 255, 255, 0.2);
            }

            .overlay-backdrop.show .overlay-container {
                transform: scale(1) translateY(0);
            }

            .overlay-header {
                padding: 20px 26px 20px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            }

            .overlay-title {
                font-size: 1.2em;
                font-weight: 700;
                margin: 0;
                color: var(--color-text-primary);
            }

            .overlay-content {
                padding: 5px 26px;
                color: var(--color-text-secondary);
                line-height: 1.6;
            }

            .overlay-content hr {
                border: none;
                height: 1px;
                background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                margin: 16px 0;
            }

            .overlay-actions {
                background-color: var(--color-background);
                padding: 16px 32px 32px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .overlay-actions-short {
                background-color: var(--color-background);
                padding: 9px 32px 9px 32px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .overlay-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
                min-width: 80px;
            }

            .overlay-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .overlay-btn:active {
                transform: translateY(0);
            }

            .overlay-btn.primary {
                background-color: var(--color-primary);
                color: var(--color-text-fixed-primary-light);
            }

            .overlay-btn.danger {
                background: linear-gradient(45deg, #ff6b6b, #ee5a52);
                color: white;
            }

            .overlay-btn.secondary {
                background: #f7fafc;
                color: #4a5568;
                border: 1px solid #e2e8f0;
            }

            /* Loading overlay */
            .loading-overlay {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 40px;
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Input Field Styles */
            .input-group {
                margin-bottom: 16px;
            }

            .input-group:last-child {
                margin-bottom: 0;
            }

            .input-label {
                display: block;
                margin-bottom: 6px;
                font-weight: 600;
                color: var(--color-text-secondary);;
                font-size: 14px;
            }

            .input-container {
                position: relative;
                display: flex;
                align-items: center;
            }

            .overlay-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.2s ease;
                background:rgba(255, 255, 255, 0);
                color:var(--color-text-primary);
            }

            .overlay-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .overlay-input.error {
                border-color: #e53e3e;
            }

            .overlay-input.error:focus {
                border-color: #e53e3e;
                box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
            }

            /* Password toggle button */
            .password-toggle {
                position: absolute;
                right: 12px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
                color: #4a5568;
            }

            .password-toggle:hover {
                background-color: #f7fafc;
            }

            .password-toggle svg {
                width: 20px;
                height: 20px;
            }

            /* Input error message */
            .input-error {
                color: #e53e3e;
                font-size: 12px;
                margin-top: 4px;
                display: block;
            }

            /* Checkbox and Radio styles */
            .checkbox-container, .radio-container {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 8px;
            }

            .overlay-checkbox, .overlay-radio {
                width: 16px;
                height: 16px;
                accent-color: #667eea;
            }

            /* Select dropdown styles */
            .overlay-select {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.2s ease;
                background: white;
                color: #2d3748;
            }

            .overlay-select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            /* Textarea styles */
            .overlay-textarea {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.2s ease;
                background: white;
                color: #2d3748;
                resize: vertical;
                min-height: 80px;
                font-family: inherit;
            }

            .overlay-textarea:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            /* Image overlay styles */
            .image-overlay {
                padding: 0;
                background: transparent;
                box-shadow: none;
                border: none;
                max-width: 95vw;
                max-height: 95vh;
                display: flex;
                flex-direction: column;
            }

            .image-overlay-header {
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                padding: 12px 20px;
                border-radius: 16px 16px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
            }

            .image-overlay-title {
                position: absolute;
                top: 8px;
                left: 8px;
                font-size: 1.1em;
                font-weight: 500;
                padding: 2px 6px;
                border-radius: 13px;
                color: white;
                text-shadow: 0px 0px 7px #000000;
            }

            .image-overlay-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: hsla(0, 0.00%, 0.00%, 0.7);
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background-color 0.2s ease;
                color: white;
            }

            .image-overlay-close:hover {
                background: rgba(0, 0, 0, 0.53);
            }

            .image-overlay-content {
                background: var(--color-background);
                backdrop-filter: blur(10px);
                border-radius: 0 0 16px 16px;
                padding: 0;
                display: flex;
                flex-direction: column;
                position: relative;
                min-height: 300px;
            }

            .image-overlay-image-container {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 300px;
                padding: 0px;
            }

            .image-overlay-image {
                max-width: 100%;
                max-height: 70vh;
                object-fit: contain;
                border-radius: 8px;
                transition: transform 0.3s ease;
            }

            .image-overlay-image.zoomed {
                transform: scale(1.5);
                cursor: zoom-out;
            }

            .image-overlay-image:not(.zoomed) {
            }

            .image-overlay-info {
                position: absolute;
                bottom: 8px;
                left: 8px;
                padding: 0px 0px;
                color: rgb(253 253 253 / 90%);
                font-size: 14px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                text-shadow: 0px 0px 9px #000000;
            }

            .image-overlay-controls {
                position: absolute;
                bottom: 8px;
                right: 8px;
                display: flex;
                gap: 8px;
            }

            .image-overlay-control-btn {
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(10px);
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                color: white;
            }

            .image-overlay-control-btn:hover {
                background: rgba(0, 0, 0, 0.9);
                transform: scale(1.1);
            }

            .image-overlay-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 300px;
                color: rgba(255, 255, 255, 0.7);
            }
        `;
    }

    async askConfirmation(options = {}) {
        const config = {
            title: { text: "Confirm Action", color: "#2d3748" },
            content: "Are you sure you want to proceed?",
            actions: [
                { name: "Confirm", color: "#667eea", return: true, type: "primary" },
                { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
            ],
            size: { width: "400px", height: "auto" },
            dismissible: true,
            ...options
        };

        return new Promise((resolve) => {
            const id = this.show({
                type: 'confirmation',
                ...config,
                onAction: (result) => {
                    this.hide(id);
                    resolve(result);
                }
            });
        });
    }

    async askInput(options = {}) {
        const config = {
            title: { text: "Input Required", color: "#2d3748" },
            content: "Please enter the required information:",
            placeholder: "Enter value...",
            validation: null,
            handler: null,
            actions: [
                { name: "Submit", color: "#667eea", return: true, type: "primary" },
                { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
            ],
            size: { width: "400px", height: "auto" },
            ...options
        };

        return new Promise((resolve) => {
            const id = this.show({
                type: 'input',
                ...config,
                onAction: async (result, value) => {
                    if (result) {
                        if (!value || value.toString().trim() === '') {
                            this.notificationManager.error('Input cannot be empty');
                            return;
                        } else if (config.validation) {
                            const isValid = await config.validation(value);
                            if (!isValid) {
                                resolve(false);
                                this.hide(id);
                                return;
                            } else {
                                resolve(config.handler ? await config.handler(value) : true);
                                this.hide(id);
                                return;
                            }

                        } else {
                            resolve(config.handler ? await config.handler(value) : true);
                            this.hide(id);
                            return;
                        }
                    } else {
                        resolve(false);
                        this.hide(id);
                        return;
                    }   
                }
            });
        });
    }

    async askMultipleInputs(options = {}) {
        const config = {
            title: { text: "Input Required", color: "#2d3748" },
            content: "Please fill in the required information:",
            inputs: [
                {
                    name: 'input1',
                    label: 'Input 1',
                    type: 'text',
                    placeholder: 'Enter value...',
                    required: false,
                    validation: null
                }
            ],
            actions: [
                { name: "Submit", color: "#667eea", return: true, type: "primary" },
                { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
            ],
            size: { width: "450px", height: "auto" },
            ...options
        };

        return new Promise((resolve) => {
            const id = this.show({
                type: 'multi-input',
                ...config,
                onAction: async (result, values) => {
                    if (result) {
                        var isValuesEmpty = false;
                        for (const key in values) {
                            if (!values[key] || values[key].toString().trim() === '') {
                                isValuesEmpty = true;
                                break;
                            }
                        }
                        if (values && isValuesEmpty === false) {
                        // Validate all inputs
                            const errors = this.validateInputs(config.inputs, values);
                            if (errors.length > 0) {
                                this.notificationManager.error('Please fix the errors before submitting');
                                resolve(false);
                                this.hide(id);                            
                                return;
                            } else {
                                if (config.validation) {
                                    const isValid = await config.validation(values);
                                    if (isValid) {
                                        resolve(config.handler ? await config.handler(values) : resolve(true));
                                        this.hide(id);
                                        return;
                                    } else {
                                        return;
                                    }
                                } else {
                                    resolve(config.handler ? await config.handler(values) : resolve(true));
                                    this.hide(id);
                                    return;
                                }
                            }
                        } else {
                            this.notificationManager.error('Input cannot be empty');
                            return;
                        }
                    } else {
                        resolve(false);
                        this.hide(id);
                        return;
                    }
                }
            });
        });
    }

    validateInputs(inputConfigs, values) {
        const errors = [];
        
        inputConfigs.forEach(inputConfig => {
            const value = values[inputConfig.name];
            
            // Check required fields
            if (inputConfig.required && (!value || value.toString().trim() === '')) {
                errors.push({
                    name: inputConfig.name,
                    message: `${inputConfig.label} is required`
                });
                return;
            }
            
            // Run custom validation
            if (value && inputConfig.validation && !inputConfig.validation(value)) {
                errors.push({
                    name: inputConfig.name,
                    message: inputConfig.validationMessage || `Invalid ${inputConfig.label}`
                });
            }
        });
        
        return errors;
    }

    displayInputErrors(overlayId, errors) {
        const overlay = this.overlays.get(overlayId);
        if (!overlay) return;

        // Clear previous errors
        overlay.element.querySelectorAll('.input-error').forEach(el => el.remove());
        overlay.element.querySelectorAll('.overlay-input, .overlay-select, .overlay-textarea').forEach(el => {
            el.classList.remove('error');
        });

        // Display new errors
        errors.forEach(error => {
            const inputElement = overlay.element.querySelector(`[data-input-name="${error.name}"]`);
            if (inputElement) {
                inputElement.classList.add('error');
                
                const errorElement = document.createElement('span');
                errorElement.className = 'input-error';
                errorElement.textContent = error.message;
                
                inputElement.closest('.input-group').appendChild(errorElement);
            }
        });
    }

    showLoading(options = {}) {
        const config = {
            title: { text: "Loading...", color: "#2d3748" },
            content: "Please wait while we process your request.",
            size: { width: "300px", height: "auto" },
            dismissible: false,
            ...options
        };

        return this.show({
            type: 'loading',
            ...config
        });
    }

    show(options = {}) {
        const id = this.generateId();
        const config = {
            type: 'default',
            title: { text: "Overlay", color: "#2d3748" },
            content: "",
            actions: [],
            size: { width: "400px", height: "auto" },
            dismissible: true,
            zIndex: 9999,
            animation: true,
            ...options
        };

        const overlay = this.createOverlay(id, config);
        this.overlaySystemContainer.appendChild(overlay);

        // Store overlay reference
        this.overlays.set(id, { element: overlay, config });

        // Add event listeners
        this.addEventListeners(id, overlay, config);

        // Trigger animation
        if (config.animation) {
            requestAnimationFrame(() => {
                overlay.classList.add('show');
            });
        } else {
            overlay.classList.add('show');
        }

        return id;
    }

    createOverlay(id, config) {
        const backdrop = document.createElement('div');
        backdrop.className = 'overlay-backdrop';
        backdrop.style.zIndex = config.zIndex;
        backdrop.setAttribute('data-overlay-id', id);

        const container = document.createElement('div');
        container.className = 'overlay-container';
        
        if (config.size.width) container.style.width = config.size.width;
        if (config.size.height && config.size.height !== 'auto') {
            container.style.height = config.size.height;
        }

        // Create content based on type
        switch (config.type) {
            case 'loading':
                container.innerHTML = this.createLoadingContent(config);
                break;
            case 'input':
                container.innerHTML = this.createInputContent(config);
                break;
            case 'multi-input':
                container.innerHTML = this.createMultiInputContent(config);
                break;
            default:
                container.innerHTML = this.createDefaultContent(config);
        }

        backdrop.appendChild(container);
        return backdrop;
    }

    createDefaultContent(config) {
        const hasActions = config.actions && config.actions.length > 0;
        
        return `
            <div class="overlay-header">
                <h2 class="overlay-title" style="color: ${config.title.color}">${config.title.text}</h2>
            </div>
            <div class="overlay-content">${config.content}</div>
            ${hasActions ? `
                <div class="overlay-actions">
                    ${config.actions.map((action, index) => `
                        <button class="overlay-btn ${action.type || 'secondary'}" 
                                data-action-index="${index}"
                                style="${action.color ? `background-color: ${action.color}; color: white;` : ''}">
                            ${action.name}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    createInputContent(config) {
        return `
            <div class="overlay-header">
                <h2 class="overlay-title" style="color: ${config.title.color}">${config.title.text}</h2>
            </div>
            <div class="overlay-content">
                ${config.content}
                <div class="input-group">
                    <input type="text" class="overlay-input" placeholder="${config.placeholder || ''}" autofocus>
                </div>
            </div>
            <div class="overlay-actions">
                ${config.actions.map((action, index) => `
                    <button class="overlay-btn ${action.type || 'secondary'}" 
                            data-action-index="${index}">
                        ${action.name}
                    </button>
                `).join('')}
            </div>
        `;
    }

    createMultiInputContent(config) {
        const inputsHtml = config.inputs.map(input => this.createInputField(input)).join('');
        
        return `
            <div class="overlay-header">
                <h2 class="overlay-title" style="color: ${config.title.color}">${config.title.text}</h2>
            </div>
            <div class="overlay-content">
                ${config.content}
                <div class="inputs-container">
                    ${inputsHtml}
                </div>
            </div>
            <div class="overlay-actions">
                ${config.actions.map((action, index) => `
                    <button class="overlay-btn ${action.type || 'secondary'}" 
                            data-action-index="${index}">
                        ${action.name}
                    </button>
                `).join('')}
            </div>
        `;
    }

    createInputField(input) {
        const {
            name,
            label,
            type = 'text',
            placeholder = '',
            required = false,
            options = [],
            rows = 3,
            value = ''
        } = input;

        const labelHtml = label ? `<label class="input-label" for="${name}">${label}${required ? ' *' : ''}</label>` : '';

        switch (type) {
            case 'password':
                return `
                    <div class="input-group">
                        ${labelHtml}
                        <div class="input-container">
                            <input 
                                type="password" 
                                id="${name}"
                                name="${name}"
                                data-input-name="${name}"
                                class="overlay-input" 
                                placeholder="${placeholder}"
                                value="${value}"
                                ${required ? 'required' : ''}
                            >
                            <button type="button" class="password-toggle" data-toggle-password="${name}">
                                <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                <svg class="eye-off-icon" style="display: none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            
            case 'email':
            case 'number':
            case 'tel':
            case 'url':
            case 'text':
                return `
                    <div class="input-group">
                        ${labelHtml}
                        <input 
                            type="${type}" 
                            id="${name}"
                            name="${name}"
                            data-input-name="${name}"
                            class="overlay-input" 
                            placeholder="${placeholder}"
                            value="${value}"
                            ${required ? 'required' : ''}
                        >
                    </div>
                `;
            
            case 'textarea':
                return `
                    <div class="input-group">
                        ${labelHtml}
                        <textarea 
                            id="${name}"
                            name="${name}"
                            data-input-name="${name}"
                            class="overlay-textarea" 
                            placeholder="${placeholder}"
                            rows="${rows}"
                            ${required ? 'required' : ''}
                        >${value}</textarea>
                    </div>
                `;
            
            case 'select':
                const optionsHtml = options.map(option => {
                    if (typeof option === 'string') {
                        return `<option value="${option}">${option}</option>`;
                    } else {
                        return `<option value="${option.value}" ${option.selected ? 'selected' : ''}>${option.label}</option>`;
                    }
                }).join('');
                
                return `
                    <div class="input-group">
                        ${labelHtml}
                        <select 
                            id="${name}"
                            name="${name}"
                            data-input-name="${name}"
                            class="overlay-select"
                            ${required ? 'required' : ''}
                        >
                            <option value="">Choose...</option>
                            ${optionsHtml}
                        </select>
                    </div>
                `;
            
            case 'checkbox':
                return `
                    <div class="input-group">
                        <div class="checkbox-container">
                            <input 
                                type="checkbox" 
                                id="${name}"
                                name="${name}"
                                data-input-name="${name}"
                                class="overlay-checkbox"
                                value="true"
                                ${value ? 'checked' : ''}
                            >
                            <label for="${name}">${label}</label>
                        </div>
                    </div>
                `;
            
            case 'radio':
                const radioOptionsHtml = options.map((option, index) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    const radioId = `${name}_${index}`;
                    
                    return `
                        <div class="radio-container">
                            <input 
                                type="radio" 
                                id="${radioId}"
                                name="${name}"
                                data-input-name="${name}"
                                class="overlay-radio"
                                value="${optionValue}"
                                ${value === optionValue ? 'checked' : ''}
                            >
                            <label for="${radioId}">${optionLabel}</label>
                        </div>
                    `;
                }).join('');
                
                return `
                    <div class="input-group">
                        ${labelHtml}
                        ${radioOptionsHtml}
                    </div>
                `;
            
            default:
                return `
                    <div class="input-group">
                        ${labelHtml}
                        <input 
                            type="text" 
                            id="${name}"
                            name="${name}"
                            data-input-name="${name}"
                            class="overlay-input" 
                            placeholder="${placeholder}"
                            value="${value}"
                            ${required ? 'required' : ''}
                        >
                    </div>
                `;
        }
    }

    createLoadingContent(config) {
        return `
            <div class="loading-overlay">
                <div class="spinner"></div>
                <h3 style="color: ${config.title.color}">${config.title.text}</h3>
                <p style="color: #4a5568; margin-top: 10px;">${config.content}</p>
            </div>
        `;
    }

    addEventListeners(id, overlay, config) {
        const listeners = [];

        // Backdrop click handler
        if (config.dismissible) {
            const backdropHandler = (e) => {
                if (e.target === overlay) {
                    this.hide(id);
                    if (config.onDismiss) config.onDismiss();
                }
            };
            overlay.addEventListener('click', backdropHandler);
            listeners.push({ element: overlay, event: 'click', handler: backdropHandler });
        }

        // Password toggle handlers
        const passwordToggles = overlay.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            const toggleHandler = (e) => {
                e.preventDefault();
                const inputName = toggle.dataset.togglePassword;
                const input = overlay.querySelector(`input[name="${inputName}"]`);
                const eyeIcon = toggle.querySelector('.eye-icon');
                const eyeOffIcon = toggle.querySelector('.eye-off-icon');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    eyeIcon.style.display = 'none';
                    eyeOffIcon.style.display = 'block';
                } else {
                    input.type = 'password';
                    eyeIcon.style.display = 'block';
                    eyeOffIcon.style.display = 'none';
                }
            };
            toggle.addEventListener('click', toggleHandler);
            listeners.push({ element: toggle, event: 'click', handler: toggleHandler });
        });

        // Keyboard handlers
        const keyHandler = (e) => {
            if (e.key === 'Escape' && config.dismissible) {
                this.hide(id);
                if (config.onDismiss) config.onDismiss();
            }
            if (e.key === 'Enter' && config.actions) {
                const primaryAction = config.actions.find(a => a.return === true) || config.actions[0];
                if (primaryAction && config.onAction) {
                    if (config.type === 'multi-input') {
                        const values = this.getInputValues(overlay);
                        config.onAction(primaryAction.return, values);
                    } else {
                        const input = overlay.querySelector('.overlay-input');
                        const value = input ? input.value : null;
                        config.onAction(primaryAction.return, value);
                    }
                }
            }
        };
        document.addEventListener('keydown', keyHandler);
        listeners.push({ element: document, event: 'keydown', handler: keyHandler });

        // Action button handlers
        const actionButtons = overlay.querySelectorAll('[data-action-index]');
        actionButtons.forEach(button => {
            const actionHandler = (e) => {
                const index = parseInt(button.dataset.actionIndex);
                const action = config.actions[index];
                if (config.onAction) {
                    if (config.type === 'multi-input') {
                        const values = this.getInputValues(overlay);
                        config.onAction(action.return, values);
                    } else {
                        const input = overlay.querySelector('.overlay-input');
                        const value = input ? input.value : null;
                        config.onAction(action.return, value);
                    }
                }
            };
            button.addEventListener('click', actionHandler);
            listeners.push({ element: button, event: 'click', handler: actionHandler });
        });

        this.eventListeners.set(id, listeners);
    }

    getInputValues(overlay) {
        const values = {};
        const inputs = overlay.querySelectorAll('[data-input-name]');
        
        inputs.forEach(input => {
            const name = input.dataset.inputName;
            
            if (input.type === 'checkbox') {
                values[name] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    values[name] = input.value;
                }
            } else {
                values[name] = input.value;
            }
        });
        
        return values;
    }

    hide(id) {
        const overlayData = this.overlays.get(id);
        if (!overlayData) return false;

        const { element, config } = overlayData;

        // Remove event listeners
        this.removeEventListeners(id);

        // Animate out
        element.classList.remove('show');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.overlays.delete(id);
        }, config.animation ? 300 : 0);

        return true;
    }

    hideAll() {
        const ids = Array.from(this.overlays.keys());
        ids.forEach(id => this.hide(id));
    }

    removeEventListeners(id) {
        const listeners = this.eventListeners.get(id);
        if (listeners) {
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners.delete(id);
        }
    }

    showToast(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        this.toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    isActive(id) {
        return this.overlays.has(id);
    }

    getActiveOverlays() {
        return Array.from(this.overlays.keys());
    }

    async askImage(options = {}) {
        const config = {
            title: { text: "Image Viewer", color: "white" },
            src: "",
            alt: "Image",
            info: null,
            allowZoom: true,
            allowDownload: true,
            size: { width: "auto", height: "auto" },
            dismissible: true,
            zIndex: 9999,
            ...options
        };

        return new Promise((resolve) => {
            const id = this.showImageOverlay({
                ...config,
                onAction: (result) => {
                    this.hide(id);
                    resolve(result);
                }
            });
        });
    }

    showImageOverlay(options = {}) {
        const id = this.generateId();
        const config = {
            title: { text: "Image Viewer", color: "white" },
            src: "",
            alt: "Image",
            info: null,
            allowZoom: true,
            allowDownload: true,
            size: { width: "auto", height: "auto" },
            dismissible: true,
            zIndex: 9999,
            ...options
        };

        const overlay = this.createImageOverlay(id, config);
        this.overlaySystemContainer.appendChild(overlay);

        // Store overlay reference
        this.overlays.set(id, { element: overlay, config });

        // Add event listeners
        this.addImageEventListeners(id, overlay, config);

        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        return id;
    }

    // 3. ADD this new method to create image overlay:

    createImageOverlay(id, config) {
        const backdrop = document.createElement('div');
        backdrop.className = 'overlay-backdrop';
        backdrop.style.zIndex = config.zIndex;
        backdrop.setAttribute('data-overlay-id', id);

        const container = document.createElement('div');
        container.className = 'overlay-container image-overlay';

        const hasActions = config.actions && config.actions.length > 0;

        container.innerHTML = `
            <div class="image-overlay-content">
                <div class="image-overlay-image-container">
                    ${config.src ? `
                        <img class="image-overlay-image" 
                             src="${config.src}" 
                             alt="${config.alt}"
                             ${config.allowZoom ? 'data-zoomable="true"' : ''}>
                    ` : `
                        <div class="image-overlay-loading">
                            <div class="spinner"></div>
                        </div>
                    `}
                </div>
                ${config.info ? `
                    <div class="image-overlay-info">
                        ${config.info}
                    </div>
                ` : ''}
                <div class="image-overlay-controls">
                    ${config.allowZoom ? `
                        <button class="image-overlay-control-btn" data-zoom="true" title="Toggle Zoom">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="M21 21l-4.35-4.35"></path>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                            </svg>
                        </button>
                    ` : ''}
                    ${config.allowDownload ? `
                        <button class="image-overlay-control-btn" data-download="true" title="Download Image">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7,10 12,15 17,10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                <h3 class="image-overlay-title">${config.title.text}</h3>
                <button class="image-overlay-close" data-close="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                ${hasActions ? `
                    <div class="overlay-actions-short">
                        ${config.actions.map((action, index) => `
                            <button class="overlay-btn ${action.type || 'secondary'}" 
                                    data-action-index="${index}"
                                    style="${action.color ? `background-color: ${action.color}; color: white;` : ''}">
                                ${action.name}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        backdrop.appendChild(container);
        return backdrop;
    }

    // 4. ADD this new method for image-specific event listeners:

    addImageEventListeners(id, overlay, config) {
        const listeners = [];

        // Backdrop click handler
        if (config.dismissible) {
            const backdropHandler = (e) => {
                if (e.target === overlay) {
                    this.hide(id);
                }
            };
            overlay.addEventListener('click', backdropHandler);
            listeners.push({ element: overlay, event: 'click', handler: backdropHandler });
        }

        // Close button handler
        const closeBtn = overlay.querySelector('[data-close="true"]');
        if (closeBtn) {
            const closeHandler = () => this.hide(id);
            closeBtn.addEventListener('click', closeHandler);
            listeners.push({ element: closeBtn, event: 'click', handler: closeHandler });
        }

        // Zoom functionality
        const image = overlay.querySelector('.image-overlay-image');
        const zoomBtn = overlay.querySelector('[data-zoom="true"]');
        
        if (image && config.allowZoom) {
            const imageClickHandler = () => {
                image.classList.toggle('zoomed');
            };
            image.addEventListener('click', imageClickHandler);
            listeners.push({ element: image, event: 'click', handler: imageClickHandler });

            if (zoomBtn) {
                zoomBtn.addEventListener('click', imageClickHandler);
                listeners.push({ element: zoomBtn, event: 'click', handler: imageClickHandler });
            }
        }

        // Download functionality
        const downloadBtn = overlay.querySelector('[data-download="true"]');
        if (downloadBtn && config.allowDownload) {
            const downloadHandler = () => {
                const link = document.createElement('a');
                link.href = config.src;
                link.download = config.alt || 'image';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this.notificationManager.success('Image download started!');
            };
            downloadBtn.addEventListener('click', downloadHandler);
            listeners.push({ element: downloadBtn, event: 'click', handler: downloadHandler });
        }

        // Keyboard handlers
        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide(id);
            } else if (e.key === 'z' || e.key === 'Z') {
                if (image && config.allowZoom) {
                    image.classList.toggle('zoomed');
                }
            } else if (e.key === 'Enter' && config.actions) {
                const primaryAction = config.actions.find(a => a.return === true) || config.actions[0];
                if (primaryAction && config.onAction) {
                    if (config.type === 'multi-input') {
                        const values = this.getInputValues(overlay);
                        config.onAction(primaryAction.return, values);
                    } else {
                        const input = overlay.querySelector('.overlay-input');
                        const value = input ? input.value : null;
                        config.onAction(primaryAction.return, value);
                    }
                }
            }
        };
        document.addEventListener('keydown', keyHandler);
        listeners.push({ element: document, event: 'keydown', handler: keyHandler });

        // Action button handlers
        const actionButtons = overlay.querySelectorAll('[data-action-index]');
        actionButtons.forEach(button => {
            const actionHandler = (e) => {
                const index = parseInt(button.dataset.actionIndex);
                const action = config.actions[index];
                if (config.onAction) {
                    if (config.type === 'multi-input') {
                        const values = this.getInputValues(overlay);
                        config.onAction(action.return, values);
                    } else {
                        const input = overlay.querySelector('.overlay-input');
                        const value = input ? input.value : null;
                        config.onAction(action.return, value);
                    }
                }
            };
            button.addEventListener('click', actionHandler);
            listeners.push({ element: button, event: 'click', handler: actionHandler });
        });

        this.eventListeners.set(id, listeners);
    }
}

// Demo functions for the new multi-input feature
async function showLoginForm() {
    const result = await overlayManager.askMultipleInputs({
        title: { text: "Login", color: "#2d3748" },
        content: "Please enter your credentials:",
        inputs: [
            {
                name: 'username',
                label: 'Username',
                type: 'text',
                placeholder: 'Enter your username',   
                required: true,
                validation: (value) => value.length >= 3,
                validationMessage: 'Username must be at least 3 characters'
            },
            {
                name: 'password',
                label: 'Password',
                type: 'password',
                placeholder: 'Enter your password',
                required: true,
                validation: (value) => value.length >= 6,
                validationMessage: 'Password must be at least 6 characters'
            }
        ],
        actions: [
            { name: "Login", color: "#667eea", return: true, type: "primary" },
            { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
        ],
        size: { width: "400px" }
    });

    if (result) {
        overlayManager.showToast(`Welcome, ${result.username}!`, "success");
        console.log("Login data:", result);
    }
}

async function showUserRegistration() {
    const result = await overlayManager.askMultipleInputs({
        title: { text: "Create Account", color: "#2d3748" },
        content: "Fill in your information to create a new account:",
        inputs: [
            {
                name: 'firstName',
                label: 'First Name',
                type: 'text',
                placeholder: 'Enter your first name',
                required: true
            },
            {
                name: 'lastName',
                label: 'Last Name',
                type: 'text',
                placeholder: 'Enter your last name',
                required: true
            },
            {
                name: 'email',
                label: 'Email Address',
                type: 'email',
                placeholder: 'Enter your email',
                required: true,
                validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                validationMessage: 'Please enter a valid email address'
            },
            {
                name: 'password',
                label: 'Password',
                type: 'password',
                placeholder: 'Create a password',
                required: true,
                validation: (value) => value.length >= 8,
                validationMessage: 'Password must be at least 8 characters'
            },
            {
                name: 'confirmPassword',
                label: 'Confirm Password',
                type: 'password',
                placeholder: 'Confirm your password',
                required: true
            },
            {
                name: 'phone',
                label: 'Phone Number',
                type: 'tel',
                placeholder: 'Enter your phone number',
                required: false
            },
            {
                name: 'country',
                label: 'Country',
                type: 'select',
                required: true,
                options: [
                    { value: 'us', label: 'United States' },
                    { value: 'ca', label: 'Canada' },
                    { value: 'uk', label: 'United Kingdom' },
                    { value: 'de', label: 'Germany' },
                    { value: 'fr', label: 'France' }
                ]
            },
            {
                name: 'bio',
                label: 'Bio',
                type: 'textarea',
                placeholder: 'Tell us about yourself...',
                rows: 4,
                required: false
            },
            {
                name: 'newsletter',
                label: 'Subscribe to newsletter',
                type: 'checkbox',
                value: true
            },
            {
                name: 'accountType',
                label: 'Account Type',
                type: 'radio',
                required: true,
                options: [
                    { value: 'personal', label: 'Personal' },
                    { value: 'business', label: 'Business' },
                    { value: 'organization', label: 'Organization' }
                ]
            }
        ],
        actions: [
            { name: "Create Account", color: "#10b981", return: true, type: "primary" },
            { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
        ],
        size: { width: "500px" }
    });

    if (result) {
        // Custom validation for password confirmation
        if (result.password !== result.confirmPassword) {
            overlayManager.showToast("Passwords don't match!", "error");
            return;
        }

        overlayManager.showToast("Account created successfully!", "success");
        console.log("Registration data:", result);
    }
}

async function showContactForm() {
    const result = await overlayManager.askMultipleInputs({
        title: { text: "Contact Us", color: "#2d3748" },
        content: "We'd love to hear from you! Send us a message:",
        inputs: [
            {
                name: 'name',
                label: 'Your Name',
                type: 'text',
                placeholder: 'Enter your full name',
                required: true
            },
            {
                name: 'email',
                label: 'Email Address',
                type: 'email',
                placeholder: 'your.email@example.com',
                required: true,
                validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                validationMessage: 'Please enter a valid email address'
            },
            {
                name: 'subject',
                label: 'Subject',
                type: 'select',
                required: true,
                options: [
                    'General Inquiry',
                    'Technical Support',
                    'Bug Report',
                    'Feature Request',
                    'Partnership',
                    'Other'
                ]
            },
            {
                name: 'message',
                label: 'Message',
                type: 'textarea',
                placeholder: 'Tell us how we can help you...',
                rows: 6,
                required: true,
                validation: (value) => value.trim().length >= 10,
                validationMessage: 'Message must be at least 10 characters long'
            },
            {
                name: 'priority',
                label: 'Priority Level',
                type: 'radio',
                required: true,
                options: [
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' }
                ]
            }
        ],
        actions: [
            { name: "Send Message", color: "#667eea", return: true, type: "primary" },
            { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
        ],
        size: { width: "550px" }
    });

    if (result) {
        overlayManager.showToast("Message sent successfully!", "success");
        console.log("Contact form data:", result);
    }
}

async function showSettingsForm() {
    const result = await overlayManager.askMultipleInputs({
        title: { text: "User Settings", color: "#2d3748" },
        content: "Update your preferences:",
        inputs: [
            {
                name: 'displayName',
                label: 'Display Name',
                type: 'text',
                placeholder: 'How should we display your name?',
                value: 'John Doe',
                required: true
            },
            {
                name: 'currentPassword',
                label: 'Current Password',
                type: 'password',
                placeholder: 'Enter current password to make changes',
                required: true
            },
            {
                name: 'newPassword',
                label: 'New Password (optional)',
                type: 'password',
                placeholder: 'Leave blank to keep current password',
                required: false
            },
            {
                name: 'theme',
                label: 'Theme Preference',
                type: 'radio',
                options: [
                    { value: 'light', label: 'Light Theme' },
                    { value: 'dark', label: 'Dark Theme' },
                    { value: 'auto', label: 'Auto (System)' }
                ],
                value: 'auto'
            },
            {
                name: 'notifications',
                label: 'Enable email notifications',
                type: 'checkbox',
                value: true
            },
            {
                name: 'language',
                label: 'Preferred Language',
                type: 'select',
                options: [
                    { value: 'en', label: 'English', selected: true },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' },
                    { value: 'zh', label: 'Chinese' }
                ]
            }
        ],
        actions: [
            { name: "Save Changes", color: "#10b981", return: true, type: "primary" },
            { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
        ],
        size: { width: "450px" }
    });

    if (result) {
        overlayManager.showToast("Settings updated successfully!", "success");
        console.log("Settings data:", result);
    }
}

// Original demo functions
async function showDeleteConfirmation() {
    const result = await overlayManager.askConfirmation({
        title: { text: "Delete Chat?", color: "#e53e3e" },
        content: `<hr/><p>This will delete <b>Min window width HTML</b>.<br/>
                    Visit <u>settings</u> to delete any memories saved during this chat.</p>`,
        actions: [
            { name: "Delete", color: "#e53e3e", return: true, type: "danger" },
            { name: "Cancel", color: "#4a5568", return: false, type: "secondary" }
        ],
        size: { width: "400px", height: "auto" }
    });

    if (result) {
        overlayManager.showToast("Chat deleted successfully!", "success");
        console.log("Delete confirmed - would call api.delete()");
    } else {
        overlayManager.showToast("Delete cancelled", "info");
    }
}

async function showInputDialog() {
    const result = await overlayManager.askInput({
        title: { text: "Enter Name", color: "#2d3748" },
        content: "Please enter your name:",
        placeholder: "Your name...",
        validation: (value) => value && value.trim().length > 0
    });

    if (result) {
        overlayManager.showToast(`Hello, ${result}!`, "success");
    }
}

function showLoadingOverlay() {
    const loadingId = overlayManager.showLoading({
        title: { text: "Processing...", color: "#667eea" },
        content: "Please wait while we process your request."
    });

    // Simulate async operation
    setTimeout(() => {
        overlayManager.hide(loadingId);
        overlayManager.showToast("Operation completed!", "success");
    }, 3000);
}

function showCustomOverlay() {
    overlayManager.show({
        title: { text: "Custom Overlay", color: "#9f7aea" },
        content: `
            <p>This is a custom overlay with rich content!</p>
            <hr/>
            <p>You can include any HTML content here.</p>
            <ul style="margin-top: 10px; padding-left: 20px;">
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
            </ul>
        `,
        actions: [
            { name: "Got it!", color: "#9f7aea", return: true, type: "primary" }
        ],
        size: { width: "500px" },
        onAction: () => {
            overlayManager.showToast("Custom overlay closed!", "info");
        }
    });
}

function showToast() {
    const types = ['success', 'error', 'warning', 'info'];
    const messages = [
        'Operation successful!',
        'Something went wrong!',
        'Please be careful!',
        'Here\'s some information.'
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    overlayManager.showToast(randomMessage, randomType);
}