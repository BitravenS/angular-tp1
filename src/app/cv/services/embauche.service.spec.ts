import { TestBed } from '@angular/core/testing';
import { Cv } from '../model/cv';
import { EmbaucheService } from './embauche.service';

describe('EmbaucheService', () => {
  const cv = new Cv(1, 'aymen', 'sellaouti', 'teacher', 'as.jpg', '1234', 40);
  let service: EmbaucheService;

  beforeEach(() => {
    service = TestBed.inject(EmbaucheService);
  });

  it('starts empty', () => {
    expect(service.embauchees()).toEqual([]);
  });

  it('hires a cv and rejects a second hire of the same cv', () => {
    expect(service.embauche(cv)).toBe(true);
    expect(service.embauche(cv)).toBe(false);
    expect(service.embauchees()).toEqual([cv]);
  });

  it('identifies a cv by id, not by reference', () => {
    service.embauche(cv);
    expect(service.embauche({ ...cv })).toBe(false);
  });

  it('publishes a new array on each hire (signal change detection)', () => {
    const before = service.embauchees();
    service.embauche(cv);
    expect(service.embauchees()).not.toBe(before);
    expect(before).toEqual([]);
  });
});
