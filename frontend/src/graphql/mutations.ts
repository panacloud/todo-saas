/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTodo = /* GraphQL */ `
  mutation CreateTodo($Todo: TodoInput!) {
    createTodo(Todo: $Todo) {
      id
      name
    }
  }
`;
export const deleteTodo = /* GraphQL */ `
  mutation DeleteTodo($TodoId: String!) {
    deleteTodo(TodoId: $TodoId)
  }
`;
