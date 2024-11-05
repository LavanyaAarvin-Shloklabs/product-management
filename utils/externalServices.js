const axios = require("axios");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// Utility function to make HTTP requests using Axios
// This function allows for customizable requests with various HTTP methods and configurations

const makeRequest = asyncHandler(async (options = {}) => {
  // Destructure provided options with default values
  const {
    method = 'GET',                           // Default HTTP method is GET
    baseURL= '',                                  // Servce URL should be provided
    path = '',                                // Default path is empty
    headers = {},                             // Default headers are empty
    payload = {},                             // Default payload is empty
    withToken = false,                        // Default without Authorization token
    authToken,                                // Default auth token from environment variables
  } = options;

  // Construct the final configuration for the request
  const config = {
    method,                                   // HTTP method
    baseURL,                                  // Base URL
    url: path,                                // Request path
    headers: {
      ...headers,                             // Merge provided headers
      'Content-Type': 'application/json',     // Default content type
      // Conditionally add Authorization header if withToken is true
      ...(withToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
    },
    // Conditionally add data or params based on the method
    ...(method.toUpperCase() !== 'GET' ? { data: payload } : { params: payload }),
  };

  // Making the request using Axios
  try {
    const response = await axios(config);     // Await the Axios request
    return response.data;                     // Return the response data
  } catch (e) {
    if (e.response) {
      throw new ErrorResponse(e.response.data.error || 'An error occurred', e.response.status);
    } else if (e.request) {
      throw new ErrorResponse('No response received from the server', 503);
    } else {
      throw new ErrorResponse(e.message || 'Request failed', 500);
    }// Optionally rethrow the error after logging
  }
});

/**
 * // Sample implementation of the makeRequest utility function
    const { makeRequest } = require('../utils/makeRequest');
    const sampleImplementation = async () => {
    try {
    // Options for the request
    const options = {
      method: 'GET',                                        // HTTP method
      path: '/api/v1/tags',                                 // Endpoint path
      withToken: true,
      authToken: userAuthenticationToken,
      baseURL : 'http://tags-microservice',                 // Include Authorization token
    };      

    // Make the request using the makeRequest utility function
    const data = await makeRequest(options);

    // Send the response back to the client
    res.json({ success: true, data });
  } catch (error) {
    // Handle errors
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
 */

module.exports = {
  makeRequest
};
