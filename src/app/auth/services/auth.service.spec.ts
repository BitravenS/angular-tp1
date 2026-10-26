import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API } from '../../config/api.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const setup = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { service: TestBed.inject(AuthService), http: TestBed.inject(HttpTestingController) };
  };

  beforeEach(() => localStorage.clear());

  it('is not authenticated by default', () => {
    const { service } = setup();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.email()).toBeNull();
  });

  it('stores id, email and token on login', () => {
    const { service, http } = setup();
    service.login({ email: 'a@b.tn', password: '1234' }).subscribe();
    http.expectOne(API.login).flush({ id: 'tok', ttl: 1, created: new Date(), userId: 5 });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.userId()).toBe(5);
    expect(service.email()).toBe('a@b.tn');
    expect(service.token()).toBe('tok');
  });

  it('reloads the user state when the application starts', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 't', userId: 9, email: 'x@y.z' }));
    const { service } = setup();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.userId()).toBe(9);
  });

  it('ignores a corrupted saved state', () => {
    localStorage.setItem('auth', '{not json');
    expect(setup().service.isAuthenticated()).toBe(false);
    localStorage.setItem('auth', JSON.stringify({ token: 1 }));
    expect(setup().service.isAuthenticated()).toBe(false);
  });

  it('clears the state and the storage on logout', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 't', userId: 9, email: 'x@y.z' }));
    const { service } = setup();
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth')).toBeNull();
  });
});
