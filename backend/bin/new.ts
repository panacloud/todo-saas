#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NewStack } from '../lib/new-stack';

const app = new cdk.App();
new NewStack(app, 'CkdStack-TodoApp');
