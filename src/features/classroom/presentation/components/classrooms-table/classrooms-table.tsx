import { useMemo, useState } from "react";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
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
        <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
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
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1.5 text-left text-xs font-medium text-destructive hover:bg-destructive/10"
            onClick={() => setStatus("all")}
          >
            Clear filter
          </button>
        </>
      ) : null}
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={filteredClassrooms}
      isLoading={isLoading}
      isReloading={isReloading}
      onReload={onReload}
      filterContent={filterContent}
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
