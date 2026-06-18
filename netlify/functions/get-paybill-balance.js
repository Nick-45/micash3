// netlify/functions/get-paybill-balance.js
const axios = require('axios');

exports.handler = async (event) => {
  console.log('Function called with method:', event.httpMethod);
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log('Request body:', { 
      paybill: body.paybill, 
      userId: body.userId,
      hasAccessToken: !!body.accessToken,
      tokenLength: body.accessToken?.length || 0
    });
    
    const { paybill, userId, accessToken } = body;
    
    // Validate required fields
    if (!paybill) {
      console.log('Missing paybill');
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          error: 'Paybill number is required' 
        })
      };
    }

    if (!accessToken) {
      console.log('Missing access token');
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          error: 'Access token is required. Please enter a valid Daraja access token.' 
        })
      };
    }

    console.log('Calling Safaricom API with paybill:', paybill);
    
    // ✅ Generate SecurityCredential (you need to implement this)
    // For testing, you can use a placeholder, but in production you need proper encryption
    const securityCredential = process.env.SECURITY_CREDENTIAL || 'your_encrypted_password';
    
    // ✅ The complete request body for Account Balance API
    const requestData = {
      'Initiator': process.env.INITIATOR_NAME || 'testapi',
      'SecurityCredential': securityCredential,
      'CommandID': 'AccountBalance',
      'PartyA': paybill,
      'IdentifierType': '4',
      'Remarks': 'Balance Query',
      'QueueTimeOutURL': process.env.QUEUE_TIMEOUT_URL || 'https://your-site.netlify.app/.netlify/functions/timeout',
      'ResultURL': process.env.RESULT_URL || 'https://your-site.netlify.app/.netlify/functions/balance-result'
    };
    
    console.log('Request data (excluding SecurityCredential):', {
      ...requestData,
      SecurityCredential: '***HIDDEN***'
    });
    
    // ✅ Call Safaricom API with complete data
    const response = await axios({
      method: 'POST',
      url: 'https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      timeout: 30000
    });
    
    console.log('Safaricom API response status:', response.status);
    console.log('Safaricom API response data:', JSON.stringify(response.data));
    
    const responseData = response.data;
    
    // ✅ Check if we got a valid response
    if (responseData.ResponseCode === '0' && responseData.ConversationID) {
      // Success - request accepted
      console.log('✅ Balance request accepted. ConversationID:', responseData.ConversationID);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          balance: null, // Will be delivered via callback
          message: 'Balance request accepted. You will receive the balance via callback.',
          conversationId: responseData.ConversationID,
          pending: true
        })
      };
    } else if (responseData.ResponseCode) {
      // Error response
      console.log('❌ Safaricom returned error:', responseData);
      
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: responseData.ResponseDescription || 'Safaricom API returned an error',
          responseCode: responseData.ResponseCode
        })
      };
    } else {
      // Unknown response format
      console.log('Unknown response format:', responseData);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          balance: 0,
          message: 'Balance request processed. Check callback URL for balance.',
          rawResponse: responseData
        })
      };
    }
    
  } catch (error) {
    console.error('Error fetching paybill balance:', error);
    
    // Handle specific error cases
    let errorMessage = 'Failed to fetch balance';
    let statusCode = 500;
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      statusCode = error.response.status;
      
      if (error.response.status === 401) {
        errorMessage = 'Invalid or expired access token. Please get a new token.';
      } else if (error.response.status === 403) {
        errorMessage = 'Unauthorized - Check your credentials and permissions.';
      } else if (error.response.status === 404) {
        errorMessage = 'API endpoint not found. Check the URL.';
      } else if (error.response.data?.ResponseDescription) {
        errorMessage = error.response.data.ResponseDescription;
      } else if (error.response.data?.errorMessage) {
        errorMessage = error.response.data.errorMessage;
      }
    } else if (error.request) {
      console.error('No response received');
      errorMessage = 'No response from Safaricom API. Please check your network connection.';
    } else {
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }
    
    return {
      statusCode: statusCode,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
