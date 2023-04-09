# ChatGPT Batch Processor

This Visual Studio Code extension uses ChatGPT to process a batch of files based on user instructions.  This is a great tool for refactoring code, but it can also be used for other purposes.

## Features

- Choose which files to process
- Instruct ChatGPT changes to make to the files
- Process a batch of files using ChatGPT
- Uses ChatGPT to provide refactoring

## Authentication

When you first use ChatGPT, you will need to provide an OpenAI API key. This key is necessary for the extension to access the API and is only sent to OpenAI.

To get your OpenAI API key:

- Go to [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys). If you don't have an account, you will need to sign up first.
- Click "Create new secret key" and copy the generated key.
- Paste the key into VS Code when prompted.

Note: You must have billing set up on your OpenAI account. See the Pricing section below for more information.

### Changing API key

To change your OpenAI API key, use the "ChatGPT: Change OpenAI API key" command in the Command Palette:

- Open the Command Palette by pressing Ctrl + Shift + P.
- Search for "ChatGPT: Change OpenAI API key" and select it.
- Enter your new OpenAI API key (refer to the above instructions).

### Pricing

The ChatGPT API is charged by OpenAI at $0.002 / 1K tokens, which is directly charged to your OpenAI account. To use this extension, you must have billing set up on your account. For more on pricing, visit [https://openai.com/pricing#chat](https://openai.com/pricing#chat).

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
