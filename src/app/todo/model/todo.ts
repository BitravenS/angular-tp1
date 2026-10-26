export type TodoStatus = 'waiting' | 'in progress' | 'done';

export interface Todo {
  id: number;
  name: string;
  content: string;
  status: TodoStatus;
}
