'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { BookOpen, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import type {
  ProjectSkillCategory,
  ProjectSkillKind,
  ProjectSkillStatus,
  UIProjectSkill,
} from '@/types/skills';
import { dbProjectSkillToUI, dbSkillDocumentToUI } from '@/lib/transformers/skill';
import type { DBProjectSkill, UISkillDocument } from '@/types/skills';
import { SkillSupabaseService } from '@/services/agents/skillSupabaseService';
import {
  validateProjectSkill360,
  validateSkillDocumentAttach,
} from '@/lib/validation/epic16-agentes-skills';

const CATEGORIES: { value: ProjectSkillCategory; label: string }[] = [
  { value: 'documentation', label: 'Documentação' },
  { value: 'extraction', label: 'Extração' },
  { value: 'research', label: 'Pesquisa' },
  { value: 'governance', label: 'Governança' },
  { value: 'delivery', label: 'Entrega' },
  { value: 'communication', label: 'Comunicação' },
  { value: 'technical', label: 'Técnico' },
  { value: 'custom', label: 'Custom' },
];

const SKILL_TYPES: { value: ProjectSkillKind; label: string }[] = [
  { value: 'web_scrape', label: 'Web / documentação' },
  { value: 'document_extract', label: 'Extração de documentos' },
  { value: 'synthesis', label: 'Síntese' },
  { value: 'monitoring', label: 'Monitoramento' },
  { value: 'template', label: 'Template / checklist' },
  { value: 'risk', label: 'Riscos' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'custom', label: 'Custom' },
];

function statusLabel(s: ProjectSkillStatus) {
  if (s === 'published') return 'Publicado';
  if (s === 'archived') return 'Arquivado';
  return 'Rascunho';
}

interface SkillsCatalogContentProps {
  initialSkills: UIProjectSkill[];
}

