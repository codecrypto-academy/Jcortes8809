import { formatAddress, formatDate, parseTokenFeatures, copyToClipboard } from '../utils';

describe('utils', () => {
  describe('formatAddress', () => {
    it('should format a valid Ethereum address', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const formatted = formatAddress(address);
      expect(formatted).toBe('0x1234...7890');
    });

    it('should format short addresses with ellipsis', () => {
      const address = '0x123';
      const formatted = formatAddress(address);
      expect(formatted).toBe('0x123...x123');
    });

    it('should handle empty string', () => {
      const formatted = formatAddress('');
      expect(formatted).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format a bigint timestamp correctly', () => {
      // 1st January 2024, 00:00:00 UTC
      const timestamp = BigInt(1704067200);
      const formatted = formatDate(timestamp);

      // The exact format depends on the locale, check for valid date string
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle zero timestamp', () => {
      const formatted = formatDate(BigInt(0));
      // Check for valid date string format, not specific year due to timezone
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(typeof formatted).toBe('string');
    });
  });

  describe('parseTokenFeatures', () => {
    it('should parse valid JSON string', () => {
      const json = '{"description": "Test Token", "origin": "Spain"}';
      const parsed = parseTokenFeatures(json);

      expect(parsed).toEqual({
        description: 'Test Token',
        origin: 'Spain',
      });
    });

    it('should parse empty object', () => {
      const json = '{}';
      const parsed = parseTokenFeatures(json);

      expect(parsed).toEqual({});
    });

    it('should return empty object for invalid JSON', () => {
      const json = 'not a valid json';
      const parsed = parseTokenFeatures(json);

      expect(parsed).toEqual({});
    });

    it('should return empty object for empty string', () => {
      const parsed = parseTokenFeatures('');

      expect(parsed).toEqual({});
    });

    it('should parse complex nested JSON', () => {
      const json = '{"description": "Token", "certifications": ["ISO", "HACCP"], "metadata": {"weight": 100}}';
      const parsed = parseTokenFeatures(json);

      expect(parsed.description).toBe('Token');
      expect(parsed.certifications).toEqual(['ISO', 'HACCP']);
      expect(parsed.metadata).toEqual({ weight: 100 });
    });
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });
    });

    it('should copy text to clipboard successfully', async () => {
      const text = '0x1234567890123456789012345678901234567890';
      const result = await copyToClipboard(text);

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    it('should return false when clipboard API fails', async () => {
      // Mock clipboard to throw error
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('Failed')),
        },
      });

      const text = 'test';
      const result = await copyToClipboard(text);

      expect(result).toBe(false);
    });

    it('should return false when clipboard API is not available', async () => {
      // Remove clipboard from navigator
      const originalClipboard = navigator.clipboard;
      // @ts-ignore
      delete navigator.clipboard;

      const text = 'test';
      const result = await copyToClipboard(text);

      expect(result).toBe(false);

      // Restore clipboard
      Object.assign(navigator, { clipboard: originalClipboard });
    });
  });
});
