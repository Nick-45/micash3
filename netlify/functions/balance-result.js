// netlify/functions/balance-result.js
exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const resultData = JSON.parse(event.body);
    console.log('💰 Balance Result Callback:', JSON.stringify(resultData, null, 2));
    
    // Extract balance from ResultParameters
    let balance = 0;
    let resultCode = -1;
    let resultDesc = 'Unknown';
    
    if (resultData.Result) {
      const result = resultData.Result;
      resultCode = result.ResultCode;
      resultDesc = result.ResultDesc;
      
      if (resultCode === 0) {
        // Success - parse balance
        if (result.ResultParameters && result.ResultParameters.ResultParameter) {
          const params = result.ResultParameters.ResultParameter;
          
          // Find Balance parameter
          let balanceParam = null;
          
          if (Array.isArray(params)) {
            balanceParam = params.find(p => p.Key === 'Balance');
          } else if (params.Key === 'Balance') {
            balanceParam = params;
          }
          
          if (balanceParam && balanceParam.Value) {
            const balanceStr = balanceParam.Value;
            console.log('Balance string:', balanceStr);
            
            // Extract numeric value from "KES 1,234.56"
            const numericMatch = balanceStr.match(/[\d,]+\.?\d*/);
            if (numericMatch) {
              balance = parseFloat(numericMatch[0].replace(/,/g, ''));
              console.log('✅ Parsed balance:', balance);
            }
          }
        }
      }
    }
    
    // You can store this balance in Firebase or your database here
    // Example: await updateDoc(doc(db, 'users', userId), { paybillBalance: balance });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: resultCode === 0,
        balance: balance,
        resultCode: resultCode,
        resultDesc: resultDesc,
        received: true
      })
    };
    
  } catch (error) {
    console.error('Error processing balance result:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};
