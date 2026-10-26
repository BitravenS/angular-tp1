import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, tap } from 'rxjs';
import { API } from '../../config/api.config';
import { Cv } from '../model/cv';

@Service()
export class CvService {
  private readonly http = inject(HttpClient);

  private readonly fakeCvs: readonly Cv[] = [
    new Cv(1, 'aymen', 'sellaouti', 'teacher', 'as.jpg', '1234', 40),
    new Cv(2, 'skander', 'sellaouti', 'enfant', '       ', '1234', 4),
  ];

  /** La liste des cvs de l'API, chargée une seule fois et rechargeable (reload) */
  readonly cvsResource = rxResource({
    stream: () => this.http.get<Cv[]>(API.cv),
  });

  /** true si l'API a échoué : on affiche alors les cvs fictifs */
  readonly isFallback = computed(() => this.cvsResource.error() !== undefined);

  /** Les cvs à afficher : ceux de l'API, sinon les cvs fictifs */
  readonly cvs = computed<readonly Cv[]>(() =>
    this.cvsResource.hasValue() ? this.cvsResource.value() : this.fakeCvs,
  );

  readonly #selectedCv = signal<Cv | null>(null);

  /** Le dernier cv sélectionné (remplace le Subject selectCv$) */
  readonly selectedCv = this.#selectedCv.asReadonly();

  selectCv(cv: Cv): void {
    this.#selectedCv.set(cv);
  }

  /** Retourne un cv par son id de l'API */
  getCvById(id: number): Observable<Cv> {
    return this.http.get<Cv>(API.cv + id);
  }

  /** Supprime un cv par son id de l'API puis recharge la liste */
  deleteCvById(id: number): Observable<unknown> {
    return this.http.delete(API.cv + id).pipe(
      tap(() => {
        // Un cv supprimé ne doit plus rester sélectionné
        if (this.#selectedCv()?.id === id) this.#selectedCv.set(null);
        this.cvsResource.reload();
      }),
    );
  }

  /** Ajoute un cv puis recharge la liste */
  addCv(cv: Cv): Observable<Cv> {
    return this.http.post<Cv>(API.cv, cv).pipe(tap(() => this.cvsResource.reload()));
  }

  /** Recherche les cvs dont le name contient la chaine passée en paramètre */
  selectByName(name: string): Observable<Cv[]> {
    const search = `{"where":{"name":{"like":"%${name}%"}}}`;
    const params = new HttpParams().set('filter', search);
    return this.http.get<Cv[]>(API.cv, { params });
  }
}
