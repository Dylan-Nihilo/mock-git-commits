import { NextRequest } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync } from 'fs';

const execAsync = promisify(exec);

const COMMIT_MESSAGES = [
  'Update feature', 'Fix bug', 'Add tests', 'Refactor code', 'Update docs',
  'Optimize performance', 'Add new feature', 'Remove deprecated code',
  'Improve styling', 'Fix type error', 'Implement functionality',
  'Add comments', 'Update dependencies', 'Add error handling',
];

interface ProgressMessage {
  type: 'progress' | 'complete' | 'error';
  current?: number;
  total?: number;
  message?: string;
  data?: unknown;
}

function formatGitTimestamp(date: Date): string {
  const timestamp = Math.floor(date.getTime() / 1000);
  const timezoneOffset = date.getTimezoneOffset();
  const hours = Math.abs(Math.floor(timezoneOffset / 60));
  const minutes = Math.abs(timezoneOffset % 60);
  const sign = timezoneOffset <= 0 ? '+' : '-';
  const timezone = `${sign}${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
  return `${timestamp} ${timezone}`;
}

function generateFastImportStream(
  contributions: Array<{ date: string; count: number }>,
  authorName: string,
  authorEmail: string,
  branchName: string
): string {
  let stream = '';
  let fileContent = '# Contributions\n\nThis repository tracks contribution history.\n';
  const branchRef = `refs/heads/${branchName}`;

  for (const contribution of contributions) {
    const date = new Date(contribution.date);

    for (let i = 0; i < contribution.count; i++) {
      const commitDate = new Date(date);
      commitDate.setHours(Math.floor(Math.random() * 24));
      commitDate.setMinutes(Math.floor(Math.random() * 60));
      const commitDateString = formatGitTimestamp(commitDate);
      const commitMessage = COMMIT_MESSAGES[Math.floor(Math.random() * COMMIT_MESSAGES.length)];
      const commitNumber = Math.floor(Math.random() * 1000);

      const entry = `${commitDate.toISOString()} - ${commitMessage} #${commitNumber}\n`;
      fileContent += entry;

      stream += `commit ${branchRef}\n`;
      stream += `author ${authorName} <${authorEmail}> ${commitDateString}\n`;
      stream += `committer ${authorName} <${authorEmail}> ${commitDateString}\n`;
      stream += `data ${commitMessage.length}\n${commitMessage}\n`;
      stream += `M 100644 inline contributions.md\n`;
      stream += `data ${fileContent.length}\n${fileContent}\n`;
    }
  }

  return stream;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { contributions, authorName, authorEmail, branchName } = body;

  const authorNameValue = authorName || 'Contributor';
  const authorEmailValue = authorEmail || 'contributor@example.com';
  const branchNameValue = branchName || 'contributions';
  const totalCommits = contributions?.reduce((sum: number, c: { count: number }) => sum + c.count, 0) || 0;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (msg: ProgressMessage) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
      };

      const repoPath = process.cwd();
      const worktreePath = `${repoPath}/.worktree-${branchNameValue}`;
      const fastImportFile = `${worktreePath}/fast-import.data`;

      try {
        if (!contributions || !Array.isArray(contributions)) {
          send({ type: 'error', message: 'Invalid contributions data' });
          controller.close();
          return;
        }

        send({ type: 'progress', current: 0, total: totalCommits, message: 'Setting up worktree...' });

        await execAsync(`cd "${repoPath}" && git worktree remove "${worktreePath}" --force 2>/dev/null || true`);
        await execAsync(`rm -rf "${worktreePath}" 2>/dev/null || true`);

        let branchExists = false;
        try {
          await execAsync(`cd "${repoPath}" && git rev-parse --verify ${branchNameValue}`);
          branchExists = true;
        } catch {
          branchExists = false;
        }

        if (branchExists) {
          await execAsync(`cd "${repoPath}" && git worktree add "${worktreePath}" ${branchNameValue}`);
        } else {
          await execAsync(`cd "${repoPath}" && git worktree add --detach "${worktreePath}"`);
          await execAsync(`cd "${worktreePath}" && git checkout --orphan ${branchNameValue}`);
          await execAsync(`cd "${worktreePath}" && git rm -rf . 2>/dev/null || true`);
        }

        send({ type: 'progress', current: 0, total: totalCommits, message: 'Generating commits...' });

        const fastImportData = generateFastImportStream(contributions, authorNameValue, authorEmailValue, branchNameValue);
        writeFileSync(fastImportFile, fastImportData, 'utf8');

        send({ type: 'progress', current: totalCommits, total: totalCommits, message: 'Importing commits...' });

        await execAsync(`cd "${worktreePath}" && git fast-import < "${fastImportFile}"`);

        unlinkSync(fastImportFile);

        send({ type: 'progress', current: totalCommits, total: totalCommits, message: 'Pushing...' });
        let pushSuccess = false;
        try {
          await execAsync(`cd "${worktreePath}" && git push -u origin ${branchNameValue} --force`);
          pushSuccess = true;
        } catch (e) {
          console.error('Push failed:', e);
        }

        await execAsync(`cd "${repoPath}" && git worktree remove "${worktreePath}" --force 2>/dev/null || true`);
        await execAsync(`rm -rf "${worktreePath}" 2>/dev/null || true`);

        send({
          type: 'complete',
          data: { success: true, totalCommits, branchName: branchNameValue, pushSuccess }
        });

      } catch (error) {
        try {
          await execAsync(`cd "${repoPath}" && git worktree remove "${worktreePath}" --force 2>/dev/null || true`);
          await execAsync(`rm -rf "${worktreePath}" 2>/dev/null || true`);
        } catch {}
        send({ type: 'error', message: String(error) });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
