const { contextBridge, ipcRenderer } = require('electron');


// Expose API endpoints to renderer process securely
contextBridge.exposeInMainWorld('api', {
  // Auth
  /*
   * Register a new user
   * @param {Object} userData - User data for registration
   * @returns {Promise<Object>} - Response from the server
   */
  register: (userData) => {
    return ipcRenderer.invoke('api:register', userData);  //use
  },  
  verify: (verificationData) => ipcRenderer.invoke('api:verify', verificationData),
  checkPassword: (password, token) => ipcRenderer.invoke('api:checkPassword', { token, password }),
  
  
  // Profile
  getProfile: (token) => ipcRenderer.invoke('api:getProfile', token),
  getProfileName: (token) => ipcRenderer.invoke('api:getProfileName', token),   //use
  updateProfileName: (name,token) => ipcRenderer.invoke('api:updateProfileName', { token, name }),
  getProfileApiKey: (token) => ipcRenderer.invoke('api:getProfileApiKey', token),
  updateProfileApiKey: (apiKey, token) => ipcRenderer.invoke('api:updateProfileApiKey', { token, apiKey }),
  updatePassword: (currentPassword, newPassword, token) => 
    ipcRenderer.invoke('api:updateProfilePassword', { token, currentPassword, newPassword }),
  
  // Profile Picture
  /*
   * Get profile picture for a user
   * @param {string} username - Username to get profile picture for
   * @returns {Promise<Object>} - Profile picture blob data
   */
  getProfilePicture: (username) => ipcRenderer.invoke('api:getProfilePicture', { username }),
  
  /*
   * Update user's profile picture
   * @param {string} userName - Username
   * @param {Object} profilePicture - Profile picture data (base64 format)
   * @returns {Promise<Object>} - Response from the server
   */
  updateProfilePicture: (userName, profilePicture) => 
    ipcRenderer.invoke('api:updateProfilePicture', { userName, profilePicture }),
  
  // Model
  getModelLLm: (token) => ipcRenderer.invoke('api:getModelLLm', token),
  updateModelLLm: (token, model) => ipcRenderer.invoke('api:updateModelLLm', { token, model }),
  
  // Collections
  getCollections: (token) => ipcRenderer.invoke('api:getCollections', token),  //use
  deleteCollection: (collectionName, token) => ipcRenderer.invoke('api:deleteCollection', { token, collectionName }),
  createCollection: (collectionName, fileData, token) => ipcRenderer.invoke('api:createCollection', { token, collectionName, fileData }),

  // Documents
  getDocumentCollections: (token) => ipcRenderer.invoke('api:getDocumentCollections', token),
  getCollectionDocuments: (token, collectionId) => 
    ipcRenderer.invoke('api:getCollectionDocuments', { token, collectionId }),
  uploadDoc: (token, collectionName, filePaths) => 
    ipcRenderer.invoke('api:uploadDoc', { token, collectionName, filePaths }),
  updateDoc: (token, documentId, updateData) => 
    ipcRenderer.invoke('api:updateDoc', { token, documentId, updateData }),
  deleteDocumentCollection: (token, collectionId) => 
    ipcRenderer.invoke('api:deleteDocumentCollection', { token, collectionId }),
  deleteDocument: (collectionName, documentName, token) => 
    ipcRenderer.invoke('api:deleteDocument', { token, collectionName, documentName }), //use
  getDocumentNames: (collectionName, token) => 
    ipcRenderer.invoke('api:getDocumentNames', { token, collectionName }),  //use
  
  // Query
  query: (token, prompt, collectionName) => 
    ipcRenderer.invoke('api:query', { token, prompt, collectionName }),
});

contextBridge.exposeInMainWorld('electronAPI', {
  isOnline: () => ipcRenderer.invoke('is-online'),
  appVersion: () => ipcRenderer.invoke('app:version'),
  restartApp: () => ipcRenderer.invoke('restart-app'),
  getBackendStatus: () => ipcRenderer.invoke('get-backend-status'),
  changeColorTheme: (theme,token) => ipcRenderer.invoke('app:change-color-theme', {theme,token}),
  getColorTheme: (token) => ipcRenderer.invoke('api:get-color-theme', {token})
});