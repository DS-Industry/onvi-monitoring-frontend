import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import { message, Tooltip, Input, Button } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  UndoOutlined,
  RedoOutlined,
  ClearOutlined,
  CheckSquareOutlined,
  LinkOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import './TipTapEditor.css';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
  autoResize?: boolean;
};

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  title: string;
}> = ({ onClick, active, icon, title }) => (
  <Tooltip title={title}>
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md text-text02 hover:bg-gray-100 transition ${
        active ? 'bg-blue-100 text-[#0B68E1]' : ''
      }`}
    >
      {icon}
    </button>
  </Tooltip>
);

const TiptapEditor: React.FC<Props> = ({
  value = '',
  onChange,
  readonly = false,
}) => {
  const [, contextHolder] = message.useMessage();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
    ],
    content: value,
    editable: !readonly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const handleAddOrEditLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkValue(previousUrl || '');
    setShowLinkInput(!showLinkInput);
  };

  const applyLink = () => {
    if (linkValue === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkValue })
        .run();
    }
    setShowLinkInput(false);
  };

  return (
    <div className="w-full border rounded-lg shadow-sm bg-white">
      {contextHolder}
      <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 p-2 rounded-t-lg">
        <ToolbarButton
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon={<BoldOutlined />}
        />
        <ToolbarButton
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon={<ItalicOutlined />}
        />
        <ToolbarButton
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          icon={<UnderlineOutlined />}
        />
        <ToolbarButton
          title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          icon={<StrikethroughOutlined />}
        />
        <ToolbarButton
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          icon={<UnorderedListOutlined />}
        />
        <ToolbarButton
          title="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          icon={<OrderedListOutlined />}
        />
        <ToolbarButton
          title="Checklist"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          icon={<CheckSquareOutlined />}
        />

        <ToolbarButton
          title="Add/Edit Link"
          onClick={handleAddOrEditLink}
          active={editor.isActive('link')}
          icon={<LinkOutlined />}
        />
        <ToolbarButton
          title="Remove Link"
          onClick={() => editor.chain().focus().unsetLink().run()}
          icon={<DeleteOutlined />}
        />

        <div className="ml-auto flex gap-1">
          <ToolbarButton
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            icon={<UndoOutlined />}
          />
          <ToolbarButton
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            icon={<RedoOutlined />}
          />
          <ToolbarButton
            title="Clear"
            onClick={() => editor.chain().focus().clearContent().run()}
            icon={<ClearOutlined />}
          />
        </div>
      </div>

      {showLinkInput && (
        <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
          <Input
            placeholder="Enter URL"
            value={linkValue}
            onChange={e => setLinkValue(e.target.value)}
            onPressEnter={applyLink}
            size="small"
          />
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={applyLink}
          />
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={() => setShowLinkInput(false)}
          />
        </div>
      )}

      <div className="p-3 min-h-[200px] prose max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
