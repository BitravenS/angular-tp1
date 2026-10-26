# TP1 (GL4 2026/2027) — TTC Calculator + cvTech Refactoring with Signals

Branch of work: `claude/ttc-cv-signals-refactor-54ak8n` (starts at `aziz/signals`, commit `cd1f2fa`).
Stack: Angular 22.2, standalone components, zoneless (no `zone.js` in the project), Signal Forms, Bootstrap 5, ngx-toastr, Vitest.

> Rule #1 of the professor: *"if you read your code to explain it, it is not your code → 0."*
> This report is a study guide. Read §2–§5 until you can re-explain every file **without looking at it**, then train with the Q&A in §7.

---

## 0. Read this first — what was done, and what differs from the brief

| Topic | Reality |
|---|---|
| Where the real CV code is | The course repo's **`master` branch** (commit `8e98558`, *"Replace ngGl42627 with the correct TP starter"*) holds the real **cvTech starter**: an Angular **18, NgModule/RxJS** app (`src/app/cv/…`, `src/app/auth/…`, `navbar`). The branches `aziz/signals`, `migration`, `rxjs` are all at `cd1f2fa` (the lecture sandbox) and contain **no CV code**. So "refactoring the CV with signals" meant **porting that starter's `cv` folder onto the Angular 22 branch and refactoring it with signals**. |
| Branch | You asked for `malek/signal` from `aziz/signal`. The remote branch is named **`aziz/signals`** (with an *s*). This session may only push to `claude/ttc-cv-signals-refactor-54ak8n` (same starting commit). To get your branch: `git switch -c malek/signal` from it and push. |
| Auth | The CV code depends on `AuthService.isAuthenticated()` (details page "Delete" button, "Add CV" guard, navbar). So a **signal-based `AuthService`** (+ login, functional guard/interceptor, navbar) was also ported; it also covers the slide-13 requirements (id + email saved, authenticated or not, reloaded at startup, no state library). |
| Not ported | Everything in the starter unrelated to CV/auth (todo, products, rxjs demos, optimizationPattern, templates, color, service worker…), and the rainbow-directive / Todo exercises of slides 8 and 10. |
| Known gap in the starter | `add-cv.component.html` displays an error for a cross-field validator `cinFirstCars`, but the starter's TS never defines it. It is **not invented** here: the form validates required fields and `cin` = 8 digits only. |
| Existing tests | 4 tests **already failed on the base branch** (`App` ×2, `First`, `Pere`: missing providers / outdated "Hello" assertion). Not touched. The other 35 tests pass, including the 27 new ones. |
| Tooling | `npm ci` needs `--legacy-peer-deps` (`ngx-toastr@20` declares a peer on Angular 21). The Angular 22 CLI needs Node ≥ 22.22.3 (the sandbox had 22.22.0; Node 24 was used). `package.json` was **not** modified. |
| Push status | At the time of writing, the push to GitHub was refused (403: the Claude GitHub App has no access to the repo). The commits exist locally on the branch. |

---
## 1. Lab requirements (from the PDF)

**Slide 11 – TTC (signal branch):** a component computing the TTC price of a product from quantity and VAT. The user can change every value; defaults: quantity **1**, price **0**, VAT **18**. Quantity **between 10 and 15 → 20 % discount**; **above 15 → 30 %**. Mock-up: three inputs (Prix HT / Quantité / TVA) and three result boxes (unit price TTC, total TTC, discount); with 100 / 10 / 18 it shows **$118.00 / $1,180.00 / $0.00**.

**Slide 12 – CV (signal branch):** take the cvTech app (the `Cv` folder) and use signals where necessary. *"Think about the signal architecture."*

**Slide 13 – Auth (context):** analyse `auth`, navbar and details; use signals; keep the authenticated user's id and email and whether they are authenticated; reload the state when the app loads; **no state-management library**.

**Rules (slide 2):** coherent architecture, clean/factored code, design patterns are a duty, you must master the subject like in an interview.

---

## 2. Signals primer (what you must master)

| Concept | One-liner | Used where |
|---|---|---|
| `signal(v)` | Writable reactive value. Read `s()`, write `s.set(x)` / `s.update(fn)`. Never mutate in place (no `mutate`). | `selectedCv`, `hired`, `filter`, TTC `model` |
| `computed(fn)` | Read-only, **lazy**, **memoized** derived value; dependencies are tracked automatically on each run. | `pricing`, `cvs`, `isFallback`, `filteredCvs`, `hiredIds` |
| `effect(fn)` | Side effect re-run when its signals change. For syncing with the outside world (DOM, toasts, router) — *not* for deriving state. | 2 legitimate uses: toast when the API fails (`CvComponent`), navigate away when a CV is not found (`DetailsCv`) |
| `linkedSignal` | Writable signal that resets from a source signal. | Not needed here (CLAUDE.md: use for state derived from several sources that must stay synchronized) |
| `input()` / `input.required()` | Signal-based component inputs (replace `@Input`). | all CV components, `DetailsCv.id` |
| `output()` | Event emitter (replaces `@Output` + `EventEmitter`). | `choose`, `selected`, `hire` |
| `model()` | Two-way bound signal (`[(x)]`). | not needed |
| `resource` / `rxResource` | Async data as signals: `value()`, `isLoading()`, `error()`, `status()`, `hasValue()`. `rxResource` takes an Observable `stream`. | `CvService.cvsResource`, `DetailsCv.cvResource` |
| Signal Forms (`@angular/forms/signals`) | A `form(modelSignal, schema)` wraps a signal model; `[formField]` binds an input to a field; validators like `min()`. | TTC |

