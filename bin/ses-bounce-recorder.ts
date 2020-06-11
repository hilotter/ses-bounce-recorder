#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { SesBounceRecorderStack } from '../lib/ses-bounce-recorder-stack'

const app = new cdk.App();
new SesBounceRecorderStack(app, 'SesBounceRecorderStack', {
  env: {
    region: 'us-east-1',
  }
})
