import cdk = require('@aws-cdk/core');
import sns = require('@aws-cdk/aws-sns');
import subs = require('@aws-cdk/aws-sns-subscriptions');
import dynamodb = require('@aws-cdk/aws-dynamodb')
import lambda = require('@aws-cdk/aws-lambda')
import apigw = require('@aws-cdk/aws-apigateway');
import { ApiKeySourceType } from '@aws-cdk/aws-apigateway';
import { read } from 'fs';

export class BounceRecorderStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topicName = process.env.BOUNCE_RECORDER_SNS_TOPIC || 'ses-notifications';
    const topic = new sns.Topic(this, topicName, {
      displayName: 'SES bounce notifications'
    })

    const tableName = process.env.BOUNCE_RECORDER_DYNAMODB_TABLE || 'ses-mailing'
    const table = new dynamodb.Table(this, tableName, {
      partitionKey: { name: 'UserId', type: dynamodb.AttributeType.STRING }
    });

    const recordHandler = new lambda.Function(this, 'BounceRecorderHandler', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'bounce_recorder.handler',
      code: lambda.Code.asset('lambda'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName
      }
    });

    table.grantReadWriteData(recordHandler);
    topic.addSubscription(new subs.LambdaSubscription(recordHandler));

    const scanLimit = process.env.BOUNCE_RECORDER_SCAN_LIMIT || '1000';
    const readHandler = new lambda.Function(this, 'BounceReaderHandler', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'bounce_reader.handler',
      code: lambda.Code.asset('lambda'),
      timeout: cdk.Duration.seconds(300),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
        DYNAMODB_SCAN_LIMIT: scanLimit
      }
    });

    table.grantReadData(readHandler);

    const api = new apigw.RestApi(this, 'BounceReaderEndpoint', {});
    const integration = new apigw.LambdaIntegration(readHandler);
    const echo = api.root.addMethod('GET', integration, {
      apiKeyRequired: true
    })
    const apiKey = api.addApiKey('BounceReaderApiKey');
    const plan = api.addUsagePlan('UsagePlan', {
      name: 'BounceReader',
      apiKey: apiKey
    });

    plan.addApiStage({
      stage: api.deploymentStage,
      throttle: []
    });
  }
}
