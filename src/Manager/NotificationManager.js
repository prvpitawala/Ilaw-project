/**
 * NotificationManager - Manages system notifications
 * Provides advanced notification capabilities beyond the basic implementation in UIManager
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
        position: 'top-right', // top-right, top-left, bottom-right, bottom-left
        dismissible: true, // can be dismissed by clicking X
        animate: true,     // use animation
        progress: false    // show progress bar for timed notifications
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
    }
  
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
     */
    show(message, options = {}) {
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
      
      // Set content
      const content = document.createElement('div');
      content.className = 'notification__content';
      content.textContent = options.message;
      notification.appendChild(content);
      
      // Add dismiss button if dismissible
      if (options.dismissible) {
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'notification__dismiss';
        dismissBtn.innerHTML = '&times;';
        dismissBtn.addEventListener('click', () => this.dismiss(notification));
        notification.appendChild(dismissBtn);
      }
      
      // Add progress bar if needed
      if (options.progress && options.duration > 0) {
        const progressBar = document.createElement('div');
        progressBar.className = 'notification__progress';
        notification.appendChild(progressBar);
      }
      
      return notification;
    }
  
    /**
     * Display a notification
     * @param {HTMLElement} notification - Notification element
     * @param {object} options - Notification options
     */
    displayNotification(notification, options) {
      this.visibleNotifications++;
      
      // Set position based on options
      this.container.classList.add(`notification-container--${options.position}`);
      
      // Add to DOM
      this.container.appendChild(notification);
      
      // Apply animation if enabled
      if (options.animate) {
        // Trigger reflow for animation to work
        notification.offsetHeight;
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
        progressBar.style.width = '0%';
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
      notification.classList.add('notification--fade');
      
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
     */
    success(message, options = {}) {
      return this.show(message, { ...options, type: 'success' });
    }
  
    /**
     * Show error notification
     * @param {string} message - Notification message
     * @param {object} options - Additional options
     */
    error(message, options = {}) {
      return this.show(message, { ...options, type: 'error' });
    }
  
    /**
     * Show warning notification
     * @param {string} message - Notification message
     * @param {object} options - Additional options
     */
    warning(message, options = {}) {
      return this.show(message, { ...options, type: 'warning' });
    }
  
    /**
     * Show info notification
     * @param {string} message - Notification message
     * @param {object} options - Additional options
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