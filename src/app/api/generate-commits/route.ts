import { NextRequest } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, rmSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

function getModeDescription(mode: string): string {
  const modes = {
    conservative: 'Conservative: Only generate commits on dates with no existing contributions.',
    normal: 'Normal: Generate commits regardless of existing contributions.',
    aggressive: 'Aggressive: Generate commits on all dates. Maximizes contribution activity.',
  };
  return modes[mode as keyof typeof modes] || modes.normal;
}

interface ProgressMessage {
  type: 'progress' | 'complete' | 'error';
  current?: number;
  total?: number;
  message?: string;
  data?: unknown;
}

const COMMIT_MESSAGES = [
  'Update feature', 'Fix bug', 'Add tests', 'Refactor code', 'Update docs',
  'Optimize performance', 'Add new feature', 'Remove deprecated code',
  'Improve styling', 'Fix type error', 'Implement functionality',
  'Add comments', 'Update dependencies', 'Add error handling',
];

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
  authorEmail: string
): string {
  let stream = '';
  let fileContent = '# Contributions\n\nThis repository tracks contribution history.\n';

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

      stream += `commit refs/heads/main\n`;
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
  const { contributions, authorName, authorEmail, repoName, gitRemoteUrl, generationMode } = body;

  const generationModeValue = generationMode || 'normal';
  const authorNameValue = authorName || 'Dylan';
  const authorEmailValue = authorEmail || 'dylan@example.com';
  const repoNameValue = repoName || 'mock-git-commits';

  const projectRoot = process.cwd();
  const mockRepoPath = join(projectRoot, '.mock-git-commits', repoNameValue);

  const totalCommits = contributions?.reduce((sum: number, c: { count: number }) => sum + c.count, 0) || 0;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (msg: ProgressMessage) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
      };

      const fastImportFile = join(mockRepoPath, 'fast-import.data');

      try {
        if (!contributions || !Array.isArray(contributions)) {
          send({ type: 'error', message: 'Invalid contributions data' });
          controller.close();
          return;
        }

        send({ type: 'progress', current: 0, total: totalCommits, message: 'Initializing repository...' });

        if (existsSync(mockRepoPath)) {
          rmSync(mockRepoPath, { recursive: true, force: true });
        }
        mkdirSync(mockRepoPath, { recursive: true });

        await execAsync(`cd "${mockRepoPath}" && git init`);

        if (gitRemoteUrl) {
          await execAsync(`cd "${mockRepoPath}" && git remote add origin "${gitRemoteUrl}"`);
        }

        send({ type: 'progress', current: 0, total: totalCommits, message: 'Generating commits...' });

        const fastImportData = generateFastImportStream(contributions, authorNameValue, authorEmailValue);
        writeFileSync(fastImportFile, fastImportData, 'utf8');

        send({ type: 'progress', current: totalCommits, total: totalCommits, message: 'Importing commits...' });

        await execAsync(`cd "${mockRepoPath}" && git fast-import < "${fastImportFile}"`);

        unlinkSync(fastImportFile);

        let pushSuccess = false;
        let pushError = '';

        if (gitRemoteUrl) {
          send({ type: 'progress', current: totalCommits, total: totalCommits, message: 'Pushing to remote...' });
          try {
            await execAsync(`cd "${mockRepoPath}" && git push -u origin main --force`);
            pushSuccess = true;
          } catch (error) {
            pushError = String(error);
          }
        }

        const modeInfo = `Generation Mode: ${generationModeValue.toUpperCase()}\n${getModeDescription(generationModeValue)}`;

        let instructions = '';
        if (gitRemoteUrl) {
          if (pushSuccess) {
            instructions = `Successfully pushed ${totalCommits} commits to remote!\n\n${modeInfo}\n\nRepository: ${mockRepoPath}`;
          } else {
            instructions = `Commits created but push failed.\n\n${modeInfo}\n\nPlease push manually:\ncd "${mockRepoPath}"\ngit push -u origin main --force\n\nError: ${pushError}`;
          }
        } else {
          instructions = `Created ${totalCommits} commits locally.\n\n${modeInfo}\n\nTo push to GitHub:\ncd "${mockRepoPath}"\ngit remote add origin YOUR_REPO_URL\ngit push -u origin main --force`;
        }

        send({
          type: 'complete',
          data: {
            success: true,
            totalCommits,
            repoPath: mockRepoPath,
            generationMode: generationModeValue,
            pushSuccess,
            instructions,
          }
        });

      } catch (error) {
        send({ type: 'error', message: String(error) });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
