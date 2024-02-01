// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { goGetterPatternBoilerPlate } from "./generators/go/getterPatternBoilerPlate";
import { goWithPatternBoilerPlate } from "./generators/go/withPatternBoilerPlate";
import { goBuilderPatternBoilerPlate } from "./generators/go/builderPatternBoilerPlate";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-weaver" is now active!');

  let goWithPattern = vscode.commands.registerCommand(
    "vscode-weaver.goWithPatternBoilerPlate",
    goWithPatternBoilerPlate
  );

  let goGetterPattern = vscode.commands.registerCommand(
    "vscode-weaver.goGetterPatternBoilerPlate",
    goGetterPatternBoilerPlate
  );

  let goBuilderPattern = vscode.commands.registerCommand(
    "vscode-weaver.goBuilderPatternBoilerPlate",
    goBuilderPatternBoilerPlate
  );

  context.subscriptions.push(goWithPattern);
  context.subscriptions.push(goGetterPattern);
  context.subscriptions.push(goBuilderPattern);
}
// This method is called when your extension is deactivated
export function deactivate() {}
