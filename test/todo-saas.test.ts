import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as TodoSaas from '../lib/todo-saas-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new TodoSaas.TodoSaasStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
