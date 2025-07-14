const { ipcMain } = require('electron');
const FormData = require('form-data');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const log = require('electron-log');

// Base URL for API
const API_BASE_URL = 'http://localhost:5000/api';

// Authentication header helper
function getAuthHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// Setup all the API endpoints as IPC handlers
function setupApiHandlers() {
  // // // API // // //

  // Auth Endpoints
  ipcMain.handle('api:register', async (event, userData) => {
    try {      
      // Use makeRequest with form data
      const jsonData = {
        userName: userData.userName,
        password: userData.password,
        geminiApiKey: userData.geminiApiKey,
        chatGPTApiKey: userData.chatGPTApiKey,
        profilePicture: userData.profilePicture
      };

      const result = await makeRequest('/auth/register','POST',JSON.stringify(jsonData),{'Content-Type': 'application/json'},false); 
      return result;
    } catch (error) {
      throw error;
    }
  });
  
  ipcMain.handle('api:verify', async (_, verificationData) => {
    return await makeRequest('/auth/verify', 'POST', verificationData);
  });
  
  ipcMain.handle('api:checkPassword', async (_, { token, password }) => {
    const newHeader = getAuthHeader(token);
    newHeader.password = password;
    return await makeRequest('/auth/password/check', 'POST',{}, newHeader,false, {
      throwOnError: false
    });
  });
  
  
  // Profile Endpoints
  ipcMain.handle('api:getProfile', async (_, token) => {
    return await makeRequest('/profile', 'GET', null, getAuthHeader(token), false, {
      throwOnError: false
    });
  });

  ipcMain.handle('api:getProfileName', async (_, token) => {
    return await makeRequest('/profile/name', 'GET', null, getAuthHeader(token), false, {throwOnError: false});
    // return await makeRequest('/profile/name', 'GET', null, getAuthHeader(token));
  });

  ipcMain.handle('api:updateProfileName', async (_, { token, name }) => {
    return await makeRequest('/profile/name', 'PATCH', { name }, getAuthHeader(token), false, {throwOnError: false,validateStatus: (status) => status < 500 });
  });

  ipcMain.handle('api:getProfileApiKey', async (_, token) => {
    return await makeRequest('/profile/api-key', 'GET', null, getAuthHeader(token));
  });

  ipcMain.handle('api:updateProfileApiKey', async (_, { token, apiKey }) => {
    return await makeRequest('/profile/api-key', 'PATCH', { apiKey }, getAuthHeader(token), false, {throwOnError: false,validateStatus: (status) => status < 500 });
  });

  ipcMain.handle('api:updateProfilePassword', async (_, { token, currentPassword, newPassword }) => {
    return await makeRequest('/profile/password', 'PATCH', { "currentPassword": currentPassword, "newPassword": newPassword }, getAuthHeader(token), false, { throwOnError: false, validateStatus: (status) => status < 500 });
  });

  ipcMain.handle('api:getProfilePicture', async (_, { username }) => {
    try {
      const result = await makeRequest(`/profile-picture/${username}`, 'GET', null, {}, false, {
        responseType: 'blob',
        throwOnError: false,
        validateStatus: (status) => status < 500
      });

      // result.data is a Blob here; convert to ArrayBuffer, then Node Buffer
      const arrayBuffer = await result.data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return {
        data: buffer,           // raw bytes, safe to transfer via IPC
        contentType: result.contentType || 'image/jpeg',
        ok: true,
        status: result.status,
      };
    } catch (error) {
      console.error('Get profile picture error:', error);
      throw error;
    }
  });

  ipcMain.handle('api:updateProfilePicture', async (_, { userName, profilePicture }) => {
    try {
      const jsonData = {
        userName: userName,
        profilePicture: profilePicture
      };

      const result = await makeRequest('/auth/update-profile-picture', 'POST', jsonData, {
        'Content-Type': 'application/json'
      }, false, {
        throwOnError: false,
        validateStatus: (status) => status < 500
      });
      
      return result;
    } catch (error) {
      console.error('Update profile picture error:', error);
      throw error;
    }
  });

  
  // Model Endpoints
  ipcMain.handle('api:getModelLLm', async (_, token) => {
    return await makeRequest('/models/llm', 'GET', null, getAuthHeader(token));
  });
  
  ipcMain.handle('api:updateModelLLm', async (_, { token, model }) => {
    return await makeRequest('/models/llm', 'PUT', { model }, getAuthHeader(token));
  });
  
  // Collection Endpoints
  ipcMain.handle('api:getCollections', async (_, token) => {
    return await makeRequest('/collections', 'GET', null, getAuthHeader(token));
  });
  
  ipcMain.handle('api:deleteCollection', async (_, { token, collectionName }) => {
    return await makeRequest(`/collections/${collectionName}`, 'DELETE', null, getAuthHeader(token));
  });

  ipcMain.handle('api:createCollection', async (_, { token, collectionName, fileData }) => {
    try {      
      const formData = new FormData();
      
      // Handle the file data array from renderer
      fileData.forEach((fileInfo) => {
        // Create a buffer from the file data array
        const buffer = Buffer.from(fileInfo.data);
        
        // Create a readable stream from the buffer
        const stream = Readable.from(buffer);
        
        // Append the file with proper filename and options
        formData.append('files', stream, {
          filename: fileInfo.name,
          contentType: fileInfo.type,
          knownLength: buffer.length
        });
      });

      const result = await makeRequest(`/collections/${collectionName}`, 'POST', formData, getAuthHeader(token), true); 
      console.log(result);
      return result;
    } catch (error) {
      console.error('Create collection error:', error);
      throw error;
    }
  });

  // Document Endpoints
  ipcMain.handle('api:getDocumentCollections', async (_, token) => {
    return await makeRequest('/documents', 'GET', null, getAuthHeader(token), false);
  });
  
  ipcMain.handle('api:getCollectionDocuments', async (_, { token, collectionId }) => {
    return await makeRequest(`/documents/${collectionId}`, 'GET', null, getAuthHeader(token));
  });
  
  ipcMain.handle('api:uploadDoc', async (_, { token, collectionName, filePaths }) => {
    try {
      const form = new FormData();
      form.append('collection_name', collectionName);
      
      // Add each file to the form data
      for (const filePath of filePaths) {
        const fileName = path.basename(filePath);
        const fileStream = fs.createReadStream(filePath);
        form.append('files', fileStream, fileName);
      }
      
      // Add token to headers instead of form data for better security
      const headers = {
        ...getAuthHeader(token),
        ...form.getHeaders()
      };
      
      return await makeRequest('/documents', 'POST', form, headers, true);
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  });
  
  ipcMain.handle('api:updateDoc', async (_, { token, documentId, updateData }) => {
    return await makeRequest(`/documents/${documentId}`, 'PUT', updateData, getAuthHeader(token));
  });
  
  ipcMain.handle('api:deleteDocumentCollection', async (_, { token, collectionId }) => {
    return await makeRequest(`/documents/collections/${collectionId}`, 'DELETE', null, getAuthHeader(token));
  });
  
  ipcMain.handle('api:deleteDocument', async (_, { token, collectionName, documentName}) => {
    return await makeRequest(`/documents/${collectionName}/${documentName}`, 'DELETE', null, getAuthHeader(token));
  });
  
  ipcMain.handle('api:getDocumentNames', async (_, { token, collectionName }) => {
    return await makeRequest(`/documents/${collectionName}`, 'GET', null, getAuthHeader(token));
  });
  
  // Query Endpoint
  ipcMain.handle('api:query', async (_, { token, prompt, collectionName }) => {
    const params = new URLSearchParams();
    params.append('query', prompt);
    if (collectionName) {
      params.append('collection', collectionName);
    }
    return await makeRequest('/query', 'POST', params.toString(), getAuthHeader(token), true, {throwOnError: false});
  });


  // // // electronAPI // // //

  ipcMain.handle('app:change-color-theme', async (_,{theme,token}) => {
    return await makeRequest('/setColorTheme', 'PATCH', { theme }, getAuthHeader(token), false, {throwOnError: false,validateStatus: (status) => status < 500 });
  });

  ipcMain.handle('api:get-color-theme', async (_, token) => {
    return await makeRequest('/getColorTheme', 'GET', null, getAuthHeader(token), false, {throwOnError: false,validateStatus: (status) => status < 500 });
    // return await makeRequest('/profile/name', 'GET', null, getAuthHeader(token));
  });
}

////////////////////////////////
async function makeRequest(endpoint, method = 'GET', body = null, headers = {}, isFormData = false, options = {}) {
  const {
    timeout = 30000, // 30 seconds default timeout
    retries = 0,
    retryDelay = 1000,
    validateStatus = null, // Custom status validation function
    responseType = 'auto', // 'json', 'text', 'blob', 'arrayBuffer', 'auto'
    onUploadProgress = null,
    onDownloadProgress = null,
    baseURL = API_BASE_URL,
    throwOnError = true
  } = options;

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    try {
      // Prepare request options
      const requestOptions = {
        method: method.toUpperCase(),
        headers: {
          // Set default headers based on content type
          ...(!isFormData && body && typeof body === 'object' && { 'Content-Type': 'application/json' }),
          ...(isFormData && typeof body === 'string' && { 'Content-Type': 'application/x-www-form-urlencoded' }),
          ...headers // Custom headers override defaults
        },
        signal: AbortSignal.timeout(timeout)
      };

      // Handle request body
      if (body !== null && body !== undefined) {
        if (isFormData) {
          if (body instanceof FormData) {
            requestOptions.body = body;
            // Remove Content-Type to let browser set boundary for FormData
            delete requestOptions.headers['Content-Type'];
          } else if (typeof body === 'string') {
            requestOptions.body = body;
          } else {
            requestOptions.body = new URLSearchParams(body).toString();
            requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          }
        } else if (body instanceof Blob || body instanceof ArrayBuffer || body instanceof ReadableStream) {
          requestOptions.body = body;
        } else if (typeof body === 'string') {
          requestOptions.body = body;
        } else {
          requestOptions.body = JSON.stringify(body);
        }
      }

      console.log(`API Request (${method.toUpperCase()} ${endpoint}) - Attempt ${attempt + 1}:`, {
        url: `${baseURL}${endpoint}`,
        headers: requestOptions.headers,
        body: body instanceof FormData ? '[FormData]' : body
      });

      // Make the request
      const response = await fetch(`${baseURL}${endpoint}`, requestOptions);
      
      console.log(`API Response (${method.toUpperCase()} ${endpoint}):`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });

      // Handle different response types and status codes
      const result = await handleResponse(response, responseType, validateStatus, throwOnError);
      
      return result;

    } catch (error) {
      lastError = error;
      attempt++;

      // Handle specific error types
      if (error.name === 'AbortError') {
        console.error(`API Timeout (${endpoint}):`, error);
        if (throwOnError) throw new APIError('Request timeout', 'TIMEOUT', 408, endpoint);
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error(`API Network Error (${endpoint}):`, error);
        if (throwOnError) throw new APIError('Network error', 'NETWORK_ERROR', 0, endpoint);
      }

      // Retry logic
      if (attempt <= retries) {
        console.log(`Retrying request (${attempt}/${retries}) after ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error(`API Error (${endpoint}) - All retries exhausted:`, lastError);
        if (throwOnError) {
          if (lastError instanceof APIError) {
            throw lastError;
          }
          throw new APIError(lastError.message || 'Request failed', 'UNKNOWN_ERROR', 0, endpoint);
        }
      }
    }
  }

  return null;
}

async function handleResponse(response, responseType, validateStatus, throwOnError) {
  const { status, statusText, ok, headers } = response;
  const contentType = headers.get('content-type') || '';
  
  // Custom status validation
  const isValidStatus = validateStatus ? validateStatus(status) : ok;
  
  let data = null;
  let parsedData = null;

  try {
    // Determine response type and parse accordingly
    if (responseType === 'auto') {
      if (contentType.includes('application/json')) {
        parsedData = await response.json();
      } else if (contentType.includes('text/') || contentType.includes('application/xml')) {
        parsedData = await response.text();
      } else if (contentType.includes('application/octet-stream') || contentType.includes('image/') || contentType.includes('video/') || contentType.includes('audio/')) {
        parsedData = await response.blob();
      } else {
        // Default to text for unknown types
        parsedData = await response.text();
      }
    } else {
      switch (responseType) {
        case 'json':
          parsedData = await response.json();
          break;
        case 'text':
          parsedData = await response.text();
          break;
        case 'blob':
          console.log('responce is blob',response);
          parsedData = await response.blob();
          break;
        case 'arrayBuffer':
          parsedData = await response.arrayBuffer();
          break;
        default:
          parsedData = await response.text();
      }
    }
  } catch (parseError) {
    console.warn('Failed to parse response:', parseError);
    parsedData = null;
  }

  // Create standardized response object
  const result = {
    data: parsedData,
    status,
    statusText,
    ok,
    headers: Object.fromEntries(headers.entries()),
    contentType,
    url: response.url
  };

  // Handle different status codes
  if (isValidStatus) {
    // Success responses (2xx)
    return result;
  } else {
    // Error responses
    const errorMessage = getErrorMessage(parsedData, status, statusText);
    const errorCode = getErrorCode(status);
    
    if (throwOnError) {
      throw new APIError(errorMessage, errorCode, status, response.url, result);
    } else {
      result.error = {
        message: errorMessage,
        code: errorCode,
        status
      };
      return result;
    }
  }
}

function getErrorMessage(data, status, statusText) {
  // Try to extract error message from response data
  if (data && typeof data === 'object') {
    return data.error || data.message || data.detail || statusText || `Request failed with status ${status}`;
  } else if (typeof data === 'string' && data.trim()) {
    return data;
  }
  
  // Default error messages based on status codes
  switch (status) {
    case 400: return 'Bad Request - The request was invalid';
    case 401: return 'Unauthorized - Authentication required';
    case 403: return 'Forbidden - Access denied';
    case 404: return 'Not Found - The requested resource was not found';
    case 405: return 'Method Not Allowed - The HTTP method is not supported';
    case 408: return 'Request Timeout - The request took too long';
    case 409: return 'Conflict - The request conflicts with current state';
    case 422: return 'Unprocessable Entity - The request was well-formed but contains semantic errors';
    case 429: return 'Too Many Requests - Rate limit exceeded';
    case 500: return 'Internal Server Error - Something went wrong on the server';
    case 502: return 'Bad Gateway - Invalid response from upstream server';
    case 503: return 'Service Unavailable - The server is temporarily unavailable';
    case 504: return 'Gateway Timeout - Upstream server timeout';
    default: return statusText || `Request failed with status ${status}`;
  }
}

function getErrorCode(status) {
  const statusToCode = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    405: 'METHOD_NOT_ALLOWED',
    408: 'TIMEOUT',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT'
  };
  
  return statusToCode[status] || 'UNKNOWN_ERROR';
}

// Custom Error class for API errors
class APIError extends Error {
  constructor(message, code, status, url, response = null) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
    this.url = url;
    this.response = response;
  }
}

// Usage examples:
/*
// Basic usage
const data = await makeRequest('/api/users', 'GET');

// With custom options
const data = await makeRequest('/api/upload', 'POST', formData, {}, true, {
  timeout: 60000,
  retries: 2,
  responseType: 'json'
});

// With custom headers and no error throwing
const result = await makeRequest('/api/data', 'GET', null, {
  'Custom-Header': 'value'
}, false, {
  throwOnError: false,
  validateStatus: (status) => status < 500 // Only throw on 5xx errors
});

// Handle different response types
const blob = await makeRequest('/api/download', 'GET', null, {}, false, {
  responseType: 'blob'
});

const buffer = await makeRequest('/api/binary', 'GET', null, {}, false, {
  responseType: 'arrayBuffer'
});
*/

module.exports = {
  setupApiHandlers
};