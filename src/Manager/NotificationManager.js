/**
 * Enhanced NotificationManager - Apple-inspired design
 * Provides professional notification capabilities with refined interactions
 */
export class NotificationManager {
    constructor() {
      this.container = null;
      this.queue = [];
      this.maxVisible = 3;
      this.visibleNotifications = 0;
      this.defaultOptions = {
        type: 'info',      // info, success, warning, error
        duration: 3000,    // milliseconds
        position: 'top-center', // top-right, top-left, bottom-right, bottom-left, top-center
        dismissible: true, // can be dismissed by clicking X
        animate: true,     // use animation
        progress: false,    // show progress bar for timed notifications
        hoverPause: true   // pause timeout on hover
      };
      
      this.initialize();
    }
  
    /**
     * Initialize notification system
     */
    initialize() {
      // Check if container exists, create if not
      this.container = document.getElementById('notification-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
      }
      
      // Listen for custom notification events
      document.addEventListener('notification', this.handleNotificationEvent.bind(this));
      
      // Add styles if not already present
      // this.ensureStylesLoaded();
    }
    
    /**
     * Ensure notification styles are loaded
     */
    // ensureStylesLoaded() {
    //   if (!document.getElementById('notification-manager-styles')) {
    //     const styleLink = document.createElement('link');
    //     styleLink.id = 'notification-manager-styles';
    //     styleLink.rel = 'stylesheet';
    //     styleLink.href = '/path/to/notification-manager.css'; // Update this path
    //     document.head.appendChild(styleLink);
    //   }
    // }
  
    /**
     * Handle notification custom event
     * @param {CustomEvent} event - Notification event
     */
    handleNotificationEvent(event) {
      const options = { ...this.defaultOptions, ...event.detail };
      this.show(options.message, options);
    }
  
    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {object} options - Notification options
     * @returns {HTMLElement} - Notification element
     */
    show(message, options = {}) {
      // Ensure message is provided
      if (!message) return null;
      
      // Merge provided options with defaults
      const notificationOptions = { ...this.defaultOptions, ...options, message };
      
      // Create notification element
      const notification = this.createNotificationElement(notificationOptions);
      
      // Add to queue or display immediately
      if (this.visibleNotifications >= this.maxVisible) {
        this.queue.push({ element: notification, options: notificationOptions });
      } else {
        this.displayNotification(notification, notificationOptions);
      }
      
      return notification;
    }
  
