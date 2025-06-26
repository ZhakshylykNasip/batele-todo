export type TodoEntity = {
  id: number;
  title: string;
  completed: boolean | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
  assigneeIds?: string[];
};
