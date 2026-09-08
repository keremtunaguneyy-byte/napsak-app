import { spawnSync } from 'node:child_process';
import {
  assertFirestoreExportApply,
  assertFirestoreRestoreApply,
  buildFirestoreExportPlan,
  buildFirestoreRestorePlan,
  commandForDisplay,
  type GcloudPlan,
} from '../src/backupOperations';

function argument(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function required(name: string): string {
  const value = argument(name);
  if (!value) throw new Error(`missing_${name.replace(/-/g, '_')}`);
  return value;
}

const operation = process.argv[2];
const apply = process.argv.includes('--apply');
let plan: GcloudPlan;

if (operation === 'export') {
  const projectId = required('project');
  const bucketRoot = required('bucket');
  const timestampArgument = argument('timestamp');
  plan = buildFirestoreExportPlan({
    projectId,
    bucketRoot,
    timestamp: timestampArgument ? new Date(timestampArgument) : new Date(),
  });
  if (apply) assertFirestoreExportApply({
    projectId,
    bucketRoot,
    confirmedProject: argument('confirm-production'),
    confirmedBucket: argument('confirm-bucket'),
  });
} else if (operation === 'restore') {
  const targetProjectId = required('target-project');
  plan = buildFirestoreRestorePlan({
    sourceProjectId: required('source-project'),
    targetProjectId,
    sourceUri: required('source'),
    targetEnvironment: required('target-environment'),
  });
  if (apply) assertFirestoreRestoreApply({
    targetProjectId,
    confirmedTarget: argument('confirm-target'),
    confirmedEmptyTarget: argument('confirm-empty-target'),
  });
} else {
  throw new Error('Use export or restore as the first argument.');
}

console.log(`Firestore ${operation} ${apply ? 'apply' : 'dry run'}`, {
  projectId: plan.projectId,
  storageUri: plan.storageUri,
  command: commandForDisplay(plan),
});

if (apply) {
  const result = spawnSync(plan.executable, plan.args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
}
