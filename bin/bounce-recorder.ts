#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { BounceRecorderStack } from '../lib/bounce-recorder-stack';

const app = new cdk.App();
new BounceRecorderStack(app, 'BounceRecorderStack');
