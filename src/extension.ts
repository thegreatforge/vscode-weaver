// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-weaver" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-weaver.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vscode-weaver!');
	});

	let goWithPattern = vscode.commands.registerCommand('vscode-weaver.goWithPatternBoilerPlate', goWithPatternBoilerPlate);
	context.subscriptions.push(disposable);
}

function goWithPatternBoilerPlate() {
// check file is open
var editor = vscode.window.activeTextEditor;
if (!editor) {
	vscode.window.showErrorMessage("No file open")
	return;
}

// check we have a go file open
if (!editor.document.fileName.endsWith(".go")) {
	vscode.window.showErrorMessage("File is not a Go file")
	return;
}

const selection = editor.selection;
const text = editor.document.getText(selection).trim();
const lines = text
.split("\n")
.filter(line => line.trim() !== "\n")
.filter(line => line.trim().length > 0)
.map(line => line.trim().replace(/\s+/g, ' '));

if (!lines[0].startsWith("type") || !lines[0].endsWith("struct {") || lines[lines.length - 1].trim() !== "}") {
vscode.window.showErrorMessage("Selection is not a golang struct");
return;
}

const structName = lines[0].split(" ")[1].trim();

editor.edit(editBuilder => {
editBuilder.insert(selection.end, `\n${generateOptionType(structName)}`);

for (const line of lines.slice(1, -1)) {
	const lastSpaceIndex = line.lastIndexOf(" ");
	const dataType = line.substring(lastSpaceIndex + 1);
	const attributeString = line.substring(0, lastSpaceIndex);
	const attributes = attributeString.split(",").map(attribute => attribute.trim());

	for (const attribute of attributes) {
		editBuilder.insert(selection.end, generateWithFunction(structName, attribute, dataType));
	}
}

editBuilder.insert(selection.end, `${generateNewWithFunction(structName)}`);
});
}

function generateNewWithFunction(structName: string): string {
	const uncapitalizedStructName = structName[0].toLowerCase() + structName.slice(1);
	return `
func New${structName}(options ...${structName}Option) ${structName} {
	${uncapitalizedStructName} := ${structName}{}

	for _, option := range options {
		${uncapitalizedStructName} = option(${uncapitalizedStructName})
	}

	return ${uncapitalizedStructName}
}
	`;
}

function generateOptionType(structName: string): string {
	return `
type ${structName}Option func(${structName}) ${structName}
	`;
}

function generateWithFunction(structName: string, attribute: string, dataType: string): string {
	const uncapitalizedStructName = structName[0].toLowerCase() + structName.slice(1);
	const capitalizedAttribute = attribute[0].toUpperCase() + attribute.slice(1);
	const uncapitalizedAttribute = attribute[0].toLowerCase() + attribute.slice(1);
	const optionName = `${structName}Option`;
	return `
func With${capitalizedAttribute}(${uncapitalizedAttribute} ${dataType}) ${optionName} {
	return func(${uncapitalizedStructName} ${structName}) ${structName} {
		${uncapitalizedStructName}.${attribute} = ${uncapitalizedAttribute}
		return ${uncapitalizedStructName}
	}
}
	`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
