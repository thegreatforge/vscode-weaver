import * as vscode from "vscode";

export function goGetterPatternBoilerPlate() {
  // check file is open
  var editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No file open");
    return;
  }

  // check we have a go file open
  if (!editor.document.fileName.endsWith(".go")) {
    vscode.window.showErrorMessage("File is not a Go file");
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection).trim();
  const lines = text
    .split("\n")
    .filter((line) => line.trim() !== "\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.trim().replace(/\s+/g, " "));

  if (
    !lines[0].startsWith("type") ||
    !lines[0].endsWith("struct {") ||
    lines[lines.length - 1].trim() !== "}"
  ) {
    vscode.window.showErrorMessage("Selection is not a golang struct");
    return;
  }

  const structName = lines[0].split(" ")[1].trim();

  editor.edit((editBuilder) => {
    for (const line of lines.slice(1, -1)) {
      const lineWithoutTags = line.split("`")[0].trim();
      const lastSpaceIndex = lineWithoutTags.lastIndexOf(" ");
      const dataType = lineWithoutTags.substring(lastSpaceIndex + 1);
      const attributeString = lineWithoutTags.substring(0, lastSpaceIndex);
      const attributes = attributeString
        .split(",")
        .map((attribute) => attribute.trim());

      for (const attribute of attributes) {
        editBuilder.insert(
          selection.end,
          generateGetterPattern(structName, attribute, dataType)
        );
      }
    }
  });
}

function generateGetterPattern(
  structName: string,
  attribute: string,
  dataType: string
): string {
  const capitalizedAttribute = attribute[0].toUpperCase() + attribute.slice(1);
  // check if dataType is a pointer
  if (dataType.startsWith("*")) {
    // get the type of the pointer
    const pointerType = dataType.substring(1);

    if (pointerType === "string") {
      return `
func (s ${structName}) Get${capitalizedAttribute}() string {
  if s.${attribute} == nil {
    return ""
  }
  return *s.${attribute}
}
`;
    }

    if (
      pointerType === "int" ||
      pointerType === "int32" ||
      pointerType === "int64"
    ) {
      return `
func (s ${structName}) Get${capitalizedAttribute}() ${pointerType} {
  if s.${attribute} == nil {
    return 0
  }
  return *s.${attribute}
}`;
    }

    if (
      pointerType === "float32" ||
      pointerType === "float64" ||
      pointerType === "float"
    ) {
      return `
func (s ${structName}) Get${capitalizedAttribute}() ${pointerType} {
  if s.${attribute} == nil {
    return 0.0
  }
  return *s.${attribute}
}`;
    }

    if (pointerType === "bool") {
      return `
func (s ${structName}) Get${capitalizedAttribute}() ${pointerType} {
  if s.${attribute} == nil {
    return false
  }
  return *s.${attribute}
}`;
    }
  }

  return `
func (s ${structName}) Get${capitalizedAttribute}() ${dataType} {
  return s.${attribute}
}
`;
}
