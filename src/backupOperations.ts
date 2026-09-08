const PROJECT_ID_PATTERN = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
const BUCKET_ROOT_PATTERN = /^gs:\/\/[a-z0-9][a-z0-9._-]{1,221}[a-z0-9]$/;
const EXPORT_SOURCE_PATTERN = /^gs:\/\/[a-z0-9][a-z0-9._-]{1,221}[a-z0-9]\/[A-Za-z0-9._/-]+$/;

export type GcloudPlan = {
  executable: 'gcloud';
  args: string[];
  projectId: string;
  storageUri: string;
};

function projectId(value: string, label: string): string {
  if (!PROJECT_ID_PATTERN.test(value)) throw new Error(`${label}_invalid_project_id`);
  return value;
}

function bucketRoot(value: string): string {
  if (!BUCKET_ROOT_PATTERN.test(value) || value.includes('..')) {
    throw new Error('backup_invalid_bucket_root');
  }
  return value;
}

function exportSource(value: string): string {
  if (!EXPORT_SOURCE_PATTERN.test(value) || value.includes('..') || value.includes('//', 5)) {
    throw new Error('restore_invalid_export_source');
  }
  return value.replace(/\/$/, '');
}

function timestampSegment(value: Date): string {
  if (!Number.isFinite(value.getTime())) throw new Error('backup_invalid_timestamp');
  return value.toISOString().replace(/[:.]/g, '-');
}

export function buildFirestoreExportPlan(input: {
  projectId: string;
  bucketRoot: string;
  timestamp: Date;
}): GcloudPlan {
  const sourceProject = projectId(input.projectId, 'backup_source');
  const root = bucketRoot(input.bucketRoot);
  const destination = `${root}/firestore/${sourceProject}/${timestampSegment(input.timestamp)}`;
  return {
    executable: 'gcloud',
    args: [
      'firestore', 'export', destination,
      `--project=${sourceProject}`,
      '--database=(default)',
    ],
    projectId: sourceProject,
    storageUri: destination,
  };
}

export function assertFirestoreExportApply(input: {
  projectId: string;
  bucketRoot: string;
  confirmedProject?: string;
  confirmedBucket?: string;
}): void {
  if (input.confirmedProject !== input.projectId) throw new Error('backup_project_confirmation_required');
  if (input.confirmedBucket !== input.bucketRoot) throw new Error('backup_bucket_confirmation_required');
}

export function buildFirestoreRestorePlan(input: {
  sourceProjectId: string;
  targetProjectId: string;
  sourceUri: string;
  targetEnvironment: string;
}): GcloudPlan {
  const sourceProject = projectId(input.sourceProjectId, 'restore_source');
  const targetProject = projectId(input.targetProjectId, 'restore_target');
  if (input.targetEnvironment !== 'recovery') throw new Error('restore_recovery_environment_required');
  if (sourceProject === targetProject) throw new Error('restore_target_must_differ_from_source');
  const source = exportSource(input.sourceUri);
  return {
    executable: 'gcloud',
    args: [
      'firestore', 'import', source,
      `--project=${targetProject}`,
      '--database=(default)',
    ],
    projectId: targetProject,
    storageUri: source,
  };
}

export function assertFirestoreRestoreApply(input: {
  targetProjectId: string;
  confirmedTarget?: string;
  confirmedEmptyTarget?: string;
}): void {
  if (input.confirmedTarget !== input.targetProjectId) throw new Error('restore_target_confirmation_required');
  if (input.confirmedEmptyTarget !== `EMPTY_RECOVERY_TARGET_${input.targetProjectId}`) {
    throw new Error('restore_empty_target_confirmation_required');
  }
}

export function commandForDisplay(plan: GcloudPlan): string {
  const quote = (value: string) => `'${value.replace(/'/g, `'"'"'`)}'`;
  return [plan.executable, ...plan.args].map(quote).join(' ');
}
