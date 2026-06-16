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
    const { paybill, userId } = JSON.parse(event.body);
    
    // Get access token from your environment or database
    const accessToken = process.env.DARAJA_ACCESS_TOKEN; // Store in Netlify environment variables
    
    // Call Safaricom API to get paybill balance
    // This is an example - actual endpoint may vary
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
      }
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        balance: response.data.Balance || 0
      })
    };
  } catch (error) {
    console.error('Error fetching paybill balance:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch balance'
      })
    };
  }
};
