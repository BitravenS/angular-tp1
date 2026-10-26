import { render } from '../../testing/render';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { API } from '../../../config/api.config';
import { AddCvComponent } from './add-cv.component';

describe('AddCvComponent', () => {
  let fixture: ComponentFixture<AddCvComponent>;
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let toastr: jasmine.SpyObj<ToastrService>;
  const root = () => fixture.nativeElement as HTMLElement;
  const submit = () => root().querySelector('button[type=submit]') as HTMLButtonElement;
  const type = async (id: string, value: string) => {
    const input = root().querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await render(fixture);
  };
  const fillValidForm = async () => {
    await type('name', 'Ben');
    await type('firstname', 'Ali');
    await type('job', 'dev');
    await type('cin', '12345678');
    await type('age', '30');
  };

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    await TestBed.configureTestingModule({
      imports: [AddCvComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toastr },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AddCvComponent);
    await render(fixture);
  });

  it('disables the submit button while the form is invalid', () => {
    expect(submit().disabled).toBeTrue();
  });

  it('rejects a cin that is not 8 digits', async () => {
    await type('cin', '123');
    expect(root().textContent).toContain('Cette Cin est invalide');
    expect(submit().disabled).toBeTrue();
  });

  it('enables the submit button once the form is valid', async () => {
    await fillValidForm();
    expect(submit().disabled).toBeFalse();
  });

  it('posts the cv then navigates to the list', async () => {
    await fillValidForm();
    submit().click();
    const request = http.expectOne({ method: 'POST', url: API.cv });
    expect(request.request.body).toEqual(
      jasmine.objectContaining({ name: 'Ben', firstname: 'Ali', job: 'dev', cin: '12345678', age: 30 })
    );
    request.flush({ id: 1, name: 'Ben', firstname: 'Ali' });
    expect(router.navigate).toHaveBeenCalledWith(['cv']);
    expect(toastr.success).toHaveBeenCalled();
  });

  it('shows an error toast when the server fails', async () => {
    await fillValidForm();
    submit().click();
    http.expectOne({ method: 'POST', url: API.cv }).flush('x', { status: 500, statusText: 'Error' });
    expect(toastr.error).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
