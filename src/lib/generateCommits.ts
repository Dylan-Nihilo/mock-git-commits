import { ContributionData } from '@/types/contribution';

export const generateRandomCommits = (
  startDate: Date,
  endDate: Date,
  minCommits: number,
  maxCommits: number
): ContributionData[] => {
  const contributions: ContributionData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const random = Math.random();

    if (random > 0.3) {
      const count = Math.floor(Math.random() * (maxCommits - minCommits + 1)) + minCommits;
      contributions.push({
        date: new Date(currentDate),
        count,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return contributions;
};

export const getYearStart = (date: Date): Date => {
  const yearStart = new Date(date);
  yearStart.setMonth(0, 1);
  return yearStart;
};

export const getYearEnd = (date: Date): Date => {
  const yearEnd = new Date(date);
  yearEnd.setMonth(11, 31);
  return yearEnd;
};
