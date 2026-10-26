import { Directive, signal } from '@angular/core';

@Directive({
  selector: 'input[appRainbow]',
  host: {
    '[style.color]': 'this.color()',
    '[style.borderColor]': 'this.color()',
    '(keyup)': 'this.changeColor()',
  },
})
export class RainbowDirective {
  color = signal(this.randomColor());

  changeColor() {
    this.color.set(this.randomColor());
  }

  randomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
