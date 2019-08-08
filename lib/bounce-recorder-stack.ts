import cdk = require('@aws-cdk/core');
import sns = require('@aws-cdk/aws-sns');
import subs = require('@aws-cdk/aws-sns-subscriptions');
import dynamodb = require('@aws-cdk/aws-dynamodb')
import lambda = require('@aws-cdk/aws-lambda')

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

    const handler = new lambda.Function(this, 'BounceRecorderHandler', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'bounce_recorder.handler',
      code: lambda.Code.asset('lambda'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName
      }
    });

    table.grantReadWriteData(handler);
    topic.addSubscription(new subs.LambdaSubscription(handler));
  }
}
