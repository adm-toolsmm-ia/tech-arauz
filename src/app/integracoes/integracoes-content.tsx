'use client';

import * as React from 'react';
import {
  Plug,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronsUpDown,
  AlertTriangle,
  Info,
  ScrollText,
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import type { EspaiderApiRow } from './page';
import type { SyncLogEntry } from '@/integrations/espaider/types';
import { LogViewer } from '@/components/integracoes';

// =============================================================================
// Types
// =============================================================================

interface IntegracoesContentProps {
  apis: EspaiderApiRow[];
  userRole: string;
  tenantId: string;
}

interface ApiFormData {
  nome: string;
  base_url: string;
  token: string;
  identificador: string;
  tipo: string;
  is_active: boolean;
}

const TIPO_LABELS: Record<string, string> = {
  projetos: 'Projetos (Completa)',
  entregas: 'Entregas',
  cronogramas: 'Cronogramas',
  requisitos: 'Requisitos',
  completo: 'API Completa',
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  success: { label: 'Sucesso', variant: 'default', icon: CheckCircle2 },
  partial: { label: 'Parcial', variant: 'secondary', icon: Clock },
  failed: { label: 'Falhou', variant: 'destructive', icon: XCircle },
};

const EMPTY_FORM: ApiFormData = {
  nome: '',
  base_url: 'https://espaider.com.br/Arauz/WCF/WCFExportaDados/WCFExportaDados.svc',
  token: '',
  identificador: '',
  tipo: 'projetos',
  is_active: true,
};

// =============================================================================
// Component
// =============================================================================

export function IntegracoesContent({ apis: initialApis, userRole, tenantId }: IntegracoesContentProps) {
  const [apis, setApis] = React.useState(initialApis);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingApi, setEditingApi] = React.useState<EspaiderApiRow | null>(null);
  const [form, setForm] = React.useState<ApiFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSyncing, setSyncing] = React.useState<string | null>(null);
  const [isTesting, setIsTesting] = React.useState<string | null>(null);
  const [showTokens, setShowTokens] = React.useState<Set<string>>(new Set());
  const [syncLogs, setSyncLogs] = React.useState<SyncLogEntry[]>([]);
  const [showLogs, setShowLogs] = React.useState(false);

  const isAdmin = userRole === 'admin';

  // ===========================================================================
  // Handlers
  // ===========================================================================

  function openCreateDialog() {
    setEditingApi(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  }

  function openEditDialog(api: EspaiderApiRow) {
    setEditingApi(api);
    setForm({
      nome: api.nome,
      base_url: api.base_url,
      token: api.token,
      identificador: api.identificador,
      tipo: api.tipo,
      is_active: api.is_active,
    });
    setIsDialogOpen(true);
  }

  async function handleSave() {
    if (!form.nome || !form.identificador) {
      toast.error('Preencha Nome e Identificador.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/integracoes', {
        method: editingApi ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingApi ? { id: editingApi.id } : {}),
          ...form,
          tenant_id: tenantId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Erro ao salvar API.');
        return;
      }

      if (editingApi) {
        setApis((prev) => prev.map((a) => (a.id === editingApi.id ? result.data : a)));
        toast.success('API atualizada com sucesso.');
      } else {
        setApis((prev) => [...prev, result.data]);
        toast.success('API cadastrada com sucesso.');
      }

      setIsDialogOpen(false);
    } catch {
      toast.error('Erro de conexão ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(apiId: string) {
    if (!confirm('Tem certeza que deseja excluir esta API?')) return;

    try {
      const res = await fetch(`/api/integracoes?id=${apiId}`, { method: 'DELETE' });
      if (res.ok) {
        setApis((prev) => prev.filter((a) => a.id !== apiId));
        toast.success('API removida.');
      } else {
        toast.error('Erro ao remover API.');
      }
    } catch {
      toast.error('Erro de conexão.');
    }
  }

  async function handleSetupDefaultApi() {
    setIsSaving(true);
    try {
      const res = await fetch('/api/integracoes/setup', { method: 'POST' });
      const result = await res.json();

      if (result.success) {
        toast.success(result.message);
        window.location.reload();
      } else {
        toast.error(result.error || 'Erro ao configurar API.');
      }
    } catch {
      toast.error('Erro de conexão ao configurar.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTestConnection(api: EspaiderApiRow) {
    setIsTesting(api.id);
    try {
      const res = await fetch('/api/integracoes/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_url: api.base_url,
          token: api.token,
          identificador: api.identificador,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`Conexão OK! ${result.totalRecords} registros encontrados.`);
      } else {
        toast.error(`Falha na conexão: ${result.error}`);
      }
    } catch {
      toast.error('Erro ao testar conexão.');
    } finally {
      setIsTesting(null);
    }
  }

  async function handleSyncAll() {
    setSyncing('all');
    setSyncLogs([]);
    setShowLogs(true);
    try {
      const res = await fetch('/api/integracoes/sync', { method: 'POST' });
      const result = await res.json();

      if (result.logs) {
        setSyncLogs(result.logs);
      }

      if (result.success) {
        toast.success(result.message);
        // Refresh API cards data
        window.location.reload();
      } else {
        toast.error(result.message || 'Erro na sincronização.');
      }
    } catch {
      toast.error('Erro de conexão na sincronização.');
    } finally {
      setSyncing(null);
    }
  }

  function toggleTokenVisibility(apiId: string) {
    setShowTokens((prev) => {
      const next = new Set(prev);
      if (next.has(apiId)) next.delete(apiId);
      else next.add(apiId);
      return next;
    });
  }

  function maskToken(token: string): string {
    if (token.length <= 8) return '••••••••';
    return `${token.slice(0, 4)}${'•'.repeat(Math.min(token.length - 8, 20))}${token.slice(-4)}`;
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <>
      <DashboardHeader
        title="Integrações"
        subtitle="Gerencie as APIs Espaider conectadas ao portal"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {apis.length} API{apis.length !== 1 ? 's' : ''} cadastrada{apis.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncAll}
              disabled={!!isSyncing || apis.length === 0}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar Todas
            </Button>
            {isAdmin && (
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Nova API
              </Button>
            )}
          </div>
        </div>

        {/* Sync Logs Panel */}
        {syncLogs.length > 0 && (
          <Collapsible open={showLogs} onOpenChange={setShowLogs}>
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full flex justify-between px-0 hover:bg-transparent">
                    <div className="flex items-center gap-2">
                      <ScrollText className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm">Logs da Sincronização ({syncLogs.length} eventos)</CardTitle>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-1 max-h-64 overflow-y-auto text-xs font-mono">
                    {syncLogs.map((log, i) => {
                      const Icon = log.level === 'error' ? XCircle
                        : log.level === 'warn' ? AlertTriangle
                          : log.level === 'success' ? CheckCircle2
                            : Info;
                      const color = log.level === 'error' ? 'text-destructive'
                        : log.level === 'warn' ? 'text-yellow-500'
                          : log.level === 'success' ? 'text-green-500'
                            : 'text-muted-foreground';
                      return (
                        <div key={i} className="flex items-start gap-2 py-1 border-b border-border/50 last:border-0">
                          <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${color}`} />
                          <span className="text-muted-foreground shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                            {log.dataset}
                          </Badge>
                          <span className={color}>{log.message}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* API Cards Grid */}
        {apis.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plug className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Nenhuma API cadastrada.</p>
              {isAdmin && (
                <div className="flex flex-col gap-2 mt-4">
                  <Button onClick={handleSetupDefaultApi} disabled={isSaving}>
                    <Zap className="mr-2 h-4 w-4" />
                    {isSaving ? 'Configurando...' : 'Configurar API Padrão (Projetos)'}
                  </Button>
                  <Button variant="outline" onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar manualmente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {apis.map((api) => {
              const syncStatus = api.last_sync_status
                ? STATUS_CONFIG[api.last_sync_status]
                : null;
              const SyncIcon = syncStatus?.icon || Clock;

              return (
                <Card key={api.id} className={!api.is_active ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {api.nome}
                          {!api.is_active && (
                            <Badge variant="outline" className="text-xs">Inativa</Badge>
                          )}
                        </CardTitle>
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {TIPO_LABELS[api.tipo] || api.tipo}
                          </Badge>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(api)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(api.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Identificador */}
                    <div className="text-xs">
                      <span className="text-muted-foreground">Identificador:</span>{' '}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {api.identificador}
                      </code>
                    </div>

                    {/* Token (masked) */}
                    <div className="text-xs flex items-center gap-1">
                      <span className="text-muted-foreground">Token:</span>{' '}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {showTokens.has(api.id) ? api.token : maskToken(api.token)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => toggleTokenVisibility(api.id)}
                      >
                        {showTokens.has(api.id) ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {/* Last sync */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <SyncIcon className="h-3.5 w-3.5" />
                        <span>Última sync: {formatDate(api.last_sync_at)}</span>
                      </div>
                      {syncStatus && (
                        <Badge variant={syncStatus.variant} className="text-xs">
                          {syncStatus.label}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isTesting === api.id}
                        onClick={() => handleTestConnection(api)}
                      >
                        <Zap className={`mr-1.5 h-3.5 w-3.5 ${isTesting === api.id ? 'animate-pulse' : ''}`} />
                        {isTesting === api.id ? 'Testando...' : 'Testar Conexão'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Log History Section - Admin Only */}
        {isAdmin && (
          <div className="mt-6">
            <LogViewer />
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingApi ? 'Editar API' : 'Nova API Espaider'}</DialogTitle>
            <DialogDescription>
              {editingApi
                ? 'Atualize os dados da integração.'
                : 'Cadastre uma nova API para integração com o Espaider.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Projetos"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projetos">Projetos</SelectItem>
                  <SelectItem value="entregas">Entregas</SelectItem>
                  <SelectItem value="cronogramas">Cronogramas</SelectItem>
                  <SelectItem value="requisitos">Requisitos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="identificador">Identificador *</Label>
              <Input
                id="identificador"
                value={form.identificador}
                onChange={(e) => setForm((f) => ({ ...f, identificador: e.target.value }))}
                placeholder="Ex: BI_SOLICITACOES_SUPORTEESPAIDER"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">API Ativa</Label>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground">
                  Configuração avançada (opcional)
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="grid gap-3 pt-2">
                <p className="text-xs text-muted-foreground">
                  Se vazio, usa as credenciais padrão do sistema.
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="base_url">URL Base</Label>
                  <Input
                    id="base_url"
                    value={form.base_url}
                    onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="token">Token</Label>
                  <Input
                    id="token"
                    type="password"
                    value={form.token}
                    onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
                    placeholder="Usa credencial padrão se vazio"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : editingApi ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
