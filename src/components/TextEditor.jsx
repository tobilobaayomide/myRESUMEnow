import { useRef, useEffect, useState } from 'react';
import { Bold, List } from 'lucide-react';
import './TextEditor.css';

const TextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [isBold, setIsBold] = useState(false);

  useEffect(() => {
    if (editorRef.current && value && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const wrapSelection = (tag) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;
    
    // Create wrapper element
    const wrapper = document.createElement(tag);
    wrapper.textContent = selectedText;
    
    // Delete selected text and insert wrapper
    range.deleteContents();
    range.insertNode(wrapper);
    
    // Move cursor after the inserted element
    range.setStartAfter(wrapper);
    range.setEndAfter(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);
    
    handleInput();
  };

  const formatBold = (e) => {
    e.preventDefault();
    if (!editorRef.current) return;
    editorRef.current.focus();
    wrapSelection('b');
  };

  const insertList = (e) => {
    e.preventDefault();
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertUnorderedList', false, null);
    handleInput();
  };

  return (
    <div className="text-editor-container">
      <div className="text-editor-toolbar">
        <button
          type="button"
          onMouseDown={formatBold}
          className={`toolbar-btn ${isBold ? 'active' : ''}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onMouseDown={insertList}
          className="toolbar-btn"
          title="Bullet List"
        >
          <List size={18} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable="true"
        className="text-editor-content"
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        spellCheck="false"
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
};

export default TextEditor;
