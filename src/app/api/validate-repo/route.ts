import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 验证 Git 仓库 URL 格式
function isValidGitUrl(url: string): { valid: boolean; type: 'github' | 'gitee' | 'gitlab' | 'other' | null } {
  const patterns = {
    github: /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/,
    gitee: /^https?:\/\/(www\.)?gitee\.com\/[\w.-]+\/[\w.-]+(\.git)?$/,
    gitlab: /^https?:\/\/(www\.)?gitlab\.com\/[\w.-]+\/[\w.-]+(\.git)?$/,
    sshGithub: /^git@github\.com:[\w.-]+\/[\w.-]+(\.git)?$/,
    sshGitee: /^git@gitee\.com:[\w.-]+\/[\w.-]+(\.git)?$/,
    sshGitlab: /^git@gitlab\.com:[\w.-]+\/[\w.-]+(\.git)?$/,
  };

  if (patterns.github.test(url) || patterns.sshGithub.test(url)) {
    return { valid: true, type: 'github' };
  }
  if (patterns.gitee.test(url) || patterns.sshGitee.test(url)) {
    return { valid: true, type: 'gitee' };
  }
  if (patterns.gitlab.test(url) || patterns.sshGitlab.test(url)) {
    return { valid: true, type: 'gitlab' };
  }

  // 通用 git URL 格式
  const genericPattern = /^(https?:\/\/|git@)[\w.-]+[:/][\w.-]+\/[\w.-]+(\.git)?$/;
  if (genericPattern.test(url)) {
    return { valid: true, type: 'other' };
  }

  return { valid: false, type: null };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        valid: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    // 1. 验证 URL 格式
    const formatCheck = isValidGitUrl(url);
    if (!formatCheck.valid) {
      return NextResponse.json({
        valid: false,
        formatValid: false,
        accessible: false,
        error: 'Invalid Git repository URL format',
        suggestion: 'URL should be like: https://github.com/username/repo.git',
      });
    }

    // 2. 检测仓库是否可访问（使用 git ls-remote）
    try {
      await execAsync(`git ls-remote "${url}" HEAD`, { timeout: 10000 });
      return NextResponse.json({
        valid: true,
        formatValid: true,
        accessible: true,
        type: formatCheck.type,
        message: 'Repository is accessible',
      });
    } catch (error) {
      // 仓库不可访问（可能是私有仓库或不存在）
      return NextResponse.json({
        valid: true,
        formatValid: true,
        accessible: false,
        type: formatCheck.type,
        warning: 'Repository may be private or does not exist. Make sure you have access.',
      });
    }

  } catch (error) {
    console.error('Error validating repository:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate repository' },
      { status: 500 }
    );
  }
}
