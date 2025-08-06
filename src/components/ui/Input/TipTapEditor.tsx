import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

type MenuBarProps = {
  editor: Editor | null;
  readonly?: boolean;
};

const MenuBar = ({ editor, readonly }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2">
      <button
        type="button"
        onClick={() =>
          readonly ? {} : editor.chain().focus().toggleBold().run()
        }
        className={`p-2 hover:bg-background06 rounded ${editor.isActive('bold') ? 'text-primary' : 'text-text01'}`}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() =>
          readonly ? {} : editor.chain().focus().toggleItalic().run()
        }
        className={`p-2 hover:bg-background06 rounded ${editor.isActive('italic') ? 'text-primary' : 'text-text01'}`}
        title="Italic"
      >
        <i>I</i>
      </button>
      <button
        type="button"
        onClick={() =>
          readonly ? {} : editor.chain().focus().toggleUnderline().run()
        }
        className={`p-2 hover:bg-background06 rounded ${editor.isActive('underline') ? 'text-primary' : 'text-text01'}`}
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={() =>
          readonly ? {} : editor.chain().focus().toggleStrike().run()
        }
        className={`p-2 hover:bg-background06 rounded ${editor.isActive('strike') ? 'text-primary' : 'text-text01'}`}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
      <button
        type="button"
        onClick={() =>
          readonly ? {} : editor.chain().focus().toggleBulletList().run()
        }
        className={`p-2 hover:bg-background06 rounded ${editor.isActive('bulletList') ? 'text-primary' : 'text-text01'}`}
        title="Bullet List"
      >
        •
      </button>
      <button
        type="button"
        onClick={() =>
          readonly ? {} : editor.chain().focus().toggleOrderedList().run()
        }
        className={`p-2 hover:bg-background06 rounded ${editor.isActive('orderedList') ? 'text-primary' : 'text-text01'}`}
        title="Numbered List"
      >
        1.
      </button>
      <button
        type="button"
        onClick={() =>
          readonly ? {} : editor.chain().focus().toggleTaskList().run()
        }
        className={`p-2 hover:bg-background06 rounded ${editor.isActive('taskList') ? 'text-primary' : 'text-text01'}`}
        title="Task List"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="6" height="6" rx="1" />
          <path d="M3 17h6" />
          <path d="M13 5h8" />
          <path d="M13 9h5" />
          <path d="M13 17h8" />
          <path d="M13 21h5" />
        </svg>
      </button>
      <span className="text-text01">...</span>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={() =>
            readonly ? {} : editor.chain().focus().setContent('').run()
          }
          className="p-2 hover:bg-background06 rounded text-text01"
          title="Clear content"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => (readonly ? {} : editor.chain().focus().undo().run())}
          className="p-2 hover:bg-background06 rounded text-text01"
          title="Undo"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
      </div>
    </div>
  );
};

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
};

const TiptapEditor = ({ value, onChange, readonly = false }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<string>(value || '');
  const isEditingRef = useRef<boolean>(false);

  // Add custom CSS to ensure list styles are displayed
  useEffect(() => {
    // Add CSS for ordered and unordered lists
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .ProseMirror ul { list-style-type: disc; margin-left: 1.5em; }
      .ProseMirror ol { list-style-type: decimal; margin-left: 1.5em; }
      .ProseMirror ul li, .ProseMirror ol li { margin-bottom: 0.5em; }
      .ProseMirror ul[data-type="taskList"] { list-style-type: none; margin-left: 0; }
      .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; }
      .ProseMirror ul[data-type="taskList"] li > label { margin-right: 0.5em; }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      // Use only essential parts of StarterKit, manually add what we need
      Document,
      Paragraph,
      Text,
      StarterKit.configure({
        // Disable all list-related extensions from StarterKit
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Underline,
      // Add list extensions with proper configuration
      ListItem.configure({
        HTMLAttributes: {
          class: 'list-item',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'ordered-list',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
    ],
    content: value || '',
    editable: !readonly,
    onUpdate: ({ editor }) => {
      if (readonly) return;
      isEditingRef.current = true;
      const html = editor.getHTML();
      contentRef.current = html;
      if (onChange) onChange(html);
      setTimeout(() => {
        isEditingRef.current = false;
      }, 10);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter') {
          // Allow default Enter behavior for lists
          if (
            editor &&
            (editor.isActive('bulletList') ||
              editor.isActive('orderedList') ||
              editor.isActive('taskList'))
          ) {
            return false; // Let Tiptap handle the Enter key for lists
          }
          event.stopPropagation();
          return false;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && !isEditingRef.current && value !== contentRef.current) {
      contentRef.current = value || '';
      editor.commands.setContent(contentRef.current);
    }
  }, [value, editor]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Don't prevent Enter in lists
      if (
        editor &&
        (editor.isActive('bulletList') ||
          editor.isActive('orderedList') ||
          editor.isActive('taskList'))
      ) {
        return;
      }
      e.stopPropagation();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={wrapperRef}
      className="w-full border rounded overflow-hidden bg-white"
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
    >
      <MenuBar editor={editor} readonly={readonly} />
      <div className="border-t p-4">
        <EditorContent
          editor={editor}
          className="min-h-64 focus:outline-none text-text01"
          placeholder="Комментарий по выполнению"
        />
      </div>
    </div>
  );
};

export default TiptapEditor;
