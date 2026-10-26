export interface Cv {
  id: number;
  name: string;
  firstname: string;
  age: number;
  cin: number;
  job: string;
  path: string;
}

/** Données de secours si l'API est indisponible. */
export const FALLBACK_CVS: readonly Cv[] = [
  { id: 1, name: 'Sellaouti', firstname: 'Aymen', age: 43, cin: 12345678, job: 'Assistant Professor', path: '' },
  { id: 2, name: 'Bailly', firstname: 'Stephan', age: 20, cin: 12345699, job: 'Informaticien', path: '' },
  { id: 3, name: 'Chouakria', firstname: 'Farid', age: 52, cin: 12345690, job: 'Informaticien', path: '' },
];
