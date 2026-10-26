import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Cv, FALLBACK_CVS } from '../model/cv';

const API_URL = 'https://apilb.tridevs.net/api/personnes';

/**
 * Source unique de vérité du module CV : toute la donnée partagée
 * (liste, sélection, embauchés) vit ici sous forme de signaux.
 */
@Service()
export class CvService {
  private readonly http = inject(HttpClient);
  private readonly toastr = inject(ToastrService);

  readonly cvsResource = rxResource({
    stream: () => this.http.get<Cv[]>(API_URL),
  });
  // hasValue() est sûr même en erreur (value() lèverait une exception)
  readonly cvs = computed<readonly Cv[]>(() =>
    this.cvsResource.hasValue() ? this.cvsResource.value() : FALLBACK_CVS,
  );
  readonly isLoading = this.cvsResource.isLoading;
  readonly isFallback = computed(() => this.cvsResource.error() !== undefined);

  readonly selectedCv = signal<Cv | null>(null);

  private readonly hired = signal<readonly Cv[]>([]);
  readonly embauchees = this.hired.asReadonly();
  private readonly hiredIds = computed(() => new Set(this.hired().map((cv) => cv.id)));

  select(cv: Cv): void {
    this.selectedCv.set(cv);
  }

  isEmbauche(cv: Cv): boolean {
    return this.hiredIds().has(cv.id);
  }

  embaucher(cv: Cv): void {
    if (this.isEmbauche(cv)) {
      this.toastr.warning(`${cv.firstname} ${cv.name} est déjà embauché`);
      return;
    }
    this.hired.update((list) => [...list, cv]);
    this.toastr.success(`${cv.firstname} ${cv.name} a été embauché`);
  }

  getCvById(id: string): Observable<Cv> {
    return this.http.get<Cv>(`${API_URL}/${id}`);
  }
}
