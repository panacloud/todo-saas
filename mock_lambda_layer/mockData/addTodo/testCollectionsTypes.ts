import { Todo, MutationAddTodoArgs, MutationDeleteTodoArgs } from "../types";

export type TestCollection = {
  fields: { addTodo: { arguments: MutationAddTodoArgs; response: Todo }[] };
};
