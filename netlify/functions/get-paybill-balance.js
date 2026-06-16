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
    
    // Call Safaricom API to get paybill balance
    const response = await axios({
      method: 'GET',
      url: 'https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        'CommandID': 'AccountBalance',
        'PartyA': paybill,
        'IdentifierType': '4',
        'Remarks': 'Balance Query'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('Safaricom API response status:', response.status);
    console.log('Safaricom API response data:', JSON.stringify(response.data));
    
    // Parse the balance from the response
    let balance = 0;
    if (response.data) {
      if (response.data.Balance) {
        // Extract numeric value from "KES 1,234.56" format
        const balanceStr = response.data.Balance;
        const numericMatch = balanceStr.match(/[\d,]+\.?\d*/);
        balance = numericMatch ? parseFloat(numericMatch[0].replace(/,/g, '')) : 0;
        console.log('Parsed balance from Balance field:', balance);
      } else if (response.data.balance) {
        balance = response.data.balance;
        console.log('Parsed balance from balance field:', balance);
      } else if (typeof response.data === 'number') {
        balance = response.data;
        console.log('Parsed balance from number:', balance);
      } else {
        console.log('Unknown response format:', response.data);
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        balance: balance,
        rawResponse: response.data
      })
    };
  } catch (error) {
    console.error('Error fetching paybill balance:', error);
    
    // Handle specific error cases
    let errorMessage = 'Failed to fetch balance';
    let statusCode = 500;
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      statusCode = error.response.status;
      
      if (error.response.status === 401) {
        errorMessage = 'Invalid or expired access token. Please get a new token.';
      } else if (error.response.status === 403) {
        errorMessage = 'Unauthorized - Check your credentials and permissions.';
      } else if (error.response.data?.errorMessage) {
        errorMessage = error.response.data.errorMessage;
      } else if (error.response.data?.errorCode) {
        errorMessage = `Error ${error.response.data.errorCode}: ${error.response.data.errorMessage || 'Unknown error'}`;
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
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
