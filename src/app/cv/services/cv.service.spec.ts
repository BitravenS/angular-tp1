import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { API } from '../../config/api.config';
import { Cv } from '../model/cv';
import { CvService } from './cv.service';

describe('CvService', () => {
  const cv = new Cv(7, 'a', 'b', 'job', '', '12345678', 30);
  let service: CvService;
  let http: HttpTestingController;
  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CvService);
    http = TestBed.inject(HttpTestingController);
    TestBed.tick();
  });

  it('exposes the cvs returned by the API', async () => {
    http.expectOne(API.cv).flush([cv]);
    await settle();
    expect(service.cvs()).toEqual([cv]);
    expect(service.isFallback()).toBe(false);
  });

  it('falls back to the fake cvs when the API fails', async () => {
    http.expectOne(API.cv).flush('boom', { status: 500, statusText: 'Server Error' });
    await settle();
    expect(service.isFallback()).toBe(true);
    expect(service.cvs().length).toBe(2);
  });

  it('keeps track of the selected cv', () => {
    expect(service.selectedCv()).toBeNull();
    service.selectCv(cv);
    expect(service.selectedCv()).toBe(cv);
  });

  it('reloads the list and unselects the cv after deleting it', async () => {
    http.expectOne(API.cv).flush([cv]);
    await settle();
    service.selectCv(cv);
    service.deleteCvById(cv.id).subscribe();
    http.expectOne({ method: 'DELETE', url: API.cv + cv.id }).flush({});
    expect(service.selectedCv()).toBeNull();
    TestBed.tick();
    http.expectOne({ method: 'GET', url: API.cv }).flush([]);
    await settle();
    expect(service.cvs()).toEqual([]);
  });

  it('reloads the list after adding a cv', async () => {
    http.expectOne(API.cv).flush([]);
    await settle();
    service.addCv(cv).subscribe();
    http.expectOne({ method: 'POST', url: API.cv }).flush(cv);
    TestBed.tick();
    http.expectOne({ method: 'GET', url: API.cv }).flush([cv]);
    await settle();
    expect(service.cvs()).toEqual([cv]);
  });
});
