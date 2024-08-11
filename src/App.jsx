import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import logo from '../public/compile.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as monaco from 'monaco-editor';
import { FidgetSpinner, Oval } from 'react-loader-spinner'

function App() {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [loader, showLoader] = useState(false);
  const defaultCodeCpp = `#include<iostream>\nusing namespace std;\n\nint main(){\n\tcout<<"Hello, World!"<<endl;\n\treturn 0;\n}`;
  const defaultCodeC = `#include <stdio.h>\n\n\nint main(){\n\treturn 0;\n}`;
  const defaultCodeJava = `import java.util.*;\npublic class Main {\n\tpublic static void main(String[] args) {\n\t}\n}`;
  const defaultCodeJavascript = `console.log("Hello, World!")`;

  const defaultCodes = {
    cpp: defaultCodeCpp,
    c: defaultCodeC,
    java: defaultCodeJava,
    javascript: defaultCodeJavascript,
  };

  useEffect(() => {
    // Define the blueish theme
    monaco.editor.defineTheme('blueish-theme', {
      base: 'vs-dark', // Base theme to extend
      inherit: true, // Inherit base theme
      rules: [
        { token: '', foreground: 'd4d4d4' }, // Default text color
        { token: 'keyword', foreground: '569cd6' }, // Blue keywords
        { token: 'identifier', foreground: '9cdcfe' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'delimiter', foreground: 'd4d4d4' },
        { token: 'type', foreground: '4ec9b0' },
        { token: 'comment', foreground: '6a9955' },
      ],
      colors: {
        'editor.background': '#111827', // Editor background color
        'editor.foreground': '#d4d4d4', // Default text color
        'editor.lineHighlightBackground': '#2d2d2d', // Line highlight
        'editorCursor.foreground': '#d4d4d4', // Cursor color
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editorLineNumber.foreground': '#858585', // Line numbers color
      },
    });

    // Set the theme for the editor
    monaco.editor.setTheme('blueish-theme');
  }, []);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    editorRef.current.getModel().updateOptions({
      tabSize: 8,
      insertSpaces: true,
    });
  }

  const copyToast = () => toast("Copied to clipboard!", {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });

  function handleLanguageChange(event) {
    setInput('');
    setOutput('');
    setLanguage(event.target.value);
    editorRef.current.setValue(defaultCodes[event.target.value]); // Set default code on language change
  }

  function handleReset() {
    editorRef.current.setValue(defaultCodes[language]); // Reset to the default code for the selected language
    setOutput('');
    setInput('');
  }

  function handleInputChange(event) {
    setInput(event.target.value);
  }

  function copyToClipboard(value) {
    copyToast();
    navigator.clipboard.writeText(value);
  }

  async function showValue() {
    try {
      const value = editorRef.current.getValue();
      const languageIdMap = {
        javascript: 63,
        java: 62,
        cpp: 53,
        c: 50,
        python: 71
      };
      const language_id = languageIdMap[language];
      showLoader(true);
      const response = await axios.post('http://143.110.184.202:2358/submissions/?base64_encoded=false&wait=true', {
        language_id: language_id,
        source_code: value,
        stdin: input,
      });
      console.log('Response:', response.data);
      setOutput(response.data.stdout || response.data.stderr || response.data.status.description);
    } catch (error) {
      console.error('Error:', error);
      setOutput('An error occurred while executing the code.');
    } finally {
      showLoader(false);
    }
  }
  return (
    <>
      <div style={{ backgroundColor: '#1e1e1e', color: '#ececec' }}>
      <div className='header flex justify-between items-center border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800 shadow-md p-2'>
        <button className='flex items-center'>
          <img src={logo} alt="CompileX Logo" className='h-10 w-10 mr-1 rounded-xl' />
          <div className='flex flex-col mb-3'>
            <h1 className='text-xl text-left font-bold text-white' onClick={handleReset}>CompileX</h1>
            <p className='text-left text-white absolute top-7 text-sm text-gray-400'>Siddhartha Mukherjee & Team</p>
          </div>
        </button>
        <div className='flex items-center'>
          <h1 className='ml-32 text-white mr-3'>Beta Version</h1>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#80ff00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkle"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
        </div>
        <div className='flex items-center'>
          <select value={language} className='bg-gray-700 text-white font-medium py-1 px-3 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2' onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>
          <button className='bg-gray-700 hover:bg-gray-600 text-white font-medium py-1 px-3 rounded shadow focus:outline-none focus:ring-2 focus:ring-red-500 mr-2' onClick={handleReset}>
            Reset
          </button>
          <button className='bg-green-600 hover:bg-green-500 text-white font-medium py-1 px-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-green-500' onClick={showValue}>
            Run Code
          </button>
        </div>
      </div>
      {loader?<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '10', textAlign: 'center', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <Oval
          visible={true}
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="oval-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
        <h1 className='mt-4 text-xl text-white'>Compiling. . . .</h1>
      </div>:null}
      <Editor
        height="68vh"
        width="100vw"
        theme="vs-dark" // Apply the custom theme here
        language={language}
        defaultValue={defaultCodes[language]} // Set the initial value based on the language
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          renderLineHighlight: 'none',
          fontFamily: 'monospace',
          fontSize: 24,
          lineHeight: 24,
          tabSize: 8,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          parameterHints: { enabled: true },
        }}
      />
      <hr style={{ borderWidth: '3px' }} />
      <div className='flex' style={{ width: '100%' }}>
        <div className='header border-b border-gray-700 border-r-2 flex flex-col' style={{ backgroundColor: '#111827', width: '50%', height: '225px', position: 'relative', padding: '16px' }}>
          <h4 className='text-white text-xl mb-2 flex justify-between items-center'>
            Input:
            <button onClick={() => copyToClipboard(input)} className='focus:outline-none'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
            </button>
          </h4>
          <textarea
            type="textarea"
            name="input"
            style={{ backgroundColor: '#1f2937', color: 'white', border: 'none', height: '100%', width: '100%', padding: '12px', borderRadius: '8px', fontSize: '16px', lineHeight: '24px' }}
            placeholder='Your Input Here'
            value={input}
            onChange={handleInputChange}
          />
        </div>
        <div className='header border-b border-gray-700 border-r-2 flex flex-col' style={{ backgroundColor: '#111827', width: '50%', height: '225px', position: 'relative', padding: '16px' }}>
          <h4 className='text-white text-xl mb-2 flex justify-between items-center'>
            Output:
            <button onClick={() => copyToClipboard(output)} className='focus:outline-none'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
            </button>
          </h4>
          <textarea
            type="textarea"
            name="output"
            style={{ backgroundColor: '#1f2937', color: 'white', border: 'none', height: '100%', width: '100%', padding: '12px', borderRadius: '8px', fontSize: '16px', lineHeight: '24px' }}
            placeholder='Your Output Here'
            value={output}
            readOnly
          />
        </div>
      </div>
      <ToastContainer />
    </div>
    </>
  );
}

export default App;
