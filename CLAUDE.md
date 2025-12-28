# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mock Git Commits is a Next.js web application that generates realistic GitHub contribution graphs. Users can configure date ranges, commit patterns, and push generated commits to GitHub repositories.

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components (Radix UI primitives)

## Architecture

### Routing Structure
- `/` - Root redirect
- `/[locale]/landing` - Landing page with "HELLO WORLD" demo pattern
- `/[locale]/generator` - Main generator interface

Locales supported: `en`, `zh`

### Key Components

**ContributionGrid** (`src/components/ContributionGrid.tsx`)
- Renders the GitHub-style contribution heatmap
- Handles date selection and hover tooltips
- Uses grayscale color scheme (bg-gray-900 to bg-gray-400)

**ControlPanel** (`src/components/ControlPanel.tsx`)
- Configuration UI for date range, commit counts, git settings
- URL validation with debounced API calls
- Generation modes: conservative, normal, aggressive
- Push modes: remote (new repo) or branch (local branch)

### API Routes

**`/api/generate-commits`** - Creates commits in isolated `.mock-git-commits/` directory
- Uses `git fast-import` for bulk commit creation
- Returns Server-Sent Events for progress updates
- Optionally pushes to remote repository

**`/api/generate-branch`** - Creates commits on a local branch

**`/api/validate-repo`** - Validates GitHub repository URLs

### i18n System

Custom lightweight i18n implementation in `src/lib/translations.ts`:
- Messages stored in `messages/en.json` and `messages/zh.json`
- `useTranslations(namespace)` hook for component translations
- `getCurrentLocale()` extracts locale from URL path

### Types

`src/types/contribution.ts` defines:
- `ContributionData`: `{ date: Date, count: number }`
- `ContributionGridProps`: Grid component props

### Commit Generation

`src/lib/generateCommits.ts`:
- `generateRandomCommits()` - Creates random contribution data
- `getYearStart()` / `getYearEnd()` - Date range helpers

Generated commits are stored in `.mock-git-commits/[repoName]/` directory, isolated from the main project.
