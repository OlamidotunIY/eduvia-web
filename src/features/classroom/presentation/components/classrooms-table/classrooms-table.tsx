import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { DataTable } from "@/shared/composites/data-table";
import type { Classroom, OrganizationSubject } from "@/shared/domain";
import { School } from "lucide-react";
import {
  createClassroomColumns,
  classroomColumnLabels,
} from "./classroom-columns";

interface ClassroomsTableProps {
  classrooms: Classroom[];
  subjects: OrganizationSubject[];
  isLoading?: boolean;
  isReloading?: boolean;
  onReload?: () => void;
  onOpen: (classroom: Classroom) => void;
  onManageStudents: (classroom: Classroom) => void;
  onPause: (classroom: Classroom) => void;
  onClose: (classroom: Classroom) => void;
  canUpdate: boolean;
  emptyAction?: React.ReactNode;
}

export function ClassroomsTable({
  classrooms,
  subjects,
  isLoading,
  isReloading,
  onReload,
  onOpen,
  onManageStudents,
  onPause,
  onClose,
  canUpdate,
  emptyAction,
}: ClassroomsTableProps) {
  const [status, setStatus] = useState("all");
  const subjectNameById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject.name])),
    [subjects],
  );
  const columns = useMemo(
    () =>
      createClassroomColumns({
        subjectNameById,
        onManageStudents,
        onPause,
        onClose,
        canUpdate,
      }),
    [subjectNameById, onManageStudents, onPause, onClose, canUpdate],
  );
  const filteredClassrooms = useMemo(
    () =>
      classrooms.filter(
        (classroom) =>
          status === "all" || classroom.status.toLowerCase() === status,
      ),
    [classrooms, status],
  );
  const isFiltered = status !== "all";

  const filterContent = (
    <div className="space-y-3">
      <DropdownMenuGroup>
        <DropdownMenuLabel>Classroom status</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(value) => setStatus(value ?? "all")}
        >
          <DropdownMenuRadioItem value="all">
            All classrooms
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="paused">Paused</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="closed">Closed</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>
      {isFiltered ? (
        <>
          <DropdownMenuSeparator />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="w-full justify-start text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setStatus("all")}
          >
            Clear filter
          </Button>
        </>
      ) : null}
    </div>
  );

  const filterSlot = (
    <Select
      value={status}
      onValueChange={(value) => setStatus(value ?? "all")}
    >
      <SelectTrigger size="sm" className="h-8 flex-1 sm:flex-initial min-w-[120px] sm:min-w-32 rounded-lg text-xs">
        <SelectValue>
          {status === "all"
            ? "All statuses"
            : status.charAt(0).toUpperCase() + status.slice(1)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="paused">Paused</SelectItem>
        <SelectItem value="closed">Closed</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <DataTable
      columns={columns}
      data={filteredClassrooms}
      isLoading={isLoading}
      isReloading={isReloading}
      onReload={onReload}
      filterContent={filterContent}
      filterSlot={filterSlot}
      isFiltered={isFiltered}
      searchKey="name"
      searchPlaceholder="Search classrooms..."
      columnLabels={classroomColumnLabels}
      emptyIcon={School}
      emptyHeading="No classrooms yet"
      emptyDescription="Create your first classroom to organise learners, recurring lessons, and teaching materials."
      emptyAction={emptyAction}
      onRowClick={onOpen}
    />
  );
}
