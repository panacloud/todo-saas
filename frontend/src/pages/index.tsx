import React, { useEffect, useState } from "react";
// import { DocumentNode, gql } from "@apollo/client";
import { API } from "aws-amplify";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  makeStyles,
  CircularProgress,
  Grid,
  IconButton,
} from "@material-ui/core";
import shortId from "shortid";
import { listTodos } from "../graphql/queries";
import { createTodo, deleteTodo } from "../graphql/mutations";
import DeleteIcon from "@material-ui/icons/Delete";

const MyStyle = makeStyles(() => ({
  mainContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },

  formContainer: {
    background: "#f3f3f3",
    width: "100%",
    maxWidth: "600px",
    borderRadius: "5px",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "600px",
    marginTop: "20px",
  },
  Datalist: {
    background: "#f9f9f9",
    padding: "10px 20px",
    marginBottom: "4px",
    // borderBottom: "1px solid #f3f3f3",
  },
  loadingWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "10px",
    height: "100px",
  },
}));

const Index = () => {
  const classes = MyStyle();
  const [data, setData] = React.useState<any>();
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const data: any = await API.graphql({ query: listTodos });
      setData({ todos: data.data.listTodos });
    })();
  }, [setData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id: string = shortId.generate();
    setLoading(true);
    const res: any = await API.graphql({
      query: createTodo,
      variables: { Todo: { id: id, name: name } },
    });
    let readonly = await data.todos.map((item) => {
      return item;
    });
    // inserting response in the state
    await readonly.push(res.data.createTodo);
    if (readonly) {
      setData({ todos: readonly });
      setLoading(false);
      setName("");
    }
  };
  const handleDelete = async (id) => {
    setLoading(true);
    await API.graphql({
      query: deleteTodo,
      variables: { TodoId: id },
    });
    let Datadel = await data.todos.filter((item) => {
      return item.id !== id;
    });
    if (Datadel) {
      setData({ todos: Datadel });
      setLoading(false);
    }
  };

  return (
    <div>
      <Container>
        <div className={classes.mainContainer}>
          <Box py={8}>
            <Typography variant="h5">SERVERLESS GRAPHQL TODO APP</Typography>
          </Box>
          <div className={classes.formContainer}>
            <Box p={4}>
              <form onSubmit={handleSubmit}>
                <Box pb={2}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    label="Message"
                    name="task"
                    required
                  />
                </Box>
                <Button type="submit" variant="contained" color="primary">
                  add task
                </Button>
              </form>
            </Box>
          </div>
          <div className={classes.contentWrapper}>
            <Box py={1}>
              {!data || loading ? (
                <div className={classes.loadingWrapper}>
                  <CircularProgress />
                </div>
              ) : (
                data.todos.map((todos) => (
                  <div key={todos.id} className={classes.Datalist}>
                    <Grid container>
                      <Grid item xs={10} container alignItems="center">
                        <Typography>{todos.name}</Typography>
                      </Grid>
                      <Grid container justify="flex-end" item xs={2}>
                        <IconButton onClick={() => handleDelete(todos.id)}>
                          <DeleteIcon color="secondary" fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </div>
                ))
              )}
            </Box>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Index;
