export interface OrganizationPermissionDefinitionProps {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export class OrganizationPermissionDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description?: string;

  constructor(props: OrganizationPermissionDefinitionProps) {
    this.id = props.id;
    this.name = props.name;
    this.category = props.category;
    this.description = props.description;
  }
}
