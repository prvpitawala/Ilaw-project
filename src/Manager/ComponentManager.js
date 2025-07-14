/**
 * ComponentManager - Renders components in appropriate sections and manages CSS
 */
export class ComponentManager {
    constructor() {
      this.componentCache = new Map();
      this.templateCache = new Map();
      this.styleCache = new Map();
      this.styleCounter = 0;
    }
  
    /**
     * Render component in specified container
     * @param {string} containerId - ID of container element
     * @param {object|string} componentData - Data or HTML to render
     * @param {object|string} [componentStyle] - CSS styles to apply
     * @returns {HTMLElement|null} - The rendered container element or null if not found
     */
    renderComponent(containerId, componentData, componentStyle = null) {
      const container = document.getElementById(containerId);
      
      if (!container) {
        console.error(`Container with ID ${containerId} not found`);
        return null;
      }
      
      if (!componentData) return null;
      
      // Clear container and append new content
      container.innerHTML = '';
      container.innerHTML = componentData;
      
      // Apply styles if provided
      if (componentStyle) {
        if (typeof componentStyle === 'string') {
          // If componentStyle is a string, treat it as CSS text and create a scoped style
          const styleId = `style-${containerId}`;
          const cssText = componentStyle;
          
          // Remove any existing style for this component
          const existingStyle = document.getElementById(styleId);
          if (existingStyle) {
            existingStyle.parentNode.removeChild(existingStyle);
          }
          
          // Add the new style
          this.addStyle(cssText, styleId);
          
        } else if (typeof componentStyle === 'object') {
          // If componentStyle is an object, apply inline styles
          Object.keys(componentStyle).forEach(property => {
            container.style[property] = componentStyle[property];
          });
        }
      }
      
      // Cache created component and its style
      this.componentCache.set(containerId, {
        content: componentData,
        style: componentStyle
      });
      
      return container;
    }
  
    /**
     * Render component using a template
     * @param {string} templateId - ID of template
     * @param {object} data - Data to populate template
     */
    renderFromTemplate(templateId, data) {
      // Get or load template
      let template = this.templateCache.get(templateId);
      
      if (!template) {
        const templateElement = document.getElementById(templateId);
        if (!templateElement) {
          console.error(`Template with ID ${templateId} not found`);
          return null;
        }
        template = templateElement.content.cloneNode(true);
        this.templateCache.set(templateId, template);
      }
      
      // Clone template
      const fragment = template.cloneNode(true);
      
      // Apply data to template (simple implementation)
      // In real app, use more sophisticated templating
      const element = document.createElement('div');
      element.appendChild(fragment);
      
      // Replace template placeholders with data
      if (data) {
        Object.keys(data).forEach(key => {
          const placeholder = `{{${key}}}`;
          element.innerHTML = element.innerHTML.replace(
            new RegExp(placeholder, 'g'), 
            data[key]
          );
        });
      }
      
      return element.firstChild;
    }
  
    /**
     * Create a basic component without a template
     * @param {object} data - Component data
     */
    createBasicComponent(data) {
      if (!data || typeof data !== 'object') {
        return null;
      }
      
      const element = document.createElement(data.tag || 'div');
      
      // Apply attributes
      if (data.attributes) {
        Object.keys(data.attributes).forEach(attr => {
          element.setAttribute(attr, data.attributes[attr]);
        });
      }
      
      // Apply content
      if (data.content) {
        if (typeof data.content === 'string') {
          element.textContent = data.content;
        } else if (Array.isArray(data.content)) {
          data.content.forEach(child => {
            const childElement = this.createBasicComponent(child);
            if (childElement) {
              element.appendChild(childElement);
            }
          });
        }
      }
      
      return element;
    }
  
    /**
     * Update an existing component with new data
     * @param {string} componentId - ID of component to update
     * @param {object} newData - New data for component
     */
    updateComponent(componentId, newData) {
      const component = document.getElementById(componentId);
      if (!component) {
        console.error(`Component with ID ${componentId} not found`);
        return;
      }
      
      // Simple implementation - replace content
      if (newData.content) {
        component.textContent = newData.content;
      }
      
      // Update attributes
      if (newData.attributes) {
        Object.keys(newData.attributes).forEach(attr => {
          component.setAttribute(attr, newData.attributes[attr]);
        });
      }
    }

    /**
     * Add a CSS style to the document
     * @param {string} css - CSS rules to add
     * @param {string} [id] - Optional ID for the style element
     * @returns {string} ID of the created style element
     */
    addStyle(css, id = null) {
      // Generate ID if not provided
      const styleId = id || `component-style-${this.styleCounter++}`;
      
      // Check if style with this ID already exists
      if (this.styleCache.has(styleId)) {
        return styleId;
      }
      
      // Create style element
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = css;
      
      // Add to document head
      document.head.appendChild(styleElement);
      
      // Cache the style
      this.styleCache.set(styleId, css);
      
      return styleId;
    }
    
    /**
     * Update an existing style element
     * @param {string} styleId - ID of the style element to update
     * @param {string} css - New CSS rules
     * @returns {boolean} Success status
     */
    updateStyle(styleId, css) {
      const styleElement = document.getElementById(styleId);
      if (!styleElement) {
        console.error(`Style with ID ${styleId} not found`);
        return false;
      }
      
      // Update style content
      styleElement.textContent = css;
      
      // Update cache
      this.styleCache.set(styleId, css);
      
      return true;
    }
    
    /**
     * Remove a style element from the document
     * @param {string} styleId - ID of the style element to remove
     * @returns {boolean} Success status
     */
    removeStyle(styleId) {
      const styleElement = document.getElementById(styleId);
      if (!styleElement) {
        console.error(`Style with ID ${styleId} not found`);
        return false;
      }
      
      // Remove from document
      styleElement.parentNode.removeChild(styleElement);
      
      // Remove from cache
      this.styleCache.delete(styleId);
      
      return true;
    }
    
