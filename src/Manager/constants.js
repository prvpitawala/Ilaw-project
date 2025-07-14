/**
 * UI Management System Constants
 * Defines constants used throughout the UI system
 */

// Component stage constants for better readability
export const STAGES = {
    HIDDEN: '--hidden',
    PRIMARY: '--primary',
    SECONDARY: '--secondary'
  };

// Event groups 
export const EVENTGROUPS = new Set(['register','dashboard','massage','setting','collectionAdd','documentAdd','fileview']);
export const EVENTIDVSGROUP = {
  'registration-card': 'register',
  'settings-card': 'setting',
  'dashboard' : 'dashboard',
  'collection-add-card' : 'collectionAdd',
  'message-card' : 'massage',
  'document-view-card': 'fileview',
  'document-add-card' : 'documentAdd'
}

export const SHOTCUTS = [
  {'action': 'dashboard', 'key': 'Ctrl+Shift+D'},
  {'action': 'setting', 'key': 'Ctrl+S'},
  {'action': 'back', 'key': 'Escape'},
];