# TP1 (GL4 2026/2027) — TTC Calculator + CV App with Signals

Branch of work: `claude/ttc-cv-signals-refactor-54ak8n` (content identical to `aziz/signals` + 1 commit).
Stack: Angular 22.2, standalone components, zoneless (no `zone.js` in the project), Signal Forms, Bootstrap 5, ngx-toastr, Vitest.

> Rule #1 of the professor: *"if you read your code to explain it, it is not your code → 0."*
> This report is a study guide. Read §2–§5 until you can re-explain every file **without looking at it**, then train with the Q&A in §7.

---

## 0. Read this first — what was done, and what differs from the brief

| Topic | Reality |
|---|---|
| Branch | You asked for `malek/signal` branched from `aziz/signal`. The remote branch is actually named **`aziz/signals`** (with an *s*), and this session is restricted to pushing on `claude/ttc-cv-signals-refactor-54ak8n`, which starts at the exact same commit as `aziz/signals`. To get your branch: `git switch -c malek/signal` from this branch and push. |
| "Refactor the CV app" | The course repo (`aymensellaouti/ngGl42627`, `master`) **contains no `Cv` folder and no `auth` folder** — it is identical to this repo (`cd1f2fa`). There was no CV code to refactor, so the CV feature was **written from scratch directly with signals**. The API used is the one already present in the repo (`https://apilb.tridevs.net/api/personnes`). If your professor's real CV code exists elsewhere, only the *architecture* here transfers, not the files. |
| Auth exercise (slide 13) | **Not implemented** — you asked only for TTC + CV. Slide 13 is a separate exercise (signal-based auth store). A design sketch is in §7 Q30 in case you are asked. |
| Other exercises | Rainbow directive (slide 8) and Todo (slide 10) are not part of this work. |
| Images | The API returns `path: "as.jpg"` but the image files are not in the repo, so a local placeholder (`public/images/avatar.svg`) is displayed via `NgOptimizedImage`. |
| Existing tests | 4 tests **already failed on the base branch** (`App` ×2, `First`, `Pere`: missing providers / outdated "Hello" assertion). They were not touched. The other 23 tests pass, including the 15 new ones. |
| Tooling | `npm ci` needs `--legacy-peer-deps` (`ngx-toastr@20` declares a peer on Angular 21). The Angular 22 CLI needs Node ≥ 22.22.3 (the sandbox had 22.22.0; Node 24 was used to build/test). The repo's `package.json` was **not** modified. |

---

## 1. Lab requirements (from the PDF)

**Slide 11 – TTC (signal branch):** a component computing the TTC price of a product from quantity and VAT. The user can change every value; defaults: quantity **1**, price **0**, VAT **18**. Quantity **between 10 and 15 → 20 % discount**; **above 15 → 30 %**. Mock-up: three inputs (Prix HT / Quantité / TVA) and three result boxes (unit price TTC, total TTC, discount); with 100 / 10 / 18 it shows **$118.00 / $1,180.00 / $0.00**.

**Slide 12 – CV (signal branch):** take the cvTech app and use signals where necessary. *"Think about the signal architecture."*

**Rules (slide 2):** coherent architecture, clean/factored code, design patterns are a duty, you must master the subject like in an interview.

---

## 2. Signals primer (what you must master)

| Concept | One-liner | Used where |
|---|---|---|
| `signal(v)` | Writable reactive value. Read `s()`, write `s.set(x)` / `s.update(fn)`. Never mutate in place (no `mutate`). | `selectedCv`, `hired`, `filter`, TTC `model` |
| `computed(fn)` | Read-only, **lazy**, **memoized** derived value; dependencies are tracked automatically on each run. | `pricing`, `cvs`, `isFallback`, `filteredCvs`, `hiredIds` |
| `effect(fn)` | Side effect re-run when its signals change. For syncing with the outside world (DOM, logging, router) — *not* for deriving state. | **Not needed** here (deliberately; see Q9) |
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

## 4. CV application

### 4.1 Architecture (smart service + presentational components)

```
src/app/cv/
  model/cv.ts                  Cv interface + FALLBACK_CVS
  services/cv.service.ts       @Service — ALL shared state as signals
  cv.ts            (CvPage)    "smart" page: injects the service, wires children
  list-cv/list-cv.ts           list + junior/senior filter (local state)
  item-cv/item-cv.ts           one row (dumb)
  card-cv/card-cv.ts           selected CV card (dumb) + Détails link + Embaucher
  embauche-cv/embauche-cv.ts   hired list (dumb)
  details-cv/details-cv.ts     route /cv/:id — loads one CV
  cv.routes.ts                 lazy child routes
```

