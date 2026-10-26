import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { Cv, FALLBACK_CVS } from '../model/cv';
import { CvService } from './cv.service';

describe('CvService', () => {
  const toastr = { success: vi.fn(), warning: vi.fn() };
  const cv: Cv = FALLBACK_CVS[0];
  let service: CvService;
  let http: HttpTestingController;

  beforeEach(() => {
    toastr.success.mockClear();
    toastr.warning.mockClear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ToastrService, useValue: toastr }],
    });
    service = TestBed.inject(CvService);
    http = TestBed.inject(HttpTestingController);
  });

  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  it('exposes the cvs returned by the API', async () => {
    TestBed.tick();
    http.expectOne(() => true).flush([cv]);
    await settle();
    expect(service.cvs()).toEqual([cv]);
    expect(service.isFallback()).toBe(false);
  });

  it('falls back to local data when the API fails', async () => {
    TestBed.tick();
    http.expectOne(() => true).flush('boom', { status: 500, statusText: 'Server Error' });
    await settle();
    expect(service.isFallback()).toBe(true);
    expect(service.cvs()).toBe(FALLBACK_CVS);
  });

  it('hires a cv only once', () => {
    service.embaucher(cv);
    service.embaucher(cv);
    expect(service.embauchees()).toEqual([cv]);
    expect(service.isEmbauche(cv)).toBe(true);
    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(toastr.warning).toHaveBeenCalledTimes(1);
  });

  it('keeps track of the selected cv', () => {
    expect(service.selectedCv()).toBeNull();
    service.select(cv);
    expect(service.selectedCv()).toBe(cv);
  });
});
