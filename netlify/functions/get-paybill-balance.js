// netlify/functions/get-paybill-balance.js
const axios = require('axios');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { paybill, userId, accessToken } = JSON.parse(event.body);
    
    // Validate required fields
    if (!paybill) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          error: 'Paybill number is required' 
        })
      };
    }

    if (!accessToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          error: 'Access token is required' 
        })
      };
    }

    // Call Safaricom API to get paybill balance
    const response = await axios({
      method: 'GET',
      url: 'https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query',
      headers: {
        'Authorization': `Bearer ${accessToken}`, // ✅ Use token from frontend
        'Content-Type': 'application/json'
      },
      params: {
        'CommandID': 'AccountBalance',
        'PartyA': paybill,
        'IdentifierType': '4',
        'Remarks': 'Balance Query'
      }
    });
    
    // Parse the balance from the response
    // The response format may vary, adjust accordingly
    let balance = 0;
    if (response.data) {
      // Different possible response formats
      if (response.data.Balance) {
        // Extract numeric value from "KES 1,234.56" format
        const balanceStr = response.data.Balance;
        const numericMatch = balanceStr.match(/[\d,]+\.?\d*/);
        balance = numericMatch ? parseFloat(numericMatch[0].replace(/,/g, '')) : 0;
      } else if (response.data.balance) {
        balance = response.data.balance;
      } else if (typeof response.data === 'number') {
        balance = response.data;
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        balance: balance,
        rawResponse: response.data // Optional: for debugging
      })
    };
  } catch (error) {
    console.error('Error fetching paybill balance:', error);
    
    // Handle specific error cases
    let errorMessage = 'Failed to fetch balance';
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      if (error.response.status === 401) {
        errorMessage = 'Invalid or expired access token';
      } else if (error.response.status === 403) {
        errorMessage = 'Unauthorized - Check your credentials';
      } else if (error.response.data?.errorMessage) {
        errorMessage = error.response.data.errorMessage;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from Safaricom API';
    }
    
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
