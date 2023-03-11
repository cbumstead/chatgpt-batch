// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
//import axios from 'axios';

import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { open } from 'fs';

const configuration = new Configuration({
  apiKey: "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" // process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ChatGPT Pro" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('chatgpt-batch.chat', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Welcome to ChatGPT Pro!');

        const defaultPrompt = "Refactor the persons data folder to use Typescript and Prisma.";

        const input = await vscode.window.showInputBox({ prompt: 'Enter your instructions for ChatGPT Pro', value: defaultPrompt }) ?? defaultPrompt;

        const messages: ChatCompletionRequestMessage[] = [
            {"role": "system", "content": "You are a ChatGPT vs code extension that can do multi-file refactoring. When you receive a request to refactor code always put any notes in code comments so the file will still build."},
            {"role": "user", "content": input },
        ];

        try {

            //vscode.window.showInformationMessage('ChatGPT Pro is working on your request to ' + input);

            // const completion = await openai.createChatCompletion({
            //     model: 'gpt-3.5-turbo',
            //     messages: messages
            // });

            // TODO: Let the developer choose the files to refactor in vscode



            // TODO: Find the files to refactor
            const files = await vscode.workspace.findFiles('**/data/persons/**', '**/node_modules/**');

            vscode.window.showInformationMessage('ChatGPT Pro found ' + files.length + ' files to refactor');

            // For each file, ask ChatGPT to the refactoring
            for (const file of files) {
                // Read the file
                const fileContent = await vscode.workspace.fs.readFile(file);
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
                    await vscode.workspace.fs.writeFile(file, Buffer.from(content));
                }
                break; // Only run on one file for now
            }    

            vscode.window.showInformationMessage('ChatGPT Pro has finished your request to ' + input);

        } catch (error) {
            console.error(error);
        }

	});

	context.subscriptions.push(disposable);
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
