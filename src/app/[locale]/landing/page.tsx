'use client';

import { useState, useEffect, startTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Calendar, Zap, Lock, GitCommit, Github, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import ContributionGrid from '@/components/ContributionGrid';
import { generateHelloWorldPattern } from '@/lib/helloWorldPattern';

export default function Landing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  // 生成 HELLO WORLD 图案数据
  const helloWorldData = useMemo(() => generateHelloWorldPattern(), []);
  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(() => new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000), [endDate]);

  const navigateToGenerator = () => {
    window.location.href = `/zh/generator`;
  };

  const features = [
    {
      icon: Calendar,
      title: '自定义日期范围',
      description: '完全控制你的贡献图，选择任意日期范围进行生成',
      gradient: 'from-blue-500/20 to-purple-500/20'
    },
    {
      icon: Zap,
      title: '逼真的提交模式',
      description: '自然的提交分布，可配置范围，看起来真实可信',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: Lock,
      title: '隐私优先',
      description: '所有数据都保留在你的浏览器中，不会发送到任何服务器',
      gradient: 'from-orange-500/20 to-red-500/20'
    },
  ];

  const stats = [
    { label: '周数据', value: '52' },
    { label: '天/年', value: '365' },
    { label: '提交模式', value: '∞' },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden selection:bg-green-500/30">
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-sm flex items-center justify-center shadow-lg shadow-white/10">
              <span className="text-black font-bold text-sm">MGC</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Mock Git Commits</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Dylan-Nihilo/mock-git-commits"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-all hover:scale-110"
            >
              <Github className="h-5 w-5" />
            </a>
            <Button
              size="sm"
              className="bg-white text-black hover:bg-gray-200 text-xs h-9 px-5 font-medium shadow-lg shadow-white/10"
              onClick={navigateToGenerator}
            >
              开始使用
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-[1400px] mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/80 border border-gray-800 rounded-full mb-10 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm text-gray-300 font-medium">
                秒级生成逼真的 GitHub 贡献图
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight tracking-tighter">
              打造你的完美
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-blue-500 animate-gradient-x bg-[length:200%_auto]">
                GitHub 主页
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              生成逼真的贡献图，自然的提交模式。
              适合测试、演示，或者纯粹为了好玩。
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 px-8 h-14 text-base font-semibold shadow-xl shadow-white/10 hover:shadow-white/20 transition-all"
                onClick={navigateToGenerator}
              >
                立即开始生成
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* HELLO WORLD Demo */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <Card className="relative max-w-5xl mx-auto bg-[#0d1117] border border-gray-800 p-8 mb-20 backdrop-blur-sm shadow-2xl">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 mb-6 border-b border-gray-800/50 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="ml-4 text-xs text-gray-500 font-mono flex-1 text-center pr-16">
                    contribution-graph-preview — -zsh
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-white mb-2 tracking-wider font-mono">
                    HELLO WORLD
                  </div>
                  <p className="text-sm text-gray-500 font-mono">$ echo "Previewing contribution pattern..."</p>
                </div>
                <div className="flex justify-center overflow-x-auto pb-4">
                  <ContributionGrid
                    data={helloWorldData}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-24">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="mb-24">
              <div className="flex items-center justify-center gap-2 mb-12">
                <TrendingUp className="h-5 w-5 text-white" />
                <h2 className="text-2xl font-bold text-white">为什么选择 Mock Git Commits？</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br ${feature.gradient} border-gray-800 p-8 hover:border-gray-600 transition-all hover:-translate-y-1 hover:shadow-xl`}
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-24">
              <h2 className="text-3xl font-bold text-white mb-12">使用流程</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: '01', title: '配置', description: '设置日期范围和提交数量' },
                  { step: '02', title: '生成', description: '创建逼真的贡献模式' },
                  { step: '03', title: '预览', description: '查看并调整你的贡献图' },
                  { step: '04', title: '导出', description: '下载或创建真实的 Git 提交' },
                ].map((item, index) => (
                  <div key={index} className="relative">
                    <div className="text-7xl font-bold text-gray-800 mb-4">{item.step}</div>
                    <div className="text-xl font-bold text-white mb-2">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                    {index < 3 && (
                      <ChevronRight className="hidden md:block absolute top-8 -right-3 h-6 w-6 text-gray-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-12 md:p-16">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-white/10">
                  <GitCommit className="h-8 w-8 text-black" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                准备好改变你的主页了吗？
              </h2>
              <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
                几秒钟内生成你的第一个贡献图。快速、免费、完全私密。
              </p>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 px-10 h-14 text-base font-semibold shadow-xl shadow-white/10 hover:shadow-white/20 transition-all"
                onClick={navigateToGenerator}
              >
                启动生成器
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-gray-800/50 py-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-[8px]">MGC</span>
              </div>
              <span className="text-sm font-semibold text-white">Mock Git Commits</span>
            </div>
            <div className="text-xs text-gray-600">
              仅供娱乐，真正的成就需要靠双手创造。
            </div>
            <div>
              <a
                href="https://github.com/Dylan-Nihilo/mock-git-commits"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                由 Dylan 创建
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
