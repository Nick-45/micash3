exports.handler = async (event) => {
  const data = JSON.parse(event.body);

  console.log("B2B RESULT:", data);

  // Save to DB here (important)

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Result received" }),
  };
};
