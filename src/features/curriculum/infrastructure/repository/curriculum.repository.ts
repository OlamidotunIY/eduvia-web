import {
  CurriculumProfileSummary,
  type CurriculumSearchResult,
  CurriculumTreeNode,
  type CurriculumTreeResponse,
  type ICurriculumRepository,
  type OrganizationCurriculumOverview,
} from "@/shared/domain";
import { curriculumApi } from "../rest/curriculum.api";

export class CurriculumRepository implements ICurriculumRepository {
  async getOverview(
    organizationId: string,
  ): Promise<OrganizationCurriculumOverview> {
    const raw = (await curriculumApi.getOverview(organizationId)) as any;
    if (!raw) {
      return {
        organizationId,
        organizationCountry: "NG",
        coveredCountries: [],
        coveredJurisdictions: [],
        learnerGrades: [],
        enrolledStudentCount: 0,
        offeredSubjects: [],
        unmappedSubjects: [],
        curricula: [],
      };
    }

    return {
      organizationId: String(raw.organizationId ?? organizationId),
      organizationCountry: String(raw.organizationCountry ?? "NG"),
      coveredCountries: Array.isArray(raw.coveredCountries)
        ? raw.coveredCountries
        : [],
      coveredJurisdictions: Array.isArray(raw.coveredJurisdictions)
        ? raw.coveredJurisdictions
        : [],
      learnerGrades: Array.isArray(raw.learnerGrades) ? raw.learnerGrades : [],
      enrolledStudentCount: Number(raw.enrolledStudentCount ?? 0),
      offeredSubjects: Array.isArray(raw.offeredSubjects)
        ? raw.offeredSubjects.map((s: any) => ({
            id: String(s.id),
            name: String(s.name),
            platformSubjectId: s.platformSubjectId ? String(s.platformSubjectId) : null,
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
        ? raw.curricula.map((c: any) => this.toCurriculumProfile(c))
        : [],
    };
  }

  async getTree(
    organizationId: string,
    curriculumId: string,
  ): Promise<CurriculumTreeResponse> {
    const raw = (await curriculumApi.getTree(
      organizationId,
      curriculumId,
    )) as any;
    // The organization-scoped endpoint returns the tree directly. Keep the
    // wrapped form supported as well for compatibility with older contracts.
    const rawTree = Array.isArray(raw) ? raw : raw?.tree;
    const tree: CurriculumTreeNode[] = Array.isArray(rawTree)
      ? rawTree.map((n: any) => this.toTreeNode(n))
      : [];

    return {
      curriculum: {
        id: String(raw?.curriculum?.id ?? curriculumId),
        name: String(raw?.curriculum?.name ?? "Curriculum"),
        shortCode: String(raw?.curriculum?.shortCode ?? ""),
        countryCode: String(raw?.curriculum?.countryCode ?? ""),
        jurisdictionCode: String(
          raw?.curriculum?.jurisdictionCode ??
            raw?.curriculum?.countryCode ??
            "",
        ),
        authority: String(raw?.curriculum?.authority ?? ""),
        description: raw?.curriculum?.description
          ? String(raw.curriculum.description)
          : null,
        sourceUrl: raw?.curriculum?.sourceUrl
          ? String(raw.curriculum.sourceUrl)
          : null,
      },
      totalNodes: raw?.totalNodes ?? this.countTreeNodes(tree),
      tree,
    };
  }

  async search(
    organizationId: string,
    query: string,
    curriculumId?: string,
  ): Promise<CurriculumSearchResult[]> {
    const raw = (await curriculumApi.search(organizationId, query, curriculumId)) as any;
    if (!Array.isArray(raw)) return [];
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

  private toTreeNode(raw: any): CurriculumTreeNode {
    return new CurriculumTreeNode({
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
      children: Array.isArray(raw.children)
        ? raw.children.map((child: any) => this.toTreeNode(child))
        : [],
    });
  }

  private countTreeNodes(nodes: CurriculumTreeNode[]): number {
    let count = nodes.length;
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        count += this.countTreeNodes(node.children);
      }
    }
    return count;
  }

  private toCurriculumProfile(c: any): CurriculumProfileSummary {
    return new CurriculumProfileSummary({
      id: String(c.id),
      name: String(c.name),
      shortCode: String(c.shortCode),
      countryCode: String(c.countryCode),
      jurisdictionCode: String(c.jurisdictionCode ?? c.countryCode),
      authority: String(c.authority),
      description: c.description ? String(c.description) : null,
      version: c.version ? String(c.version) : null,
      sourceUrl: c.sourceUrl ? String(c.sourceUrl) : null,
      isActive: Boolean(c.isActive),
      mappedOfferedSubjectCount: Number(c.mappedOfferedSubjectCount ?? 0),
    });
  }
}

export const curriculumRepository = new CurriculumRepository();
