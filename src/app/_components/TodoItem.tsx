"use client";

import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import React from "react";
import type { TodoEntity } from "types/todo.entity";
import { api } from "~/trpc/react";
import { TodoForm, type FormValues } from "./todoForm";

type Props = {
  todo: TodoEntity;
};
export const TodoItem = ({ todo }: Props) => {
  console.log("TodoItem: ", todo);
  const [opened, { open, close }] = useDisclosure(false);
  const utils = api.useUtils();

  const deleteTodo = api.todo.delete.useMutation({
    onSuccess: () => {
      void utils.todo.getAll.invalidate();
      notifications.show({
        color: "green",
        title: "🗑️ Удалено",
        message: "Задача удалена",
      });
    },
    onError: () => {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Не удалось удалить задачу",
      });
    },
  });

  const updateTodo = api.todo.update.useMutation({
    onSuccess: () => {
      void utils.todo.getAll.invalidate();
      notifications.show({
        color: "blue",
        title: "✅ Обновлено",
        message: "Задача успешно обновлена",
      });
      close();
    },
    onError: () => {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Не удалось обновить задачу",
      });
    },
  });

  const handleDelete = () => {
    deleteTodo.mutate({ id: todo.id });
  };
  const handleSubmit = (values: FormValues) => {
    updateTodo.mutate({
      id: todo.id,
      data: values,
    });
  };

  return (
    <li className="flex items-center justify-between rounded-xl border-[1px] p-2">
      <Modal opened={opened} onClose={close} title="Редактировать Задачу">
        <TodoForm
          defaultValues={{
            title: todo.title,
            completed: todo.completed ?? false,
          }}
          onSubmit={handleSubmit}
        />
      </Modal>

      <span>
        {todo?.title} {todo?.completed ? "✅" : "❌"}
      </span>

      <div className="flex gap-1.5">
        <Button onClick={open} variant="outline" color="blue" size="xs">
          ✏️
        </Button>
        <Button onClick={handleDelete} variant="outline" color="red" size="xs">
          🗑️
        </Button>
      </div>
    </li>
  );
};
