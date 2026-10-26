import { Service, signal } from '@angular/core';
import { Cv } from '../model/cv';

@Service()
export class EmbaucheService {
  readonly #embauchees = signal<readonly Cv[]>([]);

  /** Liste des cvs pré embauchés (lecture seule pour les consommateurs) */
  readonly embauchees = this.#embauchees.asReadonly();

  /**
   * Embauche une personne si elle ne l'est pas encore.
   * Sinon retourne false.
   */
  embauche(cv: Cv): boolean {
    if (this.#embauchees().some((embauchee) => embauchee.id === cv.id)) return false;
    this.#embauchees.update((embauchees) => [...embauchees, cv]);
    return true;
  }
}
