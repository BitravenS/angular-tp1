# TP1 (GL4 2026/2027) — TTC Calculator + cvTech refactoring with Signals

Base: the `signal` branch of `BitravenS/angular-tp1-update` (Angular 22.2, standalone, zone.js, Karma/Jasmine, `@relynn/ngx-toastr`).
Work: **one commit on top of that branch**, touching only the TTC and CV files (+ the route table and one navbar link).

> Rule #1 of the professor: *"if you read your code to explain it, it is not your code → 0."*
> The code contains **no comments on purpose**. Everything is explained here. Read §2 (concepts) and §4–§5 (walkthrough) until you can re-explain each file **without looking at it**, then train with §8.

---

## 0. Summary and honest notes

| Topic | Reality |
|---|---|
| Base code | `master` of `angular-tp1-update` is the Angular 18 NgModule/RxJS starter (the "initial project" of slide 3). Its `signal` branch is the migrated version (v22, standalone, new control flow, `inject()`), already containing the todo and rainbow-directive exercises. The CV code to refactor lives there. The work is a commit **on top of `signal`** so it can be moved there without conflicts. |
| What was added | `src/app/ttc/*` (new) and a signal refactoring of `src/app/cv/*`, `src/app/app-routing.module.ts` (lazy routes), `navbar.component.html` (one "TTC" link), `src/app/testing/render.ts` (test helper). |
| What was **not** touched | Auth (`AuthService`, login, guard, interceptor): the branch already exposes `token` and `isAuthenticated` as signals and the CV code only needs `isAuthenticated()`. Todo, rainbow, products, rxjs demos, `package.json`, `package-lock.json`, `angular.json`, toastr package (`@relynn/ngx-toastr` kept). |
| Conventions followed | Same file names (`*.component.ts/html/css`), same paths, `@Injectable({ providedIn: 'root' })` for services, `inject()`, `templateUrl`/`styleUrls`, Jasmine/Karma specs, `@relynn/ngx-toastr`, double-quote style in files that already used it. |
| Change detection | The migration had put `changeDetection: ChangeDetectionStrategy.Eager` on every component to keep the old behaviour. On the components refactored here it was **removed**: with signals, the default (OnPush in v22) is correct and cheaper. Untouched components keep `Eager`. |
| Tests | 92 specs in the full suite → **85 pass**. The 7 failures (`AppComponent` ×3, `ColorComponent`, `LoginComponent`, `NavbarComponent`, `TestObservableComponent`) are generated "should create" stubs without providers, **already failing before this work** and not modified. The baseline had 50 specs, 12 failing, and two `fdescribe` that silently skipped 48 specs (they were temporarily switched to `describe` to measure, then restored). The `ttc` and `cv` folders now hold 54 specs (the stubs were replaced by real ones), all passing. |
| Known gap in the starter | `add-cv.component.html` printed an error for a `cinFirstCars` cross-field validator that was never defined in the TypeScript. It is **not invented**: the form validates required fields + CIN = 8 digits. |
| Local tooling | The branch's `package-lock.json` is out of sync with `package.json` (`npm ci` fails), so `npm install` was used and the lockfile change was **discarded**. The Angular 22 CLI needs Node ≥ 22.22.3. |

---

## 1. Lab requirements (the PDF)

* **Slide 11 – TTC (signal branch):** compute the TTC price from quantity and VAT; every value editable; defaults quantity **1**, price **0**, VAT **18**; quantity between 10 and 15 → **20 %** discount; above 15 → **30 %**. Mock-up: inputs *Prix HT / Quantité / TVA* and three boxes (unit price TTC, total TTC, discount). With 100 / 10 / 18: **$118.00 / $1,180.00 / $0.00**.
* **Slide 12 – CV (signal branch):** take the cvTech (the `Cv` folder) and use signals where necessary. *Think about the architecture of the signal.*
* **Slide 2 (rules):** coherent architecture, clean and factored code, design patterns are a duty, be ready like for an interview.

---

## 2. The Angular concepts used (what you must master)

### 2.1 Signals

A **signal** is a getter function wrapping a value: `const s = signal(0); s()` reads, `s.set(1)` / `s.update(v => v + 1)` write. Reading a signal inside a template, a `computed` or an `effect` **registers that reader as a dependent**; writing notifies only the dependents. Angular knows exactly *which* view depends on *which* signal, so it can refresh only that view (fine-grained reactivity) instead of re-checking the whole tree.

