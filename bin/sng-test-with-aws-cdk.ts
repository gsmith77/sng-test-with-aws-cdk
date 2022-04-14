#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {SngTestWithAwsCdkStack} from '../lib/sng-test-with-aws-cdk-stack';

const app = new cdk.App();
new SngTestWithAwsCdkStack(app, 'SngTestWithAwsCdkStack');
