const { DynamoDB } = require("aws-sdk");

exports.handler = async function(event) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Limit: process.env.DYNAMODB_SCAN_LIMIT
  };

  const lastUserId =
    event.queryStringParameters && event.queryStringParameters.lastUserId;
  if (lastUserId) {
    params.ExclusiveStartKey = {
      UserId: lastUserId
    };
  }
  const dynamo = new DynamoDB.DocumentClient();
  try {
    const response = await dynamo.scan(params).promise();
    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