* **Immutability:** a signal notifies only if the new value differs by `Object.is`. Mutating an array in place (`push`) does **not** notify; replace it (`update(l => [...l, x])`). `mutate` no longer exists for that reason.
* **`signal.asReadonly()`:** returns a read-only view. The service keeps the writable signal private (`#selectedCv`) and publishes the read-only one (`selectedCv`), so only the service can change the state.
* **`#private` vs `private`:** `#x` is a real JavaScript private field (hard private at runtime), `private x` is TypeScript-only. The starter already used `#selectCvSuject$`; the same style is kept.

### 2.2 `computed`

`computed(() => …)` creates a **read-only derived signal**: lazy (computed on first read), **memoized** (re-run only if a dependency changed) and with **dynamic dependencies** (only the signals actually read during the last run count). Must be pure: no writes, no side effects. Used here for `pricing` (TTC), `cvList`, `isFallback`, `cv` (details), `results` (autocomplete).

### 2.3 `effect`

`effect(() => …)` runs a **side effect** when the signals it reads change (asynchronously, during change detection). Use it only to talk to the outside world (toast, router, localStorage, logging) — never to copy a signal into another signal (use `computed`/`linkedSignal`). Two legitimate uses here: the "API failed" toast (`CvComponent`) and the redirect when a CV is not found (`DetailsCvComponent`). An effect must be created in an injection context (constructor/field initializer).

### 2.4 `linkedSignal` (not used, but be ready)

A **writable** signal whose value is reset from a source signal when that source changes, e.g. `selected = linkedSignal(() => this.cvs()[0])` resets the selection when the list changes. It is the answer to "state derived from another state but that the user can still override".

### 2.5 Signal-based component API

| Old | New | Notes |
|---|---|---|
| `@Input() cv!: Cv` | `cv = input.required<Cv>()` | read with `cv()`; usable in `computed`/`effect`; no `ngOnChanges` needed |
| `@Input() size = 50` | `size = input(50)` | default value, type inferred |
| `@Input({transform})` | `input.required({ transform: numberAttribute })` | converts the route param string `'12'` into `12` |
| `@Output() x = new EventEmitter()` | `x = output<T>()` | `x.emit(v)` |
| `@Input` + `@Output` pair | `model<T>()` | two-way binding `[(x)]` |

Inputs are **read-only signals**: a parent cannot be overwritten by the child. In tests an input is set with `fixture.componentRef.setInput('cv', value)`.

### 2.6 Resources: `resource` / `rxResource`

An **async state machine exposed as signals**: `value()`, `isLoading()`, `error()`, `status()` (`idle | loading | reloading | resolved | error | local`), `hasValue()`, `reload()`, `set()`. `rxResource` takes a `stream` returning an Observable (HttpClient); `resource` takes a Promise `loader`.

* `params: () => this.id()` makes the request **reactive**: when `id()` changes, the previous request is **cancelled** and a new one starts. If `params` returns `undefined` the resource stays **idle** (no request).
* **`value()` throws when the resource is in the error state.** `hasValue()` is the safe check, hence `hasValue() ? value() : fallback` everywhere.
* A resource has no manual subscription to clean: Angular unsubscribes on destroy.
* Why not `toSignal(http.get())`? `toSignal` only converts an observable; it has no loading flag, no reload and no reactive params.

### 2.7 Signal Forms (`@angular/forms/signals`)

`form(modelSignal, schemaFn)` wraps a **model signal** and returns a *field tree* mirroring it. Each field is a function returning a state object with signals: `value()`, `valid()`, `invalid()`, `errors()`, `touched()`, `dirty()`. `[formField]="myForm.name"` binds an `<input>` (the `FormField` directive, imported in the component) and parses `type="number"` into a number. Validators are declared in the schema: `required`, `min`, `pattern`, `email`, `minLength`… and `debounce(path.search, 300)` delays when the model is updated. The **model signal stays the single source of truth**: the component reads `this.model()` and derives from it with `computed`. Compared with Reactive Forms: no `FormBuilder`, no `get name()` getters, no `valueChanges` subscription, fully typed.

### 2.8 Built-in control flow

`@if (x; as y) {…} @else {…}`, `@for (item of list; track item.id) {…} @empty {…}`, `@switch`. Faster than `*ngIf/*ngFor` (no directive instances), `track` is **mandatory** in `@for` (lets Angular reuse DOM nodes when an array is replaced). Contextual variables: `$index`, `$odd`, `$even`, `$first`, `$last`, `$count`. `@if (cv(); as cv)` evaluates the signal once and gives it a typed non-null alias for the block.

### 2.9 `class` and `style` bindings instead of `ngClass`/`ngStyle`

