import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Lock,
  MessageSquare,
  Search,
  Users,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { Checkbox } from "@/shared/ui/checkbox";
import type {
  OrganizationPermissionDefinition,
  OrganizationRoleDefinition,
} from "@/shared/domain";
import type {
  CreateOrganizationRoleDto,
  UpdateOrganizationRoleDto,
} from "@/shared/api/generated";

interface RoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: OrganizationRoleDefinition | null; // null if creating a new role
  permissionsCatalog: OrganizationPermissionDefinition[];
  onSaveRole: (data: {
    roleId?: string;
    dto: CreateOrganizationRoleDto | UpdateOrganizationRoleDto;
  }) => void;
  isSaving?: boolean;
}

function getCategoryIcon(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes("classroom")) return Users;
  if (cat.includes("lesson")) return BookOpen;
  if (cat.includes("assessment")) return ClipboardCheck;
  if (cat.includes("progress")) return BarChart3;
  if (cat.includes("communication")) return MessageSquare;
  return Building2;
}

export function RoleDrawer({
  isOpen,
  onClose,
  role,
  permissionsCatalog,
  onSaveRole,
  isSaving,
}: RoleDrawerProps) {
  const isEditing = Boolean(role);
  const isSystemRole = Boolean(role?.isSystem);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Sync state when role changes or drawer opens
  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description ?? "");
      setSelectedPermissions([...role.permissions]);
    } else {
      setName("");
      setDescription("");
      setSelectedPermissions([]);
    }
    setSearchTerm("");
  }, [role, isOpen]);

  // Group permissions by category
  const categories = useMemo(() => {
    const map = new Map<string, OrganizationPermissionDefinition[]>();
    for (const perm of permissionsCatalog) {
      const cat = perm.category || "General Management";
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(perm);
    }
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [permissionsCatalog]);

  // Filtered categories based on search input
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.trim().toLowerCase();

    return categories
      .map(({ category, items }) => {
        const filteredItems = items.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.id.toLowerCase().includes(term) ||
            category.toLowerCase().includes(term),
        );
        return { category, items: filteredItems };
      })
      .filter(({ items }) => items.length > 0);
  }, [categories, searchTerm]);

  // Toggle single permission selection
  const handleTogglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  // Toggle category all
  const handleToggleCategory = (categoryItems: OrganizationPermissionDefinition[]) => {
    const itemIds = categoryItems.map((item) => item.id);
    const allSelected = itemIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      // Unselect all in this category
      setSelectedPermissions((prev) => prev.filter((id) => !itemIds.includes(id)));
    } else {
      // Select all in this category
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  // Select all permissions
  const handleSelectAll = () => {
    const allIds = permissionsCatalog.map((p) => p.id);
    setSelectedPermissions(allIds);
  };

  // Clear all permissions
  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  // Toggle category collapse
  const handleToggleCollapse = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const dto = {
      name: name.trim(),
      description: description.trim() || undefined,
      permissions: selectedPermissions as any[],
    };

    onSaveRole({
      roleId: role?.id,
      dto,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg md:max-w-xl flex flex-col p-0 gap-0 bg-background border-l border-border/80"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border/70 text-left shrink-0">
          <SheetTitle className="text-xl font-bold font-serif text-foreground">
            {isEditing ? "Edit Role" : "Create Role"}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground mt-0.5">
            {isEditing
              ? "Update the role details and permissions."
              : "Define the role details and permissions."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Role Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Role name
              </label>
              {isSystemRole && (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[11px] gap-1 px-2 py-0.5 rounded-md font-medium"
                >
                  <Lock className="size-3" />
                  <span>System role</span>
                </Badge>
              )}
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Academic Coordinator"
              disabled={isSystemRole || isSaving}
              className="h-9 text-xs rounded-lg bg-card/50 border-border/80"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the responsibilities and scope for this role..."
              rows={3}
              disabled={isSaving}
              className="text-xs rounded-lg bg-card/50 border-border/80 resize-none"
            />
          </div>

          {/* Permissions Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Permissions
                </span>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[11px] px-2 py-0.5 rounded-full font-medium"
                >
                  {selectedPermissions.length} selected
                </Badge>
              </div>
            </div>

            {/* Search and Bulk Select Actions */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search permissions..."
                  className="h-8 pl-8 text-xs rounded-lg bg-card/50 border-border/80"
                />
              </div>
              <div className="flex items-center gap-2 text-xs shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-muted-foreground hover:text-emerald-400 font-medium transition-colors cursor-pointer"
                >
                  Select all
                </button>
                <span className="text-muted-foreground/40">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Categorized Permissions Accordion */}
            <div className="space-y-2 pt-1">
              {filteredCategories.map(({ category, items }) => {
                const IconComp = getCategoryIcon(category);
                const categoryItemIds = items.map((i) => i.id);
                const selectedInCat = categoryItemIds.filter((id) =>
                  selectedPermissions.includes(id),
                ).length;
                const totalInCat = categoryItemIds.length;
                const isAllSelected = totalInCat > 0 && selectedInCat === totalInCat;
                const isPartiallySelected = selectedInCat > 0 && selectedInCat < totalInCat;
                const isCollapsed = Boolean(collapsedCategories[category]);

                return (
                  <div
                    key={category}
                    className="border border-border/70 rounded-xl bg-card/40 overflow-hidden transition-colors"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-card/60 hover:bg-card/90 cursor-pointer transition-colors select-none">
                      <div
                        className="flex items-center gap-2.5 flex-1 min-w-0"
                        onClick={() => handleToggleCategory(items)}
                      >
                        <Checkbox
                          checked={isAllSelected}
                          indeterminate={isPartiallySelected}
                          className="size-4 data-checked:bg-emerald-500 data-checked:border-emerald-500 text-white rounded shrink-0"
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => handleToggleCategory(items)}
                        />
                        <div className="flex items-center gap-2 truncate">
                          <IconComp className="size-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-semibold text-foreground truncate">
                            {category}{" "}
                            <span className={selectedInCat > 0 ? "text-emerald-400 font-medium" : "text-muted-foreground"}>
                              ({selectedInCat}/{totalInCat})
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleCollapse(category)}
                        className="text-muted-foreground hover:text-foreground p-1 shrink-0 ml-2 cursor-pointer"
                        title={isCollapsed ? "Expand" : "Collapse"}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </button>
                    </div>

                    {/* Permissions list inside category */}
                    {!isCollapsed && (
                      <div className="px-3.5 py-2 space-y-1.5 border-t border-border/50 bg-background/50">
                        {items.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.id);

                          return (
                            <label
                              key={perm.id}
                              className="flex items-start gap-2.5 py-1.5 px-2 rounded-lg hover:bg-card/70 cursor-pointer transition-colors select-none"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => handleTogglePermission(perm.id)}
                                className="size-4 mt-0.5 data-checked:bg-emerald-500 data-checked:border-emerald-500 text-white rounded shrink-0"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-medium text-foreground">
                                  {perm.name}
                                </span>
                                {perm.description && (
                                  <span className="text-[11px] text-muted-foreground line-clamp-1">
                                    {perm.description}
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No permissions matching &ldquo;{searchTerm}&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t border-border/70 flex flex-row items-center justify-end gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="h-9 px-4 rounded-lg text-xs border-border/80"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="h-9 px-4 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-xs"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
