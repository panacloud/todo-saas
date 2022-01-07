import { Todo, MutationAddTodoArgs, MutationDeleteTodoArgs } from "../types";

export type TestCollection = {
  fields: { getTodos: { arguments: {}; response: Todo[] }[] };
};
