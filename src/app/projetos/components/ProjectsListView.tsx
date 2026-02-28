'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ProjectListView } from '@/components/views/ProjectListView';
import { SkeletonTableRow } from '@/components/ui/skeletons';

interface ProjectsListViewWrapperProps<T> {
  projects: T[];
  isLoading: boolean;
  onSelectProject: (project: T) => void;
}

export function ProjectsListViewWrapper<T extends { id: string }>({
  projects,
  isLoading,
  onSelectProject,
}: ProjectsListViewWrapperProps<T>) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonTableRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ProjectListView
      projects={projects}
      onSelectProject={(projectId) => {
        const project = projects.find((p) => p.id === projectId);
        if (project) onSelectProject(project);
      }}
    />
  );
}
