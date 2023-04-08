import {
  getOpenAIKey,
} from './extension';

describe('extension tests', () => {
  // More test comming soon
  describe('getOpenAIKey function', () => {
    it('should retrieve the key from secrets when it exists', async () => {
      const context = { secrets: { get: jest.fn(() => Promise.resolve('key')) } } as any;

      const result = await getOpenAIKey(context);

      expect(result).toBe('key');
      expect(context.secrets.get).toHaveBeenCalledWith('openAIKey');
    });
  });
});
//
