## Basic Usage Examples

### 1. Initialize the Manager

```javascript
// Create a notification manager instance
const notificationManager = new NotificationManager();
```

### 2. Basic Notification Types

```javascript
// Show different notification types
notificationManager.info('This is an information message');
notificationManager.success('Operation completed successfully!');
notificationManager.warning('Please save your work before continuing');
notificationManager.error('Unable to connect to server');

// Alternative generic method
notificationManager.show('Custom message', { type: 'info' });
```

### 3. Customizing Duration

```javascript
// Show notification for 5 seconds (5000ms)
notificationManager.success('File uploaded successfully', { duration: 5000 });

// Show persistent notification (no auto-dismiss)
notificationManager.info('Important announcement', { duration: 0 });
```

### 4. Different Positions

```javascript
// Position options: 'top-center', 'top-right', 'top-left', 'bottom-right', 'bottom-left'
notificationManager.info('Top center notification', { position: 'top-center' });
notificationManager.success('Top right notification', { position: 'top-right' });
notificationManager.warning('Top left notification', { position: 'top-left' });
notificationManager.error('Bottom right notification', { position: 'bottom-right' });
notificationManager.info('Bottom left notification', { position: 'bottom-left' });
```

## Advanced Features

### 5. Progress Bar

```javascript
// Show notification with progress bar
notificationManager.info('Downloading file...', { 
  duration: 5000,
  progress: true
});
```

### 6. Hover Pause

```javascript
// Notification that pauses when hovered
notificationManager.info('This notification pauses on hover', { 
  duration: 3000,
  hoverPause: true,
  progress: true // Add progress to visualize the pause
});

// Disable hover pause behavior
notificationManager.warning('This notification won't pause', { 
  duration: 3000,
  hoverPause: false 
});
```

### 7. Non-dismissible Notifications

```javascript
// Create notification without dismiss button
notificationManager.warning('You must complete this step', { 
  dismissible: false,
  duration: 0 // Make it persistent
});
```

### 8. Animation Control

```javascript
// Notification without animation
notificationManager.info('Appears instantly without animation', { 
  animate: false 
});
```

### 9. Custom Events

```javascript
// Listen for notification clicks
document.addEventListener('notification-clicked', (event) => {
  console.log('Notification clicked:', event.detail);
  
  // Perform action based on notification
  if (event.detail.type === 'success') {
    // Handle success notification clicks
  }
});

// Trigger a notification through custom event
document.dispatchEvent(new CustomEvent('notification', {
  detail: {
    message: 'Triggered through custom event',
    type: 'info',
    duration: 3000
  }
}));
```

### 10. Dismiss on Click

```javascript
// Notification that dismisses when clicked anywhere
notificationManager.info('Click me to dismiss', { 
  dismissOnClick: true 
});
```

### 11. Manual Dismissal

```javascript
// Store reference to notification for later dismissal
const notification = notificationManager.warning('Processing in background', { 
  duration: 0 // Make it persistent
});

// Later dismiss it manually
setTimeout(() => {
  notificationManager.dismiss(notification);
}, 10000);
```

### 12. Clear All Notifications

```javascript
// Remove all visible notifications and clear queue
document.getElementById('clear-notifications-btn').addEventListener('click', () => {
  notificationManager.clearAll();
});
```

### 13. Combining Multiple Options

```javascript
// Notification with multiple custom options
notificationManager.success('File processed successfully', {
  duration: 4000,
  position: 'bottom-right',
  progress: true,
  hoverPause: true,
  dismissOnClick: true
});
```

### 14. Queue Management

```javascript
// The notification system automatically queues notifications when
// visibleNotifications >= maxVisible (default 3)
for (let i = 1; i <= 10; i++) {
  notificationManager.info(`Notification ${i} of 10`, { 
    duration: 2000 + (i * 500) 
  });
}
```

### 15. Complete Real-World Example

```javascript
// Form submission with notification feedback
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Show loading notification
  const loadingNotification = notificationManager.info('Sending message...', {
    duration: 0,
    dismissible: false
  });
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dismiss loading notification
    notificationManager.dismiss(loadingNotification);
    
    // Show success notification
    notificationManager.success('Message sent successfully', {
      duration: 5000,
      progress: true
    });
    
    // Reset form
    e.target.reset();
    
  } catch (error) {
    // Dismiss loading notification
    notificationManager.dismiss(loadingNotification);
    
    // Show error notification
    notificationManager.error('Failed to send message. Please try again.', {
      duration: 0,
      position: 'top-center'
    });
  }
});
```

Would you like me to explain any specific feature in more detail?