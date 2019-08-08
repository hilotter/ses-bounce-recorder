# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

# custom settings

```
export BOUNCE_RECORDER_SNS_TOPIC=ses-notifications
export BOUNCE_RECORDER_DYNAMODB_TABLE=ses-mailing
```
