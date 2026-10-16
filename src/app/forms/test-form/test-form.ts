import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';

export interface Section {
  name: string;
  level: number;
}

@Component({
  imports: [FormField,JsonPipe],
  selector: 'app-test-form',
  styleUrl: './test-form.css',
  templateUrl: './test-form.html',
})
export class TestForm {
  // Value Form avec un signal
  section = signal<Section>({
    name: 'GLLLLLLL',
    level: 4
  });
  // On crée le fieldState avec form
  sectionForm = form(this.section, form =>  {
    required(form.name),
    maxLength(form.name,4, {
      message: 'Le champ ne peut pas dépasser 4 caractère'
    })
  });
  showForm() {
    console.log({fieldTree:this.sectionForm});
    console.log({ fieldState: this.sectionForm() });
    console.log({ value: this.sectionForm().value() });
    console.log({ dirty: this.sectionForm().dirty() });
    console.log({ valid: this.sectionForm().valid() });
    console.log({ touched: this.sectionForm().touched() });
    console.log({ leveltouched: this.sectionForm.level().touched() });

  }
}
