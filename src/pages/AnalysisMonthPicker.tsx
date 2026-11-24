import React from 'react';
import { DatePicker } from '@byted-babi/babi-design';
import { months } from './analysisData';

export default function AnalysisMonthPicker({ value, onChange }: { value: string; onChange: (month: string) => void }) {
  return <DatePicker.MonthPicker
    aria-label="账期"
    aria-required
    value={value}
    format="YYYY-MM"
    placeholder="请选择月份"
    allowClear={false}
    editable={false}
    disabledDate={date => !months.includes(date.format('YYYY-MM'))}
    onChange={onChange}
    style={{ width: '100%' }}
  />;
}
