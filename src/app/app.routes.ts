import { Routes } from '@angular/router';
import { Pere } from './commInterCompo/pere/pere';
import { Fils } from './commInterCompo/fils/fils';
import { Som } from './components/som/som';
import { First } from './first/first';

export const routes: Routes = [
  {path: '', component: Pere},
  {path: 'fils', component: Fils, children: [
    {path: 'som', component: Som }
  ] },
  {path: 'som', component: Som },
  {path: 'hello/:name', component: First},
];
