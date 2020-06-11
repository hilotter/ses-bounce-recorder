# Custom settings

```
export BOUNCE_RECORDER_SNS_TOPIC=ses-notifications
export WEBHOOK_KEY=webhook_key
export WEBHOOK_URL=https://your-webhook-url
```

# deploy

```
yarn
yarn run cdk bootstrap

# dry-run
yarn run cdk diff

# deploy
yarn run cdk deploy
```

# Add SNS topic to SES notification setting

Please set SNS topic subscribe in SES notification manually

- Bounce Notifications SNS Topic
- Complaint Notifications SNS Topic

![notification](https://user-images.githubusercontent.com/1042519/62696253-ff7bec80-ba12-11e9-9962-4f55d37901f4.png)

# Lambda Test

use `test/lambda_bounce_event.json`

https://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html#bounce-object

# Manual Email Test

https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-email-simulator.html
