'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Heading2, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateProjectNotesAction } from '@/app/actions/projects';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLACEHOLDER = 'Adicione anotações sobre este projeto…';

interface ProjectNotesEditorProps {
  projectId: string;
  initialContent: string | null;
  onSave?: () => void;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  'aria-label': ariaLabel,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  'aria-label': string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8 rounded-md', active && 'bg-muted')}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
}

export const ProjectNotesEditor: React.FC<ProjectNotesEditorProps> = ({
  projectId,
  initialContent,
  onSave,
}) => {
  const [isSaving, setIsSaving] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: PLACEHOLDER }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class:
          'min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 prose prose-sm dark:prose-invert max-w-none',
      },
    },
  });

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const html = editor.getHTML();
      const result = await updateProjectNotesAction(projectId, html === '<p></p>' ? null : html);
      if (result.success) {
        toast.success(result.message);
        onSave?.();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) {
    return (
      <div className="bg-muted/30 flex min-h-[200px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        Carregando editor…
      </div>
    );
  }

  const isEmpty = !initialContent || initialContent === '' || initialContent === '<p></p>';

  return (
    <div className="space-y-4">
      <div
        className="bg-muted/30 flex flex-wrap items-center gap-1 rounded-md border p-2"
        role="toolbar"
        aria-label="Formatação do texto"
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          aria-label="Negrito"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          aria-label="Itálico"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          aria-label="Título"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          aria-label="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          aria-label="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('URL do link:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive('link')}
          aria-label="Inserir link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="rounded-md border bg-background">
        <EditorContent editor={editor} />
      </div>

      {isEmpty && (
        <p className="text-sm text-muted-foreground">
          Use a barra de ferramentas para formatar. Suas anotações ficam salvas apenas neste
          projeto.
        </p>
      )}

      <Button onClick={handleSave} disabled={isSaving} aria-label="Salvar anotações">
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando…
          </>
        ) : (
          'Salvar anotações'
        )}
      </Button>
    </div>
  );
};
