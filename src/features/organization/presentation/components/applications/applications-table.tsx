import { useMemo, useState } from 'react';
import { UserCheck } from 'lucide-react';
import { DataTable } from '@/shared/composites/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import type { TeacherApplicationRecord } from '@/shared/domain';
import {
  applicationColumnLabels,
  createApplicationColumns,
} from './application-columns';

interface ApplicationsTableProps {
  applications: TeacherApplicationRecord[];
  isLoading?: boolean;
  isReloading?: boolean;
  onReload?: () => void;
  canReview: boolean;
  onReview: (application: TeacherApplicationRecord) => void;
  onApprove: (application: TeacherApplicationRecord) => void;
  onReject: (application: TeacherApplicationRecord) => void;
  emptyHeading?: string;
  emptyDescription?: string;
}

export function ApplicationsTable({
  applications,
  isLoading,
  isReloading,
  onReload,
  canReview,
  onReview,
  onApprove,
  onReject,
  emptyHeading = 'No applications found',
  emptyDescription = 'Submitted teacher applications matching your filters will appear here.',
}: ApplicationsTableProps) {
  const [selectedSubject, setSelectedSubject] = useState('all');

  const availableSubjects = useMemo(() => {
    const map = new Map<string, string>();
    for (const app of applications) {
      for (const item of app.appliedSubjectDetails) {
        if (item.name && !map.has(item.name.toLowerCase())) {
          map.set(item.name.toLowerCase(), item.name);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (selectedSubject === 'all') return applications;
    const target = selectedSubject.toLowerCase();
    return applications.filter((app) =>
      app.appliedSubjectDetails.some(
        (subject) => subject.name.toLowerCase() === target,
      ),
    );
  }, [applications, selectedSubject]);

  const columns = useMemo(
    () =>
      createApplicationColumns({
        canReview,
        onReview,
        onApprove,
        onReject,
      }),
    [canReview, onReview, onApprove, onReject],
  );

  const filterSlot = availableSubjects.length > 0 ? (
    <div className="flex items-center gap-2 shrink-0">
      <Select
        value={selectedSubject}
        onValueChange={(value) => setSelectedSubject(value ?? 'all')}
      >
        <SelectTrigger size="sm" className="h-8 shrink-0 min-w-36 rounded-lg text-xs">
          <SelectValue>
            {selectedSubject === 'all' ? 'All subjects' : selectedSubject}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">All subjects</SelectItem>
          {availableSubjects.map((subjectName) => (
            <SelectItem key={subjectName} value={subjectName}>
              {subjectName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : undefined;

  return (
    <DataTable
      columns={columns}
      data={filteredApplications}
      isLoading={isLoading}
      isReloading={isReloading}
      onReload={onReload}
      filterSlot={filterSlot}
      isFiltered={selectedSubject !== 'all'}
      searchKey="applicant"
      searchPlaceholder="Search applicants by name, email, or subject..."
      columnLabels={applicationColumnLabels}
      emptyIcon={UserCheck}
      emptyHeading={emptyHeading}
      emptyDescription={emptyDescription}
    />
  );
}
