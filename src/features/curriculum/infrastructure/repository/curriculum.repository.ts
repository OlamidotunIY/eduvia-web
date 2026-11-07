import type {
  CreateCurriculumInput,
  CurriculumListFilter,
  CurriculumProfileSummary,
  CurriculumSearchResult,
  CurriculumTreeNode,
  CurriculumTreeResponse,
  ICurriculumRepository,
  OrganizationCurriculumOverview,
} from "@/shared/domain";
import { curriculumApi } from "../rest/curriculum.api";

function toTreeNode(raw: any): CurriculumTreeNode {
  return {
    id: String(raw.id),
    curriculumId: String(raw.curriculumId),
    parentNodeId: raw.parentNodeId ? String(raw.parentNodeId) : null,
    nodeType: String(raw.nodeType),
    name: String(raw.name),
    code: raw.code ? String(raw.code) : null,
    description: raw.description ? String(raw.description) : null,
    gradeLevel: raw.gradeLevel ? String(raw.gradeLevel) : null,
    depth: Number(raw.depth ?? 0),
    path: String(raw.path ?? ""),
    isLeaf: Boolean(raw.isLeaf),
    isActive: raw.isActive !== false,
    children: Array.isArray(raw.children) ? raw.children.map(toTreeNode) : [],
  };
}

function countTreeNodes(nodes: CurriculumTreeNode[]): number {
  let count = nodes.length;
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      count += countTreeNodes(node.children);
    }
  }
  return count;
}

function toCurriculumProfile(c: any): CurriculumProfileSummary {
  return {
    id: String(c.id),
    name: String(c.name),
    shortCode: String(c.shortCode),
    countryCode: String(c.countryCode),
    authority: String(c.authority),
    description: c.description ? String(c.description) : null,
    version: c.version ? String(c.version) : null,
    isActive: Boolean(c.isActive),
    mappedOfferedSubjectCount: Number(c.mappedOfferedSubjectCount ?? 0),
  };
}

export class CurriculumRepository implements ICurriculumRepository {
  async getOverview(
    organizationId: string,
  ): Promise<OrganizationCurriculumOverview> {
    const raw = (await curriculumApi.getOverview(organizationId)) as any;
    if (!raw) {
      throw new Error("Invalid response from curriculum overview API.");
    }

    return {
      organizationId: String(raw.organizationId ?? organizationId),
      organizationCountry: String(raw.organizationCountry ?? "NG"),
      coveredCountries: Array.isArray(raw.coveredCountries)
        ? raw.coveredCountries.map(String)
        : [],
      enrolledStudentCount: Number(raw.enrolledStudentCount ?? 0),
      offeredSubjects: Array.isArray(raw.offeredSubjects)
        ? raw.offeredSubjects.map((s: any) => ({
            id: String(s.id),
            name: String(s.name),
            platformSubjectId: s.platformSubjectId
              ? String(s.platformSubjectId)
              : null,
            isMapped: Boolean(s.isMapped),
          }))
        : [],
      unmappedSubjects: Array.isArray(raw.unmappedSubjects)
        ? raw.unmappedSubjects.map((s: any) => ({
            id: String(s.id),
            name: String(s.name),
          }))
        : [],
      curricula: Array.isArray(raw.curricula)
        ? raw.curricula.map(toCurriculumProfile)
        : [],
    };
  }

  async listAll(
    filter?: CurriculumListFilter,
  ): Promise<CurriculumProfileSummary[]> {
    const raw = (await curriculumApi.listAll(filter)) as any;
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map(toCurriculumProfile);
  }

  async create(
    data: CreateCurriculumInput,
  ): Promise<CurriculumProfileSummary> {
    const raw = (await curriculumApi.create(data)) as any;
    return toCurriculumProfile(raw);
  }

  async getById(id: string): Promise<CurriculumProfileSummary> {
    const raw = (await curriculumApi.getById(id)) as any;
    return toCurriculumProfile(raw);
  }

  async update(
    id: string,
    data: Partial<CreateCurriculumInput>,
  ): Promise<CurriculumProfileSummary> {
    const raw = (await curriculumApi.update(id, data)) as any;
    return toCurriculumProfile(raw);
  }

  async activate(id: string): Promise<void> {
    await curriculumApi.activate(id);
  }

  async deactivate(id: string): Promise<void> {
    await curriculumApi.deactivate(id);
  }

  async createNode(curriculumId: string, data: any): Promise<any> {
    return curriculumApi.createNode(curriculumId, data);
  }

  async getTreeDirect(curriculumId: string): Promise<CurriculumTreeResponse> {
    const raw = (await curriculumApi.getTreeDirect(curriculumId)) as any;
    if (!raw) {
      throw new Error("Invalid response from curriculum tree API.");
    }
    const nodesArray = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.tree)
        ? raw.tree
        : [];
    const tree = nodesArray.map(toTreeNode);
    const rawCurriculum = !Array.isArray(raw) && raw.curriculum ? raw.curriculum : {};
    return {
      curriculum: {
        id: String(rawCurriculum.id ?? curriculumId),
        name: String(rawCurriculum.name ?? ""),
        shortCode: String(rawCurriculum.shortCode ?? ""),
        countryCode: String(rawCurriculum.countryCode ?? ""),
        authority: String(rawCurriculum.authority ?? ""),
        description: rawCurriculum.description ? String(rawCurriculum.description) : null,
      },
      totalNodes: Number(rawCurriculum.totalNodes ?? raw.totalNodes ?? countTreeNodes(tree)),
      tree,
    };
  }

  async getTree(
    organizationId: string,
    curriculumId: string,
    preview?: boolean,
  ): Promise<CurriculumTreeResponse> {
    const raw = (await curriculumApi.getTree(
      organizationId,
      curriculumId,
      preview,
    )) as any;
    if (!raw) {
      throw new Error("Invalid response from curriculum tree API.");
    }

    const nodesArray = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.tree)
        ? raw.tree
        : [];
    const tree = nodesArray.map(toTreeNode);
    const rawCurriculum = !Array.isArray(raw) && raw.curriculum ? raw.curriculum : {};

    return {
      curriculum: {
        id: String(rawCurriculum.id ?? curriculumId),
        name: String(rawCurriculum.name ?? ""),
        shortCode: String(rawCurriculum.shortCode ?? ""),
        countryCode: String(rawCurriculum.countryCode ?? ""),
        authority: String(rawCurriculum.authority ?? ""),
        description: rawCurriculum.description
          ? String(rawCurriculum.description)
          : null,
      },
      totalNodes: Number(rawCurriculum.totalNodes ?? raw.totalNodes ?? countTreeNodes(tree)),
      tree,
    };
  }

  async search(
    organizationId: string,
    query: string,
    curriculumId?: string,
  ): Promise<CurriculumSearchResult[]> {
    const raw = await curriculumApi.search(organizationId, query, curriculumId);
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.map((item: any) => ({
      id: String(item.id),
      curriculumId: String(item.curriculumId),
      parentNodeId: item.parentNodeId ? String(item.parentNodeId) : null,
      nodeType: String(item.nodeType),
      name: String(item.name),
      code: item.code ? String(item.code) : null,
      description: item.description ? String(item.description) : null,
      gradeLevel: item.gradeLevel ? String(item.gradeLevel) : null,
      depth: Number(item.depth ?? 0),
      path: String(item.path ?? ""),
      isLeaf: Boolean(item.isLeaf),
      isActive: item.isActive !== false,
    }));
  }
}

export const curriculumRepository = new CurriculumRepository();
