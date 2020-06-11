import * as cdk from '@aws-cdk/core';
import * as sns from '@aws-cdk/aws-sns';
import * as subs from '@aws-cdk/aws-sns-subscriptions';
import * as lambda from '@aws-cdk/aws-lambda'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'

export class SesBounceRecorderStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // NOTE: Please set SNS topic subscribe in SES notification manually
    // - Bounce Notifications SNS Topic
    // - Complaint Notifications SNS Topic
    const topicName = process.env.BOUNCE_RECORDER_SNS_TOPIC || 'ses-notifications'
    const topic = new sns.Topic(this, topicName, {
      topicName: topicName,
      displayName: 'SES bounce notifications'
    })

    const bounceRecorderLambda = new NodejsFunction(
      this,
      'BounceRecorderLambda',
      {
        functionName: `SesBounceRecorder`,
        entry: 'src/lambda/handlers/sesBounceRecorder.ts',
        runtime: lambda.Runtime.NODEJS_12_X,
        timeout: cdk.Duration.seconds(30),
      }
    )
    bounceRecorderLambda.addEnvironment('WEBHOOK_KEY', process.env.WEBHOOK_KEY || '')
    bounceRecorderLambda.addEnvironment('WEBHOOK_URL', process.env.WEBHOOK_URL || '')

    topic.addSubscription(new subs.LambdaSubscription(bounceRecorderLambda))
  }
}