    /**
     * Create notification DOM element
     * @param {object} options - Notification options
     * @returns {HTMLElement} - Notification element
     */
    createNotificationElement(options) {
      const notification = document.createElement('div');
      notification.className = `notification notification--${options.type}`;
      notification.dataset.position = options.position;
      notification.setAttribute('role', 'alert');
      notification.setAttribute('aria-live', 'polite');
      
      // Create icon based on notification type
      const icon = document.createElement('div');
      icon.className = 'notification__icon';
      
      // Set icon based on type
      switch(options.type) {
        case 'success':
          icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9,16.17L4.83,12l-1.42,1.41L9,19 21,7l-1.41-1.41L9,16.17z"></path></svg>';
          break;
        case 'error':
          icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41z"></path></svg>';
          break;
        case 'warning':
          icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M1,21h22L12,2L1,21z M13,18h-2v-2h2V18z M13,14h-2v-4h2V14z"></path></svg>';
          break;
        case 'info':
        default:
          icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M13,17h-2v-6h2V17z M13,9h-2V7h2V9z"></path></svg>';
      }
      
      notification.appendChild(icon);
      
      // Set content
      const content = document.createElement('div');
      content.className = 'notification__content';
      content.textContent = options.message;
      notification.appendChild(content);
      
      // Add dismiss button if dismissible
      if (options.dismissible) {
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'notification__dismiss';
        dismissBtn.setAttribute('aria-label', 'Close notification');
        dismissBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41z"></path></svg>';
        dismissBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dismiss(notification);
        });
        notification.appendChild(dismissBtn);
      }
      
      // Add progress bar if needed
      if (options.progress && options.duration > 0) {
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'notification__progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'notification__progress';
        
        progressBarContainer.appendChild(progressBar);
        notification.appendChild(progressBarContainer);
      }
      
      // Add hover pause functionality
      if (options.hoverPause && options.duration > 0) {
        notification.addEventListener('mouseenter', () => {
          this.pauseNotification(notification);
        });
        
        notification.addEventListener('mouseleave', () => {
          this.resumeNotification(notification, options);
        });
      }
      
      // Add click handler for the entire notification (optional)
      notification.addEventListener('click', () => {
        // Emit click event for custom handling
        const clickEvent = new CustomEvent('notification-clicked', {
          detail: { id: notification.id, type: options.type, message: options.message }
        });
        document.dispatchEvent(clickEvent);
        
        // Optional: dismiss on click
        if (options.dismissOnClick) {
          this.dismiss(notification);
        }
      });
      
      return notification;
    }
    
    /**
     * Pause notification timeout on hover
     * @param {HTMLElement} notification - Notification element
     */
    pauseNotification(notification) {
      // Clear timeout if exists
      if (notification.timeout) {
        clearTimeout(notification.timeout);
      }
      
      // Pause progress bar animation
      if (notification.querySelector('.notification__progress')) {
        const progressBar = notification.querySelector('.notification__progress');
        const computedStyle = window.getComputedStyle(progressBar);
        const width = computedStyle.getPropertyValue('width');
        
        // Store current width
        notification.dataset.progressWidth = width;
        
        // Pause animation
        progressBar.style.transition = 'none';
        progressBar.style.width = width;
      }
    }
    
    /**
     * Resume notification timeout after hover
     * @param {HTMLElement} notification - Notification element
     * @param {object} options - Notification options
     */
    resumeNotification(notification, options) {
      if (!notification.classList.contains('notification--dismissing')) {
        // Calculate remaining time
        const progressBar = notification.querySelector('.notification__progress');
        let remainingTime = options.duration;
        
        if (progressBar && notification.dataset.progressWidth) {
          const totalWidth = progressBar.parentNode.offsetWidth;
          const currentWidth = parseFloat(notification.dataset.progressWidth);
          const widthPercent = currentWidth / totalWidth;
          remainingTime = options.duration * widthPercent;
        }
        
        // Resume animation
        if (progressBar) {
          progressBar.style.transition = `width ${remainingTime}ms linear`;
          progressBar.style.width = '0';
        }
        
        // Set new timeout
        notification.timeout = setTimeout(() => {
          this.dismiss(notification);
        }, remainingTime);
      }
    }
  
    /**
     * Display a notification
     * @param {HTMLElement} notification - Notification element
     * @param {object} options - Notification options
     */
    displayNotification(notification, options) {
      this.visibleNotifications++;
      
      // Generate unique ID
      notification.id = `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Set position-specific container class
      this.container.className = 'notification-container';
      this.container.classList.add(`notification-container--${options.position}`);
      
      // Add to DOM
      this.container.appendChild(notification);
      
      // Trigger reflow for animation to work
      notification.offsetHeight;
      
      // Apply animation if enabled
      if (options.animate) {
        notification.classList.add('notification--visible');
      } else {
        notification.classList.add('notification--visible', 'notification--no-animation');
      }
      
      // Start progress bar animation if enabled
      if (options.progress && options.duration > 0) {
        const progressBar = notification.querySelector('.notification__progress');
        progressBar.style.transition = `width ${options.duration}ms linear`;
        
        // Trigger reflow
        progressBar.offsetHeight;
        progressBar.style.width = '0';
      }
      
      // Auto-dismiss after duration if specified
      if (options.duration > 0) {
        notification.timeout = setTimeout(() => {
          this.dismiss(notification);
        }, options.duration);
      }
    }
  
    /**
     * Dismiss a notification
     * @param {HTMLElement} notification - Notification to dismiss
     */
    dismiss(notification) {
      // Clear timeout if exists
      if (notification.timeout) {
        clearTimeout(notification.timeout);
      }
      
      // Add fade out class
      notification.classList.remove('notification--visible');
      notification.classList.add('notification--dismissing');
      
      // Wait for animation then remove
      setTimeout(() => {
        if (notification.parentNode === this.container) {
          this.container.removeChild(notification);
          this.visibleNotifications--;
          
          // Process queue if any notifications are waiting
          this.processQueue();
        }
      }, 300); // Match CSS transition time
    }
  
    /**
     * Process notification queue
     */
    processQueue() {
      if (this.queue.length > 0 && this.visibleNotifications < this.maxVisible) {
        const next = this.queue.shift();
        this.displayNotification(next.element, next.options);
      }
    }
  
    /**
     * Show success notification
     * @param {string} message - Notification message
     * @param {object} options - Additional options
     * @returns {HTMLElement} - Notification element
     */
    success(message, options = {}) {
      return this.show(message, { ...options, type: 'success' });
    }
  
    /**
     * Show error notification
     * @param {string} message - Notification message
     * @param {object} options - Additional options
     * @returns {HTMLElement} - Notification element
     */
    error(message, options = {}) {
      return this.show(message, { ...options, type: 'error' });
    }
  
    /**
     * Show warning notification
     * @param {string} message - Notification message
     * @param {object} options - Additional options
     * @returns {HTMLElement} - Notification element
     */
    warning(message, options = {}) {
      return this.show(message, { ...options, type: 'warning' });
    }
  
    /**
     * Show info notification
     * @param {string} message - Notification message
     * @param {object} options - Additional options
     * @returns {HTMLElement} - Notification element
     */
    info(message, options = {}) {
      return this.show(message, { ...options, type: 'info' });
    }
  
    /**
     * Clear all notifications
     */
    clearAll() {
      // Clear queue
      this.queue = [];
      
      // Remove all visible notifications
      const notifications = this.container.querySelectorAll('.notification');
      notifications.forEach(notification => {
        if (notification.timeout) {
          clearTimeout(notification.timeout);
        }
        this.container.removeChild(notification);
      });
      
      this.visibleNotifications = 0;
    }
}