const { DynamoDB } = require("aws-sdk");

exports.handler = async function(event, context, callback) {
  // console.log("Received event:", JSON.stringify(event, null, 2));
  const message = JSON.parse(event.Records[0].Sns.Message);

  switch (message.notificationType) {
    case "Bounce":
      handleBounce(message, callback);
      break;
    case "Complaint":
      handleComplaint(message, callback);
      break;
    case "Delivery":
      handleDelivery(message, callback);
      break;
    default:
      callback(`Unknown notification type: ${message.notificationType}`);
  }
};

function handleBounce(message, callback) {
  const messageId = message.mail.messageId;
  const addresses = message.bounce.bouncedRecipients.map(function(recipient) {
    return recipient.emailAddress;
  });
  const bounceType = message.bounce.bounceType;

  if (bounceType === "Permanent") {
    for (var i = 0; i < addresses.length; i++) {
      writeDDB(addresses[i], message, "disable");
    }
  }

  const log = `Message ${messageId} bounced when sending to ${addresses.join(
    ", "
  )}. Bounce type: ${bounceType}`;

  console.log(log);
  callback(null, log);
}

async function handleComplaint(message, callback) {
  const messageId = message.mail.messageId;
  const addresses = message.complaint.complainedRecipients.map(function(
    recipient
  ) {
    return recipient.emailAddress;
  });

  for (var i = 0; i < addresses.length; i++) {
    await writeDDB(addresses[i], message, "disable");
  }

  const log = `A complaint was reported by ${addresses.join(
    ", "
  )} for message ${messageId}.`;

  console.log(log);
  callback(null, log);
}

function handleDelivery(message, callback) {
  const messageId = message.mail.messageId;
  const deliveryTimestamp = message.delivery.timestamp;

  const log = `Message ${messageId} was delivered successfully at ${deliveryTimestamp}.`;
  console.log(log);
  callback(null, log);
}

async function writeDDB(id, payload, status) {
  const item = {
    UserId: id,
    notificationType: payload.notificationType,
    from: payload.mail.source,
    timestamp: payload.mail.timestamp,
    state: status
  };
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: item
  };

  const dynamo = new DynamoDB.DocumentClient();
  await dynamo.put(params).promise();
}
