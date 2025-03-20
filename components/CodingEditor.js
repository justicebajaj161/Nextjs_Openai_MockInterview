import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function CodingEditor({ initialCode, onCodeChange, clearEditor }) {
  const [code, setCode] = useState(initialCode || "");

  // Clear the editor when `clearEditor` prop changes
  useEffect(() => {
    if (clearEditor) {
      setCode("");
    }
  }, [clearEditor]);

  const handleEditorChange = (value) => {
    setCode(value);
    onCodeChange(value);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height="400px"
        width="100%"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}