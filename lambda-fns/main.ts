import { listTodos } from './listTodos';
import { createTodo } from './createTodo';
import { deleteTodo } from './deleteTodo';

	
    type Event = {
        info: {
          fieldName: string
       }
     }

exports.handler = async (event:Event) => {
switch (event.info.fieldName) {

	
          case "listTodos":
              return await listTodos();
          
	
          case "createTodo":
              return await createTodo();
          
	
          case "deleteTodo":
              return await deleteTodo();
          

}
}
