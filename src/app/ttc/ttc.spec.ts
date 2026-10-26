import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ttc } from './ttc';

describe('Ttc', () => {
  let fixture: ComponentFixture<Ttc>;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Ttc] }).compileComponents();
    fixture = TestBed.createComponent(Ttc);
    await fixture.whenStable();
  });

  it('starts with price 0, quantity 1 and VAT 18', () => {
    const value = (id: string) => (el().querySelector(`#${id}`) as HTMLInputElement).value;
    expect(value('prixHt')).toBe('0');
    expect(value('quantite')).toBe('1');
    expect(value('tva')).toBe('18');
  });

  it('recomputes the results when an input changes', async () => {
    const price = el().querySelector('#prixHt') as HTMLInputElement;
    price.value = '100';
    price.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(el().textContent).toContain('$118.00');
  });
});
