import { NextRequest } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, rmSync } from 'fs';
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

      try {
        if (!contributions || !Array.isArray(contributions)) {
          send({ type: 'error', message: 'Invalid contributions data' });
          controller.close();
          return;
        }

        // 阶段1: 初始化仓库
        send({ type: 'progress', current: 0, total: totalCommits, message: 'Initializing repository...' });

        if (existsSync(mockRepoPath)) {
          rmSync(mockRepoPath, { recursive: true, force: true });
        }
        mkdirSync(mockRepoPath, { recursive: true });
        await execAsync(`cd "${mockRepoPath}" && git init`);

        if (gitRemoteUrl) {
          await execAsync(`cd "${mockRepoPath}" && git remote add origin "${gitRemoteUrl}"`);
        }

        await execAsync(`cd "${mockRepoPath}" && git config user.name "${authorNameValue}"`);
        await execAsync(`cd "${mockRepoPath}" && git config user.email "${authorEmailValue}"`);

        // 阶段2: 创建提交
        let currentCommit = 0;

        for (const contribution of contributions) {
          const date = new Date(contribution.date);
          const count = contribution.count;

          for (let i = 0; i < count; i++) {
            currentCommit++;

            const commitDate = new Date(date);
            commitDate.setHours(Math.floor(Math.random() * 24));
            commitDate.setMinutes(Math.floor(Math.random() * 60));
            const commitDateString = commitDate.toISOString();

            const commitMessage = COMMIT_MESSAGES[Math.floor(Math.random() * COMMIT_MESSAGES.length)];
            const commitNumber = Math.floor(Math.random() * 1000);
            const fileName = `commit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.md`;

            try {
              const command = `cd "${mockRepoPath}" && \
                export GIT_AUTHOR_DATE="${commitDateString}" && \
                export GIT_COMMITTER_DATE="${commitDateString}" && \
                export GIT_AUTHOR_NAME="${authorNameValue}" && \
                export GIT_AUTHOR_EMAIL="${authorEmailValue}" && \
                export GIT_COMMITTER_NAME="${authorNameValue}" && \
                export GIT_COMMITTER_EMAIL="${authorEmailValue}" && \
                echo "# ${commitMessage} #${commitNumber}" > "${fileName}" && \
                echo "Created: ${commitDateString}" >> "${fileName}" && \
                git add "${fileName}" && \
                git commit -m "${commitMessage} #${commitNumber}"`;

              await execAsync(command);

              // 每5个提交或最后一个提交时发送进度
              if (currentCommit % 5 === 0 || currentCommit === totalCommits) {
                send({
                  type: 'progress',
                  current: currentCommit,
                  total: totalCommits,
                  message: `Creating commits... (${currentCommit}/${totalCommits})`
                });
              }
            } catch (error) {
              console.error('Error creating commit:', error);
            }
          }
        }

        // 阶段3: 推送到远程
        let pushSuccess = false;
        let pushError = '';

        if (gitRemoteUrl) {
          send({ type: 'progress', current: totalCommits, total: totalCommits, message: 'Pushing to remote...' });
          try {
            await execAsync(`cd "${mockRepoPath}" && git branch -M main`);
            await execAsync(`cd "${mockRepoPath}" && git push -u origin main --force`);
            pushSuccess = true;
          } catch (error) {
            pushError = String(error);
          }
        }

        // 构建完成消息
        const modeInfo = `Generation Mode: ${generationModeValue.toUpperCase()}\n${getModeDescription(generationModeValue)}`;

        let instructions = '';
        if (gitRemoteUrl) {
          if (pushSuccess) {
            instructions = `Successfully pushed ${currentCommit} commits to remote!\n\n${modeInfo}\n\nRepository: ${mockRepoPath}`;
          } else {
            instructions = `Commits created but push failed.\n\n${modeInfo}\n\nPlease push manually:\ncd "${mockRepoPath}"\ngit push -u origin main --force\n\nError: ${pushError}`;
          }
        } else {
          instructions = `Created ${currentCommit} commits locally.\n\n${modeInfo}\n\nTo push to GitHub:\ncd "${mockRepoPath}"\ngit remote add origin YOUR_REPO_URL\ngit branch -M main\ngit push -u origin main --force`;
        }

        send({
          type: 'complete',
          data: {
            success: true,
            totalCommits: currentCommit,
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