    /**
     * Apply CSS styles to a specific component
     * @param {string} componentId - ID of the component to style
     * @param {object} styles - Object with CSS properties and values
     */
    applyStyles(componentId, styles) {
      const component = document.getElementById(componentId);
      if (!component) {
        console.error(`Component with ID ${componentId} not found`);
        return false;
      }
      
      // Apply styles directly to element
      Object.keys(styles).forEach(property => {
        component.style[property] = styles[property];
      });
      
      return true;
    }
    
    /**
     * Create a CSS class and add it to the document
     * @param {string} className - Name of the CSS class
     * @param {object} styles - Object with CSS properties and values
     * @param {string} [styleId] - Optional ID for the style element
     * @returns {string} Class name that was created
     */
    createCssClass(className, styles, styleId = null) {
      // Convert style object to CSS text
      let cssText = `.${className} {`;
      Object.keys(styles).forEach(property => {
        // Convert camelCase to kebab-case
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssText += `${cssProperty}: ${styles[property]};`;
      });
      cssText += `}`;
      
      // Add the style to document
      this.addStyle(cssText, styleId);
      
      return className;
    }
    
    /**
     * Load external CSS file
     * @param {string} url - URL of the CSS file
     * @param {string} [id] - Optional ID for the link element
     * @returns {Promise} Promise that resolves when CSS is loaded
     */
    loadExternalCss(url, id = null) {
      return new Promise((resolve, reject) => {
        // Generate ID if not provided
        const linkId = id || `external-css-${this.styleCounter++}`;
        
        // Check if already loaded
        if (document.getElementById(linkId)) {
          resolve(linkId);
          return;
        }
        
        // Create link element
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = url;
        
        // Set up load event
        link.onload = () => resolve(linkId);
        link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
        
        // Add to document head
        document.head.appendChild(link);
      });
    }
    
    /**
     * Manage stylesheet links in the document
     * @param {string} action - Action to perform: 'add', 'remove', 'toggle', 'replace'
     * @param {object} options - Options for the action
     * @returns {string|boolean} Result of the operation
     */
    manageStylesheet(action, options) {
      switch(action) {
        case 'add': {
          const { href, id = `stylesheet-${this.styleCounter++}`, media = 'all' } = options;
          
          // Check if already exists with same href
          const existingLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
          const exists = existingLinks.some(link => link.href === href);
          
          if (exists) {
            console.log(`Stylesheet ${href} already loaded`);
            return false;
          }
          
          // Create new link element
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = href;
          link.media = media;
          
          // Add to document head
          document.head.appendChild(link);
          return id;
        }
        
        case 'remove': {
          const { id, href } = options;
          let element = null;
          
          if (id) {
            // Remove by ID
            element = document.getElementById(id);
          } else if (href) {
            // Remove by href
            element = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
              .find(link => link.href.includes(href));
          }
          
          if (element) {
            element.parentNode.removeChild(element);
            return true;
          }
          
          return false;
        }
        
        case 'toggle': {
          const { id, href } = options;
          let element = null;
          
          if (id) {
            element = document.getElementById(id);
          } else if (href) {
            element = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
              .find(link => link.href.includes(href));
          }
          
          if (element) {
            // Toggle disabled state
            element.disabled = !element.disabled;
            return !element.disabled; // Return new state
          }
          
          return false;
        }
        
        case 'replace': {
          const { oldHref, newHref, keepId = true } = options;
          
          // Find existing stylesheet
          const existingLink = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .find(link => link.href.includes(oldHref));
            
          if (!existingLink) {
            return false;
          }
          
          // Create replacement
          const newLink = document.createElement('link');
          if (keepId && existingLink.id) {
            newLink.id = existingLink.id;
          } else {
            newLink.id = `stylesheet-${this.styleCounter++}`;
          }
          
          newLink.rel = 'stylesheet';
          newLink.href = newHref;
          newLink.media = existingLink.media;
          
          // Replace in DOM
          existingLink.parentNode.replaceChild(newLink, existingLink);
          return newLink.id;
        }
        
        default:
          console.error(`Unknown stylesheet action: ${action}`);
          return false;
      }
    }
    
    /**
     * Apply theme by loading theme CSS file
     * @param {string} themeName - Theme name or path to theme CSS
     * @returns {Promise} Promise that resolves when theme is applied
     */
    applyTheme(themeName) {
      // Determine theme path - could be extended with theme directory logic
      const themePath = themeName.endsWith('.css') ? 
        themeName : `./styles/${themeName}.css`;
      
      // Check if a theme is already loaded
      const themeLink = document.getElementById('current-theme');
      
      if (themeLink) {
        // Replace existing theme
        return new Promise((resolve, reject) => {
          const newLink = document.createElement('link');
          newLink.id = 'current-theme';
          newLink.rel = 'stylesheet';
          newLink.href = themePath;
          
          newLink.onload = () => resolve('current-theme');
          newLink.onerror = () => reject(new Error(`Failed to load theme: ${themePath}`));
          
          themeLink.parentNode.replaceChild(newLink, themeLink);
        });
      } else {
        // Load new theme
        return this.loadExternalCss(themePath, 'current-theme');
      }
    }
    
    /**
     * Get all currently loaded stylesheets
     * @returns {Array} Array of stylesheet information objects
     */
    getLoadedStylesheets() {
      const styleSheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return styleSheets.map(link => ({
        id: link.id || null,
        href: link.href,
        media: link.media,
        disabled: link.disabled
      }));
    }
  }