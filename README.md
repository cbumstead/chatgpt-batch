# ChatGPT Batch Processor for VSCode

This Visual Studio Code extension uses ChatGPT to process a batch of files based on user instructions.  This is a great tool for refactoring code, but it can also be used for other purposes.

## Features

- Process a batch of files using ChatGPT
- Change your OpenAI API key
- Uses ChatGPT to provide refactoring suggestions

## Requirements

- Visual Studio Code
- OpenAI API Key

## Installation

1. Download the extension and unzip the contents to your `.vscode/extensions` folder.
2. Restart Visual Studio Code if it was open.

## Usage

1. Open a folder or workspace containing the files you want to process in Visual Studio Code.
2. Right-click on a folder in the file explorer and choose "ChatGPT Batch Process Selected" from the context menu.
3. Enter your OpenAI API key if prompted.
4. Choose the files you want to process.
5. Enter your instructions for ChatGPT, e.g. "Refactor to use Typescript and Prisma."
6. Wait for the processing to finish, and review the results in the processed files.

## Commands

- `chatgptBatch.processSelected`: Processes the selected folder or files with ChatGPT based on user instructions.
- `chatgptBatch.changeOpenAIAPIKey`: Changes the stored OpenAI API key.

## Extension Settings

No settings are required.

## Known Issues

None at the moment.

## Release Notes

### 1.0.0

Initial release of the ChatGPT Batch Processor for Visual Studio Code.
