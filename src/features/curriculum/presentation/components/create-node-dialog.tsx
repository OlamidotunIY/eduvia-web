import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/select";
import type { CurriculumTreeNode } from "@/shared/domain";

interface CreateNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curriculumId: string;
  parentNode?: CurriculumTreeNode | null;
  nodeToEdit?: CurriculumTreeNode | null;
  onSubmit: (data: {
    nodeType: string;
    name: string;
    code?: string;
    description?: string;
    gradeLevel?: string;
    parentNodeId?: string | null;
    isActive?: boolean;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreateNodeDialog({
  open,
  onOpenChange,
  parentNode,
  nodeToEdit,
  onSubmit,
  isSubmitting = false,
}: CreateNodeDialogProps) {
  const [name, setName] = useState("");
  const [nodeType, setNodeType] = useState("topic");
  const [code, setCode] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Suggest default child nodeType based on parent or prefill if editing
  useEffect(() => {
    if (open) {
      if (nodeToEdit) {
        setName(nodeToEdit.name);
        setNodeType(nodeToEdit.nodeType);
        setCode(nodeToEdit.code || "");
        setGradeLevel(nodeToEdit.gradeLevel || "");
        setDescription(nodeToEdit.description || "");
      } else if (parentNode) {
        if (parentNode.nodeType === "subject") setNodeType("keystage");
        else if (parentNode.nodeType === "keystage") setNodeType("strand");
        else if (parentNode.nodeType === "strand") setNodeType("topic");
        else if (parentNode.nodeType === "topic") setNodeType("learning_objective");
        else setNodeType("topic");

        setGradeLevel(parentNode.gradeLevel || "");
        setName("");
        setCode("");
        setDescription("");
      } else {
        setNodeType("subject");
        setGradeLevel("");
        setName("");
        setCode("");
        setDescription("");
      }
      setError(null);
    }
  }, [open, parentNode, nodeToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide a name for this node.");
      return;
    }

    try {
      await onSubmit({
        parentNodeId: parentNode ? parentNode.id : null,
        nodeType,
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        gradeLevel: gradeLevel.trim() || undefined,
        isActive: true,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to create node. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold">
            {nodeToEdit
              ? `Edit Node "${nodeToEdit.name}"`
              : parentNode
                ? `Add Child Node to "${parentNode.name}"`
                : "Add Curriculum Node"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {nodeToEdit
              ? "Update standard attributes, code, or description for this node."
              : parentNode
                ? `Creating a new nested item under ${parentNode.name} (${parentNode.nodeType}).`
                : "Create a root or framework node under this curriculum profile."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="node-type" className="text-xs font-medium">
                Node Type <span className="text-destructive">*</span>
              </Label>
              <Select value={nodeType} onValueChange={(val) => setNodeType(val ?? "topic")}>
                <SelectTrigger id="node-type" className="h-9 text-xs">
                  <span className="capitalize">{nodeType.replace("_", " ")}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subject">Subject</SelectItem>
                  <SelectItem value="keystage">Grade / Key Stage</SelectItem>
                  <SelectItem value="strand">Strand</SelectItem>
                  <SelectItem value="topic">Topic</SelectItem>
                  <SelectItem value="learning_objective">Learning Objective</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="node-code" className="text-xs font-medium">
                Standard Code
              </Label>
              <Input
                id="node-code"
                placeholder="e.g. MATH-Y10-ALG-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="node-name" className="text-xs font-medium">
              Node Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="node-name"
              placeholder="e.g. Linear Equations"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="node-grade" className="text-xs font-medium">
              Grade / Key Stage Level
            </Label>
            <Input
              id="node-grade"
              placeholder="e.g. Year 10 or Key Stage 4"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="node-desc" className="text-xs font-medium">
              Description / Learning Objective
            </Label>
            <Textarea
              id="node-desc"
              rows={3}
              placeholder="Detailed description of what the student is expected to learn or understand..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              <span>
                {isSubmitting
                  ? "Saving..."
                  : nodeToEdit
                    ? "Save changes"
                    : "Add node"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
