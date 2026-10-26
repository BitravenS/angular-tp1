import { Todo } from './todo';

describe('Todo', () => {
  it('should create a todo object', () => {
    const todo: Todo = { id: 1, name: 'name', content: 'content', status: 'waiting' };
    expect(todo).toBeTruthy();
  });
});
