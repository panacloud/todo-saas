/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type TodoInput = {
  id: string,
  name: string,
};

export type CreateTodoMutationVariables = {
  Todo: TodoInput,
};

export type CreateTodoMutation = {
  createTodo:  {
    __typename: "Todo",
    id: string,
    name: string,
  } | null,
};

export type DeleteTodoMutationVariables = {
  TodoId: string,
};

export type DeleteTodoMutation = {
  deleteTodo: string | null,
};

export type ListTodosQuery = {
  listTodos:  Array< {
    __typename: "Todo",
    id: string,
    name: string,
  } | null > | null,
};
