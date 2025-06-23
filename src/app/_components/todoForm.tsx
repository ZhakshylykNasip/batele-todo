import { Button, Checkbox, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  completed: z.boolean() || null,
});

export type FormValues = z.infer<typeof schema>;

type Props = {
  onSubmit: (values: FormValues) => void;
  defaultValues?: Partial<FormValues>;
};

const initialValues: FormValues = {
  title: "",
  completed: false,
};

export const TodoForm = ({ onSubmit, defaultValues = {} }: Props) => {
  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      ...initialValues,
      ...defaultValues,
    },
    validate: zodResolver(schema),
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <TextInput
        style={{ width: "200px" }}
        label="title"
        placeholder="Enter your title... "
        {...form.getInputProps("title")}
      />

      <Checkbox
        mt="md"
        label="Completed"
        {...form.getInputProps("completed", { type: "checkbox" })}
      />
      <Group mt="md">
        <Button type="submit">
          {defaultValues?.title ? "Update" : "Create"}
        </Button>
      </Group>
    </form>
  );
};
