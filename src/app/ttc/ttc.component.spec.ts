import { render } from '../testing/render';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TtcComponent } from './ttc.component';

describe('TtcComponent', () => {
  let fixture: ComponentFixture<TtcComponent>;
  const root = () => fixture.nativeElement as HTMLElement;
  const input = (id: string) => root().querySelector(`#${id}`) as HTMLInputElement;
  const type = async (id: string, value: string) => {
    input(id).value = value;
    input(id).dispatchEvent(new Event('input'));
    await render(fixture);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TtcComponent] }).compileComponents();
    fixture = TestBed.createComponent(TtcComponent);
    await render(fixture);
  });

  it('starts with price 0, quantity 1 and VAT 18', () => {
    expect(input('prixHt').value).toBe('0');
    expect(input('quantite').value).toBe('1');
    expect(input('tva').value).toBe('18');
  });

  it('recomputes the results when an input changes', async () => {
    await type('prixHt', '100');
    expect(root().textContent).toContain('$118.00');
  });

  it('shows the 20% discount from 11 pieces', async () => {
    await type('prixHt', '100');
    await type('quantite', '12');
    expect(root().textContent).toContain('$1,132.80');
    expect(root().textContent).toContain('$283.20');
    expect(root().textContent).toContain('20%');
  });

  it('shows no discount at 10 pieces', async () => {
    await type('prixHt', '100');
    await type('quantite', '10');
    expect(root().textContent).toContain('$1,180.00');
    expect(root().textContent).toContain('Discount : $0.00');
  });
});
