'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RichTextEditor({
  value,
  onChange,
  className,
  label = 'Content',
}: {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  /** Accessible name for the editing area (e.g. "Article body"). */
  label?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          'min-h-40 px-3 py-2.5 text-sm focus-visible:outline-offset-[-2px] prose prose-sm max-w-none',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': label,
      },
    },
  });

  React.useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = editor.getHTML();
    if (value && value !== current) editor.commands.setContent(value);
  }, [editor, value]);

  if (!editor) {
    return (
      <div role="status" className="h-40 animate-pulse rounded-xl border border-border bg-bg">
        <span className="sr-only">Loading editor…</span>
      </div>
    );
  }

  const tools = [
    { label: 'Bold', icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { label: 'Italic', icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { label: 'Heading', icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { label: 'Bulleted list', icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { label: 'Numbered list', icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
  ];

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-surface', className)}>
      <div
        role="toolbar"
        aria-label={`${label} formatting`}
        className="flex flex-wrap gap-1 border-b border-divider bg-bg/60 px-2 py-1.5"
      >
        {tools.map(({ label: name, icon: Icon, action, active }) => (
          <button
            key={name}
            type="button"
            onClick={action}
            aria-label={name}
            aria-pressed={active}
            title={name}
            className={cn(
              'grid h-8 w-8 place-items-center rounded-lg text-navy ',
              active ? 'bg-gold/20 text-navy' : 'hover:bg-surface',
            )}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
