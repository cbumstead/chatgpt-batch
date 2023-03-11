// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

//TODO: Ask for API key
const configuration = new Configuration({
  apiKey: "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" // process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ChatGPT Batch Refactor" is now active!');

    const command = 'chatgptBatchRefactor.refactorSelected';
    context.subscriptions.push(vscode.commands.registerCommand(command, async (ctx) => {
        const options: vscode.OpenDialogOptions = {
        canSelectMany: true,
        openLabel: 'Refactor',
        // set the defaultUri to the selected folder
        defaultUri: ctx?.fsPath ? vscode.Uri.file(ctx.fsPath) : undefined,
        filters: {
            'All files': ['*']
        },
        };
        const uris = await vscode.window.showOpenDialog(options);
        if (uris) {
            vscode.window.showInformationMessage('ChatGPT Batch Refactor found ' + uris.length + ' files to refactor');

            const defaultPrompt = "Refactor to use Typescript and Prisma.";

            const input = await vscode.window.showInputBox({ prompt: 'Enter your instructions for ChatGPT Batch Refactor', value: defaultPrompt }) ?? defaultPrompt;

            const messages: ChatCompletionRequestMessage[] = [
                {"role": "system", "content": "You are a ChatGPT vs code extension that can do multi-file refactoring. When you receive a request to refactor code always put any notes in code comments so the file will still build."},
                {"role": "user", "content": input },
            ];

            try {
                // vscode.window.showInformationMessage('ChatGPT Batch Refactor found ' + uris.length + ' files to refactor');

                // Perform refactoring on the selected file/folder.

                // For each file, ask ChatGPT to the refactoring
                for (const uri of uris) {
                    // Read the file
                    const fileContent = await vscode.workspace.fs.readFile(uri);
                    // Ask ChatGPT to refactor the file
                    const response = await openai.createChatCompletion({
                        model: 'gpt-3.5-turbo',
                        messages:[ ...messages,
                            {"role": "assistant", "content": fileContent.toString()},
                    ]});
                    console.log(response.data.choices[0].message?.content);
                    if(response.data.choices[0].message?.content){
                        const content = refactorGraphQL(response.data.choices[0].message.content);
                        // Write the refactored file
                        await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
                    }
                    break; // Only run on one file for now
                }    

                vscode.window.showInformationMessage('ChatGPT Batch Refactor has finished your request to ' + input);

            } catch (error) {
                console.error(error);
            }

            }
    }));
}

// Function to handle the GraphQL refactoring request
function refactorGraphQL(content: string) : string {
    // TODO: USE REGEX GROUP to find matching ``` and ending ```
    // Find all the lines before ``` and after ``` and add comment markers
    // const [before, code, after] = content.split('```');
    // const refactoredCode = [
    //     '//',
    //     before.split('\n').map(line => '// ' + line).join('\n'),
    //     ...code,
    //     after.split('\n').map(line => '// ' + line).join('\n'),
    // ].join('');
    // replace all ``` with //

    const refactoredCode = `//${content.replace(/```/g, '//')}`;
    return refactoredCode;
}

// This method is called when your extension is deactivated
export function deactivate() {}
