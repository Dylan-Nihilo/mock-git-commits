'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw, Sparkles, Calendar, GitCommit, Clock, GitBranch, AlertCircle, ArrowRight, CheckCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import ContributionGrid from '@/components/ContributionGrid';
import ControlPanel from '@/components/ControlPanel';
import { ContributionData } from '@/types/contribution';
import { generateRandomCommits, getYearStart, getYearEnd } from '@/lib/generateCommits';
import { useTranslations, getBrowserLocale, getCurrentLocale } from '@/lib/translations';

interface Commit {
  hash: string;
  message: string;
  time: string;
  author: string;
}

type GenerationMode = 'conservative' | 'normal' | 'aggressive';

export default function Generator() {
  const t = useTranslations('generator');
  const currentLocale = getCurrentLocale();
  const [startDate, setStartDate] = useState(() => {
    const date = getYearStart(new Date());
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = getYearEnd(new Date());
    return date.toISOString().split('T')[0];
  });
  const [minCommits, setMinCommits] = useState(0);
  const [maxCommits, setMaxCommits] = useState(10);
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingGitCommits, setIsCreatingGitCommits] = useState(false);
  const [commitProgress, setCommitProgress] = useState<{
    current: number;
    total: number;
    message: string;
  } | null>(null);

  // 弹窗状态
  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    success: boolean;
    title: string;
    message: string;
    commands?: string;
  }>({ open: false, success: true, title: '', message: '' });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const [generationMode, setGenerationMode] = useState<GenerationMode>('normal');

  const [gitRepoName, setGitRepoName] = useState('mock-commits');
  const [gitRemoteUrl, setGitRemoteUrl] = useState('');
  const [authorName, setAuthorName] = useState('Dylan');
  const [authorEmail, setAuthorEmail] = useState('dylan@example.com');

  const handleGenerate = useCallback(async () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert(t('alerts.startDateError'));
      return;
    }

    if (minCommits > maxCommits) {
      alert(t('alerts.minMaxError'));
      return;
    }

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = generateRandomCommits(start, end, minCommits, maxCommits);
    setContributions(data);
    setSelectedDate(null);
    setIsGenerating(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, minCommits, maxCommits]);

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocaleChange = () => {
    const newLocale = currentLocale === 'zh' ? 'en' : 'zh';
    window.location.href = `/${newLocale}/generator`;
  };

  const getTargetLanguageLabel = () => {
    return currentLocale === 'zh' ? 'English' : '中文';
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(contributions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'contributions.json');
    linkElement.click();
  };

  const handleCreateGitCommits = async () => {
    const modeDescriptions = {
      conservative: t('settings.generationMode.conservative.description'),
      normal: t('settings.generationMode.normal.description'),
      aggressive: t('settings.generationMode.aggressive.description'),
    };

    // 使用自定义确认弹窗
    setConfirmDialog({
      open: true,
      title: currentLocale === 'zh' ? '确认创建提交' : 'Confirm Create Commits',
      message: `${t('settings.generationMode.title')}: ${t('settings.generationMode.' + generationMode + '.title')}\n\n${modeDescriptions[generationMode]}`,
      onConfirm: () => executeCreateCommits(),
    });
  };

  const executeCreateCommits = async () => {
    setConfirmDialog({ ...confirmDialog, open: false });
    setIsCreatingGitCommits(true);
    setCommitProgress({ current: 0, total: 0, message: 'Starting...' });

    try {
      const response = await fetch('/api/generate-commits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributions: contributions.map(c => ({
            date: c.date.toISOString(),
            count: c.count,
          })),
          repoName: gitRepoName,
          gitRemoteUrl: gitRemoteUrl || undefined,
          authorName,
          authorEmail,
          generationMode,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'progress') {
                setCommitProgress({
                  current: data.current || 0,
                  total: data.total || 0,
                  message: data.message || '',
                });
              } else if (data.type === 'complete') {
                const result = data.data;
                setResultDialog({
                  open: true,
                  success: true,
                  title: currentLocale === 'zh' ? '创建成功' : 'Success',
                  message: result.pushSuccess
                    ? (currentLocale === 'zh' ? `成功推送 ${result.totalCommits} 个提交到远程仓库！` : `Successfully pushed ${result.totalCommits} commits!`)
                    : (currentLocale === 'zh' ? `成功创建 ${result.totalCommits} 个提交` : `Created ${result.totalCommits} commits`),
                  commands: result.pushSuccess ? undefined : `cd "${result.repoPath}"\ngit remote add origin YOUR_REPO_URL\ngit branch -M main\ngit push -u origin main --force`,
                });
              } else if (data.type === 'error') {
                setResultDialog({
                  open: true,
                  success: false,
                  title: currentLocale === 'zh' ? '创建失败' : 'Error',
                  message: data.message,
                });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error creating git commits:', error);
      setResultDialog({
        open: true,
        success: false,
        title: currentLocale === 'zh' ? '创建失败' : 'Error',
        message: currentLocale === 'zh' ? '创建提交失败，请检查控制台' : 'Failed to create commits',
      });
    } finally {
      setIsCreatingGitCommits(false);
      setCommitProgress(null);
    }
  };

  const getSelectedContribution = () => {
    if (!selectedDate) return null;
    return contributions.find((c) => {
      const cDate = new Date(c.date);
      return cDate.toDateString() === selectedDate.toDateString();
    }) || null;
  };

  const generateMockCommits = (): Commit[] => {
    const messages = [
      'Update feature',
      'Fix bug',
      'Add tests',
      'Refactor code',
      'Update docs',
      'Optimize performance',
      'Add new feature',
      'Remove deprecated code',
      'Improve styling',
      'Fix type error',
    ];
    const commits: Commit[] = [];
    const contribution = getSelectedContribution();
    const commitAuthor = authorName;

    for (let i = 0; i < (contribution?.count || 0); i++) {
      const hash = Math.random().toString(16).substring(2, 9);
      const message = messages[Math.floor(Math.random() * messages.length)];
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      commits.push({
        hash,
        message: `${message} #${Math.floor(Math.random() * 1000)}`,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        author: commitAuthor,
      });
    }

    return commits;
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800/50">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
              <span className="text-black font-bold text-[10px]">MGC</span>
            </div>
            <span className="text-sm font-semibold text-white">Mock Git Commits</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800"
              onClick={handleLocaleChange}
            >
              {currentLocale === 'zh' ? '中文' : 'EN'}
              <ArrowRight className="ml-1 h-3 w-3" />
              {getTargetLanguageLabel()}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-gray-400 hover:text-white"
              onClick={handleDownload}
            >
              <Download className="mr-1.5 h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold text-white">{t('title')}</h1>
                 <div className="flex items-center gap-2 text-xs text-gray-500">
                   <span className="text-white font-semibold">
                     {contributions.reduce((sum, c) => sum + c.count, 0)}
                   </span>
                   <span>{t('totalCommits')}</span>
                </div>
              </div>
              <Button
                className="bg-white text-black hover:bg-gray-200 text-xs h-8 px-4"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3 w-3" />
                    {t('generate')}
                  </>
                )}
              </Button>
            </div>

            <Card className="bg-black border border-gray-800/50 mb-4">
              <div className="p-6">
                <ContributionGrid
                  data={contributions}
                  startDate={new Date(startDate)}
                  endDate={new Date(endDate)}
                  onSelectDate={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </div>
            </Card>

            {selectedDate && getSelectedContribution() && getSelectedContribution()!.count > 0 && (
              <Card className="bg-black border border-gray-800/50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-white">
                        {selectedDate.toLocaleDateString(getBrowserLocale() === 'zh' ? 'zh-CN' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <GitCommit className="h-3 w-3" />
                      <span>{getSelectedContribution()!.count} {t('commits.count')}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-80 overflow-y-auto">
                    {generateMockCommits().map((commit, index) => (
                      <div
                        key={`${commit.hash}-${index}`}
                        className="flex items-start gap-2 p-2 bg-gray-900/30 rounded border border-gray-800/50"
                      >
                        <div className="flex items-center gap-1 min-w-fit">
                          <GitBranch className="h-3 w-3 text-gray-600" />
                          <span className="text-[10px] font-mono text-gray-500">
                            {commit.hash}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white mb-0.5 truncate">{commit.message}</div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-600">
                            <span className="truncate">{commit.author}</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {commit.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {selectedDate && getSelectedContribution() && getSelectedContribution()!.count === 0 && (
              <Card className="bg-black border border-gray-800/50 border-dashed">
                <div className="p-8 text-center">
                  <AlertCircle className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{t('noCommits.description')}</p>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <ControlPanel
              startDate={startDate}
              endDate={endDate}
              minCommits={minCommits}
              maxCommits={maxCommits}
              gitRepoName={gitRepoName}
              gitRemoteUrl={gitRemoteUrl}
              authorName={authorName}
              authorEmail={authorEmail}
              generationMode={generationMode}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onMinCommitsChange={setMinCommits}
              onMaxCommitsChange={setMaxCommits}
              onGitRepoNameChange={setGitRepoName}
              onGitRemoteUrlChange={setGitRemoteUrl}
              onAuthorNameChange={setAuthorName}
              onAuthorEmailChange={setAuthorEmail}
              onGenerationModeChange={setGenerationMode}
              onGenerate={handleGenerate}
              onCreateGitCommits={handleCreateGitCommits}
              isCreatingGitCommits={isCreatingGitCommits}
              progress={commitProgress}
            />
          </div>
        </div>
      </main>

      {/* 确认弹窗 */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogContent>
          <DialogHeader onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-gray-300 whitespace-pre-line">{confirmDialog.message}</p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
              {currentLocale === 'zh' ? '取消' : 'Cancel'}
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmDialog.onConfirm}
            >
              {currentLocale === 'zh' ? '确认' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 结果弹窗 */}
      <Dialog open={resultDialog.open} onClose={() => setResultDialog({ ...resultDialog, open: false })}>
        <DialogContent>
          <DialogHeader onClose={() => setResultDialog({ ...resultDialog, open: false })}>
            <div className="flex items-center gap-2">
              {resultDialog.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <DialogTitle>{resultDialog.title}</DialogTitle>
            </div>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-gray-300">{resultDialog.message}</p>
            {resultDialog.commands && (
              <div className="relative">
                <pre className="bg-black rounded p-3 text-xs text-gray-400 overflow-x-auto border border-gray-800">
                  {resultDialog.commands}
                </pre>
                <button
                  className="absolute top-2 right-2 p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-white"
                  onClick={() => navigator.clipboard.writeText(resultDialog.commands || '')}
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              size="sm"
              className="bg-white text-black hover:bg-gray-200"
              onClick={() => setResultDialog({ ...resultDialog, open: false })}
            >
              {currentLocale === 'zh' ? '确定' : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
