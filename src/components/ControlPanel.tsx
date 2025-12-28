'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Settings, GitPullRequest, RefreshCw, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Loader2, Calendar, Zap, Activity, Battery } from 'lucide-react';
import { useTranslations, getCurrentLocale } from '@/lib/translations';

interface ProgressState {
  current: number;
  total: number;
  message: string;
}

interface ControlPanelProps {
  startDate: string;
  endDate: string;
  minCommits: number;
  maxCommits: number;
  gitRepoName?: string;
  gitRemoteUrl?: string;
  authorName?: string;
  authorEmail?: string;
  generationMode?: 'conservative' | 'normal' | 'aggressive';
  pushMode?: 'remote' | 'branch';
  branchName?: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onMinCommitsChange: (value: number) => void;
  onMaxCommitsChange: (value: number) => void;
  onGitRepoNameChange?: (value: string) => void;
  onGitRemoteUrlChange?: (value: string) => void;
  onAuthorNameChange?: (value: string) => void;
  onAuthorEmailChange?: (value: string) => void;
  onGenerationModeChange?: (value: 'conservative' | 'normal' | 'aggressive') => void;
  onPushModeChange?: (value: 'remote' | 'branch') => void;
  onBranchNameChange?: (value: string) => void;
  onGenerate: () => void;
  onCreateGitCommits?: () => void;
  isCreatingGitCommits?: boolean;
  progress?: ProgressState | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  startDate,
  endDate,
  minCommits,
  maxCommits,
  gitRepoName = 'mock-commits',
  gitRemoteUrl = '',
  authorName = 'Dylan',
  authorEmail = 'dylan@example.com',
  generationMode = 'normal',
  pushMode = 'remote',
  branchName = 'contributions',
  onStartDateChange,
  onEndDateChange,
  onMinCommitsChange,
  onMaxCommitsChange,
  onGitRepoNameChange,
  onGitRemoteUrlChange,
  onAuthorNameChange,
  onAuthorEmailChange,
  onGenerationModeChange,
  onPushModeChange,
  onBranchNameChange,
  onGenerate,
  onCreateGitCommits,
  isCreatingGitCommits = false,
  progress = null,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [urlValidation, setUrlValidation] = React.useState<{
    status: 'idle' | 'validating' | 'valid' | 'warning' | 'invalid';
    message?: string;
    type?: string;
  }>({ status: 'idle' });
  const t = useTranslations('generator');
  const currentLocale = getCurrentLocale();

