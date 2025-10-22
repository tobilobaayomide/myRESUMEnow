import { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';
import './TextEditor.css';

const TextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isBullet, setIsBullet] = useState(false);
  const [isNumbered, setIsNumbered] = useState(false);

  // Detect formatting at cursor or caret
  const updateToolbarState = () => {
    if (!editorRef.current) return;
    // Use queryCommandState to check formatting at caret/selection
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
    setIsBullet(document.queryCommandState('insertUnorderedList'));
    setIsNumbered(document.queryCommandState('insertOrderedList'));
  };

  useEffect(() => {
    if (editorRef.current && value && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
    // Listen for selection changes and input events
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateToolbarState();
      }
    };
    const handleInput = () => {
      updateToolbarState();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    if (editorRef.current) {
      editorRef.current.addEventListener('keyup', handleInput);
      editorRef.current.addEventListener('mouseup', handleInput);
      editorRef.current.addEventListener('input', handleInput);
    }
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (editorRef.current) {
        editorRef.current.removeEventListener('keyup', handleInput);
        editorRef.current.removeEventListener('mouseup', handleInput);
        editorRef.current.removeEventListener('input', handleInput);
      }
    };
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateToolbarState();
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
    document.execCommand('bold', false, null);
    handleInput();
  };

  const formatItalic = (e) => {
    e.preventDefault();
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('italic', false, null);
    handleInput();
  };

  const formatUnderline = (e) => {
    e.preventDefault();
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('underline', false, null);
    handleInput();
  };

  const insertList = (e) => {
    e.preventDefault();
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertUnorderedList', false, null);
    handleInput();
  };

  const insertNumberedList = (e) => {
    e.preventDefault();
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertOrderedList', false, null);
    handleInput();
  };

  return (
    <div className="text-editor-container">
      <div className="text-editor-toolbar">
        <button
          type="button"
          onMouseDown={formatBold}
          className={`toolbar-btn${isBold ? ' active' : ''}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onMouseDown={formatItalic}
          className={`toolbar-btn${isItalic ? ' active' : ''}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onMouseDown={formatUnderline}
          className={`toolbar-btn${isUnderline ? ' active' : ''}`}
          title="Underline"
        >
          <Underline size={18} />
        </button>
        <button
          type="button"
          onMouseDown={insertList}
          className={`toolbar-btn${isBullet ? ' active' : ''}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onMouseDown={insertNumberedList}
          className={`toolbar-btn${isNumbered ? ' active' : ''}`}
          title="Numbered List"
        >
          <ListOrdered size={18} />
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
