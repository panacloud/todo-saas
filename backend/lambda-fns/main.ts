import createTodo from './createTodo';
import deleteTodo from './deleteTodo';
import listTodos from './listTodos';
import Todo from './todo';

type AppSyncEvent = {
   info: {
     fieldName: string
  },
   arguments: {
     TodoId: string,
     Todo: Todo
  }
}

exports.handler = async (event:AppSyncEvent) => {
    switch (event.info.fieldName) {
        case "createTodo":
            return await createTodo(event.arguments.Todo);
        case "listTodos":
            return await listTodos();
        case "deleteTodo":
            return await deleteTodo(event.arguments.TodoId);
        default:
            return null;
    }
}