  // URL 验证函数
  const validateUrl = React.useCallback(async (url: string) => {
    if (!url) {
      setUrlValidation({ status: 'idle' });
      return;
    }

    setUrlValidation({ status: 'validating' });

    try {
      const response = await fetch('/api/validate-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();

      if (!result.formatValid) {
        setUrlValidation({ status: 'invalid', message: result.error || result.suggestion });
      } else if (!result.accessible) {
        setUrlValidation({ status: 'warning', message: result.warning, type: result.type });
      } else {
        setUrlValidation({ status: 'valid', message: result.message, type: result.type });
      }
    } catch {
      setUrlValidation({ status: 'invalid', message: 'Failed to validate URL' });
    }
  }, []);

  // 防抖验证
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (gitRemoteUrl) {
        validateUrl(gitRemoteUrl);
      } else {
        setUrlValidation({ status: 'idle' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [gitRemoteUrl, validateUrl]);

  // 快速日期选择
  const setQuickDate = (type: 'thisYear' | 'lastYear' | 'last6Months') => {
    const end = new Date();
    const start = new Date();

    if (type === 'thisYear') {
      start.setMonth(0, 1);
    } else if (type === 'lastYear') {
      start.setFullYear(end.getFullYear() - 1, 0, 1);
      end.setFullYear(end.getFullYear() - 1, 11, 31);
    } else if (type === 'last6Months') {
      start.setMonth(end.getMonth() - 6);
    }

    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  return (
    <Card className="bg-black border-gray-800">
      <div className="p-4 space-y-4">
        <div className="space-y-3">
          {/* Quick Date Selectors */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDate('thisYear')}
              className="flex-1 text-[10px] h-7 bg-gray-900 border-gray-800 hover:bg-gray-800 text-gray-300"
            >
              {currentLocale === 'zh' ? '今年' : 'This Year'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDate('lastYear')}
              className="flex-1 text-[10px] h-7 bg-gray-900 border-gray-800 hover:bg-gray-800 text-gray-300"
            >
              {currentLocale === 'zh' ? '去年' : 'Last Year'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDate('last6Months')}
              className="flex-1 text-[10px] h-7 bg-gray-900 border-gray-800 hover:bg-gray-800 text-gray-300"
            >
              {currentLocale === 'zh' ? '近6个月' : 'Last 6 Months'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t('settings.dateRange.startDate')}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white text-xs h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t('settings.dateRange.endDate')}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white text-xs h-8"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-gray-500">{t('settings.commitSettings.minCommits')}</Label>
                <span className="text-xs text-white font-mono bg-gray-800 px-2 py-0.5 rounded">{minCommits}</span>
              </div>
              <Slider
                value={[minCommits]}
                min={0}
                max={50}
                step={1}
                onValueChange={(vals) => onMinCommitsChange(vals[0])}
                className="py-1"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-gray-500">{t('settings.commitSettings.maxCommits')}</Label>
                <span className="text-xs text-white font-mono bg-gray-800 px-2 py-0.5 rounded">{maxCommits}</span>
              </div>
              <Slider
                value={[maxCommits]}
                min={0}
                max={100}
                step={1}
                onValueChange={(vals) => onMaxCommitsChange(vals[0])}
                className="py-1"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={onGenerate}
          className="w-full bg-white text-black hover:bg-gray-200 text-xs h-8 font-medium"
        >
          <RefreshCw className="mr-1.5 h-3 w-3" />
          {t('generate')}
        </Button>

        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white w-full"
          >
            <Settings className="h-3 w-3" />
            {showAdvanced ? t('settings.advanced.hide') : t('settings.advanced.show')}
            {showAdvanced ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-3 pt-3">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 block">{t('settings.generationMode.title')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['conservative', 'normal', 'aggressive'] as const).map((mode) => {
                  const icons = {
                    conservative: Battery,
                    normal: Activity,
                    aggressive: Zap
                  };
                  const Icon = icons[mode];
                  
                  return (
                    <button
                      key={mode}
                      onClick={() => onGenerationModeChange?.(mode)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all ${
                        generationMode === mode
                          ? 'bg-white text-black border-white'
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-medium">{t(`settings.generationMode.${mode}.title`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500 block">{currentLocale === 'zh' ? '推送模式' : 'Push Mode'}</Label>
              <div className="flex gap-1">
                <button
                  onClick={() => onPushModeChange?.('remote')}
                  className={`flex-1 px-2 py-1.5 text-[10px] rounded ${pushMode === 'remote' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400'}`}
                >
                  {currentLocale === 'zh' ? '远程仓库' : 'Remote'}
                </button>
                <button
                  onClick={() => onPushModeChange?.('branch')}
                  className={`flex-1 px-2 py-1.5 text-[10px] rounded ${pushMode === 'branch' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400'}`}
                >
                  {currentLocale === 'zh' ? '本地分支' : 'Branch'}
                </button>
              </div>
            </div>

            {pushMode === 'branch' && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 block">{currentLocale === 'zh' ? '分支名' : 'Branch'}</Label>
                <Input
                  type="text"
                  value={branchName}
                  onChange={(e) => onBranchNameChange?.(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-white text-xs h-8"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs text-gray-500 block">{t('settings.gitConfig.authorName')}</Label>
              <Input
                type="text"
                value={authorName}
                onChange={(e) => onAuthorNameChange?.(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500 block">{t('settings.gitConfig.authorEmail')}</Label>
              <Input
                type="email"
                value={authorEmail}
                onChange={(e) => onAuthorEmailChange?.(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500 block">{t('settings.gitConfig.repoName')}</Label>
              <Input
                type="text"
                value={gitRepoName}
                onChange={(e) => onGitRepoNameChange?.(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500 block">{t('settings.gitConfig.githubUrl')}</Label>
              <div className="relative">
                <Input
                  type="url"
                  value={gitRemoteUrl}
                  onChange={(e) => onGitRemoteUrlChange?.(e.target.value)}
                  placeholder={t('settings.gitConfig.githubUrlPlaceholder')}
                  className={`bg-gray-900 border-gray-800 text-white text-xs h-8 pr-8 ${
                    urlValidation.status === 'invalid' ? 'border-red-500' :
                    urlValidation.status === 'warning' ? 'border-yellow-500' :
                    urlValidation.status === 'valid' ? 'border-green-500' : ''
                  }`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {urlValidation.status === 'validating' && (
                    <Loader2 className="h-3 w-3 text-gray-400 animate-spin" />
                  )}
                  {urlValidation.status === 'valid' && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                  {urlValidation.status === 'warning' && (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                  {urlValidation.status === 'invalid' && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
              {urlValidation.message && urlValidation.status !== 'idle' && (
                <p className={`text-[10px] ${
                  urlValidation.status === 'invalid' ? 'text-red-400' :
                  urlValidation.status === 'warning' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {urlValidation.type && <span className="font-medium">[{urlValidation.type.toUpperCase()}] </span>}
                  {urlValidation.message}
                </p>
              )}
            </div>

              <Button
                onClick={onCreateGitCommits}
                className="w-full bg-green-600 text-white hover:bg-green-700 text-xs h-8 font-medium"
                disabled={isCreatingGitCommits || urlValidation.status === 'invalid'}
              >
                {isCreatingGitCommits ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    {progress ? `${progress.current}/${progress.total}` : t('settings.gitConfig.creating')}
                  </>
                ) : (
                  <>
                    <GitPullRequest className="mr-1.5 h-3 w-3" />
                    {t('settings.gitConfig.createGitCommits')}
                  </>
                )}
              </Button>

              {/* 进度条 */}
              {isCreatingGitCommits && progress && (
                <div className="space-y-1.5">
                  <Progress
                    value={progress.current}
                    max={progress.total}
                    showLabel
                    label={progress.message}
                  />
                </div>
              )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ControlPanel;
