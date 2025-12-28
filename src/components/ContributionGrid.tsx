import { useState, useMemo } from 'react';
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

  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      map.set(new Date(d.date).toDateString(), d.count);
    });
    return map;
  }, [data]);

  const getContributionForDate = (date: Date): number => {
    return dataMap.get(date.toDateString()) || 0;
  };

  const getCellColor = (count: number): string => {
    if (count === 0) return 'bg-[#161b22]';
    if (count <= 5) return 'bg-[#0e4429]';
    if (count <= 10) return 'bg-[#006d32]';
    if (count <= 20) return 'bg-[#26a641]';
    return 'bg-[#39d353]';
  };

  const { weeks, monthLabels } = useMemo(() => {
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
    
    return { weeks, monthLabels };
  }, [startDate, endDate]);

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

  const handleKeyDown = (e: React.KeyboardEvent, currentDate: Date) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(currentDate);
      return;
    }

    const directionMap: { [key: string]: number } = {
      ArrowUp: -1,
      ArrowDown: 1,
      ArrowLeft: -7,
      ArrowRight: 7,
    };

    const dayDiff = directionMap[e.key];
    if (dayDiff !== undefined) {
      e.preventDefault();
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + dayDiff);
      
      // Find the element with this date and focus it
      const element = document.querySelector(`[data-date="${newDate.toDateString()}"]`) as HTMLElement;
      if (element) {
        element.focus();
      }
    }
  };

  const cellStyle = { width: CELL_SIZE_PX, height: CELL_SIZE_PX };

  return (
    <div className="flex flex-col items-center gap-2 w-full animate-in fade-in duration-500">
      {hoveredDate && (
        <div
          className="fixed bg-gray-800 text-white px-3 py-2 rounded-md text-xs z-50 pointer-events-none shadow-lg border border-gray-700 transition-opacity duration-200 ease-in-out"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
            opacity: 1,
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

      {/* Grid container with horizontal scroll */}
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex items-start min-w-fit">
          {/* Day labels column */}
          <div
            className="flex flex-col text-[10px] text-gray-500 pt-5 sticky left-0 bg-black z-10"
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
                      role="gridcell"
                      tabIndex={0}
                      data-date={date.toDateString()}
                      aria-label={`${count} commits on ${date.toDateString()}`}
                      className={`rounded-sm border border-gray-800 transition-all duration-200 cursor-pointer hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-125 ${
                        isOutsideRange ? 'bg-gray-950 pointer-events-none' : getCellColor(count)
                      } ${isSelected ? 'ring-2 ring-white' : ''}`}
                      onMouseEnter={(e) => handleMouseEnter(e, date)}
                      onFocus={(e) => handleMouseEnter(e as any, date)}
                      onMouseLeave={handleMouseLeave}
                      onBlur={handleMouseLeave}
                      onClick={() => !isOutsideRange && handleClick(date)}
                      onKeyDown={(e) => !isOutsideRange && handleKeyDown(e, date)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{t('less')}</span>
        <div className="flex" style={{ gap: CELL_GAP_PX }}>
          <div style={cellStyle} className="rounded-sm bg-[#161b22] border border-gray-800" />
          <div style={cellStyle} className="rounded-sm bg-[#0e4429] border border-gray-800" />
          <div style={cellStyle} className="rounded-sm bg-[#006d32] border border-gray-800" />
          <div style={cellStyle} className="rounded-sm bg-[#26a641] border border-gray-800" />
          <div style={cellStyle} className="rounded-sm bg-[#39d353] border border-gray-800" />
        </div>
        <span>{t('more')}</span>
      </div>
    </div>
  );
};

export default ContributionGrid;
