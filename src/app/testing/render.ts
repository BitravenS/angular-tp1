import { ComponentFixture } from '@angular/core/testing';

export async function render(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await new Promise<void>((resolve) => setTimeout(resolve));
  fixture.detectChanges();
}