`[class.list-group-item-primary]="$odd"` toggles one class from a boolean; `[style.width.px]="size()"` sets one style. They are native template syntax, no directive import, cheaper.

### 2.10 Standalone components, `imports`, DI with `inject()`

A standalone component declares what its template uses in `imports: [...]` (components, directives, pipes). `inject(Token)` replaces constructor injection and works in field initializers (`private http = inject(HttpClient)`), which is also what makes `rxResource(...)`/`effect(...)` legal as fields (injection context). `@Injectable({ providedIn: 'root' })` = one tree-shakable singleton for the whole app.

### 2.11 Routing: lazy loading and input binding

`loadComponent: () => import('./x').then(m => m.X)` creates a **separate chunk** loaded on first navigation (smaller initial bundle). `RouterModule.forRoot(routes, { bindToComponentInputs: true })` (the NgModule equivalent of `withComponentInputBinding()`) maps route params, query params and route data to **component inputs of the same name**: `/cv/12` fills `id = input.required<…>()`. Route order matters: `cv/add` is declared **before** `cv/:id`, otherwise `add` would be captured as an id.

### 2.12 `NgOptimizedImage`

`<img [ngSrc]="…" [width]="…" [height]="…" [alt]="…">` — requires explicit dimensions (avoids layout shift), lazy-loads by default and warns about the LCP image (`priority`). It **does not react to `width`/`height` changing after the first render** (NG02953): bind them once at creation. Decorative images use `alt=""`.

### 2.13 Change detection, zone.js and OnPush

This branch still uses **zone.js** (`polyfills: ["zone.js"]`): zone patches async APIs and triggers a check after each. Components with `ChangeDetectionStrategy.Eager` are checked every cycle; **OnPush** components (default in v22) are checked only when an input signal changes, an event fires in them, a signal read in their template changes, or `markForCheck` is called. Signals give OnPush exactly the notifications it needs — that is why the explicit `Eager` could be dropped, and why the code is ready for zoneless.

### 2.14 Pipes

A **pure** pipe (`defaultImage`) is re-evaluated only when its input reference changes — an easy, memoized template transform. Used with `NgOptimizedImage`: `'assets/images/' + (cv().path | defaultImage)`.

### 2.15 HTTP, `HttpClient` and RxJS operators kept

Commands (add / delete) and one-shot queries (`getCvById`, `selectByName`) stay `Observable`s: they are **events**, not state. `tap` runs a side effect on success without altering the stream (`tap(() => this.cvsResource.reload())`). The `rxResource` is the *state*.

### 2.16 Testing concepts

