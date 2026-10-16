import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestForm } from './test-form';

describe('TestForm', () => {
  let component: TestForm;
  let fixture: ComponentFixture<TestForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TestForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
