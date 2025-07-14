/**
 * UIManager - Coordinates LayoutManager, ComponentManager, and EventManager
 */
import { LayoutManager } from './LayoutManager.js';
import { ComponentManager } from './ComponentManager.js';
import { EventManager } from './EventManager.js';
import { STAGES,EVENTGROUPS,EVENTIDVSGROUP } from './constants.js';

export class UIManager{
  /**
   * @param {import("../Manager/NotificationManager.js").NotificationManager} notificationManager
  */
  constructor(notificationManager) {
    this.layoutManager = new LayoutManager();
    this.componentManager = new ComponentManager();
    this.eventManager = new EventManager();
    this.notificationManager = notificationManager;
    this.currentView = null;
    this.registedComponent = new Map();
    
    // Setup system events
    this.setupSystemEvents();
  }

  /**
   * Setup essential system events
   */
  async setupSystemEvents() {
    // Example: listening for window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    // document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-theme', await this.getAppColorTheme());
    this.eventManager.registerEvent(document,'keydown',async (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't') {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
          document.documentElement.setAttribute('data-theme', 'light');
          await this.changeAppColorTheme('light');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          await this.changeAppColorTheme('dark');
        }
      }
    },'system');
  }

  async changeAppColorTheme(theme) {
    try {
      const responce = await electronAPI.changeColorTheme(theme,'Raveen2244@');
      // Handle different response statuses
      if (responce.status === 401) {
        this.notificationManager.error('Authorization header required. Please log in again.');
      }
      if (responce.status === 500) {
        this.notificationManager.error('Server error. Please try again later.');
      }
      if (responce.status === 204) {
        this.notificationManager.info('No profile found.');
      }
      if (responce.status === 200 && responce.data.message.length > 0) {
        return;
      }
      if (responce.status !== 200) {
        // this.notificationManager.error(`Error fetching profile: ${responce.status}`);
      }
      return;

    } catch (error) {
      // this.notificationManager.error(`Error fetching profile: ${error.message}`);
      return;
    }
  }

  async getAppColorTheme() {
    try {
      const responce = await electronAPI.getColorTheme('Raveen2244@');
      // Handle different response statuses
      var colorTheme = 'light';
      if (responce.status === 401) {
        this.notificationManager.error('Authorization header required. Please log in again.');
      }
      if (responce.status === 500) {
        this.notificationManager.error('Server error. Please try again later.');
      }
      if (responce.status === 204) {
        this.notificationManager.info('No profile found.');
      }
      if (responce.status === 200) {
        colorTheme = responce.data.message.theme;
      }
      if (responce.status !== 200) {
        // this.notificationManager.error(`Error fetching color theme: ${responce.status}`);
      }
      return colorTheme;

    } catch (error) {
      // this.notificationManager.error(`Error fetching profile: ${error.message}`);
      return 'light';
    }
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
  navigateToView(viewId, viewGroup, options = {}) {
    const viewElement = document.getElementById(viewId);
    if (!viewElement) {
      console.error(`View with ID ${viewId} not found`);
      return;
    }
    
    // Make this view primary
    this.layoutManager.setAsPrimary(viewElement);
    
    // Enable events for this view, disable others
    var removeGroups = new Set(EVENTGROUPS);
    removeGroups.delete(viewGroup);

    this.eventManager.disableEventGroups(removeGroups)
    this.eventManager.enableEventGroup(viewGroup);
    // navigate function
    this.registedComponent.get(viewId).main.navigator(options);
    

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
    const web_style = componentData.main.style();
    this.componentManager.renderComponent(
      containerId,
      web_content,
      web_style
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
    // Store component data
    this.registedComponent.set(containerId, componentData); 
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

  eventgroup(viewID) {
    return EVENTIDVSGROUP[viewID];
  }

  userProfileButtonVisibility(isVisible) {
    const userbuttonContainer = document.querySelector('#user-button-container');
    if (userbuttonContainer) {
      if (isVisible) {
        userbuttonContainer.style.zIndex = 1;
      } else {
        userbuttonContainer.style.zIndex = 0;
      }
    } else {
      this.notificationManager.error('User button container not found');
    }
  }
}