import { render } from '../../testing/render';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { API } from '../../../config/api.config';
import { Cv } from '../model/cv';
import { CvService } from '../services/cv.service';
import { CvComponent } from './cv.component';

describe('CvComponent', () => {
  let fixture: ComponentFixture<CvComponent>;
  let http: HttpTestingController;
  let toastr: jasmine.SpyObj<ToastrService>;
  const root = () => fixture.nativeElement as HTMLElement;
  const names = () => Array.from(root().querySelectorAll('app-list li')).map((li) => li.textContent?.trim());

  beforeEach(async () => {
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'info', 'error']);
    await TestBed.configureTestingModule({
      imports: [CvComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ToastrService, useValue: toastr },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CvComponent);
    await render(fixture);
  });

  it('welcomes the user', () => {
    expect(toastr.info).toHaveBeenCalled();
    http.expectOne(API.cv);
  });

  it('lists the cvs returned by the API', async () => {
    http.expectOne(API.cv).flush([new Cv(1, 'Ali', 'Ben', 'j', '', '1', 1), new Cv(2, 'Sami', 'Tr', 'j', '', '1', 1)]);
    await render(fixture);
    expect(names()).toEqual(['Ali Ben', 'Sami Tr']);
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it('shows the fake cvs and an error toast when the API fails', async () => {
    http.expectOne(API.cv).flush('boom', { status: 500, statusText: 'Server Error' });
    await render(fixture);
    expect(names().length).toBe(2);
    expect(toastr.error).toHaveBeenCalledTimes(1);
  });

  it('shows the card of the selected cv', async () => {
    http.expectOne(API.cv).flush([new Cv(1, 'Ali', 'Ben', 'j', '', '1', 1)]);
    await render(fixture);
    TestBed.inject(CvService).selectCv(new Cv(1, 'Ali', 'Ben', 'j', '', '1', 1));
    await render(fixture);
    expect(root().querySelector('app-cv-card .name')?.textContent).toContain('Ali Ben');
  });
});