Data flow (one direction down, events up):

```
              CvService (signals)
  cvsResource ─▶ cvs ─┐   selectedCv   hired ─▶ embauchees
                      ▼       ▼            ▼
                    CvPage (inject service)
        [cvs] ▼          [cv] ▼            [cvs] ▼
      ListCv ──(selected)─▶ service.select()
        └─ ItemCv ──(choose)
                       CardCv ──(hire)─▶ service.embaucher()
                                          EmbaucheCv
```

**State placement rule used:** *state shared by several components or surviving navigation → service signal; state used by one component → local signal.*
* Service: `cvsResource`, `selectedCv`, `hired` (shared between list, card, hired list; the selection survives going to `/cv/:id` and back).
* Local: the junior/senior `filter` inside `ListCv` (nobody else cares).
* Presentational components get everything through `input()` and emit through `output()` → reusable and trivially testable. Only `CvPage` and `DetailsCv` know the service.

### 4.2 `CvService`

```ts
@Service()
export class CvService {
  private readonly http = inject(HttpClient);
  private readonly toastr = inject(ToastrService);

  readonly cvsResource = rxResource({ stream: () => this.http.get<Cv[]>(API_URL) });
  readonly cvs = computed<readonly Cv[]>(() =>
    this.cvsResource.hasValue() ? this.cvsResource.value() : FALLBACK_CVS);
  readonly isLoading = this.cvsResource.isLoading;
  readonly isFallback = computed(() => this.cvsResource.error() !== undefined);

  readonly selectedCv = signal<Cv | null>(null);

  private readonly hired = signal<readonly Cv[]>([]);
  readonly embauchees = this.hired.asReadonly();
  private readonly hiredIds = computed(() => new Set(this.hired().map((cv) => cv.id)));
  ...
}
```

Key points:
* **`@Service()`** (Angular 22) is the new decorator for singleton services, replacing `@Injectable({providedIn:'root'})` — required by CLAUDE.md. `autoProvided` is true by default → root singleton, tree-shakable.
* **`rxResource`** replaces `http.get().subscribe()` + `isLoading` flag + `try/catch`: it exposes `value / isLoading / error / status` as signals and **cancels/unsubscribes automatically** (no leak). It is eager on first read of the owning injection context (created in the field initializer → request fired when the service is first injected).
* **Error handling without `catchError`:** the rxjs-branch exercise asks for `catchError`; in the signal branch the error is a *state* (`resource.error()`). `cvs` falls back to `FALLBACK_CVS` and `isFallback` drives a warning banner. `hasValue()` is used instead of `value()` because reading `value()` of a resource in **error state throws**.
* **Encapsulation:** `hired` is private and exposed through `asReadonly()` → components can read but cannot `set` (only `embaucher()` mutates it). Immutable update `[...list, cv]` (a new array reference is what signals compare by `Object.is`).
* **`hiredIds`** is a `computed` `Set` → `isEmbauche(cv)` is O(1) instead of scanning the array, and it is memoized.
* `embaucher` rejects duplicates and notifies with Toastr (`success` / `warning`).
* `getCvById(id)` is a plain method returning an `Observable` (a one-shot query is not shared state, so it does not belong in a signal).

### 4.3 Components

**`ItemCv`** — `cv = input.required<Cv>()`, `active = input(false)`, `choose = output<Cv>()`. A real `<button>` (keyboard-accessible, no click on a `div`), `[class.active]` (no `ngClass`), `[attr.aria-current]`.

**`ListCv`** — `cvs = input.required<readonly Cv[]>()`, `selectedId = input<number|null>()`, `selected = output<Cv>()`, local `filter = signal<'all'|'junior'|'senior'>('all')` and

```ts
protected readonly filteredCvs = computed(() => { /* depends on cvs() AND filter() */ });
```
`filteredCvs` re-evaluates when the **input signal** `cvs` or the **local signal** `filter` changes — this is the point of "inputs are signals". `track cv.id` in `@for` keeps DOM nodes stable; `@empty` handles empty state; `aria-pressed` on the filter buttons.

**`CardCv`** — dumb: `cv`, `hired` inputs, `hire` output; `routerLink="['/cv', cv().id]"`; `NgOptimizedImage` with explicit `width/height` (required, avoids layout shift), `alt=""` because the avatar is decorative.

**`EmbaucheCv`** — displays `cvs()` and a count.

