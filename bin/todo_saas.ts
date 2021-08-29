import * as cdk from "aws-cdk-lib";
import { TodoSaasStack } from "../lib/todo_saas-stack";
const app: cdk.App = new cdk.App();
new TodoSaasStack(app, "TodoSaasStack", {});