**Why signals instead of zone-based change detection?** A signal read in a template registers that template as a consumer. When the signal changes, only the consumers are marked dirty → fine-grained updates, no need for `zone.js`, glitch-free (a `computed` is never observed in an inconsistent state), and no manual `subscribe/unsubscribe`.

**Zoneless:** `angular.json` has no `zone.js` polyfill and `app.config.ts` provides no zone provider, so the app runs zoneless (Angular 22 default). Signals are what make this work: they notify the scheduler when state changes. CLAUDE.md also says not to set `OnPush` explicitly (default in v22) and not to put `standalone: true` (default).

---

## 3. TTC Calculator

### 3.1 Files

```
src/app/ttc/
  ttc.pricing.ts       pure business logic (no Angular)
  ttc.ts               component: form model + computed
  ttc.pricing.spec.ts  unit tests of the logic
  ttc.spec.ts          component tests
```
Route: `/ttc`, **lazy-loaded** (`loadComponent`).

### 3.2 Design decision: separate logic from UI

All maths is in `ttc.pricing.ts` as pure functions. Reasons: testable without TestBed, reusable (e.g. by a cart), the component stays a thin binding layer (single responsibility).

```ts
export const DISCOUNT_TIERS: readonly DiscountTier[] = [
  { above: 15, rate: 0.3 },
  { above: 10, rate: 0.2 },
];

export function discountRateFor(quantity: number): number {
  return DISCOUNT_TIERS.find((tier) => quantity > tier.above)?.rate ?? 0;
}

export function computePricing(priceHt, quantity, vat): Pricing {
  const price = sanitize(priceHt);
  const qty = sanitize(quantity);
  const unitTtc = price * (1 + sanitize(vat) / 100);
  const gross = unitTtc * qty;
  const discountRate = discountRateFor(qty);
  const discount = gross * discountRate;
  return { unitTtc, discountRate, discount, total: gross - discount };
}
```

* **Data-driven discount table** instead of `if/else if` chains → adding a 40 % tier above 50 is one line (open/closed principle; a light *Strategy*/table-driven approach).
* Tiers sorted from highest to lowest so `find` returns the first (highest) match.
* `sanitize` turns `NaN` (empty `<input type=number>`), negatives and `Infinity` into `0` so the UI never shows `NaN`.

### 3.3 The boundary decision (be ready to defend it)

The text says "*entre 10 et 15 → 20 %*" and "*supérieur à 15 → 30 %*". The mock-up shows **quantity 10 → Discount $0.00**. So 10 is **excluded** from the first tier. Final rule:

| Quantity | Rate |
|---|---|
| ≤ 10 | 0 % |
| 11 – 15 | 20 % |
| ≥ 16 | 30 % |

This is covered by `it.each` tests (1, 10, 11, 15, 16, 100). If your professor says 10 should be included, change `above: 10` to `above: 9` (quantities are integers) — one token.

*Total shown = gross TTC − discount* (at 12 pieces, 100 HT, 18 %: 12 × 118 = 1416; discount 283.20; total 1132.80 — verified in a real browser).

### 3.4 The component

```ts
private readonly model = signal<TtcModel>({ prixHt: 0, quantite: 1, tva: 18 });

protected readonly ttcForm = form(this.model, (path) => {
  min(path.prixHt, 0);
  min(path.quantite, 0);
  min(path.tva, 0);
});

protected readonly pricing = computed(() => {
  const { prixHt, quantite, tva } = this.model();
  return computePricing(prixHt, quantite, tva);
});
```

* `model` is the **single source of truth**. `form(model, schema)` gives a `FieldTree`; `[formField]="ttcForm.prixHt"` two-way-binds the input to `model().prixHt` (and applies number parsing for `type="number"`).
* `pricing` is a `computed`: when any field changes, `model` changes → `pricing` is recomputed lazily when the template reads it. **No event handlers, no `ngModel`, no `valueChanges`, no `ngOnChanges`.**
* Template uses `currency` (gives the `$118.00` format of the mock-up) and `percent` pipes, native `@if`, `<label for>` on each input (accessibility), `aria-live="polite"` on the results so screen readers announce changes.
* Bootstrap colour utilities (`bg-*-subtle text-*-emphasis`) reproduce the blue/green/red boxes while keeping WCAG AA contrast.
* `private`/`protected`: only what the template needs is exposed (`protected`), nothing is public by accident.

