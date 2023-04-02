import { workspace } from 'vscode';

export const vscode = {
  // mock the vscode API which you use in your project. Jest will tell you which keys are missing.
  ExtensionContext: jest.fn(),
  window: {
    showInformationMessage: jest.fn(),
    showInputBox: jest.fn(),
    showOpenDialog: jest.fn(),
  },
  commands: {
    executeCommand: jest.fn(),
  },
  Uri: {
    file: jest.fn(),
  },
  workspace: {
    fs: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
  },
};
