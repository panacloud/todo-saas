import * as cdk from "aws-cdk-lib";
import { TodoSaasStack } from "../lib/todo_saas-stack";
const app: cdk.App = new cdk.App();
const deployEnv = process.env.STAGE;
const stack = new TodoSaasStack(
  app,
  deployEnv ? deployEnv + "-TodoSaasStack" : "TodoSaasStack",
  { prod: deployEnv }
);