---

## 4. The cvTech port and its signal architecture

### 4.1 What the starter did (RxJS/NgModule) → what it does now

| Starter (Angular 18, NgModule) | This branch (Angular 22, signals) |
|---|---|
| `CvService.selectCv$` = private `Subject` + `asObservable()`; `CvComponent` subscribed manually | `selectedCv` = private writable `signal` exposed with `asReadonly()`; read directly in the template |
| `CvComponent` constructor: `getCvs().subscribe(...)` with `next/error`, fake cvs on error + toast | `rxResource` in the service; `cvs` = `computed` (API list, else fake list); `isFallback` = `computed`; the error toast is an `effect` |
| `EmbaucheService.embauchees: Cv[]` mutated with `push` and returned **by reference** (the component held that array) | `signal<readonly Cv[]>` updated immutably; `embauchees` exposed read-only |
| `@Input()` / `@Output()` decorators, `*ngIf`, `*ngFor`, `ngClass`, `ngStyle` | `input()`, native `@if/@for`, `[class.x]`, `[style]`/width+height attributes |
| Constructor injection | `inject()` |
| `DetailsCvComponent`: `ActivatedRoute.snapshot.params['id']` once in `ngOnInit` + `subscribe` | route param bound to `input()` and fed to a reactive `rxResource` (re-fetches if the id changes) |
| `AddCvComponent`: `FormBuilder` + getters `name`, `firstname`… | Signal Form: a model signal + schema validators, no getters |
| `AuthService.isAuthenticated()` read `localStorage` on **every** call | `isAuthenticated` is a `computed` over one state signal restored once at startup |
| `AuthGuard` class + `AuthInterceptor` class with `HTTP_INTERCEPTORS` | functional `CanActivateFn` + `HttpInterceptorFn` |
| NgModule `declarations` + `AppRoutingModule` | standalone components, lazy `loadChildren`/`loadComponent` |

### 4.2 Files

```
src/app/config/            api.config.ts, const.config.ts, routes.config.ts
src/app/cv/
  model/cv.ts              Cv class (unchanged from the starter)
  pipes/default-image.pipe.ts
  services/cv.service.ts         ← cvs, selectedCv, API calls
  services/embauche.service.ts   ← embauchees
  cv/cv.ts                 page (list + autocomplete + card + embauchés)
  list/list.ts             list of cvs
  item/item.ts             one cv (click = select)
  cv-card/cv-card.ts/.html rotating card + "embaucher" + "détails"
  embauche/embauche.ts     pré-embauchés
  details-cv/              /cv/:id, delete if authenticated
  add-cv/                  /cv/add (guarded), Signal Form
  autocomplete/autocomplete.ts   search by name
  cv.routes.ts             lazy child routes
src/app/auth/
  services/auth.service.ts       ← user state as signals
  guards/auth.guard.ts           functional guard
  interceptors/auth.interceptor.ts   functional interceptor
  login/login.ts                 Signal Form
  dto/*.ts
src/app/components/navbar/navbar.ts
public/assets/images/      cv.png (default avatar), as.jpg, tim_logo.png, rotating_card_thumb2.png
src/styles/rotating-card.css   (imported from styles.css)
```

### 4.3 Where each piece of state lives (the "architecture of the signal")

Rule: *state needed by several components or that must survive navigation → signal in a root service; state used by one component → local signal; everything derivable → `computed`.*

| State | Owner | Kind | Why there |
|---|---|---|---|
| list of cvs, loading/error | `CvService.cvsResource` | `rxResource` | async data, loaded once, reloadable |
| `cvs` shown | `CvService.cvs` | `computed` | API value or fake fallback; never stored twice |
| `isFallback` | `CvService` | `computed` | derived from `error()` |
| selected cv | `CvService.#selectedCv` (+ `selectedCv` read-only) | `signal` | written by `Item` and `Autocomplete`, read by `CvComponent`/card; survives `/cv` ↔ `/cv/:id` |
| hired cvs | `EmbaucheService.#embauchees` | `signal` | written by the card, read by `Embauche` |
| auth state (token, userId, email) | `AuthService.#state` | `signal` | read by navbar, details, guard, interceptor |
| `isAuthenticated`, `token`, `userId`, `email` | `AuthService` | `computed` | derived from `#state` |
| search text | `Autocomplete.model` | `signal` (form model) | local to the search box |
| one cv on the details page | `DetailsCv.cvResource` | `rxResource` keyed on `id()` | local; changes with the route |
| form values | `AddCv.model`, `Login.credentials` | `signal` (form model) | local |

