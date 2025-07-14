/**
 * EventManager - Manages system and component events
 */
export class EventManager {
    constructor() {
      this.activeEventGroups = new Set(['system']);
      this.eventHandlers = new Map();
      this.temporaryDisabledHandlers = new Map();
    }
  
    /**
     * Register an event handler
     * @param {string} elementId - ID of element to attach event to
     * @param {string} eventType - Type of event (click, change, etc)
     * @param {Function} handler - Event handler function
     * @param {string} group - Event group for selective enabling/disabling
     */
    registerEvent(element, eventType, handler, group = 'default') {
      if (!element) {
        console.error(`Cannot register event: Element is null or undefined`);
        return;
      }
    
      const id = element === document ? 'document' : element === window ? 'window' : element === document.documentElement? 'documentDocumentElement' : element.id || 'anonymous';
    
      const handlerId = `${id}-${eventType}-${group}`;
    
      // Store handler reference
      this.eventHandlers.set(handlerId, {
        element,
        eventType,
        handler,
        group
      });
    
      // Only attach handler if group is active
      if (this.activeEventGroups.has(group)) {
        element.addEventListener(eventType, handler);
      }
    }
    
  
    /**
     * Enable events for a specific group
     * @param {string} group - Group name to enable
     */
    enableEventGroup(group) {
      if (this.activeEventGroups.has(group)) return;
      
      this.activeEventGroups.add(group);
      
      // Attach all handlers for this group
      this.eventHandlers.forEach((config, id) => {
        if (config.group === group) {
          config.element.addEventListener(config.eventType, config.handler);
        }
      });
    }
  
    /**
     * Disable events for a list of groups
     * @param {string[]} groups - Array of group names to disable
     * @param {boolean} temporary - If true, store handlers for re-enabling
     */
    disableEventGroups(groups, temporary = false) {
      for (const group of groups) {
        if (!this.activeEventGroups.has(group)) {
          continue;
        }

        // Don't allow disabling system events
        if (group === 'system') {
          console.warn('Cannot disable system events');
          continue;
        }

        this.activeEventGroups.delete(group);

        // Detach all handlers for this group
        this.eventHandlers.forEach((config, id) => {
          if (config.group === group) {
            config.element.removeEventListener(config.eventType, config.handler);

            // Store if temporary
            if (temporary) {
              this.temporaryDisabledHandlers.set(id, config);
            }
          }
        });
      }
    }


  
    /**
     * Re-enable temporarily disabled event group
     * @param {string} group - Group name to re-enable
     */
    restoreEventGroup(group) {
      if (this.activeEventGroups.has(group)) return;
      
      this.activeEventGroups.add(group);
      
      // Re-attach handlers for this group
      this.temporaryDisabledHandlers.forEach((config, id) => {
        if (config.group === group) {
          config.element.addEventListener(config.eventType, config.handler);
          this.temporaryDisabledHandlers.delete(id);
        }
      });
    }
  
    /**
     * Trigger a custom event
     * @param {string} eventName - Name of custom event
     * @param {object} detail - Event details
     */
    triggerCustomEvent(eventName, detail = {}) {
      const event = new CustomEvent(eventName, { 
        detail,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    }
  
    /**
     * Listen for custom events
     * @param {string} eventName - Name of custom event
     * @param {Function} handler - Event handler
     */
    listenForCustomEvent(eventName, handler) {
      document.addEventListener(eventName, handler);
      
      // Store for potential cleanup
      this.eventHandlers.set(`custom-${eventName}`, {
        element: document,
        eventType: eventName,
        handler,
        group: 'custom'
      });
    }
  }