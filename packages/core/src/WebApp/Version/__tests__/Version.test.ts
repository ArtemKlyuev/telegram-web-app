import { Version } from '../Version';

describe('Version', () => {
  let version: Version;
  const versionValue = '6.7';

  beforeEach(() => {
    version = new Version(versionValue);
  });

  it('should return version', () => {
    expect(version.value).toBe(versionValue);
  });

  describe('set()', () => {
    it('should set version', () => {
      expect(version.value).toBe(versionValue);

      version.set('6.8');

      expect(version.value).toBe('6.8');
    });
  });

  describe('isSuitableTo()', () => {
    it('should return `false` is passed version higher than actual', () => {
      expect(version.isSuitableTo('6.8')).toBe(false);
    });

    it('should return `true` is passed version equal actual', () => {
      expect(version.isSuitableTo('6.7')).toBe(true);
    });

    it('should return `true` is passed version lower actual', () => {
      expect(version.isSuitableTo('6.6')).toBe(true);
    });
  });
});
