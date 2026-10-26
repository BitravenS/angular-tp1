import { render } from '../../testing/render';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { API } from '../../../config/api.config';
import { Cv } from '../model/cv';
import { DetailsCvComponent } from './details-cv.component';

describe('DetailsCvComponent', () => {
  const cv = new Cv(12, 'Ali', 'Ben', 'dev', 'as.jpg', '12345678', 30);
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let toastr: jasmine.SpyObj<ToastrService>;

  const create = async (authenticated: boolean) => {
    if (authenticated) localStorage.setItem('token', 't');
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [DetailsCvComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toastr },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    const fixture: ComponentFixture<DetailsCvComponent> = TestBed.createComponent(DetailsCvComponent);
    fixture.componentRef.setInput('id', '12');
    await render(fixture);
    return fixture;
  };

  afterEach(() => localStorage.removeItem('token'));

  it('loads the cv of the id given as a string and displays it', async () => {
    const fixture = await create(false);
    http.expectOne(API.cv + 12).flush(cv);
    await render(fixture);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Cv Ali Ben');
    expect(root.textContent).toContain('12345678');
  });

  it('hides the delete button when not authenticated', async () => {
    const fixture = await create(false);
    http.expectOne(API.cv + 12).flush(cv);
    await render(fixture);
    expect((fixture.nativeElement as HTMLElement).querySelector('.btn-danger')).toBeNull();
  });

  it('deletes the cv and goes back to the list when authenticated', async () => {
    const fixture = await create(true);
    http.expectOne(API.cv + 12).flush(cv);
    await render(fixture);
    ((fixture.nativeElement as HTMLElement).querySelector('.btn-danger') as HTMLButtonElement).click();
    http.expectOne({ method: 'DELETE', url: API.cv + 12 }).flush({});
    expect(toastr.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['cv']);
  });

  it('goes back to the list when the cv does not exist', async () => {
    const fixture = await create(false);
    http.expectOne(API.cv + 12).flush('nope', { status: 404, statusText: 'Not Found' });
    await render(fixture);
    expect(router.navigate).toHaveBeenCalledWith(['cv']);
  });
});