export function SkillsCatalogContent({ initialSkills }: SkillsCatalogContentProps) {
  const router = useRouter();
  const [skills, setSkills] = useState(initialSkills);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editing, setEditing] = useState<UIProjectSkill | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  const filtered = useMemo(() => {
    return skills.filter((s) => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [skills, search, categoryFilter, statusFilter]);

  const handleDelete = async (skill: UIProjectSkill) => {
    if (!confirm(`Remover skill "${skill.name}"?`)) return;
    try {
      await SkillSupabaseService.deleteSkill(skill.id);
      setSkills((prev) => prev.filter((x) => x.id !== skill.id));
      if (editing?.id === skill.id) setEditing(null);
      toast.success('Skill removida');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-xs">Buscar</Label>
            <Input
              placeholder="Nome, slug, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Categoria</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="gap-2" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nova skill
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 opacity-50" />
            <p>Nenhuma skill neste filtro.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card
              key={s.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setEditing(s)}
            >
              <CardHeader className="space-y-2 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 font-semibold leading-tight">{s.name}</h3>
                  <Badge variant={s.status === 'published' ? 'default' : 'secondary'}>
                    {statusLabel(s.status)}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">
                    {CATEGORIES.find((c) => c.value === s.category)?.label ?? s.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {SKILL_TYPES.find((t) => t.value === s.skillType)?.label ?? s.skillType}
                  </Badge>
                </div>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDelete(s);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SkillFormSheet
        open={creating}
        mode="create"
        onOpenChange={setCreating}
        saving={saving}
        setSaving={setSaving}
        onSaved={(row) => {
          setSkills((prev) => [...prev, dbProjectSkillToUI(row)].sort((a, b) => a.name.localeCompare(b.name)));
          setCreating(false);
          router.refresh();
        }}
      />

      {editing && (
        <SkillFormSheet
          key={editing.id}
          open
          mode="edit"
          initial={editing}
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
          saving={saving}
          setSaving={setSaving}
          onSaved={(row) => {
            const ui = dbProjectSkillToUI(row);
            setSkills((prev) => prev.map((x) => (x.id === ui.id ? ui : x)));
            setEditing(ui);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function SkillFormSheet({
  open,
  mode,
  initial,
  onOpenChange,
  saving,
  setSaving,
  onSaved,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: UIProjectSkill;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onSaved: (row: DBProjectSkill) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectSkillCategory>('documentation');
  const [skillType, setSkillType] = useState<ProjectSkillKind>('custom');
  const [instructionBody, setInstructionBody] = useState('');
  const [sourceUrls, setSourceUrls] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<ProjectSkillStatus>('draft');
  const [docs, setDocs] = useState<UISkillDocument[]>([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      setName(initial.name);
      setSlug(initial.slug);
      setDescription(initial.description);
      setCategory(initial.category);
      setSkillType(initial.skillType);
      setInstructionBody(initial.instructionBody);
      setSourceUrls(initial.sourceUrls.join('\n'));
      setTags(initial.tags.join(', '));
      setStatus(initial.status);
      void SkillSupabaseService.listDocuments(initial.id)
        .then((rows) => setDocs(rows.map(dbSkillDocumentToUI)))
        .catch(() => setDocs([]));
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setCategory('documentation');
      setSkillType('custom');
      setInstructionBody('');
      setSourceUrls('');
      setTags('');
      setStatus('draft');
      setDocs([]);
    }
    setNewDocTitle('');
    setNewDocContent('');
    setFieldErrors({});
  }, [open, mode, initial]);

  const handleName = (v: string) => {
    setName(v);
    if (mode === 'create') {
      setSlug(
        v
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      );
    }
  };

  const handleSave = async () => {
    const validation = validateProjectSkill360({
      name,
      slug,
      description,
      category,
      skillType,
      status,
      instructionBody,
      sourceUrlsRaw: sourceUrls,
      tagsRaw: tags,
    });

    if (!validation.ok || !validation.payload) {
      setFieldErrors(validation.fieldErrors);
      toast.error(Object.values(validation.fieldErrors)[0] ?? 'Corrija os campos destacados.');
      return;
    }

    setFieldErrors({});
    setSaving(true);
    try {
      const p = validation.payload;

      if (mode === 'create') {
        const row = await SkillSupabaseService.createSkill({
          name: p.name,
          slug: p.slug,
          description: p.description,
          category: p.category,
          skill_type: p.skill_type,
          instruction_body: p.instruction_body,
          source_urls: p.source_urls,
          tags: p.tags,
          status: p.status,
        });
        onSaved(row);
        toast.success('Skill criada');
      } else if (initial) {
        const row = await SkillSupabaseService.updateSkill(initial.id, {
          name: p.name,
          slug: p.slug,
          description: p.description,
          category: p.category,
          skill_type: p.skill_type,
          instruction_body: p.instruction_body,
          source_urls: p.source_urls,
          tags: p.tags,
          status: p.status,
        });
        onSaved(row);
        toast.success('Skill atualizada');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const addDocument = async () => {
    if (!initial?.id) return;
    const docCheck = validateSkillDocumentAttach(newDocTitle);
    if (!docCheck.ok) {
      toast.error(docCheck.message ?? 'Título inválido');
      return;
    }
    setSaving(true);
    try {
      const row = await SkillSupabaseService.createDocument({
        skill_id: initial.id,
        title: newDocTitle.trim(),
        content: newDocContent,
      });
      setDocs((prev) => [...prev, dbSkillDocumentToUI(row)]);
      setNewDocTitle('');
      setNewDocContent('');
      toast.success('Documento anexado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao anexar');
    } finally {
      setSaving(false);
    }
  };

  const removeDocument = async (id: string) => {
    setSaving(true);
    try {
      await SkillSupabaseService.deleteDocument(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success('Documento removido');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-xl">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{mode === 'create' ? 'Nova skill' : 'Editar skill'}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4 pb-8">
            <div>
              <Label>Nome *</Label>
              <Input
                value={name}
                onChange={(e) => {
                  handleName(e.target.value);
                  setFieldErrors({});
                }}
                className={fieldErrors.name ? 'border-destructive' : ''}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setFieldErrors({});
                }}
                className={fieldErrors.slug ? 'border-destructive' : ''}
                aria-invalid={!!fieldErrors.slug}
              />
              {fieldErrors.slug && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.slug}</p>
              )}
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setFieldErrors({});
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ProjectSkillCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de skill</Label>
                <Select value={skillType} onValueChange={(v) => setSkillType(v as ProjectSkillKind)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_TYPES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectSkillStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Corpo da instrução (Markdown)</Label>
              <Textarea
                rows={10}
                className="font-mono text-xs"
                value={instructionBody}
                onChange={(e) => setInstructionBody(e.target.value)}
                placeholder="Instruções que o time ou os agentes devem seguir quando esta skill for acionada..."
              />
            </div>
            <div>
              <Label>URLs de referência (uma por linha)</Label>
              <Textarea
                rows={3}
                className={`font-mono text-xs ${fieldErrors.sourceUrls ? 'border-destructive' : ''}`}
                value={sourceUrls}
                onChange={(e) => {
                  setSourceUrls(e.target.value);
                  setFieldErrors({});
                }}
                aria-invalid={!!fieldErrors.sourceUrls}
              />
              {fieldErrors.sourceUrls && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.sourceUrls}</p>
              )}
            </div>
            <div>
              <Label>Tags (vírgula)</Label>
              <Input
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  setFieldErrors({});
                }}
              />
            </div>

            {mode === 'edit' && initial && (
              <>
                <Separator className="my-2" />
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Documentos anexados</h4>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Textos extraídos, trechos de manuais ou notas coladas pelo usuário (RLS por tenant).
                  </p>
                  <div className="mb-3 space-y-2">
                    {docs.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between gap-2 rounded border px-2 py-1 text-sm"
                      >
                        <span className="truncate">{d.title}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void removeDocument(d.id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 rounded-lg border p-3">
                    <Input
                      placeholder="Título do documento"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Conteúdo (texto extraído ou notas)"
                      rows={4}
                      value={newDocContent}
                      onChange={(e) => setNewDocContent(e.target.value)}
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={() => void addDocument()} disabled={saving}>
                      Anexar documento
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Fechar
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