Data flow (unidirectional, events up):

```
Item ──click──▶ CvService.selectCv() ──▶ #selectedCv (signal) ──▶ CvComponent.selectedCv ──▶ CvCard [cv]
CvCard ──embaucher()──▶ EmbaucheService.embauche() ──▶ #embauchees ──▶ Embauche
Autocomplete ──typing (debounced)──▶ rxResource ──▶ results ──click──▶ CvService.selectCv()
CvService.cvsResource ──▶ cvs (computed) ──▶ CvComponent ──[cvs]──▶ List ──[cv]──▶ Item
```

### 4.4 `CvService` (read this one until you can write it)

```ts
@Service()
export class CvService {
  private readonly http = inject(HttpClient);
  private readonly fakeCvs: readonly Cv[] = [ new Cv(1,…), new Cv(2,…) ];

  readonly cvsResource = rxResource({ stream: () => this.http.get<Cv[]>(API.cv) });
  readonly isFallback = computed(() => this.cvsResource.error() !== undefined);
  readonly cvs = computed<readonly Cv[]>(() =>
    this.cvsResource.hasValue() ? this.cvsResource.value() : this.fakeCvs);

  readonly #selectedCv = signal<Cv | null>(null);
  readonly selectedCv = this.#selectedCv.asReadonly();
  selectCv(cv: Cv): void { this.#selectedCv.set(cv); }

  getCvById(id: number)  { return this.http.get<Cv>(API.cv + id); }
  deleteCvById(id: number) { return this.http.delete(API.cv + id).pipe(tap(() => {
      if (this.#selectedCv()?.id === id) this.#selectedCv.set(null);
      this.cvsResource.reload(); })); }
  addCv(cv: Cv) { return this.http.post<Cv>(API.cv, cv).pipe(tap(() => this.cvsResource.reload())); }
  selectByName(name: string) { /* GET with a LoopBack `filter` query param */ }
}
```

* **`@Service()`** — Angular 22's decorator for root singletons (replaces `@Injectable({providedIn:'root'})`).
* **`rxResource`** replaces `getCvs().subscribe(...)`. It exposes `value/isLoading/error/status/hasValue/reload` as signals and unsubscribes on its own. Because the service is a root singleton the list is fetched **once**, not at every visit of `/cv`; hence `reload()` after add/delete so the list never goes stale (the starter re-fetched in the page constructor).
* **`hasValue()` and not `value()`** — reading `value()` of a resource in the error state **throws**; `hasValue()` is safe and lets us fall back to `fakeCvs`.
* **Mutations stay Observables** (`add`, `delete`, `getCvById`, `selectByName`): a one-shot request is an *event*, not *state*; signals model state. We use `tap` to update state on success.
* **`#selectedCv` + `asReadonly()`** — only the service writes; components can read. It replaces the `Subject`+`asObservable()` idiom. Behavioural difference: a `Subject` has no value (a late subscriber misses past selections, so a freshly created `CvComponent` showed no card); a signal **keeps** the last selection, so coming back from `/cv/3` still shows the selected card.
* On delete, the selection is cleared if it was the deleted cv (a stale selected card would be a bug).

### 4.5 `EmbaucheService`

```ts
@Service()
export class EmbaucheService {
  readonly #embauchees = signal<readonly Cv[]>([]);
  readonly embauchees = this.#embauchees.asReadonly();
  embauche(cv: Cv): boolean {
    if (this.#embauchees().some((e) => e.id === cv.id)) return false;
    this.#embauchees.update((list) => [...list, cv]);
    return true;
  }
}
```
Two real fixes versus the starter: (1) the duplicate check compares **ids**, not references (`indexOf` fails for a cv re-fetched from the API); (2) the array is **replaced** instead of `push`ed — signals detect change by `Object.is`, so an in-place mutation would not notify anyone (and the starter only worked because the component kept the same array reference and the zone triggered change detection).

### 4.6 Components

