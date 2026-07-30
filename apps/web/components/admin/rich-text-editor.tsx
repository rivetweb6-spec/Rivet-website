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
}: {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          'min-h-40 px-3 py-2.5 text-[0.9375rem] outline-none prose prose-sm max-w-none',
      },
    },
  });

  React.useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = editor.getHTML();
    if (value && value !== current) editor.commands.setContent(value);
  }, [editor, value]);

  if (!editor) {
    return <div className="h-40 animate-pulse rounded-[12px] border border-border bg-bg" />;
  }

  return (
    <div className={cn('overflow-hidden rounded-[12px] border border-border bg-surface', className)}>
      <div className="flex flex-wrap gap-1 border-b border-divider bg-bg/60 px-2 py-1.5">
        {(
          [
            { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
            { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
            { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
            { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
            { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
          ] as const
        ).map(({ icon: Icon, action, active }, i) => (
          <button
            key={i}
            type="button"
            onClick={action}
            className={cn(
              'grid h-8 w-8 place-items-center rounded-[8px] text-navy',
              active ? 'bg-gold/20 text-navy' : 'hover:bg-surface',
            )}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
