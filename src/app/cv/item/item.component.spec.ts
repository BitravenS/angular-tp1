import { render } from '../../testing/render';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Cv } from '../model/cv';
import { CvService } from '../services/cv.service';
import { ItemComponent } from './item.component';

describe('ItemComponent', () => {
  const cv = new Cv(3, 'Ali', 'Ben', 'dev', 'as.jpg', '12345678', 30);
  let fixture: ComponentFixture<ItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ItemComponent);
    fixture.componentRef.setInput('cv', cv);
    await render(fixture);
  });

  it('displays the name and the image of the cv', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Ali Ben');
    expect(root.querySelector('img')?.getAttribute('src')).toContain('assets/images/as.jpg');
  });

  it('uses the default image when the path is blank', async () => {
    fixture.componentRef.setInput('cv', new Cv(4, 'a', 'b', 'j', '   ', '1', 1));
    await render(fixture);
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('src')).toContain('assets/images/cv.png');
  });

  it('applies the size given at creation to the image', async () => {
    const sized = TestBed.createComponent(ItemComponent);
    sized.componentRef.setInput('cv', cv);
    sized.componentRef.setInput('size', 150);
    await render(sized);
    const img = (sized.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('width')).toBe('150');
  });

  it('selects the cv when clicked', () => {
    const service = TestBed.inject(CvService);
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(service.selectedCv()).toBe(cv);
  });
});
