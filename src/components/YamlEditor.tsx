import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

interface YamlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  readOnly: boolean;
}

export function YamlEditor({ value, onChange, readOnly }: YamlEditorProps) {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('modern-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'string', foreground: 'A3BE8C' },
          { token: 'keyword', foreground: '81A1C1' },
          { token: 'number', foreground: 'B48EAD' },
          { token: 'comment', foreground: '616E88', fontStyle: 'italic' },
        ],
        colors: {
          'editor.background': '#111111',
          'editor.foreground': '#D8DEE9',
          'editorLineNumber.foreground': '#4C566A',
          'editor.lineHighlightBackground': '#1A1A1A',
          'editor.selectionBackground': '#434C5E',
          'editorCursor.foreground': '#88C0D0',
          'editorIndentGuide.background': '#2E3440',
          'editorIndentGuide.activeBackground': '#4C566A',
        }
      });
      monaco.editor.setTheme('modern-dark');
    }
  }, [monaco]);

  return (
    <div className="w-full h-full bg-[#111111] p-2">
      <Editor
        height="100%"
        defaultLanguage="yaml"
        theme="modern-dark"
        value={value}
        onChange={onChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          lineNumbersMinChars: 3,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: 'all',
          roundedSelection: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          folding: true,
          matchBrackets: 'always',
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          }
        }}
        className="rounded-lg overflow-hidden border border-slate-800/50"
      />
    </div>
  );
}
