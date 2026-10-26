import { Injectable, computed, inject, signal } from '@angular/core';
import { Todo, TodoStatus } from '../model/todo';
import { LoggerService } from '../../services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private loggerService = inject(LoggerService);

  private nextId = 1;

  
  private todos = signal<Todo[]>([]);

  
  waitingTodos = computed(() =>
    this.todos().filter((todo) => todo.status === 'waiting')
  );
  inProgressTodos = computed(() =>
    this.todos().filter((todo) => todo.status === 'in progress')
  );
  doneTodos = computed(() =>
    this.todos().filter((todo) => todo.status === 'done')
  );

  
  addTodo(name: string, content: string): void {
    const todo: Todo = { id: this.nextId++, name, content, status: 'waiting' };
    this.todos.update((todos) => [...todos, todo]);
  }

 
  changeStatus(todo: Todo, status: TodoStatus): void {
    this.todos.update((todos) =>
      todos.map((t) => (t.id === todo.id ? { ...t, status } : t))
    );
  }

 
  deleteTodo(todo: Todo): void {
    this.todos.update((todos) => todos.filter((t) => t.id !== todo.id));
  }


  logTodos() {
    this.loggerService.logger(this.todos());
  }
}
