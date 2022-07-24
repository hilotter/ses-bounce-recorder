// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/webhook', function (req, res) {
  const webhookKey = req.get('X-Webhook-Key')
  if (webhookKey !== process.env.WEBHOOK_KEY) {
    return res.send({ message: 'invalid webhook key' })
  }

  const address = req.body.address
  const notificationType = req.body.notification_type

  // TODO:
  // - save this address to your DB
  // - do not send mail to this address
  console.log(address, notificationType)

  res.send({ message: 'bounce mail registered' })
})

app.listen(3000, () =>
  console.log('Example webhook app listening on port 3000!')
)
