# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

# Custom settings

```
export BOUNCE_RECORDER_SNS_TOPIC=ses-notifications
export BOUNCE_RECORDER_DYNAMODB_TABLE=ses-mailing
export BOUNCE_RECORDER_SCAN_LIMIT=1000
```

# Add SNS topic to SES notification setting

![notification](https://user-images.githubusercontent.com/1042519/62696253-ff7bec80-ba12-11e9-9962-4f55d37901f4.png)

# Usage

- Get bounce data (default: 1000 items/req)

```
curl --header 'x-api-key:{api-key}' -i 'https://{id}.execute-api.us-east-1.amazonaws.com/prod/'

{
  "Items": [
    {
      // ...
    },
    {
      "notificationType": "Bounce",
      "UserId": "bounce@simulator.amazonses.com",
      "from": "test@example.com",
      "state": "disable",
      "timestamp": "2019-08-08T09:48:18.000Z"
    }
  ],
  "Count": 1000,
  "ScannedCount": 1000,
  "LastEvaluatedKey": {
    "UserId": "bounce@simulator.amazonses.com"
  }
}
```

- Get next items by add `lastUserId` parameter

```
curl --header 'x-api-key:{api-key}' -i 'https://{id}.execute-api.us-east-1.amazonaws.com/prod/?lastUserId=bounce@simulator.amazonses.com'
```
