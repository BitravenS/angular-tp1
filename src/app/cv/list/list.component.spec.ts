import { render } from '../../testing/render';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Cv } from '../model/cv';
import { ListComponent } from './list.component';

describe('ListComponent', () => {
  let fixture: ComponentFixture<ListComponent>;
  const items = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ListComponent);
    fixture.componentRef.setInput('cvs', [
      new Cv(1, 'a', 'a', 'j', '', '1', 1),
      new Cv(2, 'b', 'b', 'j', '', '1', 1),
      new Cv(3, 'c', 'c', 'j', '', '1', 1),
    ]);
    await render(fixture);
  });

  it('renders one row per cv', () => {
    expect(items().length).toBe(3);
  });

  it('alternates the row colors', () => {
    const [first, second, third] = items();
    expect(first.classList).toContain('list-group-item-secondary');
    expect(second.classList).toContain('list-group-item-primary');
    expect(third.classList).toContain('list-group-item-secondary');
  });

  it('updates when the input changes', async () => {
    fixture.componentRef.setInput('cvs', [new Cv(9, 'z', 'z', 'j', '', '1', 1)]);
    await render(fixture);
    expect(items().length).toBe(1);
  });
});
