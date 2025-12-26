export interface ContributionData {
  date: Date;
  count: number;
}

export interface ContributionGridProps {
  data: ContributionData[];
  startDate: Date;
  endDate: Date;
  onSelectDate?: (date: Date | null) => void;
  selectedDate?: Date | null;
}
