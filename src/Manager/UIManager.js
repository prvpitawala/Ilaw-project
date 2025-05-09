/**
 * UIManager - Coordinates LayoutManager, ComponentManager, and EventManager
 */
import { LayoutManager } from './LayoutManager.js';
import { ComponentManager } from './ComponentManager.js';
import { EventManager } from './EventManager.js';
import { STAGES,EVENTGROUPS } from './constants.js';

export class UIManager{
  constructor(notificationManager) {
    this.layoutManager = new LayoutManager();
    this.componentManager = new ComponentManager();
    this.eventManager = new EventManager();
    this.notificationManager = notificationManager;
    this.currentView = null;
    
    // Setup system events
    this.setupSystemEvents();
  }

  /**
   * Setup essential system events
   */
  setupSystemEvents() {
    // Example: listening for window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Example implementation - adjust layout based on screen size
    const width = window.innerWidth;
    if (width < 768) {
      this.layoutManager.applyLayoutMode('mobile');
    } else if (width < 1200) {
      this.layoutManager.applyLayoutMode('tablet');
    } else {
      this.layoutManager.applyLayoutMode('desktop');
    }
  }

  /**
   * Navigate to a view (show/hide components)
   * @param {string} viewId - ID of view to navigate to
   * @param {string} viewGroup - view group
   */
  navigateToView(viewId, viewGroup) {
    const viewElement = document.getElementById(viewId);
    if (!viewElement) {
      console.error(`View with ID ${viewId} not found`);
      return;
    }
    
    // Make this view primary
    this.layoutManager.setAsPrimary(viewElement);
    
    // Enable events for this view, disable others
    let removeGroups = EVENTGROUPS;
    removeGroups.delete(viewGroup);

    this.eventManager.disableEventGroups(removeGroups)
    this.eventManager.enableEventGroup(viewGroup);

    this.currentView = viewId;
  }

  /**
   * Register a component with events
   * @param {any} componentData - Component data
   * @param {string} containerId - Container to render in
   */
  registerComponent(componentData, containerId) {
    // Render component
    const web_content = componentData.main.componant();
    this.componentManager.renderComponent(
      containerId,
      web_content
    );
    this.layoutManager.setComponentStage(document.getElementById(containerId), STAGES.HIDDEN);
    
    // Setup events for the component
    if (componentData.main.event()) {
      componentData.main.event().forEach(eventitems => {
        this.eventManager.registerEvent(
          eventitems.element,
          eventitems.eventType,
          eventitems.handler,
          eventitems.eventGroup
        );
      });
    }
  }

  /**
   * Show a component with specific stage
   * @param {string} componentId - ID of component to show
   * @param {string} stage - Stage to set (from STAGES)
   */
  showComponent(componentId, stage = STAGES.PRIMARY) {
    const component = document.getElementById(componentId);
    if (!component) {
      console.error(`Component with ID ${componentId} not found`);
      return;
    }
    
    this.layoutManager.setComponentStage(component, stage);
    
    // If primary, ensure its events are enabled
    if (stage === STAGES.PRIMARY) {
      this.eventManager.enableEventGroup(componentId);
    }
  }

  /**
   * Hide a component
   * @param {string} componentId - ID of component to hide
   */
  hideComponent(componentId) {
    const component = document.getElementById(componentId);
    if (!component) {
      console.error(`Component with ID ${componentId} not found`);
      return;
    }
    
    this.layoutManager.setComponentStage(component, STAGES.HIDDEN);
    
    // Temporarily disable component events
    this.eventManager.disableEventGroup(componentId, true);
  }
}