* `TestBed.configureTestingModule({ imports: [Cmp], providers: [...] })` builds a test injector; standalone components go in `imports`.
* `provideHttpClient()` + `provideHttpClientTesting()` replace the real backend; `HttpTestingController.expectOne(url).flush(body)` answers a request, `.flush('x', {status: 500, statusText: ''})` simulates an error, `expectNone` asserts no request.
* `jasmine.createSpyObj('ToastrService', ['success'])` + `{ provide: ToastrService, useValue: spy }` replaces a dependency.
* **With zone.js, `fixture.whenStable()` does not run change detection** — call `fixture.detectChanges()`. `src/app/testing/render.ts` does `detectChanges → one macrotask → detectChanges`.
* `whenStable()` never resolves while an HTTP request is pending (the resource's list request in `CvService`), so component specs yield a macrotask instead.
* Debounced code is tested by really waiting longer than the delay (`setTimeout(400)`).

---

## 3. TTC Calculator (`src/app/ttc/`)

```
ttc.pricing.ts            pure business logic, no Angular
ttc.component.ts / .html  presentation + form model
ttc.pricing.spec.ts       9 specs (logic)
ttc.component.spec.ts     4 specs (component)
```
Route `ttc` (lazy) + navbar link "TTC".

### 3.1 `ttc.pricing.ts` — logic separated from UI

```ts
export const DISCOUNT_TIERS: readonly DiscountTier[] = [
  { above: 15, rate: 0.3 },
  { above: 10, rate: 0.2 },
];
export function discountRateFor(quantity: number): number {
  return DISCOUNT_TIERS.find((tier) => quantity > tier.above)?.rate ?? 0;
}
export function computePricing(priceHt, quantity, vat): Pricing { /* unitTtc, discountRate, discount, total */ }
```
* **Table-driven rules** (a light *Strategy*): the discount scale is data, not an `if/else` chain. A new tier is one line (open/closed principle). Tiers are sorted from highest to lowest because `find` returns the first match.
* **Pure functions**: testable without TestBed, reusable by a cart, the component stays thin (single responsibility).
* `sanitize` turns `NaN` (an emptied number input), negatives and `Infinity` into `0`: the UI never shows `NaN`.
* **Boundary decision:** the text says "between 10 and 15 → 20 %" but the mock-up shows **quantity 10 → Discount $0.00**. So the rule is `quantity > 10` → 20 %, `> 15` → 30 %. To include 10, change `above: 10` to `above: 9`. Total shown = gross TTC − discount (12 × 118 = 1416, discount 283.20, total 1132.80).

### 3.2 `ttc.component.ts`

```ts
private readonly model = signal<TtcModel>({ prixHt: 0, quantite: 1, tva: 18 });
protected readonly ttcForm = form(this.model, (path) => { min(path.prixHt, 0); min(path.quantite, 0); min(path.tva, 0); });
protected readonly pricing = computed(() => {
  const { prixHt, quantite, tva } = this.model();
  return computePricing(prixHt, quantite, tva);
});
```
Data flow: **typing → field → `model` signal → `pricing` computed → template**. There is no `(input)` handler, no `ngModel`, no `valueChanges`. The defaults are the initial value of the model signal (price 0, quantity 1, VAT 18 as required). The template uses `currency` (`$118.00`) and `percent` pipes, `<label for>` on each input, `aria-live="polite"` on the results so assistive technology announces them, and Bootstrap `*-subtle` colours (AA contrast) for the blue/green/red boxes of the mock-up.

---

## 4. cvTech: before → after

| Starter (RxJS + imperative) | After (signals) |
|---|---|
| `CvService.selectCv$`: private `Subject` + `asObservable()`; `CvComponent` subscribed in its constructor | `#selectedCv` signal + read-only `selectedCv`; read in the template |
| `CvComponent` constructor: `getCvs().subscribe(next, error)`, fake list + toast on error | `rxResource` in the service, `cvList` and `isFallback` are `computed`; the toast is an `effect` |
| `EmbaucheService`: `Cv[]` mutated with `push`, returned by reference; `indexOf` (reference equality) | `signal<readonly Cv[]>`, immutable `update`, `some(e => e.id === cv.id)` |
| `@Input()`, `*ngIf/*ngFor`, `ngClass`, `ngStyle` | `input()`, `@if/@for`, `[class.x]`, `width/height` bound once |
| `DetailsCv`: `ActivatedRoute.snapshot.params['id']` once in `ngOnInit` + `subscribe` | `id` input bound from the route + `rxResource({ params })` |
| `AddCv`: `FormBuilder`, 6 getters, `form.value as Cv` | Signal Form: model signal + schema, builds a real `Cv` |
| `Autocomplete`: empty stub (form + unused rxjs imports) | Signal Form with `debounce(300)` + reactive `rxResource` |
| Eager routes | `loadComponent` lazy routes |

### 4.1 Where each piece of state lives (the "architecture of the signal")

Rule: *state shared by several components, or that must survive navigation → signal in a root service; state used by one component → local signal; anything derivable → `computed`.*

| State | Owner | Kind |
|---|---|---|
| list of cvs + loading/error | `CvService.cvsResource` | `rxResource` |
| cvs shown | `CvService.cvList` | `computed` (API value, else fake list) |
| API failed? | `CvService.isFallback` | `computed` |
| selected cv | `CvService.#selectedCv` / `selectedCv` | `signal` + read-only view |
| hired cvs | `EmbaucheService.#embauchees` / `embauchees` | `signal` + read-only view |
| search text | `AutocompleteComponent.model` | local `signal` (form model) |
| one cv (details page) | `DetailsCvComponent.cvResource` | local `rxResource` keyed on `id()` |
| add form values | `AddCvComponent.model` | local `signal` (form model) |

```
ItemComponent ─click─▶ CvService.selectCv() ─▶ #selectedCv ─▶ CvComponent.selectedCv() ─▶ <app-cv-card [cv]>
CvCardComponent ─embaucher()─▶ EmbaucheService.embauche() ─▶ #embauchees ─▶ EmbaucheComponent
AutocompleteComponent ─typing (debounced 300 ms)─▶ rxResource ─▶ results ─click─▶ CvService.selectCv()
CvService.cvsResource ─▶ cvList (computed) ─▶ CvComponent.cvs() ─[cvs]─▶ ListComponent ─[cv]─▶ ItemComponent
```

---

## 5. File-by-file walkthrough (`src/app/cv/`)

### 5.1 `services/cv.service.ts`

```ts
cvsResource = rxResource({ stream: () => this.getCvs() });
isFallback = computed(() => this.cvsResource.error() !== undefined);
cvList = computed<readonly Cv[]>(() =>
  this.cvsResource.hasValue() ? this.cvsResource.value() : this.getFakeCvs());
#selectedCv = signal<Cv | null>(null);
selectedCv = this.#selectedCv.asReadonly();
selectCv(cv: Cv) { this.#selectedCv.set(cv); }
deleteCvById(id) { return this.http.delete(API.cv + id).pipe(tap(() => {
  if (this.#selectedCv()?.id === id) this.#selectedCv.set(null);
  this.cvsResource.reload(); })); }
addCv(cv) { return this.http.post<Cv>(API.cv, cv).pipe(tap(() => this.cvsResource.reload())); }
```
* The service is a root singleton, so the list is fetched **once**, not at every visit of `/cv` as in the starter (it re-fetched in the component constructor). Therefore add/delete call `reload()` — otherwise the list would go stale.
* A deleted cv must not stay selected → the selection is cleared in the same `tap`.
* A `Subject` has **no memory**: a component created later misses past selections. A signal keeps the **last value**, so the selected card is still there after visiting `/cv/3` and coming back.
* Unchanged on purpose: `getCvs`, `getCvById`, `getFakeCvs`, `findCvById`, `deleteCv`, `selectByProperty` (and their original JSDoc). `selectByName` now returns `Cv[]` instead of `any`.
* `private cvs` (the fake list) and `cvList` are different things: the first is a fixture used as a fallback, the second is what the UI shows.

### 5.2 `services/embauche.service.ts`

```ts
#embauchees = signal<readonly Cv[]>([]);
embauchees = this.#embauchees.asReadonly();
embauche(cv: Cv): boolean {
  if (this.#embauchees().some((e) => e.id === cv.id)) return false;
  this.#embauchees.update((list) => [...list, cv]);
  return true;
}
```
Two real fixes: duplicates are detected **by id** (a cv re-fetched from the API is a different object, so `indexOf` would hire it twice), and the array is **replaced** (the starter's `push` only worked because the component kept the same array reference and zone.js triggered a check; an in-place mutation notifies nobody in a signal world).

### 5.3 `cv/cv.component.*` (smart/page component)

```ts
cvs = this.cvService.cvList;
selectedCv = this.cvService.selectedCv;
constructor() {
  this.logger.logger("je suis le cvComponent");
  this.toastr.info("Bienvenu dans notre CvTech");
  effect(() => { if (this.cvService.isFallback()) this.toastr.error(`…données fictives…`); });
}
```
The component holds **references to the service's signals** (no copy, no subscription). The template calls them: `<app-list [cvs]="cvs()">`, `<app-cv-card [cv]="selectedCv()">`, plus `<app-autocomplete>` and `<app-embauche>`. The effect only reads `isFallback()` and fires a toast (a side effect); it writes no signal. `date` is a plain class field (a constant, no reactivity needed).

### 5.4 `list/list.component.*`

`cvs = input<readonly Cv[]>([])`; `@for (cv of cvs(); track cv.id)`; zebra rows with `[class.list-group-item-primary]="$odd"` / `[class.list-group-item-secondary]="!$odd"`. The starter tracked by object (`track cv`); tracking by `id` keeps the DOM stable when the list is reloaded.

### 5.5 `item/item.component.*`

`cv = input.required<Cv>()`, `size = input(50)`; the click calls `cvService.selectCv(this.cv())`. The clickable root is now a `<button type="button">` (focusable, Enter/Space, announced as a button — the starter used a clickable `div`). The image uses `NgOptimizedImage` with `[width]="size()" [height]="size()"` (this also fixes the starter's `heigth` typo that made the height style ineffective). `size` is set once by the parent (`50` default, `150` in the hired list), which is compatible with `NgOptimizedImage`'s "no change after init" rule.

### 5.6 `cv-card/cv-card.component.*`

`cv = input<Cv | null>(null)`; `@if (cv(); as cv)`; `embaucher()` asks `EmbaucheService.embauche()` and toasts `success` or `warning`. "détails" is an `<a [routerLink]="['/cv', cv.id]">` (a navigation is a link; the starter put `routerLink` on a `button`). Static images use `NgOptimizedImage` with real dimensions (596×337 for the cover, 100×100 for the avatar via CSS); the decorative cover has `alt=""`; the Font Awesome icon is `aria-hidden`. The flipping card markup and CSS (`rotating-card.css`) are unchanged.

### 5.7 `embauche/embauche.component.*`

`embauchees = inject(EmbaucheService).embauchees` — the **signal itself** is exposed, so the list updates the moment the service hires someone (in the starter the component copied a reference once in its constructor). `@if (embauchees().length)` + `@for … track embauchee.id`.

### 5.8 `details-cv/details-cv.component.*`

```ts
id = input.required({ transform: numberAttribute });
private cvResource = rxResource({ params: () => this.id(), stream: ({ params }) => this.cvService.getCvById(params) });
cv = computed(() => (this.cvResource.hasValue() ? this.cvResource.value() : null));
constructor() { effect(() => { if (this.cvResource.error()) this.router.navigate([APP_ROUTES.cv]); }); }
```
`bindToComponentInputs` copies the `:id` URL segment into `id`; `numberAttribute` turns the string into a number (replaces `+id`). Because `params` is reactive, `/cv/1 → /cv/2` re-fetches (the starter's `snapshot` would show the first cv forever). A missing cv redirects to the list, like the starter. **Delete** is shown only `@if (authService.isAuthenticated())` — the existing auth signal; `deleteCv` calls the service whose `tap` clears the selection and reloads the list. `deleteCv`/`ToastrService` behaviour is unchanged.

### 5.9 `add-cv/add-cv.component.*`

```ts
private model = signal<AddCvModel>({ name: "", firstname: "", path: "", job: "", cin: "", age: 0 });
addForm = form(this.model, (path) => {
  required(path.name); required(path.firstname); required(path.job);
  required(path.cin); pattern(path.cin, /^[0-9]{8}$/); required(path.age);
});
```
Same rules as the starter (`name`, `firstname`, `job` required; `cin` required and 8 digits; `age` required). Template: `<label for>` + `[formField]`, errors shown with `@if (field().touched() && field().invalid())` and `role="alert"`, submit disabled while `addForm().invalid()`, `(submit)` with `preventDefault`. `addCv()` builds a real `Cv` (constructor order: `id, firstname, name, job, path, cin, age`), posts it and navigates to `/cv`. The service reloads the list after success.

### 5.10 `autocomplete/autocomplete.component.*`

```ts
private model = signal({ search: "" });
searchForm = form(this.model, (path) => { debounce(path.search, 300); });
private searchResource = rxResource({
  params: () => this.model().search.trim() || undefined,
  stream: ({ params }) => this.cvService.selectByName(params),
});
results = computed(() => this.searchResource.hasValue() ? this.searchResource.value() : []);
```
Equivalent of `debounceTime(300) + distinctUntilChanged() + switchMap(...)` without those operators: `debounce` delays the model update; a signal does not notify for an identical value (distinct); the resource **cancels the previous request** when `params` changes (switch); an empty string gives `undefined` → idle → no request. A click on a result calls `selectCv`, so the card shows it. The starter's component was an empty stub; it is completed and placed above the list.

### 5.11 `app-routing.module.ts` and navbar

```ts
{ path: "ttc", loadComponent: () => import("./ttc/ttc.component").then((m) => m.TtcComponent) },
{ path: "cv", loadComponent: () => import("./cv/cv/cv.component").then((m) => m.CvComponent) },
{ path: "cv/add", loadComponent: …AddCvComponent, canActivate: [AuthGuard] },
{ path: "cv/:id", loadComponent: …DetailsCvComponent },
RouterModule.forRoot(routes, { bindToComponentInputs: true })
```
The guard, login, `**` route and every other route are unchanged. `bindToComponentInputs` is required for `DetailsCvComponent.id`; existing components that read `ActivatedRoute` are unaffected. One "TTC" link was added to the navbar.

---

## 6. Compatibility with the `signal` branch and how to move it

Constraints respected: Angular 22.2.x APIs only (`@angular/forms/signals`, `rxResource`, `input()`), `@relynn/ngx-toastr`, **no new dependency**, no change to `package.json`, `angular.json`, `tsconfig`, auth, todo or rainbow; `strictTemplates` and the production AOT build pass; Karma/Jasmine specs.

The work is **one commit on top of `origin/signal`** (the branch pushed to `BitravenS/angular-tp1`). To bring it into the update repo:

```bash
cd angular-tp1-update
git checkout signal
git remote add tp1 https://github.com/BitravenS/angular-tp1
git fetch tp1
git cherry-pick <sha-of-the-commit>
```
or, as a patch: `git format-patch -1 <sha> --stdout > ttc-cv.patch` in this repo, then `git am ttc-cv.patch` in the update repo.

Files changed: `src/app/ttc/*` (new), `src/app/testing/render.ts` (new), `src/app/cv/**` (components, services, specs), `src/app/app-routing.module.ts`, `src/app/components/navbar/navbar.component.html`, this document.

---

## 7. Verification performed

* `ng build` (production, AOT, `strictTemplates`): OK, `ttc`, `cv`, `cv/add`, `cv/:id` are lazy chunks.
* Karma (headless Chrome): the **54 specs of the `ttc` and `cv` folders pass**; whole suite 85/92, the 7 failures being the untouched stubs listed in §0.
  * `ttc.pricing.spec`: lab example, boundaries 1/10/11/15/16/100, discount subtraction, invalid input.
  * `ttc.component.spec`: defaults 0/1/18, recompute on typing, 20 % at 12 pieces, no discount at 10.
  * `cv.service.spec`: API success, API failure → fake list + `isFallback`, selection, delete (DELETE sent, selection cleared, list reloaded), add (POST then reload), search filter.
  * `embauche.service.spec`: empty, hire once, id identity, new array each time.
  * component specs for list, item, card, hired list, page, details (id as string, delete visibility, delete flow, 404 redirect), add-cv (validation, CIN, POST, server error) and autocomplete (no request when empty, debounced search, selection).
* Real browser (Playwright) on `ng serve` with the live API: 12 pieces → total $1,132.80 / discount $283.20 (20 %), 10 pieces → $0.00; `/cv` loads 14 cvs, selection shows the card, "embaucher" twice → one hired + success and warning toasts, search "Bailly" lists the cv and selects it; `/cv/add` redirects to `/login` when logged out and shows for a stored session (nav shows *Add Cv* / *Logout*), a 3-digit CIN shows the error and keeps the button disabled; `/cv/1330` shows the details with the **Delete** button when logged in; `/cv/99999999` goes back to `/cv`.
* Delete/add were **not** executed against the shared API (covered by `HttpTestingController` specs). No AXE audit was run. The browser logs 404s for image names stored in the shared API data (e.g. `Law`, `bb`): those files do not exist in `assets/images`, same as in the starter.

---

## 8. Questions the professor could ask — with answers

### Signals
**Q1. What is a signal, and how is it different from a property or a `BehaviorSubject`?** A getter function holding a value plus a dependency graph. Reads are tracked, so views update without zone.js. Compared with `BehaviorSubject`: synchronous with an always-available value, but no `subscribe/unsubscribe`, no operators, automatic dependency tracking, glitch-free, garbage-collected with its consumers. RxJS stays better for event streams over time (debounce, retries, websockets).

**Q2. `computed` vs a method in the template?** The method runs at every check; `computed` runs only when a dependency changed and caches the result. It is lazy: never read → never computed.

**Q3. How does `computed` find its dependencies?** It records the signals read during each run. In `cvList`, `value()` is read only when `hasValue()` is true, so `value` is a dependency only then.

**Q4. `set` vs `update`?** `set` replaces, `update` derives from the previous value. A signal notifies only if the new value differs by `Object.is` → arrays are replaced immutably (`[...list, cv]`).

**Q5. Why `asReadonly()` and a `#private` signal?** Encapsulation: only the service can change `selectedCv` or `embauchees`; consumers can read. Every mutation is in one place.

**Q6. `effect` vs `computed`?** `computed` derives data; `effect` performs side effects (toast, navigation). Copying a signal into another in an effect is an anti-pattern.

**Q7. Which effects did you write and why are they legitimate?** The error toast in `CvComponent` and the redirect in `DetailsCvComponent`. Both act on the outside world (UI toast, router) and write no signal.

**Q8. What is `linkedSignal` and would it fit here?** A writable signal reset from a source. `selectedCv = linkedSignal(() => this.cvList()[0])` would reset the selection when the list changes. Here the selection is set by the user and cleared on delete, so a plain signal was enough.

**Q9. What does glitch-free mean?** If `c = computed(a + b)` and both change in the same tick, `c` is never seen with only one of them updated; it recomputes once, lazily.

**Q10. Can you write a signal inside a `computed`?** No, it must be pure.

### Components and templates
**Q11. `@Input()` vs `input()`?** `input()` returns a read-only signal usable in `computed`/`effect` (no `ngOnChanges`); `input.required` has no default and errors if unbound; `transform` converts values (`numberAttribute`).

**Q12. Why does `ItemComponent` call the service instead of emitting an output?** Selecting a cv is a **global** action shared by the list, the hired list and the autocomplete; going through the service avoids bubbling the same output through two levels. The starter already did it this way. An `output()` chain would also work but adds plumbing.

**Q13. Why `track cv.id`?** Mandatory in `@for`; keeps DOM nodes when the array is replaced (here when the list is reloaded).

**Q14. Why did the clickable `div` become a `button`?** A `div` is not focusable nor keyboard operable (WCAG). A button gives focus, Enter/Space and the right role.

**Q15. Why was `ChangeDetectionStrategy.Eager` removed from these components?** The migration added it to preserve the pre-v22 behaviour. With signals, OnPush (default) refreshes exactly when a read signal or an input changes, with fewer checks. Untouched components keep `Eager` and still work.

**Q16. Is the app zoneless?** No: this branch keeps `zone.js`. The code is zoneless-ready since the state is in signals.

### Resources and HTTP
**Q17. What is `rxResource`?** An Observable-based async resource exposed as signals (`value`, `isLoading`, `error`, `status`, `hasValue`, `reload`). `params` makes it reactive and cancels the previous request; `undefined` params ⇒ idle.

**Q18. Why `hasValue()` rather than `value()`?** `value()` throws in the error state; `hasValue()` is safe and lets us fall back to the fake list.

**Q19. What happens if the API is down?** `error()` is set, `hasValue()` is false, `cvList` returns the fake cvs, `isFallback` is true → the effect shows the toast. Nothing throws in the template.

**Q20. Why do add/delete remain Observables?** They are commands (events), not state. We update state on success with `tap` (`reload()`).

**Q21. Why `reload()` after add/delete?** The service is a singleton: the list is no longer re-fetched on every visit, so it must be refreshed explicitly.

**Q22. How do you reproduce `debounceTime + distinctUntilChanged + switchMap`?** `debounce(path.search, 300)` in the form schema, signals' own equality check, and `rxResource`'s cancel-on-params-change. The empty string maps to `undefined` so no request is sent.

**Q23. How does `DetailsCv` get its id?** `bindToComponentInputs` maps the route param `:id` to the input `id`; `numberAttribute` converts it. Because it feeds a resource's `params`, navigating to another id refetches.

### Forms
**Q24. What are Signal Forms?** `form(modelSignal, schema)` returns a field tree; each field exposes signals (`value`, `valid`, `invalid`, `errors`, `touched`, `dirty`); `[formField]` binds an input; validators are declared in the schema. The model signal remains the source of truth.

**Q25. Why Signal Forms for the TTC?** The model is a signal, so `computed` can derive prices directly from it. No handler, no subscription.

**Q26. What about `cinFirstCars` in the starter's template?** The TypeScript never defined that validator (the template read `form.errors['cinFirstCars']`, always undefined). I did not invent a business rule; I'd add it as `validateTree` if it were specified.

### Architecture and patterns
**Q27. Which design patterns?** Container/Presentational (`CvComponent` vs list/item/card), service-as-store (root singleton holding signals), Dependency Injection, Facade (`CvService` hides HTTP, fallback and reload), table-driven Strategy (discount tiers), immutability, single responsibility per file.

**Q28. Why not NgRx?** The state is small; a signal service gives one source of truth with far less code.

**Q29. Why does the selection now survive navigation?** It is a signal in a root service (it keeps its last value); a `Subject` has no memory.

**Q30. Why lazy-load?** Smaller initial bundle; each route is a chunk fetched at first navigation.

**Q31. Why is the route `cv/add` before `cv/:id`?** First match wins; otherwise `add` would be read as an id.

### Testing
**Q32. Why `fixture.detectChanges()` in the specs?** The branch is zone-based: `whenStable()` doesn't render. `render()` runs detection, yields a macrotask, runs detection again.

**Q33. Why not `whenStable()` in component specs?** `CvService`'s resource issues a request that the testing backend keeps pending; `whenStable()` waits for it forever.

**Q34. How do you test a debounce?** Wait for longer than the delay with a real `setTimeout`, then flush the resulting request.

**Q35. Why did `NgOptimizedImage` complain in a test (NG02953)?** I changed `size` after the first render; the directive doesn't support `width/height` changes. Sizes are set at creation in real use and the spec creates a fresh component.

### Honest weak points
* Auth was not refactored (already partially signal-based on the branch; out of the requested scope).
* The 7 remaining failing specs are pre-existing stubs; the 48 specs hidden by `fdescribe` are not mine.
* No AXE audit; the rotating-card CSS comes from the starter.
* Delete/add are not exercised against the real API (shared data), only through `HttpTestingController`.
* The `cinFirstCars` rule does not exist in the starter, so it is absent.
