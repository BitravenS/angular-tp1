import { render } from '../../testing/render';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { Cv } from '../model/cv';
import { EmbaucheService } from '../services/embauche.service';
import { CvCardComponent } from './cv-card.component';

describe('CvCardComponent', () => {
  const cv = new Cv(5, 'Sami', 'Trabelsi', 'teacher', 'as.jpg', '12345678', 40);
  let fixture: ComponentFixture<CvCardComponent>;
  let toastr: jasmine.SpyObj<ToastrService>;
  const root = () => fixture.nativeElement as HTMLElement;
  const hireButton = () => root().querySelector('button') as HTMLButtonElement;

  beforeEach(async () => {
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'warning']);
    await TestBed.configureTestingModule({
      imports: [CvCardComponent],
      providers: [provideRouter([]), { provide: ToastrService, useValue: toastr }],
    }).compileComponents();
    fixture = TestBed.createComponent(CvCardComponent);
    await render(fixture);
  });

  it('renders nothing without a cv', () => {
    expect(root().querySelector('.card')).toBeNull();
  });

  it('renders the cv and a details link', async () => {
    fixture.componentRef.setInput('cv', cv);
    await render(fixture);
    expect(root().querySelector('.name')?.textContent).toContain('Sami Trabelsi');
    expect(root().querySelector('a.btn-dark')?.getAttribute('href')).toBe('/cv/5');
  });

  it('hires the cv once and warns the second time', async () => {
    fixture.componentRef.setInput('cv', cv);
    await render(fixture);
    hireButton().click();
    hireButton().click();
    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(toastr.warning).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(EmbaucheService).embauchees()).toEqual([cv]);
  });
});
