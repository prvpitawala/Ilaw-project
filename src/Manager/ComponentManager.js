/**
 * ComponentManager - Renders components in appropriate sections
 */
export class ComponentManager {
    constructor() {
      this.componentCache = new Map();
      this.templateCache = new Map();
    }
  
    /**
     * Render component in specified container
     * @param {string} containerId - ID of container element
     * @param {object} componentData - Data to render
     * @param {string} templateId - Optional ID of template to use
     */
    renderComponent(containerId, componentData) {
      const container = document.getElementById(containerId);
      
      if (!container) {
        console.error(`Container with ID ${containerId} not found`);
        return null;
      }
      
      if (!componentData) return null;
      
      // Clear container and append new content
      container.innerHTML = '';
      container.innerHTML = componentData;
      
      // Cache created component
      this.componentCache.set(containerId, componentData);
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
  }