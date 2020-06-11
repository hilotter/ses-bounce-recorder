import { SNSEvent, Context, Callback } from 'aws-lambda'
import axios from 'axios'

// refs: https://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html
type SesMailObject = {
  messageId: string
}

type SesBouncedRecipient = {
  emailAddress: string
}
type SesBounceObject = {
  notificationType: string
  mail: SesMailObject
  bounce: {
    timestamp: string
    bouncedRecipients: SesBouncedRecipient[]
    bounceType: string
  }
}

type SesComplainedRecipient = {
  emailAddress: string
}
type SesComplaintObject = {
  notificationType: string
  mail: SesMailObject
  complaint: {
    timestamp: string
    complainedRecipients: SesComplainedRecipient[]
  }
}

type SesDeliveryObject = {
  notificationType: string
  mail: SesMailObject
  delivery: {
    timestamp: string
  }
}

const handleBounce = async (message: SesBounceObject, callback: Callback) => {
  const messageId = message.mail.messageId
  const addresses = message.bounce.bouncedRecipients.map((recipient) => {
    return recipient.emailAddress
  })
  const bounceType = message.bounce.bounceType

  if (bounceType === 'Permanent') {
    for (let i = 0; i < addresses.length; i++) {
      await sendWebhook(addresses[i], message.notificationType)
    }
  }

  const log = `Message ${messageId} bounced when sending to ${addresses.join(', ')}. Bounce type: ${bounceType}`
  console.log(log)
  callback(null, log)
}

const handleComplaint = async (
  message: SesComplaintObject,
  callback: Callback
) => {
  const messageId = message.mail.messageId
  const addresses = message.complaint.complainedRecipients.map((recipient) => {
    return recipient.emailAddress
  })

  for (let i = 0; i < addresses.length; i++) {
    await sendWebhook(addresses[i], message.notificationType)
  }

  const log = `A complaint was reported by ${addresses.join(', ')} for message ${messageId}.`
  console.log(log)
  callback(null, log)
}

const handleDelivery = (message: SesDeliveryObject, callback: Callback) => {
  const messageId = message.mail.messageId
  const deliveryTimestamp = message.delivery.timestamp

  const log = `Message ${messageId} was delivered successfully at ${deliveryTimestamp}.`
  callback(null, log)
}

const sendWebhook = async (address: string, notificationType: string) => {
  const webhookKey = process.env.WEBHOOK_KEY || ''
  const webhookUrl = process.env.WEBHOOK_URL || ''
  if (webhookUrl === '') {
    return
  }

  try {
    await axios.post(
      webhookUrl,
      {
        address,
        notification_type: notificationType,
      },
      {
        headers: {
          'X-Webhook-Key': webhookKey,
        },
      }
    )
  } catch (error) {
    // https://github.com/axios/axios#handling-errors
    if (error.response) {
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else if (error.request) {
      console.log(error.request)
    } else {
      console.log('Error', error.message)
    }
    console.log(error.config)
    console.log(error.message)
  }
}

export const handler = async (event: SNSEvent, _context: Context, callback: Callback): Promise<void> => {
  // console.log("Received event:", JSON.stringify(event, null, 2));
  const message = JSON.parse(event.Records[0].Sns.Message)

  switch (message.notificationType) {
    case 'Bounce':
      await handleBounce(message, callback)
      break
    case 'Complaint':
      await handleComplaint(message, callback)
      break
    case 'Delivery':
      handleDelivery(message, callback)
      break
    case 'AmazonSnsSubscriptionSucceeded':
      callback(null, 'ok')
      break
    default:
      callback(`Unknown notification type: ${message.notificationType}`)
  }
}
