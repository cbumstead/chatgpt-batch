const vscode = require('vscode');
const axios = require('axios');

function activate(context: { subscriptions: any[]; }) {
  console.log('ChatGPT is now active.');

  let disposable = vscode.commands.registerCommand('chatgpt-batch.chat', async function () {
    const input = await vscode.window.showInputBox({ prompt: 'Enter your instructions for ChatGPT' });
    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt: input,
      max_tokens: 60,
      n: 1,
      stop: '\n',
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.CHAT_GPT_KEY
      }
    });

    const completion = response.data.choices[0].text.trim();
    console.log(completion);
    // TODO: Parse the completion and perform the requested task (e.g., create a copy of the data folder called data-refactor and refactor it to use Prisma)
  });

  context.subscriptions.push(disposable);
}

function deactivate() {
  console.log('ChatGPT is now inactive.');
}

module.exports = {
  activate,
  deactivate
};
