exports.handler = async (event) => {
  try {
    const { accessToken } = JSON.parse(event.body);

    // ❌ Validate
    if (!accessToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Access token is required" }),
      };
    }

    // ✅ Return it (or use it for debugging/logging)
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Access token received",
        accessToken,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