* **`CvComponent`** (smart/page): injects `CvService`, `ToastrService`, `Logger`; exposes `cvs` and `selectedCv` (the service's signals); template `<app-list [cvs]="cvs()"/>`, `<app-cv-card [cv]="selectedCv()"/>`, `<app-embauche/>`. The error toast is an **`effect`**:
  ```ts
  effect(() => { if (this.cvService.isFallback()) this.toastr.error('…données fictives…'); });
  ```
  A legitimate effect: it talks to the outside world (a toast) when state changes; it does not write any signal.
* **`List`**: `cvs = input<readonly Cv[]>([])`; `@for (cv of cvs(); track cv.id)`; the zebra striping uses `$odd` and `[class.list-group-item-primary]` (no `ngClass`).
* **`Item`**: `cv = input.required<Cv>()`, `size = input(50)`; the click calls `cvService.selectCv(this.cv())`. The root is a `<button>` (keyboard accessible; the starter used a clickable `div`). Image: `NgOptimizedImage` with `[ngSrc]`, `[width]`/`[height]` bound to `size()` — this also fixes the starter's `heigth` typo in its `ngStyle`.
* **`CvCard`**: `cv = input<Cv | null>(null)`; `@if (cv(); as cv)`; `embaucher()` calls `EmbaucheService.embauche()` and toasts success/warning. "détails" is an `<a [routerLink]>` (a link navigates; the starter put `routerLink` on a `button`).
* **`Embauche`**: `embauchees = inject(EmbaucheService).embauchees` (the signal itself is bound), `@if (embauchees().length)`, `@for … track embauchee.id`.
* **`DefaultImagePipe`**: unchanged, pure pipe; empty/blank `path` → `cv.png`.
* **`DetailsCv`**:
  ```ts
  id = input.required({ transform: numberAttribute });   // route param :id → number
  private readonly cvResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.cvService.getCvById(params),
  });
  protected readonly cv = computed(() => this.cvResource.hasValue() ? this.cvResource.value() : null);
  constructor() { effect(() => { if (this.cvResource.error()) this.router.navigate([APP_ROUTES.cv]); }); }
  ```
  `withComponentInputBinding()` (already in `app.config.ts`) copies the `:id` URL segment into the `id` input; `numberAttribute` converts the string (replaces the starter's `+id`). `params` makes the request reactive (re-fetch and cancel the previous one if the id changes while the component stays alive). Error → back to the list, as in the starter. The **Delete** button shows only `@if (authService.isAuthenticated())`.
* **`AddCv`** (Signal Form):
  ```ts
  private readonly model = signal<AddCvModel>({ name:'', firstname:'', path:'', job:'', cin:'', age:0 });
  protected readonly addForm = form(this.model, (path) => {
    required(path.name); required(path.firstname); required(path.job);
    required(path.cin); pattern(path.cin, /^[0-9]{8}$/); required(path.age);
  });
  ```
  Same rules as the starter (`name/firstname/job` required, `cin` 8 digits, `age` required). Template: `[formField]`, `<label for>`, error blocks `@if (field().touched() && field().invalid())` with `role="alert"`, submit disabled while `addForm().invalid()`. `addCv()` builds a `Cv` (note the constructor order `id, firstname, name, job, path, cin, age`), posts, then navigates to `/cv` and toasts.
* **`Autocomplete`** (the starter's component was an empty stub: a form with a `search` control and unused rxjs imports; it is completed here with signals):
  ```ts
  private readonly model = signal({ search: '' });
  protected readonly searchForm = form(this.model, (path) => { debounce(path.search, 300); });
  private readonly searchResource = rxResource({
    params: () => this.model().search.trim() || undefined,   // undefined ⇒ resource stays idle
    stream: ({ params }) => this.cvService.selectByName(params),
  });
  ```
  `debounce(…, 300)` is the Signal-Forms replacement of `debounceTime(300)`: the model signal changes only 300 ms after the last keystroke. The resource re-runs (cancelling the in-flight request, i.e. the role of `switchMap`) when the value changes; `distinctUntilChanged` is implicit because a signal doesn't notify for an equal value. Clicking a result calls `selectCv`.

### 4.7 Auth (signals, no state library)

```ts
const STORAGE_KEY = 'auth';
function restoreState(): AuthState | null { /* JSON.parse in try/catch + shape check */ }

@Service()
export class AuthService {
  readonly #state = signal<AuthState | null>(restoreState());   // reloaded when the app loads
  readonly isAuthenticated = computed(() => this.#state() !== null);
  readonly token  = computed(() => this.#state()?.token  ?? null);
  readonly userId = computed(() => this.#state()?.userId ?? null);
  readonly email  = computed(() => this.#state()?.email  ?? null);

  login(credentials) { return this.http.post<LoginResponseDto>(API.login, credentials)
      .pipe(tap((r) => { /* #state.set({token:r.id, userId:r.userId, email:credentials.email}); persist */ })); }
  logout() { this.#state.set(null); /* remove from localStorage */ }
}
```
* The API's login response contains `{id (the token), ttl, created, userId}` but **no email**, so the email comes from the submitted credentials.
* One JSON entry (`auth`) is saved; the starter used a bare `token` key. Corrupted or incomplete JSON is treated as "not logged in" (tested).
* `authGuard` (functional): `inject(AuthService).isAuthenticated() || router.createUrlTree(['login'])` — returning a `UrlTree` is the recommended redirect (the starter called `router.navigate` and returned `false`).
* `authInterceptor` (functional): adds `Authorization: <token>` when a token exists; registered with `provideHttpClient(withInterceptors([authInterceptor]))` (the starter used `withInterceptorsFromDi` + `HTTP_INTERCEPTORS`).
* `Navbar` reads `authService.isAuthenticated()` / `email()`; the "Logout" is a `<button>`.
* **Why no effect to persist?** Persistence happens directly in `login`/`logout` where the state changes; an effect would add an asynchronous hidden step for no benefit.

### 4.8 Routing & lazy loading

```ts
{ path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.Login) },
{ path: 'ttc',   loadComponent: () => import('./ttc/ttc').then(m => m.Ttc) },
{ path: 'cv',    loadChildren: () => import('./cv/cv.routes').then(m => m.CV_ROUTES) },
```
```ts
export const CV_ROUTES: Routes = [
  { path: '',    loadComponent: … CvComponent },
  { path: 'add', canActivate: [authGuard], loadComponent: … AddCv },   // before ':id' on purpose
  { path: ':id', loadComponent: … DetailsCv },
];
```
`add` must be declared **before** `:id`, otherwise `/cv/add` would match `:id`. Each page is its own chunk.

### 4.9 The remaining plumbing

`app.config.ts` gained `provideHttpClient(withInterceptors([authInterceptor]))`. `App` now imports only what its template uses (`RouterOutlet`, `Navbar`, `TestHttp`). `styles.css` imports `styles/rotating-card.css` (the starter's card/flip CSS) and the three images the starter's cvs reference were copied under `public/assets/images/` (Angular 22 serves `public/` as the asset root).

---

## 5. Tests and verification performed

Unit tests (Vitest, 35 passing + the 4 pre-existing failures):
* `ttc.pricing.spec.ts`, `ttc.spec.ts` — see §3.
* `cv.service.spec.ts` — API success; API failure → fake cvs + `isFallback`; selection; **delete** (DELETE request, selection cleared, list reloaded); **add** (POST then list reloaded).
* `embauche.service.spec.ts` — empty at start, hire once, id-based identity, a new array on every hire.
* `default-image.pipe.spec.ts` — path kept / blank → `cv.png`.
* `auth.service.spec.ts` — default state, login stores id/email/token, state reloaded from storage, corrupted storage ignored, logout clears.

Real browser (Playwright/Chromium against `ng serve`, real API):
* TTC: 12 pieces → $1,132.80 total / $283.20 discount (20 %); 10 pieces → $0 discount.
* `/cv`: 11 cvs loaded; clicking an item shows the card; "embaucher" twice → one hired entry + a success toast + a warning toast; the autocomplete finds "Bailly" and selecting it shows its card.
* `/cv/add` without login → redirected to `/login`; with a stored session → page shown, navbar shows the email, **Add Cv** and **Logout**; a 3-digit CIN shows the error and keeps the submit button disabled.
* `/cv/1330` → details; **Delete** button visible when logged in (not clicked — the API is shared); `/cv/99999999` → back to `/cv`.
* Delete/add against the real API were deliberately **not** exercised in the browser to avoid altering the shared data; they are covered by the `HttpTestingController` tests.

Commands:
```bash
npm ci --legacy-peer-deps
npx ng serve          # /ttc , /cv , /cv/add , /login
npx ng test --watch=false
npx ng build
```

---

## 6. CLAUDE.md compliance checklist

standalone only ✔ · no explicit OnPush ✔ · signals for state ✔ · lazy routes ✔ · no `@HostBinding/@HostListener` ✔ · `NgOptimizedImage` for images ✔ · `input()/output()` functions ✔ · `computed()` ✔ · Signal Forms for new forms ✔ · no `ngClass/ngStyle` (`[class.x]`) ✔ · no `CommonModule` (only `DatePipe`, `UpperCasePipe`, `CurrencyPipe`, `PercentPipe`, `NgOptimizedImage`) ✔ · native control flow ✔ · `@Service` + `inject()` ✔ · no `mutate` ✔ · labels, roles, `aria-*`, real buttons/links ✔.
Not formally AXE-audited (no axe tool run).

---

## 7. Questions the professor could ask — with answers

### Signals fundamentals
**Q1. What is a signal and how is it different from a plain property or a BehaviorSubject?**
A signal is a getter-function wrapping a value with a dependency graph. Versus a property: reads are tracked, so templates/computeds update automatically without zone.js. Versus `BehaviorSubject`: synchronous with an always-available value (like a BehaviorSubject), but no `subscribe/unsubscribe`, no operators, automatic dependency tracking, glitch-free, garbage-collected with its consumers. RxJS remains better for event streams over time (debounce, switchMap, websockets).

**Q2. `computed` vs a method called in the template?** A method runs on every change detection; `computed` runs only when a dependency changed and caches its result. It is lazy: never read → never computed.

**Q3. How does `computed` know its dependencies?** At each execution it records the signals actually read; dependencies are *dynamic*. In `cvs`, `value()` is only read when `hasValue()` is true, so `value` is a dependency only in that case.

**Q4. `set` vs `update`?** `set(v)` replaces; `update(fn)` computes from the previous value. Both notify only if the new value differs by `Object.is`. That's why arrays/objects are replaced immutably (`[...list, cv]`) and why `mutate` no longer exists.

**Q5. Can you write a signal inside a `computed`?** No — it must be pure.

**Q6. `effect` vs `computed`?** `computed` derives a value; `effect` performs side effects (toast, router, logging, storage). Copying a signal into another signal in an effect is an anti-pattern.

**Q7. Which effects did you write and why are they legitimate?** Two: the error toast in `CvComponent` (when `isFallback()` becomes true) and the redirect in `DetailsCv` (when the resource errors). Both act on the outside world (toast UI, router) and write no signal.

**Q8. Why `asReadonly()` + a `#private` signal?** Encapsulation: only the service can change `selectedCv`, `embauchees`, `auth state`; consumers get a read-only `Signal`. One place to look for any mutation.

**Q9. What is `linkedSignal` and would it fit here?** A writable signal that is recomputed from a source when the source changes (e.g. `selectedCv = linkedSignal(() => this.cvs()[0])` would reset the selection when the list changes). The selection here is only set by user action, and I explicitly clear it on delete; `linkedSignal` would be a possible alternative for that.

**Q10. What is "glitch-free"?** If `c = computed(a + b)` and both change in the same tick, `c` is never observed with only one of them updated; it recomputes once, lazily.

### Components / templates
**Q11. `@Input()` vs `input()`?** `input()` returns a read-only signal usable in `computed/effect` (no `ngOnChanges`); `input.required<T>()` has no default and errors if unbound; `transform` (e.g. `numberAttribute`) converts incoming values.

**Q12. Why does `List` receive `cvs` as an input while `Item` calls the service directly?** `List` is presentational. `Item` triggers a *global* action (select) — the starter already did this through `CvService.selectCv`. An alternative is an `output()` bubbled up by `List`; the service route avoids prop-drilling through two levels.

**Q13. Why `track cv.id`?** Mandatory in `@for`; lets Angular reuse DOM nodes when the array is replaced.

**Q14. Why did `ItemComponent` become a `<button>`?** A clickable `div` isn't focusable/keyboard operable (WCAG). A button gives focus, Enter/Space, role.

**Q15. How does `DetailsCv` get its `id`?** `withComponentInputBinding()` maps route params to inputs of the same name. Route params are strings → `numberAttribute`. Previously `ActivatedRoute.snapshot.params`, which would **not** update if the route reused the component with another id; the resource-with-`params` approach does.

**Q16. Why did `/cv/add` have to come before `/cv/:id`?** Route matching is first-match; `add` would otherwise be captured as an id.

### resource / HTTP
**Q17. What is `rxResource`/`resource`?** An async-to-signal bridge. States: `idle, loading, reloading, resolved, error, local`. `rxResource` uses an Observable `stream`; `resource` uses a Promise `loader`. Exposes `value, isLoading, error, status, hasValue, reload(), set()`. `params` is a reactive function: a change cancels the in-flight request and starts a new one; `undefined` params ⇒ idle.

**Q18. `toSignal(http.get())` vs `rxResource`?** `toSignal` just converts an observable you give it (initial value needed, no loading flag, errors rethrown on read). `rxResource` has loading/error/reload and reactive params.

**Q19. What happens if the API is down?** `error()` is set, `hasValue()` false → `cvs` returns `fakeCvs`, `isFallback` is true → the effect shows the toast. No exception reaches the template.

**Q20. Why is `value()` not used directly?** In the error state it throws; `hasValue()` is safe.

**Q21. Why do add/delete still return Observables?** They are one-shot commands (events), not state. After success we update state with `tap` (`reload()`), which keeps the resource as the single source of truth.

**Q22. Why `reload()` after add/delete?** The service is a singleton: the list is no longer re-fetched on every visit as in the starter, so it must be refreshed explicitly.

**Q23. Autocomplete: how do you reproduce `debounceTime + distinctUntilChanged + switchMap` without RxJS operators?** `debounce(path.search, 300)` in the form schema delays the model update; a signal doesn't notify for an equal value (distinct); `rxResource` with `params` cancels the previous request when the value changes (switch). The empty-string case returns `undefined` ⇒ idle, so no request is made.

### Forms
**Q24. What are Signal Forms?** `form(modelSignal, schemaFn)` mirrors the model as a `FieldTree`; each field exposes signals (`value, valid, invalid, errors, touched, dirty`). `[formField]` binds an input. Validators (`required, pattern, minLength, email, min, debounce…`) are declared in the schema. The model signal stays the single source of truth.

**Q25. Why not Reactive Forms / `ngModel`?** Reactive forms rely on observables (`valueChanges`) and getters like `get name()`; Signal Forms are signal-native, typed, and need no subscriptions. CLAUDE.md prefers them for new forms.

**Q26. The starter's template references `cinFirstCars` — did you implement it?** No: the starter's TS never defines such a validator (the template just reads `form.errors['cinFirstCars']`, which is always undefined). I did not invent a business rule; the form validates required fields and an 8-digit CIN. I'd add it as a `validateTree` in the schema if the rule were specified.

### Architecture & patterns
**Q27. Which design patterns?** *Container/Presentational* (CvComponent vs List/Item/Card); *Service as a store* (root singleton holding signals — observer pattern under the hood); *Dependency Injection*; *Facade* (`CvService` hides HTTP, fallback and caching); *Strategy/table-driven rules* (TTC discount tiers); *Immutability*; *Guard/Interceptor (chain of responsibility)* for auth; *Single responsibility* per file.

**Q28. Why not NgRx?** The state is small; a signal service gives a single source of truth with far less code; the auth exercise explicitly forbids a state library.

**Q29. Why does `selectedCv` survive navigation now?** Because it is a signal living in a root service (it holds its last value); the starter's `Subject` has no memory, and `CvComponent` subscribed only after construction.

**Q30. How is the authenticated state reloaded on startup?** The state signal is initialised with `restoreState()` which reads `localStorage['auth']` inside try/catch and validates its shape. Everything else (`isAuthenticated`, navbar, guard, interceptor) derives from that signal.

**Q31. Is `localStorage` a security problem?** Tokens in `localStorage` are readable by any XSS; an `HttpOnly` cookie is safer. The lab (and the API) uses an `Authorization` header token, so storage in the browser is required.

**Q32. Guard returning `UrlTree` vs `router.navigate`?** Returning a `UrlTree` lets the router cancel the navigation and redirect atomically, without a second navigation racing the first.

**Q33. Why lazy loading?** Smaller initial bundle; `loadComponent/loadChildren` produce chunks loaded on first navigation.

**Q34. Why `@Service()` rather than `@Injectable({providedIn:'root'})`?** Angular 22's concise, tree-shakable root singleton (CLAUDE.md prefers it). Same behaviour.

### Zoneless / performance
**Q35. What is zoneless Angular and is this app zoneless?** No `zone.js` monkey patching; change detection is scheduled by signals, events, `markForCheck`, async pipe. `angular.json` has no `zone.js` polyfill and `app.config.ts` provides no zone provider ⇒ zoneless. All state is in signals, which is what makes it work.

**Q36. Why is OnPush not set?** It's the default in v22+.

### Migration (slides 3–6)
**Q37. Which commands migrate to standalone / control flow / inject?** `ng g @angular/core:standalone` (3 steps in order: convert components → remove NgModules → bootstrap with standalone APIs), `ng g @angular/core:control-flow`, `ng g @angular/core:inject`. Here the starter (NgModule) code was ported by hand into the already-migrated v22 branch.

**Q38. Why `branch rxjs` vs `branch signal`?** Slide 7: `rxjs` is based on the initial project (modules, RxJS exercises); `signal` is based on the `migration` branch (standalone, new APIs).

### Testing / accessibility
**Q39. How do you test services with a resource?** `provideHttpClient()` + `provideHttpClientTesting()`, `HttpTestingController.expectOne(url).flush(...)`, `TestBed.tick()` to run the resource's effect, `ApplicationRef.whenStable()` to await it. Careful: `whenStable()` never resolves while a request is pending (it waits for it), so flush before awaiting.

**Q40. Accessibility choices?** Labels bound to inputs, `role="alert"/status`, `aria-live` on the TTC results, real buttons/links, `aria-current/pressed` where relevant, `alt` on images, a `nav` with `aria-label`.

**Q41. Weak points to admit honestly:** the CV list/search tests are service-level (no component tests for `List`, `Item`, `CvCard`, `DetailsCv`, `AddCv`); no AXE run; the rotating-card CSS comes from the starter and is not WCAG-audited; the starter's `cinFirstCars` rule is not implemented (it doesn't exist in the starter); delete/add were not run against the real API (shared data); 4 older specs were already broken before this work.

---

## 8. File inventory (this work)

```
M src/app/app.{ts,html,routes.ts,config.ts}, src/styles.css
A src/app/config/{api,const}.config.ts  (routes.config.ts extended)
A src/app/ttc/…                         (4 files)
A src/app/cv/…                          (model, pipe, 2 services, 8 components, routes, 3 specs)
A src/app/auth/…                        (service, guard, interceptor, login, dto, spec)
A src/app/components/navbar/navbar.ts
A src/styles/rotating-card.css
A public/assets/images/{as.jpg,cv.png,tim_logo.png,rotating_card_thumb2.png}
A docs/TP1-report.md
```
