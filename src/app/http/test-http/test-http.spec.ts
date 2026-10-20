import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestHttp } from './test-http';

describe('TestHttp', () => {
  let component: TestHttp;
  let fixture: ComponentFixture<TestHttp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHttp],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHttp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
