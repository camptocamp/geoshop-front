import { StripHtmlPipe } from './strip-html.pipe';

describe('StripHtmlPipe', () => {
  let pipe: StripHtmlPipe;

  beforeEach(() => {
    pipe = new StripHtmlPipe();
  });

  it('should remove all html tags', () => {
    const input = '<div>Lorem ipsum <b>dolor sit</b> amet</div>';
    expect(pipe.transform(input)).toBe('Lorem ipsum dolor sit amet');
  });

  it('should allow some tags', () => {
    const input = '<div>Lorem ipsum <b>dolor</b> sit <i>amet,</i> consectetur</div>';
    expect(pipe.transform(input, ['b'])).toBe('Lorem ipsum <b>dolor</b> sit amet, consectetur');
    expect(pipe.transform(input, ['i'])).toBe('Lorem ipsum dolor sit <i>amet,</i> consectetur');
    expect(pipe.transform(input, ['b', 'i'])).toBe('Lorem ipsum <b>dolor</b> sit <i>amet,</i> consectetur');
  });

  it('should handle null and undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should handle empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should remove nested tags not in allow list', () => {
    const input = '<div><span>Lorem <b>ipsum</b></span></div>';
    expect(pipe.transform(input, ['b'])).toBe('Lorem <b>ipsum</b>');
  });
});
