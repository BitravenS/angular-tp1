import { render } from '../../testing/render';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API } from '../../../config/api.config';
import { Cv } from '../model/cv';
import { CvService } from '../services/cv.service';
import { AutocompleteComponent } from './autocomplete.component';

describe('AutocompleteComponent', () => {
  let fixture: ComponentFixture<AutocompleteComponent>;
  let http: HttpTestingController;
  const root = () => fixture.nativeElement as HTMLElement;
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const type = async (value: string) => {
    const input = root().querySelector('#search') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await wait(400);
    await render(fixture);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AutocompleteComponent);
    await render(fixture);
  });

  it('sends no request while the search is empty', () => {
    http.expectNone((request) => request.params.has('filter'));
  });

  it('searches by name once the user stops typing and lists the results', async () => {
    await type('Bai');
    const request = http.expectOne((r) => r.url === API.cv && r.params.has('filter'));
    expect(request.request.params.get('filter')).toContain('%Bai%');
    request.flush([new Cv(1, 'Stephan', 'Bailly', 'dev', '', '1', 20)]);
    await render(fixture);
    expect(root().querySelectorAll('li').length).toBe(1);
  });

  it('selects the cv when a result is clicked', async () => {
    const cv = new Cv(1, 'Stephan', 'Bailly', 'dev', '', '1', 20);
    await type('Bai');
    http.expectOne((r) => r.url === API.cv && r.params.has('filter')).flush([cv]);
    await render(fixture);
    (root().querySelector('li button') as HTMLButtonElement).click();
    expect(TestBed.inject(CvService).selectedCv()).toEqual(cv);
  });
});
