//These tests cover different scenarios for the extension, such as registering commands on activation, prompting for user input, refactoring files, and handling errors. The tests use Jest's mocking capabilities to replace dependencies with functions that return predefined values or mock implementation. Each test case validates the expected result, such as checking if the refactoring succeeded or failed, or if the function prompted the user for input.
import { vscode } from './__mocks__/vscode';
import { OpenAIApi } from 'openai';
import {
  promptForInstructions,
  promptForFilesToRefactor,
  getOpenAIKey,
  refactorFile,
} from './extension';

describe('extension tests', () => {
  describe('refactorSelected command', () => {
    it('should not refactor any files when no files are selected', async () => {
      const openai = {} as OpenAIApi;
      const promptForFilesToRefactor = jest.fn(() => Promise.resolve(undefined));
      const promptForInstructions = jest.fn(() => Promise.resolve('instructions'));
      const showInformationMessage = jest.fn();
      const refactorFile = jest.fn(() => Promise.resolve(false));

      const result = await vscode.commands.executeCommand(
        'chatgptBatchRefactor.refactorSelected',
        null,
        { showInformationMessage },
        openai,
        promptForInstructions,
        promptForFilesToRefactor,
        refactorFile,
      );

      expect(result).toBeUndefined();
      expect(promptForFilesToRefactor).toHaveBeenCalled();
      expect(promptForInstructions).toHaveBeenCalled();
      expect(showInformationMessage).toHaveBeenCalledWith('No files selected for refactoring');
      expect(refactorFile).not.toHaveBeenCalled();
    });

    it('should refactor files when files are selected', async () => {
      const openai = {} as OpenAIApi;
      const files = [vscode.Uri.file('/path/to/file1.js'), vscode.Uri.file('/path/to/file2.ts')];
      const promptForFilesToRefactor = jest.fn(() => Promise.resolve(files));
      const promptForInstructions = jest.fn(() => Promise.resolve('instructions'));
      const showInformationMessage = jest.fn();
      const refactorFile = jest.fn(() => Promise.resolve(true));

      const result = await vscode.commands.executeCommand(
        'chatgptBatchRefactor.refactorSelected',
        null,
        { showInformationMessage },
        openai,
        promptForInstructions,
        promptForFilesToRefactor,
        refactorFile,
      );

      expect(result).toBeUndefined();
      expect(promptForFilesToRefactor).toHaveBeenCalled();
      expect(promptForInstructions).toHaveBeenCalled();
      expect(showInformationMessage).toHaveBeenCalledWith(
        `Enter instructions above. Found ${files.length} files to refactor`,
      );
      expect(showInformationMessage).toHaveBeenCalledWith(
        'ChatGPT is now refactoring. Please wait.',
      );
      expect(refactorFile).toHaveBeenCalledTimes(files.length);
      expect(showInformationMessage).toHaveBeenCalledWith(
        `ChatGPT refactored ${files.length} files.`,
      );
    });
  });

  describe('refactorFile function', () => {
    it('should return false when refactoring fails', async () => {
      const instructions = 'instructions';
      const fileContent = 'code';
      const uri = vscode.Uri.file('/path/to/file.js');
      const openai = {} as OpenAIApi;
      const showInformationMessage = jest.fn();

      //const readFile = jest.fn(() => Buffer.from(fileContent));
      const readFile = jest.fn().mockImplementation((path, callback) => {
        const fileContent = Buffer.from('file content');
        callback(null, fileContent);
        return Promise.resolve(fileContent);
      });

      const createChatCompletion = jest.fn().mockRejectedValue('error');
      const writeFile = jest.fn();

      vscode.workspace.fs.readFile = readFile;
      openai.createChatCompletion = createChatCompletion;
      vscode.workspace.fs.writeFile = writeFile;

      const result = await refactorFile(uri, openai, instructions);

      expect(result).toBe(false);
      expect(showInformationMessage).toHaveBeenCalledWith(`Error refactoring file ${uri.fsPath}`);
      expect(readFile).toHaveBeenCalledWith(uri);
      expect(createChatCompletion).toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });

    it('should return true when refactoring succeeds', async () => {
      const instructions = 'instructions';
      const fileContent = 'code';
      const refactoredContent = 'refactored code';
      const uri = vscode.Uri.file('/path/to/file.js');
      const openai = {} as OpenAIApi;
      const showInformationMessage = jest.fn();
      //const readFile = jest.fn(() => Buffer.from(fileContent));
      const readFile = jest.fn().mockImplementation((path, callback) => {
        const fileContent = Buffer.from('file content');
        callback(null, fileContent);
        return Promise.resolve(fileContent);
      });
      const createChatCompletion = jest
        .fn()
        .mockResolvedValue({ data: { choices: [{ message: { content: refactoredContent } }] } });
      const writeFile = jest.fn();
      vscode.workspace.fs.readFile = readFile;
      openai.createChatCompletion = createChatCompletion;
      vscode.workspace.fs.writeFile = writeFile;

      const result = await refactorFile(uri, openai, instructions);

      expect(result).toBe(true);
      expect(showInformationMessage).toHaveBeenCalledWith(`Refactoring file ${uri.fsPath}`);
      expect(readFile).toHaveBeenCalledWith(uri);
      expect(createChatCompletion).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalledWith(uri, Buffer.from(refactoredContent));
    });
  });

  describe('getOpenAIKey function', () => {
    it('should retrieve the key from secrets when it exists', async () => {
      const context = { secrets: { get: jest.fn(() => Promise.resolve('key')) } } as any;

      const result = await getOpenAIKey(context);

      expect(result).toBe('key');
      expect(context.secrets.get).toHaveBeenCalledWith('openAIKey');
    });

    it('should prompt for the key when it does not exist', async () => {
      const context = {
        secrets: { get: jest.fn(() => Promise.resolve(undefined)), store: jest.fn() },
      } as any;
      const showInputBox = jest.fn(() => Promise.resolve('key'));

      const result = await getOpenAIKey(context, true);

      expect(result).toBe('key');
      expect(context.secrets.get).toHaveBeenCalledWith('openAIKey');
      expect(context.secrets.store).toHaveBeenCalledWith('openAIKey', 'key');
      expect(showInputBox).toHaveBeenCalledWith({
        title: 'OpenAI API Key',
        prompt: 'Enter your OpenAI API key',
        ignoreFocusOut: true,
      });
    });

    it('should return an empty key when no key is provided', async () => {
      const context = {
        secrets: { get: jest.fn(() => Promise.resolve(undefined)), store: jest.fn() },
      } as any;
      const showInputBox = jest.fn(() => Promise.resolve(undefined));

      const result = await getOpenAIKey(context, true);

      expect(result).toBe('');
      expect(context.secrets.get).toHaveBeenCalledWith('openAIKey');
      expect(context.secrets.store).not.toHaveBeenCalled();
      expect(showInputBox).toHaveBeenCalledWith({
        title: 'OpenAI API Key',
        prompt: 'Enter your OpenAI API key',
        ignoreFocusOut: true,
      });
    });
  });

  describe('promptForInstructions function', () => {
    it('should prompt for instructions with default instructions as default value', async () => {
      const defaultInstructions = 'default instructions';
      const showInputBox = jest.fn(() => Promise.resolve('instructions'));

      const result = await promptForInstructions(defaultInstructions);

      expect(result).toBe('instructions');
      expect(showInputBox).toHaveBeenCalledWith({
        prompt: 'Enter your instructions for ChatGPT Batch Refactor',
        value: defaultInstructions,
        ignoreFocusOut: true,
      });
    });

    it('should return default instructions when no instructions is provided', async () => {
      const defaultInstructions = 'default instructions';
      const showInputBox = jest.fn(() => Promise.resolve(undefined));

      const result = await promptForInstructions(defaultInstructions);

      expect(result).toBe(defaultInstructions);
      expect(showInputBox).toHaveBeenCalledWith({
        prompt: 'Enter your instructions for ChatGPT Batch Refactor',
        value: defaultInstructions,
        ignoreFocusOut: true,
      });
    });
  });

  describe('promptForFilesToRefactor function', () => {
    it('should prompt for files to refactor with default directory as defaultUri', async () => {
      const fsPath = '/path/to/dir';
      const showOpenDialog = jest.fn(() => Promise.resolve([vscode.Uri.file('/path/to/file.js')]));

      const result = await promptForFilesToRefactor({ fsPath });

      expect(result).toHaveLength(1);
      expect(showOpenDialog).toHaveBeenCalledWith({
        canSelectMany: true,
        openLabel: 'Refactor',
        defaultUri: vscode.Uri.file('/path/to/dir'),
        filters: { 'All files': ['*'] },
      });
    });

    it('should return undefined when no files are selected', async () => {
      const fsPath = '/path/to/dir';
      const showOpenDialog = jest.fn(() => Promise.resolve(undefined));

      const result = await promptForFilesToRefactor({ fsPath });

      expect(result).toBeUndefined();
      expect(showOpenDialog).toHaveBeenCalledWith({
        canSelectMany: true,
        openLabel: 'Refactor',
        defaultUri: vscode.Uri.file('/path/to/dir'),
        filters: { 'All files': ['*'] },
      });
    });
  });
});
//
