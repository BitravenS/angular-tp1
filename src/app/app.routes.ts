import { Routes } from '@angular/router';
import { Pere } from './commInterCompo/pere/pere';
import { Fils } from './commInterCompo/fils/fils';
import { Som } from './components/som/som';
import { First } from './first/first';
import { TestForm } from './forms/test-form/test-form';

export const routes: Routes = [
  {path: '', component: Pere},
  {path: 'fils', component: Fils, children: [
    {path: 'som', component: Som }
  ] },
  {path: 'som', component: Som },
  {path: 'form', component: TestForm },
  {path: 'hello/:name', component: First},
];
