// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const getOpenAIKey = async (forceChange: boolean = false) => {
		const secrets = context.secrets;
		const oldOpenAIKey = await secrets.get("openAIKey");
		if (oldOpenAIKey && !forceChange) {
			return oldOpenAIKey;
		}
		const key = await vscode.window.showInputBox({
			title: "OpenAI API Key",
			prompt: "Enter your OpenAI API key",
			ignoreFocusOut: true,
		});
		if (!key) {
			return "";
		}
		secrets.store("openAIKey", key);
		return key;
	};

    const command = 'chatgptBatchRefactor.refactorSelected';
    const refactorCommand = vscode.commands.registerCommand(command, async (ctx) => {
        const apiKey = await getOpenAIKey();
        const configuration = new Configuration({
            apiKey: apiKey,
          });
        const openai = new OpenAIApi(configuration);

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
                    break; //TODO: Only run on one file for now
                }    

                vscode.window.showInformationMessage('ChatGPT Batch Refactor has finished your request to ' + input);

            } catch (error) {
                vscode.window.showInformationMessage('ChatGPT Batch Refactor failed to refactor your code.  Check your API key and try again.');
                console.error(error);
            }

            }
    });

    const updateOpenAIKey = vscode.commands.registerCommand(
		"chatgptBatchRefactor.changeOpenAIAPIKey",
		async () => {
			await getOpenAIKey(true);
		},
	);

    context.subscriptions.push(
		updateOpenAIKey,
        refactorCommand
	);
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
