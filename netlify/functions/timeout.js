exports.handler = async (event) => {
  const data = JSON.parse(event.body);

  console.log("TIMEOUT:", data);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Timeout handled" }),
  };
};