**`CvPage`** — only wiring: `@if (cvService.selectedCv(); as cv)` (control flow with alias) / `@else`. Loading → `role="status"`, fallback error → `role="alert"`.

**`DetailsCv`** (route `/cv/:id`)

```ts
id = input.required<string>();            // bound from the URL by withComponentInputBinding()
protected readonly cvResource = rxResource({
  params: () => this.id(),
  stream: ({ params }) => this.cvService.getCvById(params),
});
```
`params` is a reactive function: when the route param changes while the component stays alive (navigating `/cv/1` → `/cv/2`), the resource **re-fetches and cancels the previous request** automatically. Template: `@if loading / @else if error / @else if value`, with `<dl>` semantic markup.

### 4.4 Routing & lazy loading

```ts
{ path: 'ttc', loadComponent: () => import('./ttc/ttc').then(m => m.Ttc) },
{ path: 'cv',  loadChildren: () => import('./cv/cv.routes').then(m => m.CV_ROUTES) },
```
```ts
export const CV_ROUTES: Routes = [
  { path: '',    loadComponent: () => import('./cv').then(m => m.CvPage) },
  { path: ':id', loadComponent: () => import('./details-cv/details-cv').then(m => m.DetailsCv) },
];
```
Feature code is split into separate chunks — not in the initial bundle (CLAUDE.md: "implement lazy loading for feature routes"). `app.html` got `ttc` and `cv` nav links (`routerLinkActive` + `exact:true` on `/cv` so it isn't active on `/cv/12`). `withComponentInputBinding()` was already enabled in `app.config.ts`.

---

## 5. Tests and verification performed

* `ttc.pricing.spec.ts` — lab example (100/10/18 → 118/1180/0), boundary table 1, 10, 11, 15, 16, 100, discount subtraction, invalid input.
* `ttc.spec.ts` — defaults (0/1/18) rendered; typing 100 in the price input produces `$118.00` (proves the form → signal → computed → DOM chain).
* `cv.service.spec.ts` — API success, API failure → fallback, hire only once (toast called once each), selection. `HttpTestingController` + a stubbed `ToastrService`; `ApplicationRef.whenStable()` waits for the resource.
* Real browser (Playwright/Chromium) against `ng serve`: TTC 12 pieces → $1,132.80 / $283.20 (20 %); 10 pieces → $0.00; CV list loads from the real API, select → card, hire → toast + hired list, "Détails" → `/cv/1330` shows job/age/CIN; **no console errors**.
* `ng build` succeeds (only pre-existing warnings).

Commands:
```bash
npm ci --legacy-peer-deps
npx ng serve        # http://localhost:4200/ttc  and /cv
npx ng test --watch=false
npx ng build
```

---

## 6. CLAUDE.md compliance checklist

standalone only (no `standalone:true`) ✔ · no explicit OnPush ✔ · signals for state ✔ · lazy routes ✔ · no `@HostBinding/@HostListener` ✔ · `NgOptimizedImage` for static images ✔ · `input()/output()` ✔ · `computed()` ✔ · Signal Forms for the new form ✔ · no `ngClass/ngStyle` (`[class.x]`) ✔ · no `CommonModule` (only `CurrencyPipe`, `PercentPipe`, `NgOptimizedImage`) ✔ · native control flow ✔ · `@Service` + `inject()` ✔ · no `mutate` ✔ · labels, roles, `aria-*`, real buttons/links ✔.

---

## 7. Questions the professor could ask — with answers

### Signals fundamentals
**Q1. What is a signal and how is it different from a plain property or a BehaviorSubject?**
A signal is a getter-function wrapping a value with a version/consumer graph. Differences vs a property: reads are tracked, so templates/computeds update automatically without zone.js. Vs `BehaviorSubject`: synchronous and always has a value (like BehaviorSubject), but no `subscribe/unsubscribe`, no operators, no async semantics, automatic dependency tracking, glitch-free, and garbage-collected with its consumers. RxJS stays better for event streams over time (debounce, switchMap, websockets).

**Q2. `computed` vs a method called in the template?** A method runs on every change detection; `computed` runs only when a dependency changed and caches its result (memoized). It is also lazy: never read → never computed.

**Q3. How does `computed` know its dependencies?** At each execution it records the signals actually read; dependencies are *dynamic*. In `cvs`, `value()` is only read when `hasValue()` is true, so `value` is a dependency only in that case.

**Q4. `set` vs `update`?** `set(v)` replaces; `update(fn)` computes from the previous value. Both notify only if the new value differs by `Object.is`. That's why objects/arrays must be replaced immutably (`[...list, cv]`), and why `mutate` was removed.

**Q5. Can you write inside a `computed`?** No — it must be pure/side-effect-free; writing signals there throws (unless explicitly allowed). Use `effect` for side effects.

**Q6. `effect` vs `computed`?** `computed` derives a value; `effect` performs side effects (logging, `localStorage`, manual DOM, router). Effects run asynchronously during change detection. Using an effect to copy state into another signal is an anti-pattern (use `computed` or `linkedSignal`).

**Q7. What is `linkedSignal` and would it fit here?** A writable signal whose value is recomputed from a source when the source changes (e.g. "selected item resets when the list changes"). Here: if we wanted `selectedCv` to reset when `cvs` changes we could write `linkedSignal(() => this.cvs()[0])`. We did not need it; the selection is set only by user action.

**Q8. Why `asReadonly()`?** To expose a signal for reading while keeping writes inside the service (encapsulation, one place mutating `hired`).

**Q9. Why no `effect` in this lab?** Because everything is derivable (`computed`) or event-driven (`output`/method). Effects are a last resort; each one is a hidden dependency that makes data flow harder to follow.

**Q10. What happens if you read a signal inside `untracked`?** The read doesn't register as a dependency. Not used here.

**Q11. What is "glitch-free"?** If `c = computed(a + b)` and both `a` and `b` change in the same tick, `c` is never observed with only one of them updated; it is recomputed once, lazily, on the next read.

### Components / inputs / outputs
**Q12. `@Input()` vs `input()`?** `input()` returns a read-only signal, so you can use it in `computed` and `effect` directly (no `ngOnChanges`). `input.required<T>()` has no default and errors if not bound. Transform/alias options exist.

**Q13. Why do presentational components not inject the service?** Reusability and testability: they depend only on inputs/outputs ("dumb/container" pattern); only the container knows where data comes from.

**Q14. `output()` vs `EventEmitter`?** `output()` is the new API, not an RxJS Subject; same template syntax `(choose)="..."`, with `emit()`.

**Q15. When would you use `model()`?** For two-way binding `[(value)]` — a writable input that also emits. E.g. a reusable rating component.

**Q16. How does `DetailsCv` get its `id`?** `withComponentInputBinding()` maps route params to component inputs by name, so `input.required<string>()` named `id` is filled from `:id`. Previously: `ActivatedRoute.snapshot.params['id']` or an observable subscription. Note route params are strings.

**Q17. Why is `track cv.id` important in `@for`?** It is mandatory in the new control flow; it lets Angular reuse DOM nodes when the array is replaced (here each filter change creates a new array).

**Q18. Why `protected` for template members?** Templates can read `protected` members, but they aren't part of the public API of the class.

### resource / HTTP
**Q19. What is `rxResource`/`resource`?** An async-to-signal bridge. States: `idle, loading, reloading, resolved, error, local`. `rxResource` uses an Observable `stream` (HttpClient); `resource` uses a Promise `loader`. Exposes `value`, `isLoading`, `error`, `status`, `hasValue`, `reload()`, `set()`.

**Q20. How is it different from `toSignal(http.get())`?** `toSignal` converts an observable you own into a signal (needs `initialValue` or `undefined`, errors rethrow on read unless handled, no loading flag, no reactive params). `rxResource` re-runs when `params` change, cancels the in-flight request, and exposes loading/error.

**Q21. What happens if the API is down?** `cvsResource.error()` is set, `hasValue()` is false, `cvs` falls back to `FALLBACK_CVS`, `isFallback` shows the warning. No exception reaches the template. The slides' `catchError` requirement belongs to the RxJS branch; here the error is modelled as state.

**Q22. Why not `catchError`?** It would also work (`catchError(() => of(FALLBACK))`) but would hide the error and lose the `error()` state. Resource error state is more declarative.

**Q23. Why did you use `hasValue()`?** `value()` throws when the resource is in `error` state; `hasValue()` is a safe type-guard.

**Q24. Is there a memory leak?** No manual subscription anywhere. Resource and `HttpClient` observables complete; the resource unsubscribes on destroy/params change.

### Forms
**Q25. What are Signal Forms and why use them for the TTC?** `form(signalModel, schema)` creates a field tree mirroring the model; each field exposes signals (`value`, `valid`, `errors`, `touched`, `dirty`). `[formField]` binds an input. The model signal is the single source of truth and `computed` can read it directly — ideal for a calculator. Validators (`min`, `required`, `maxLength`) are declared in a schema function.

**Q26. Why not `ngModel` / Reactive Forms?** `ngModel` is template-driven and not signal-aware; Reactive Forms are observable-based (`valueChanges`) and need subscriptions. CLAUDE.md prefers Signal Forms for new forms.

**Q27. What does the TTC do when the field is empty?** The number input yields `NaN`/null; `sanitize()` converts it to `0` so the results stay finite.

### Architecture & patterns
**Q28. Which design patterns did you apply?** *Container/Presentational*; *Service as a store* (singleton holding signals — an Observer-based state holder); *Dependency Injection* (`inject()`); *Strategy/table-driven rules* (`DISCOUNT_TIERS`); *Facade* (`CvService` hides HTTP, fallback and notifications from components); *Immutability*; *Single responsibility* per file.

**Q29. Why a service for state and not a global library (NgRx)?** The state is small; a signal-based service gives the same single-source-of-truth with far less code. (The auth exercise explicitly forbids a state library.)

**Q30. (Auth exercise, not implemented) How would you do it with signals?** `AuthService` (`@Service`) with `private user = signal<{id:number,email:string}|null>(null)`, `readonly isAuthenticated = computed(() => !!this.user())`, `readonly userId/email` computed; on login store the token/user in `localStorage` and `set()` the signal; at startup (constructor or `provideAppInitializer`) read `localStorage` to restore state; logout clears both. Navbar and details read the signals; guards use `isAuthenticated()`.

**Q31. How would you add "delete CV"?** `http.delete` in the service, then `cvsResource.reload()` or `cvsResource.update(list => list.filter(...))`, and clear `selectedCv` if it was the deleted one (a `linkedSignal` would do that automatically).

**Q32. How would you persist hired CVs across reloads?** An `effect` writing `hired()` to `localStorage` plus initial value read from it — a legitimate use of `effect`.

**Q33. Why lazy loading?** Smaller initial bundle, faster first paint; `loadComponent`/`loadChildren` produce separate chunks loaded on first navigation.

**Q34. Why is `@Service` used instead of `@Injectable({providedIn:'root'})`?** Angular 22 introduces it as the concise, tree-shakable way to declare singletons (CLAUDE.md prefers it). Behaviour is the same root singleton.

### Zoneless / performance
**Q35. What is zoneless Angular?** No `zone.js` monkey-patching; Angular schedules change detection when signals, `markForCheck`, events, or the async pipe notify it. Smaller bundle, better stack traces, fewer unnecessary checks. Our code is zoneless-ready because all state is in signals.

**Q36. Why is OnPush not set?** It's the default in v22+; setting it explicitly is redundant (CLAUDE.md).

### Migration questions from the slides
**Q37. Which commands migrate to standalone / new control flow / inject?** `ng g @angular/core:standalone` (3 steps in order: convert components → remove NgModules → bootstrap with standalone APIs), `ng g @angular/core:control-flow`, `ng g @angular/core:inject`. The repo is already on Angular 22 and migrated.

### Testing / accessibility
**Q38. How do you test a computed-driven component?** Set the model/input, `await fixture.whenStable()` (zoneless: no `detectChanges` needed), assert on DOM — see `ttc.spec.ts`.

**Q39. Which a11y choices did you make?** Labels bound to inputs, `aria-live` results, `role=status/alert`, `aria-pressed/current`, buttons not divs, decorative `alt=""`, contrast-safe Bootstrap subtle palette, link text that makes sense ("← Retour à la liste").

**Q40. Weak points to admit honestly if asked:** the CV code was written from scratch because there was no existing CV code in the repo; images are a placeholder; the auth exercise was not part of this work; four older spec files were already broken before this work; the unit tests do not cover `ListCv` filtering or `DetailsCv` (candidates for next tests).

---

## 8. File inventory (this work)

```
M src/app/app.html                  nav links ttc / cv
M src/app/app.routes.ts             2 lazy routes
A public/images/avatar.svg
A src/app/ttc/{ttc.ts, ttc.pricing.ts, ttc.pricing.spec.ts, ttc.spec.ts}
A src/app/cv/{cv.ts, cv.routes.ts}
A src/app/cv/model/cv.ts
A src/app/cv/services/{cv.service.ts, cv.service.spec.ts}
A src/app/cv/{list-cv,item-cv,card-cv,embauche-cv,details-cv}/*.ts
A docs/TP1-report.md
```
