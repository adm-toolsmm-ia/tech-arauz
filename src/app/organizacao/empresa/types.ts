/**
 * Unified type for Empresa 360º — items from all 6 entity groups
 */

import type {
  OrgArea,
  OrgProcess,
  OrgSystem,
  OrgSupplier,
  OrgService,
  OrgDocument,
} from '@/types/organization';

export type EmpresaVinculoType =
  | 'areas'
  | 'processos'
  | 'sistemas'
  | 'fornecedores'
  | 'servicos'
  | 'documentos';

export interface EmpresaVinculoBase {
  id: string;
  name: string;
  type: EmpresaVinculoType;
}

export interface EmpresaVinculoArea extends EmpresaVinculoBase {
  type: 'areas';
  entity: OrgArea;
}

export interface EmpresaVinculoProcesso extends EmpresaVinculoBase {
  type: 'processos';
  entity: OrgProcess;
  areaName?: string;
  nucleusName?: string;
}

export interface EmpresaVinculoSistema extends EmpresaVinculoBase {
  type: 'sistemas';
  entity: OrgSystem;
}

export interface EmpresaVinculoFornecedor extends EmpresaVinculoBase {
  type: 'fornecedores';
  entity: OrgSupplier;
}

export interface EmpresaVinculoServico extends EmpresaVinculoBase {
  type: 'servicos';
  entity: OrgService;
}

export interface EmpresaVinculoDocumento extends EmpresaVinculoBase {
  type: 'documentos';
  entity: OrgDocument;
}

export type EmpresaVinculo =
  | EmpresaVinculoArea
  | EmpresaVinculoProcesso
  | EmpresaVinculoSistema
  | EmpresaVinculoFornecedor
  | EmpresaVinculoServico
  | EmpresaVinculoDocumento;

export const VINCULO_ORDER: EmpresaVinculoType[] = [
  'areas',
  'processos',
  'sistemas',
  'fornecedores',
  'servicos',
  'documentos',
];

export const VINCULO_LABELS: Record<EmpresaVinculoType, string> = {
  areas: 'Áreas',
  processos: 'Processos',
  sistemas: 'Sistemas',
  fornecedores: 'Fornecedores',
  servicos: 'Serviços',
  documentos: 'Documentos',
};
