import createTodo from './createTodo';
import deleteTodo from './deleteTodo';
import listTodos from './listTodos';
import Todo from './todo';
const axios =  require("axios")
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

    const data = await axios.post(`http://sandbox:8080`, event)
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