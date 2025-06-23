"use client";

import { Button, Modal, Text } from "@mantine/core";
import { api } from "~/trpc/react";
import { TodoForm, type FormValues } from "../_components/todoForm";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { TodoItem } from "../_components/TodoItem";

const TodosPage = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const utils = api.useUtils();
  const { data: todos } = api.todo.getAll.useQuery({});
  console.log("todos: ", todos);

  const createTodo = api.todo.create.useMutation({
    onSuccess: () => {
      void utils.todo.getAll.invalidate();
      notifications.show({
        title: "Default notification",
        icon: "🌟",
        message: "Do not forget to star Mantine on GitHub! 🌟",
      });
    },
    onError() {
      notifications.show({
        color: "red",
        icon: "X",
        title: "Default notification",
        message: "Do not forget to star Mantine on GitHub! 🌟",
      });
    },
  });

  const handleSubmit = (values: FormValues) => {
    createTodo.mutate(values);
    close();
  };

  return (
    <div className="mt-8 flex h-fit w-full flex-col items-center justify-center gap-15">
      <Modal opened={opened} onClose={close} title="Todo Modal">
        {opened ? (
          <TodoForm defaultValues={undefined} onSubmit={handleSubmit} />
        ) : null}
      </Modal>

      <section>
        <Text>Todos:</Text>

        <Button
          variant="default"
          onClick={() => {
            open();
          }}
        >
          Create Todo
        </Button>
      </section>

      <ul className="flex w-[900px] flex-col gap-7 rounded-sm border-2 border-amber-400 p-4">
        {todos?.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
      </ul>
    </div>
  );
};

export default TodosPage;
