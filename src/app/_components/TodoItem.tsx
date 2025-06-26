"use client";

import {
  Button,
  Modal,
  Paper,
  Text,
  Divider,
  MultiSelect,
} from "@mantine/core";
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
  console.log("todo: ", todo);
  const [opened, { open, close }] = useDisclosure(false);
  const utils = api.useUtils();
  const { data: user } = api.user.getById.useQuery({
    id: todo.userId,
  });
  const { data: allUsers } = api.user.getAllUsers.useQuery();

  console.log("user: ", user);
  console.log("allUsers: ", allUsers);

  const assignUsers = api.todo.assignUsers.useMutation({
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "✅ Назначено",
        message: "Исполнители обновлены",
      });
      void utils.todo.getAll.invalidate();
    },
    onError: () => {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Не удалось назначить исполнителей",
      });
    },
  });
  const [assigneeIds, setAssigneeIds] = React.useState<string[]>(
    todo.assigneeIds ?? [],
  );

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

  const isProcessing =
    deleteTodo.status === "pending" || updateTodo.status === "pending";

  return (
    <li>
      <Modal opened={opened} onClose={close} title="Редактировать Задачу">
        <TodoForm
          defaultValues={{
            title: todo.title,
            completed: todo.completed ?? false,
          }}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Paper
        shadow="md"
        radius="lg"
        withBorder
        p="lg"
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <Text className="text-lg font-medium text-gray-800">
            {todo.title}
          </Text>

          <div className="flex items-center gap-2">
            <Text className="text-sm text-gray-500">
              {todo.completed ? "✅ Завершено" : "❌ В процессе"}
            </Text>
            <Button
              onClick={open}
              variant="light"
              color="blue"
              size="xs"
              loading={updateTodo.status === "pending"}
              disabled={isProcessing}
            >
              ✏️
            </Button>
            <Button
              onClick={handleDelete}
              variant="light"
              color="red"
              size="xs"
              loading={deleteTodo.status === "pending"}
              disabled={isProcessing}
            >
              🗑️
            </Button>
          </div>
        </div>

        <Divider />

        <div className="mt-1.5 flex items-center gap-3">
          <img
            src={user?.image ?? ""}
            alt="author"
            className="h-10 w-10 rounded-full border object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {user?.name ?? "Неизвестный автор"}
            </p>
            <p className="text-xs text-gray-400">Автор задачи</p>
          </div>
        </div>

        <MultiSelect
          label="Кто будет сделать задачу"
          placeholder="Выберите пользователя"
          data={
            allUsers?.map((user) => ({
              value: user.id,
              label: user.name ?? user.email,
            })) ?? []
          }
          value={assigneeIds} // ✅ это теперь точно string[]
          onChange={(value: string[]) => {
            setAssigneeIds(value);
            assignUsers.mutate({
              todoId: todo.id,
              userIds: value,
            });
          }}
          searchable
        />
      </Paper>
    </li>
  );
};
