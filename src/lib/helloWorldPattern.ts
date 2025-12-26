import { ContributionData } from '@/types/contribution';

// HELLO WORLD - 7行高(周日到周六)，每个字母4列宽，间隔1列
// O 使用方形设计
const PATTERN = [
  // H      E      L      L      O        W        O      R      L      D
  [1,0,0,1,0,1,1,1,1,0,1,0,0,0,0,1,0,0,0,0,1,1,1,1,0,0,1,0,0,0,1,0,1,1,1,1,0,1,1,1,0,0,1,0,0,0,0,1,1,1,0],
  [1,0,0,1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,0,0,1,0,0,1],
  [1,0,0,1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,0,0,1,0,0,1],
  [1,1,1,1,0,1,1,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,1,0,1,0,1,0,0,1,0,1,1,1,0,0,1,0,0,0,0,1,0,0,1],
  [1,0,0,1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,0,1,0,0,0,0,1,0,0,1],
  [1,0,0,1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1,1,0,1,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,0,0,1,0,0,1],
  [1,0,0,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,0,1,0,0,0,1,0,1,1,1,1,0,1,0,0,1,0,1,1,1,1,0,1,1,1,0],
];

export function generateHelloWorldPattern(): ContributionData[] {
  const data: ContributionData[] = [];
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);

  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  let weekIndex = 0;
  const patternWidth = PATTERN[0].length;
  const patternHeight = PATTERN.length; // 7行
  const startWeek = Math.floor((53 - patternWidth) / 2);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0=周日, 6=周六
    const col = weekIndex - startWeek;
    const row = dayOfWeek; // 直接使用，0-6对应7行
    let count = 0;

    if (col >= 0 && col < patternWidth && row >= 0 && row < patternHeight) {
      if (PATTERN[row][col] === 1) {
        count = 20 + Math.floor(Math.random() * 5);
      }
    }

    data.push({ date: new Date(currentDate), count });
    currentDate.setDate(currentDate.getDate() + 1);
    if (dayOfWeek === 6) weekIndex++;
  }

  return data;
}
