import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstRxjs } from './first-rxjs';

describe('FirstRxjs', () => {
  let component: FirstRxjs;
  let fixture: ComponentFixture<FirstRxjs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstRxjs],
    }).compileComponents();

    fixture = TestBed.createComponent(FirstRxjs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
