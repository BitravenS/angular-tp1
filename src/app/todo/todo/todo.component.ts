import { Component, inject, signal } from '@angular/core';
import { TodoService } from '../service/todo.service';
import { RainbowDirective } from '../../directives/rainbow.directive';

@Component({
  selector: 'app-todo',
  imports: [RainbowDirective],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent {
  todoService = inject(TodoService);

  name = signal('');
  content = signal('');

  addTodo() {
    this.todoService.addTodo(this.name(), this.content());
    this.name.set('');
    this.content.set('');
  }
}
