import { render } from '../../testing/render';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Cv } from '../model/cv';
import { EmbaucheService } from '../services/embauche.service';
import { EmbaucheComponent } from './embauche.component';

describe('EmbaucheComponent', () => {
  let fixture: ComponentFixture<EmbaucheComponent>;
  const root = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbaucheComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(EmbaucheComponent);
    await render(fixture);
  });

  it('shows nothing when nobody is hired', () => {
    expect(root().querySelector('.alert')).toBeNull();
  });

  it('shows the hired cvs as soon as the service hires one', async () => {
    TestBed.inject(EmbaucheService).embauche(new Cv(1, 'Ali', 'Ben', 'j', '', '1', 1));
    await render(fixture);
    expect(root().querySelectorAll('app-item').length).toBe(1);
    expect(root().textContent).toContain('Ali Ben');
  });
});
