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
            vscode.window.showInformationMessage('Enter instructions above.   Found ' + uris.length + ' files to refactor');

            const defaultPrompt = "Refactor to use Typescript and Prisma.";

            const input = await vscode.window.showInputBox({ 
                prompt: 'Enter your instructions for ChatGPT Batch Refactor', 
                value: defaultPrompt,
                ignoreFocusOut: true }) ?? defaultPrompt;


            vscode.window.showInformationMessage('ChatGPT is now refactoring.  Please wait.');

            const messages: ChatCompletionRequestMessage[] = [
                {"role": "system", "content": "Pretend you are a professional software architect that can do code refactoring.  You will receive specific requests to refactor code. You will always explain why you chose to make the changes you did in the refactoring. Include these explanations inline with the code in comments each line beginning with //."},
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

                vscode.window.showInformationMessage('ChatGPT Batch Refactor has finished your request.');

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
    // There are two types of code blocks in the response:

    // The first format has a single comment line and a empty line before the code block
    // And a single empty line and comment line after the code block
    
    // Refactored code using Typescript and Prisma:
    //
    // import { PrismaClient } from '@prisma/client';
    // import stringScore from 'string_score';
    // ...
    //
    // Note: This is just an initial refactoring, there might be other optimizations and improvements that could be done.

    // This second format uses code blocks

    // Refactored code using Typescript and Prisma:
    // ```typescript
    // import { PrismaClient } from '@prisma/client';
    // import stringScore from 'string_score';
    // ```
    // Explanation:
    //
    // 1. Added a type `InsertRecord` and `UpdateRecord` that represents the structure of the `CensusRecord` object. 
    // 2. Imported `Prisma` to interact with the database.
    // 3. Modified the `createRecord`, `mergeRecord`, and `ignoreRecord` functions to interact with the Prisma client.
    // 4. Added return types to each function
    // 5. Created two new functions `getFieldScore` and `getMatches` to find the match and to score each column against another.
    // 6. Made `isInsert` and `isUpdate` functions return a narrow Boolean to properly and safely type out the object in `upsertCensusData`
    // 7. Updated the `upsertCensusData` function to interact with the Prisma client when modifying the data, and to return a Promise of `CensusRecord[]`.
    //
    // Modifications were made to accommodate the `Prisma` client and Typescript. Turning what once was an error-prone project into more manageable code.
    
    if(content.indexOf('```') > 0){
        // Find all the lines before ``` and after ``` and add comment markers
        // Split all lines into an array
        const lines = content.split('\n');
        let startFound = false;
        let endFound = false;
        // For each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if(line.startsWith('```')){
                if(!startFound && !endFound){
                    startFound = true;
                } else {
                    if(startFound && !endFound){
                        endFound = true;
                    }
                }
                lines[i] = '//';
            }

            // Add comment markers to the line if it is not between the ``` markers
            if(!startFound && endFound){
                lines[i] = '// ' + line;
            }

            if(startFound && endFound){
                startFound = false;
                endFound = false;
            }
        }

        return lines.join('\n');
    } else {
        // Split all lines into an array
        const lines = content.split('\n');
        // For each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if(i === 0){
                // Add comment markers to the first and second line
                lines[i] = '// ' + line;
            }

            // // Add comment markers to last line if line before is empty
            // if(i === lines.length - 1){
            //     if(lines[i-1] === '\n'){
            //         lines[i] = '// ' + line;
            //     }
            // }

            // if(i === lines.length - 1){
            //     lines[i] = '// ' + line;
            // }
        }

        // For each line in reverse
        for (let i = lines.length - 1; i >= 0; i=i-2) {
            const line = lines[i];

            // Add comment markers to line and line before if line before is empty
            if(i === lines.length - 1){
                if(lines[i-1] === ''){
                    lines[i] = '// ' + line;
                    lines[i-1] = '// ' + lines[i-1];
                } else {
                    // Stop when we reach the first code block
                    break;
                }
            }
        }

        return lines.join('\n');
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
