const translations = {
  en: {
    common: {
      appName: 'Mock Git Commits',
      author: 'Dylan'
    },
    nav: {
      back: 'Back',
      exportJson: 'Export JSON',
      language: 'Language'
    },
    landing: {
      title: 'Generate Mock GitHub',
      subtitle: 'Contributions',
      description: 'Create realistic GitHub contribution graphs with natural patterns. Perfect for testing, demonstrations, or just for fun.',
      startGenerating: 'Start Generating',
      liveDemo: 'Live Demo',
      tryItFree: 'Try It Free',
      features: {
        customDateRange: {
          title: 'Custom Date Range',
          description: 'Select any date range to generate your contribution graph'
        },
        realisticPatterns: {
          title: 'Realistic Patterns',
          description: 'Natural commit distribution with configurable ranges'
        },
        privacyFirst: {
          title: 'Privacy First',
          description: 'All data stays in your browser - nothing is sent to servers'
        }
      },
      readyToStart: 'Ready to Get Started?',
      generateFirstGraph: 'Generate your first contribution graph in seconds',
      launchGenerator: 'Launch Generator'
    },
    generator: {
      title: 'Contribution Generator',
      description: 'Create realistic GitHub contribution patterns with natural distribution',
      preview: 'Preview',
      totalCommits: 'total commits',
      generate: 'Generate',
      generating: 'Generating...',
      regenerate: 'Regenerate',
      selectDate: {
        title: 'Select a Date',
        description: 'Click on any cell in contribution graph to view detailed commit information'
      },
      noCommits: {
        title: 'No Commits',
        description: 'There are no commits on this date'
      },
      selectedDateDetails: {
        title: 'Selected Date Details'
      },
      settings: {
        dateRange: {
          title: 'Date Range',
          startDate: 'Start Date',
          endDate: 'End Date'
        },
        commitSettings: {
          title: 'Commit Settings',
          minCommits: 'Minimum Commits / Day',
          maxCommits: 'Maximum Commits / Day'
        },
        generationMode: {
          title: 'Generation Mode',
          conservative: {
            title: 'Conservative',
            description: 'Only generate commits on dates with no existing contributions. Avoids stacking.',
            selected: 'Selected'
          },
          normal: {
            title: 'Normal',
            description: 'Generate commits regardless of existing contributions. May stack with your current activity.',
            selected: 'Selected'
          },
          aggressive: {
            title: 'Aggressive',
            description: 'Generate commits on all dates regardless. Maximizes contribution activity.',
            selected: 'Selected'
          },
          note: 'Note: Your GitHub Profile counts commits from all public repositories. If you have existing commits on a date, they will be added together.'
        },
        gitConfig: {
          title: 'Git Configuration',
          authorName: 'Author Name',
          authorEmail: 'Author Email',
          repoName: 'Repository Name',
          githubUrl: 'GitHub URL (Optional)',
          githubUrlPlaceholder: 'https://github.com/username/repo.git',
          githubUrlHelp: 'Leave empty to create local repository only',
          createGitCommits: 'Create Git Commits',
          creating: 'Creating...'
        }
      },
      alerts: {
        startDateError: 'Start date must be before end date',
        minMaxError: 'Min commits must be less than or equal to max commits'
      },
      commits: {
        count: 'commits',
        day: 'Day',
        date: 'Date'
      },
      footer: {
        builtWith: 'Built with Next.js, React, and Tailwind CSS',
        createdBy: 'Created by',
        githubUrl: 'https://github.com/Dylan-Nihilo'
      }
    }
  },
  zh: {
    common: {
      appName: 'Mock Git Commits',
      author: 'Dylan'
    },
    nav: {
      back: '返回',
      exportJson: '导出JSON',
      language: '语言'
    },
    landing: {
      title: '生成模拟 GitHub',
      subtitle: '贡献图',
      description: '创建逼真的GitHub贡献图，带有自然的分布模式。适合测试、演示或纯粹为了好玩。',
      startGenerating: '开始生成',
      liveDemo: '实时演示',
      tryItFree: '免费试用',
      features: {
        customDateRange: {
          title: '自定义日期范围',
          description: '选择任何日期范围来生成你的贡献图'
        },
        realisticPatterns: {
          title: '逼真模式',
          description: '带有可配置范围的自然提交分布'
        },
        privacyFirst: {
          title: '隐私优先',
          description: '所有数据都保留在你的浏览器中 - 不会发送到服务器'
        }
      },
      readyToStart: '准备好开始了吗？',
      generateFirstGraph: '在几秒钟内生成你的第一个贡献图',
      launchGenerator: '启动生成器'
    },
    generator: {
      title: '贡献生成器',
      description: '创建逼真的GitHub贡献模式和自然分布',
      preview: '预览',
      totalCommits: '总共提交',
      generate: '生成',
      generating: '生成中...',
      regenerate: '重新生成',
      selectDate: {
        title: '选择日期',
        description: '点击贡献图中的任意单元格查看详细的提交信息'
      },
      noCommits: {
        title: '无提交',
        description: '这一天没有提交'
      },
      selectedDateDetails: {
        title: '选中日期详情'
      },
      settings: {
        dateRange: {
          title: '日期范围',
          startDate: '开始日期',
          endDate: '结束日期'
        },
        commitSettings: {
          title: '提交设置',
          minCommits: '最小提交数/天',
          maxCommits: '最大提交数/天'
        },
        generationMode: {
          title: '生成模式',
          conservative: {
            title: '保守模式',
            description: '只在没有现有贡献的日期生成提交。避免叠加。',
            selected: '已选择'
          },
          normal: {
            title: '正常模式',
            description: '不管是否有现有贡献都生成提交。可能会与当前活动叠加。',
            selected: '已选择'
          },
          aggressive: {
            title: '激进模式',
            description: '不管现有情况在所有日期生成提交。最大化贡献活动。',
            selected: '已选择'
          },
          note: '注意：你的GitHub个人资料统计所有公开仓库的提交。如果你在某天已有提交，它们会加在一起。'
        },
        gitConfig: {
          title: 'Git配置',
          authorName: '作者名称',
          authorEmail: '作者邮箱',
          repoName: '仓库名称',
          githubUrl: 'GitHub URL（可选）',
          githubUrlPlaceholder: 'https://github.com/username/repo.git',
          githubUrlHelp: '留空则仅创建本地仓库',
          createGitCommits: '创建Git提交',
          creating: '创建中...'
        }
      },
      alerts: {
        startDateError: '开始日期必须在结束日期之前',
        minMaxError: '最小提交数必须小于或等于最大提交数'
      },
      commits: {
        count: '次提交',
        day: '星期',
        date: '日期'
      },
      footer: {
        builtWith: '使用Next.js、React和Tailwind CSS构建',
        createdBy: '创建者',
        githubUrl: 'https://github.com/Dylan-Nihilo'
      }
    }
  }
};

export function getTranslations(locale: 'en' | 'zh', namespace: string, key: string): string {
  const localeData = translations[locale] as Record<string, Record<string, unknown>>;
  const namespaceData = localeData[namespace];
  if (namespaceData && typeof namespaceData === 'object' && key in namespaceData) {
    const value = namespaceData[key];
    return typeof value === 'string' ? value : key;
  }
  return key;
}
