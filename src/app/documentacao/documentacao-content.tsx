'use client';

import * as React from 'react';
import { User } from '@supabase/supabase-js';
import {
    BookOpen,
    FileText,
    Search,
    ChevronRight,
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Eye,
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MarkdownViewer, PdfExportButton } from '@/components/docs';
import type { TocItem } from '@/components/docs';
import type { DocumentCategory, DocumentRecord } from '@/app/actions/documents';
import {
    listDocumentsAction,
    createDocumentAction,
    updateDocumentAction,
    deleteDocumentAction,
} from '@/app/actions/documents';

interface Profile {
    id: string;
    full_name: string | null;
    role: string;
}

interface DocumentacaoContentProps {
    user: User;
    profile: Profile | null;
}

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
    manual: 'Manuais',
    regra_negocio: 'Regras de Negócio',
    arquitetura: 'Arquitetura',
    guia: 'Guias',
};

const CATEGORY_ORDER: DocumentCategory[] = ['manual', 'regra_negocio', 'arquitetura', 'guia'];

export function DocumentacaoContent({ user, profile }: DocumentacaoContentProps) {
    const [documents, setDocuments] = React.useState<DocumentRecord[]>([]);
    const [activeDoc, setActiveDoc] = React.useState<DocumentRecord | null>(null);
    const [tocItems, setTocItems] = React.useState<TocItem[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isEditing, setIsEditing] = React.useState(false);
    const [editContent, setEditContent] = React.useState('');
    const [editTitle, setEditTitle] = React.useState('');
    const [editCategory, setEditCategory] = React.useState<DocumentCategory>('guia');
    const [isCreating, setIsCreating] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [savingStatus, setSavingStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');
    const contentRef = React.useRef<HTMLDivElement>(null);

    const canEdit = profile?.role === 'admin' || profile?.role === 'manager';

    // Load documents
    React.useEffect(() => {
        async function load() {
            setLoading(true);
            const result = await listDocumentsAction();
            if (result.success && result.data) {
                setDocuments(result.data);
                if (result.data.length > 0 && !activeDoc) {
                    setActiveDoc(result.data[0]);
                }
            }
            setLoading(false);
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Group documents by category
    const groupedDocs = React.useMemo(() => {
        const filtered = searchQuery
            ? documents.filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
            : documents;

        const groups: Record<DocumentCategory, DocumentRecord[]> = {
            manual: [],
            regra_negocio: [],
            arquitetura: [],
            guia: [],
        };

        filtered.forEach((doc) => {
            if (groups[doc.category]) {
                groups[doc.category].push(doc);
            }
        });

        return groups;
    }, [documents, searchQuery]);

    // Save handler
    const handleSave = React.useCallback(async () => {
        if (!activeDoc) return;
        setSavingStatus('saving');

        const result = await updateDocumentAction(activeDoc.id, {
            title: editTitle,
            content_md: editContent,
            category: editCategory,
        });

        if (result.success && result.data) {
            setDocuments((prev) =>
                prev.map((d) => (d.id === activeDoc.id ? result.data! : d)),
            );
            setActiveDoc(result.data);
            setSavingStatus('saved');
            setTimeout(() => setSavingStatus('idle'), 2000);
        }
    }, [activeDoc, editTitle, editContent, editCategory]);

    // Create handler
    const handleCreate = React.useCallback(async () => {
        if (!editTitle.trim()) return;
        setSavingStatus('saving');

        const result = await createDocumentAction({
            title: editTitle,
            content_md: editContent || '# ' + editTitle + '\n\nComece a escrever aqui...',
            category: editCategory,
            is_published: true,
        });

        if (result.success && result.data) {
            setDocuments((prev) => [result.data!, ...prev]);
            setActiveDoc(result.data);
            setIsCreating(false);
            setIsEditing(false);
            setSavingStatus('saved');
            setTimeout(() => setSavingStatus('idle'), 2000);
        }
    }, [editTitle, editContent, editCategory]);

    // Delete handler
    const handleDelete = React.useCallback(async () => {
        if (!activeDoc || !confirm('Tem certeza que deseja excluir este documento?')) return;

        const result = await deleteDocumentAction(activeDoc.id);
        if (result.success) {
            setDocuments((prev) => prev.filter((d) => d.id !== activeDoc.id));
            setActiveDoc(null);
            setIsEditing(false);
        }
    }, [activeDoc]);

    // Start editing
    const startEditing = React.useCallback(() => {
        if (!activeDoc) return;
        setEditTitle(activeDoc.title);
        setEditContent(activeDoc.content_md);
        setEditCategory(activeDoc.category);
        setIsEditing(true);
    }, [activeDoc]);

    // Start creating
    const startCreating = React.useCallback(() => {
        setEditTitle('');
        setEditContent('');
        setEditCategory('guia');
        setIsCreating(true);
        setIsEditing(true);
        setActiveDoc(null);
    }, []);

    // Cancel editing
    const cancelEditing = React.useCallback(() => {
        setIsEditing(false);
        setIsCreating(false);
    }, []);

    return (
        <div className="flex flex-col">
            <DashboardHeader title="Documentação" subtitle="Base de conhecimento e materiais de apoio" />

            <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
                {/* ─── Left Sidebar: Document Tree ─── */}
                <aside className="w-72 flex-shrink-0 border-r bg-muted/30 p-4 overflow-y-auto">
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar documentos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                    </div>

                    {canEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mb-4 w-full"
                            onClick={startCreating}
                        >
                            <Plus className="mr-1.5 size-3.5" />
                            Novo Documento
                        </Button>
                    )}

                    {loading ? (
                        <div className="text-center text-sm text-muted-foreground py-8">Carregando...</div>
                    ) : (
                        <nav className="space-y-4">
                            {CATEGORY_ORDER.map((cat) => {
                                const docs = groupedDocs[cat];
                                if (docs.length === 0) return null;

                                return (
                                    <div key={cat}>
                                        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">
                                            <BookOpen className="size-3" />
                                            {CATEGORY_LABELS[cat]}
                                        </h3>
                                        <ul className="space-y-0.5">
                                            {docs.map((doc) => (
                                                <li key={doc.id}>
                                                    <button
                                                        onClick={() => {
                                                            setActiveDoc(doc);
                                                            setIsEditing(false);
                                                            setIsCreating(false);
                                                        }}
                                                        className={`
                              flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors
                              ${activeDoc?.id === doc.id
                                                                ? 'bg-primary/10 text-primary font-medium'
                                                                : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                                                            }
                            `}
                                                    >
                                                        <FileText className="size-3.5 flex-shrink-0" />
                                                        <span className="truncate">{doc.title}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}

                            {documents.length === 0 && !loading && (
                                <div className="text-center text-sm text-muted-foreground py-8">
                                    Nenhum documento encontrado.
                                </div>
                            )}
                        </nav>
                    )}
                </aside>

                {/* ─── Main Content Area ─── */}
                <main className="flex-1 overflow-y-auto">
                    {activeDoc || isCreating ? (
                        <div className="p-6 max-w-4xl mx-auto">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        {isCreating
                                            ? CATEGORY_LABELS[editCategory]
                                            : CATEGORY_LABELS[activeDoc?.category || 'guia']}
                                    </Badge>
                                    {!isEditing && activeDoc && (
                                        <span className="text-xs text-muted-foreground">
                                            Atualizado em{' '}
                                            {new Date(activeDoc.updated_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    )}
                                    {savingStatus === 'saving' && (
                                        <Badge variant="secondary" className="text-xs animate-pulse">
                                            Salvando...
                                        </Badge>
                                    )}
                                    {savingStatus === 'saved' && (
                                        <Badge variant="secondary" className="text-xs text-green-600">
                                            ✓ Salvo
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={isCreating ? handleCreate : handleSave}
                                            >
                                                <Save className="mr-1.5 size-3.5" />
                                                {isCreating ? 'Criar' : 'Salvar'}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={cancelEditing}>
                                                <X className="mr-1 size-3.5" />
                                                Cancelar
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            {activeDoc && (
                                                <PdfExportButton
                                                    contentRef={contentRef}
                                                    title={activeDoc.title}
                                                />
                                            )}
                                            {canEdit && (
                                                <>
                                                    <Button variant="outline" size="sm" onClick={startEditing}>
                                                        <Pencil className="mr-1.5 size-3.5" />
                                                        Editar
                                                    </Button>
                                                    {profile?.role === 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={handleDelete}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Editor or Viewer */}
                            {isEditing ? (
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Título do documento"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="text-lg font-semibold"
                                    />

                                    <div className="flex gap-2">
                                        {CATEGORY_ORDER.map((cat) => (
                                            <Button
                                                key={cat}
                                                variant={editCategory === cat ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setEditCategory(cat)}
                                                className="text-xs"
                                            >
                                                {CATEGORY_LABELS[cat]}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 min-h-[60vh]">
                                        {/* Editor pane */}
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground border-b mb-1">
                                                <Pencil className="size-3" />
                                                Editor Markdown
                                            </div>
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="flex-1 resize-none rounded-md border border-border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                placeholder="# Título&#10;&#10;Escreva em Markdown..."
                                            />
                                        </div>

                                        {/* Preview pane */}
                                        <div className="flex flex-col border rounded-md overflow-hidden">
                                            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground border-b">
                                                <Eye className="size-3" />
                                                Preview
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4">
                                                <MarkdownViewer content={editContent} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div ref={contentRef}>
                                    {activeDoc && (
                                        <>
                                            <h1 className="text-2xl font-bold mb-6 pb-3 border-b border-border">
                                                {activeDoc.title}
                                            </h1>
                                            <MarkdownViewer
                                                content={activeDoc.content_md}
                                                onTocGenerated={setTocItems}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            <div className="text-center space-y-3">
                                <BookOpen className="mx-auto size-12 opacity-30" />
                                <p className="text-sm">Selecione um documento na barra lateral</p>
                                {canEdit && (
                                    <Button variant="outline" size="sm" onClick={startCreating}>
                                        <Plus className="mr-1.5 size-3.5" />
                                        Criar novo documento
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </main>

                {/* ─── Right Sidebar: Table of Contents ─── */}
                {activeDoc && !isEditing && tocItems.length > 0 && (
                    <aside className="hidden xl:block w-56 flex-shrink-0 border-l p-4 overflow-y-auto">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Neste documento
                        </h3>
                        <nav>
                            <ul className="space-y-1">
                                {tocItems.map((item) => (
                                    <li key={item.id}>
                                        <a
                                            href={`#${item.id}`}
                                            className={`
                        block text-sm transition-colors hover:text-primary truncate
                        ${item.level === 1 ? 'font-medium text-foreground/80' : ''}
                        ${item.level === 2 ? 'pl-3 text-foreground/60' : ''}
                        ${item.level === 3 ? 'pl-6 text-foreground/50 text-xs' : ''}
                      `}
                                        >
                                            {item.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>
                )}
            </div>
        </div>
    );
}
