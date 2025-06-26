"use client";

import React, { useState, useMemo } from "react";
import {
  Button,
  Modal,
  Paper,
  Text,
  Center,
  Loader,
  Select,
} from "@mantine/core";
import { api } from "~/trpc/react";
import { TodoForm, type FormValues } from "../_components/todoForm";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { TodoItem } from "../_components/TodoItem";
import Header from "../_components/Header";

const TodosPage = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const utils = api.useUtils();

  const [authorId, setAuthorId] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  const { data: allUsers } = api.user.getAllUsers.useQuery();

  const { data: todos, isLoading } = api.todo.getAll.useQuery(
    {
      userId: authorId ?? undefined,
      assigneeId: assigneeId ?? undefined,
    },
    {
      enabled: true,
    },
  );

  const createTodo = api.todo.create.useMutation({
    onSuccess: () => {
      void utils.todo.getAll.invalidate();
      notifications.show({
        title: "Успешно",
        icon: "🌟",
        message: "Задача создана",
      });
    },
    onError() {
      notifications.show({
        color: "red",
        icon: "X",
        title: "Ошибка",
        message: "Не удалось создать задачу",
      });
    },
  });

  const handleSubmit = (values: FormValues) => {
    createTodo.mutate(values);
    close();
  };

  type SelectOption = {
    value: string;
    label: string;
  };

  const uniqueAssignees = useMemo<SelectOption[]>(() => {
    const usersMap = new Map<string, SelectOption>();

    todos?.forEach((todo) => {
      todo.assigneeIds?.forEach((id) => {
        const user = allUsers?.find((u) => u.id === id);
        if (user && !usersMap.has(user.id)) {
          usersMap.set(user.id, {
            value: user.id,
            label: user.name ?? user.email,
          });
        }
      });
    });

    return Array.from(usersMap.values());
  }, [todos, allUsers]);

  return (
    <div>
      <Header />
      <div className="mt-8 flex h-fit w-full flex-col items-center justify-center gap-15">
        <Modal opened={opened} onClose={close} title="Todo Modal">
          {opened ? (
            <TodoForm defaultValues={undefined} onSubmit={handleSubmit} />
          ) : null}
        </Modal>

        <section className="flex flex-col gap-6">
          <Button variant="filled" onClick={open}>
            Create Todo
          </Button>

          <div className="flex items-center gap-6">
            {allUsers && allUsers.length > 0 && (
              <>
                <Select
                  label="Фильтр по авторам"
                  placeholder="Выберите автора"
                  data={[
                    { value: "", label: "Все авторы" },
                    ...allUsers.map((user) => ({
                      value: user.id,
                      label: user.name ?? user.email,
                    })),
                  ]}
                  value={authorId ?? ""}
                  onChange={(value) => setAuthorId(value ?? null)}
                  searchable
                  clearable
                />

                <Select
                  label="Фильтр по исполнителям"
                  placeholder="Выберите исполнителя"
                  data={[
                    { value: "", label: "Все исполнители" },
                    ...uniqueAssignees,
                  ]}
                  value={assigneeId ?? ""}
                  onChange={(value) => setAssigneeId(value ?? null)}
                  searchable
                  clearable
                />
              </>
            )}
          </div>
        </section>

        {isLoading ? (
          <Center className="w-[900px]">
            <Loader size="lg" />
          </Center>
        ) : todos && todos.length > 0 ? (
          <Paper
            shadow="lg"
            radius="xl"
            withBorder
            p="xl"
            className="w-[900px]"
          >
            <ul className="flex flex-col gap-2">
              {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </ul>
          </Paper>
        ) : (
          <Paper
            shadow="lg"
            radius="xl"
            withBorder
            p="xl"
            className="w-[900px] text-center"
          >
            <Text component="h1">Задачи не найдены</Text>
          </Paper>
        )}
      </div>
    </div>
  );
};

export default TodosPage;
