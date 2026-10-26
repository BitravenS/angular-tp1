import { DefaultImagePipe } from './default-image.pipe';

describe('DefaultImagePipe', () => {
  const pipe = new DefaultImagePipe();

  it('returns the path when there is one', () => {
    expect(pipe.transform('as.jpg')).toBe('as.jpg');
  });

  it('returns the default image for an empty or blank path', () => {
    expect(pipe.transform('')).toBe('cv.png');
    expect(pipe.transform('   ')).toBe('cv.png');
  });
});
