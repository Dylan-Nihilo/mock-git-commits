import { useState } from 'react';
import { ContributionGridProps } from '@/types/contribution';
import { useTranslations } from '@/lib/translations';

const CELL_SIZE_PX = 12;
const CELL_GAP_PX = 4;
const DAY_LABEL_WIDTH = 28;

const ContributionGrid: React.FC<ContributionGridProps> = ({
  data,
  startDate,
  endDate,
  onSelectDate,
  selectedDate,
}) => {
  const t = useTranslations('generator');
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  const getContributionForDate = (date: Date): number => {
    const contribution = data.find((d) => {
      const dDate = new Date(d.date);
      return dDate.toDateString() === date.toDateString();
    });
    return contribution?.count || 0;
  };

  const getCellColor = (count: number): string => {
    if (count === 0) return 'bg-gray-900';
    if (count <= 5) return 'bg-gray-700';
    if (count <= 10) return 'bg-gray-600';
    if (count <= 20) return 'bg-gray-500';
    return 'bg-gray-400';
  };

  const weeks: Date[][] = [];
  const currentWeek: Date[] = [];

  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  while (currentDate <= endDate) {
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek.length = 0;
    }
    currentWeek.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push([...currentWeek]);
  }

  const monthLabels: { weekIndex: number; month: string }[] = [];

  weeks.forEach((week, weekIndex) => {
    if (week.length > 0) {
      const firstDay = week[0];
      const month = firstDay.toLocaleString('en-US', { month: 'short' });
      const lastLabel = monthLabels[monthLabels.length - 1];
      if (!lastLabel || lastLabel.month !== month) {
        monthLabels.push({ weekIndex, month });
      }
    }
  });

  const handleMouseEnter = (e: React.MouseEvent, date: Date) => {
    setHoveredDate(date);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  const handleClick = (date: Date) => {
    if (onSelectDate) {
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      onSelectDate(isSelected ? null : date);
    }
  };

  const cellStyle = { width: CELL_SIZE_PX, height: CELL_SIZE_PX };

  return (
    <div className="flex flex-col items-center gap-2">
      {hoveredDate && (
        <div
          className="fixed bg-gray-800 text-white px-3 py-2 rounded-md text-xs z-50 pointer-events-none shadow-lg border border-gray-700"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold">
            {hoveredDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="text-gray-300">
            {getContributionForDate(hoveredDate)} {t('commits.count')}
          </div>
        </div>
      )}

      <div className="flex items-start">
        {/* Day labels column */}
        <div
          className="flex flex-col text-[10px] text-gray-500 pt-5"
          style={{ width: DAY_LABEL_WIDTH, gap: CELL_GAP_PX }}
        >
          {dayLabels.map((day, index) => (
            <div
              key={index}
              className="flex items-center justify-end pr-2"
              style={{ height: CELL_SIZE_PX }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid area */}
        <div className="flex flex-col">
          {/* Month labels row */}
          <div className="relative h-5">
            {monthLabels.map((label) => (
              <span
                key={label.weekIndex}
                className="absolute text-[10px] text-gray-500"
                style={{ left: label.weekIndex * (CELL_SIZE_PX + CELL_GAP_PX) }}
              >
                {label.month}
              </span>
            ))}
          </div>

          {/* Contribution grid */}
          <div className="flex" style={{ gap: CELL_GAP_PX }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col" style={{ gap: CELL_GAP_PX }}>
                {week.map((date, dayIndex) => {
                  const count = getContributionForDate(date);
                  const isOutsideRange = date < startDate || date > endDate;
                  const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

                  return (
                    <div
                      key={dayIndex}
                      style={cellStyle}
                      className={`rounded-sm border border-gray-800 transition-all duration-200 cursor-pointer hover:scale-125 ${
                        isOutsideRange ? 'bg-gray-950' : getCellColor(count)
                      } ${isSelected ? 'ring-2 ring-white' : ''}`}
                      onMouseEnter={(e) => handleMouseEnter(e, date)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => !isOutsideRange && handleClick(date)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{t('less')}</span>
        <div className="flex" style={{ gap: CELL_GAP_PX }}>
          <div style={cellStyle} className="rounded-sm bg-gray-900 border border-gray-800" />
          <div style={cellStyle} className="rounded-sm bg-gray-700 border border-gray-800" />
          <div style={cellStyle} className="rounded-sm bg-gray-600 border border-gray-800" />
          <div style={cellStyle} className="rounded-sm bg-gray-500 border border-gray-800" />
          <div style={cellStyle} className="rounded-sm bg-gray-400 border border-gray-800" />
        </div>
        <span>{t('more')}</span>
      </div>
    </div>
  );
};

export default ContributionGrid;
