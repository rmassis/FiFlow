import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays, addDays, subWeeks, addWeeks, subMonths, addMonths, subQuarters, addQuarters, subYears, addYears } from "date-fns";

export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'trimester' | 'year';

interface DashboardContextType {
    periodType: PeriodType;
    selectedDate: Date;
    dateRange: { start: Date; end: Date };
    setPeriodType: (type: PeriodType) => void;
    navigatePeriod: (direction: 'prev' | 'next') => void;
    setDate: (date: Date) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [periodType, setPeriodType] = useState<PeriodType>('month');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });

    useEffect(() => {
        calculateDateRange(periodType, selectedDate);
    }, [periodType, selectedDate]);

    const calculateDateRange = (type: PeriodType, date: Date) => {
        let start, end;
        switch (type) {
            case 'day':
                start = startOfDay(date);
                end = endOfDay(date);
                break;
            case 'week':
                start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday start
                end = endOfWeek(date, { weekStartsOn: 0 });
                break;
            case 'month':
                start = startOfMonth(date);
                end = endOfMonth(date);
                break;
            case 'quarter':
                start = startOfQuarter(date);
                end = endOfQuarter(date);
                break;
            case 'trimester':
                // Custom logic for 4-month periods (Jan-Apr, May-Aug, Sep-Dec)
                const month = date.getMonth();
                const trimesterStartMonth = Math.floor(month / 4) * 4;
                start = new Date(date.getFullYear(), trimesterStartMonth, 1);
                end = new Date(date.getFullYear(), trimesterStartMonth + 4, 0); // Last day of 4th month
                break;
            case 'year':
                start = startOfYear(date);
                end = endOfYear(date);
                break;
            default:
                start = startOfMonth(date);
                end = endOfMonth(date);
        }
        setDateRange({ start, end });
    };

    const navigatePeriod = (direction: 'prev' | 'next') => {
        const modifier = direction === 'next' ? 1 : -1;
        let newDate = new Date(selectedDate);

        switch (periodType) {
            case 'day':
                newDate = direction === 'next' ? addDays(newDate, 1) : subDays(newDate, 1);
                break;
            case 'week':
                newDate = direction === 'next' ? addWeeks(newDate, 1) : subWeeks(newDate, 1);
                break;
            case 'month':
                newDate = direction === 'next' ? addMonths(newDate, 1) : subMonths(newDate, 1);
                break;
            case 'quarter':
                newDate = direction === 'next' ? addQuarters(newDate, 1) : subQuarters(newDate, 1);
                break;
            case 'trimester':
                newDate = direction === 'next' ? addMonths(newDate, 4) : subMonths(newDate, 4);
                break;
            case 'year':
                newDate = direction === 'next' ? addYears(newDate, 1) : subYears(newDate, 1);
                break;
        }
        setSelectedDate(newDate);
    };

    return (
        <DashboardContext.Provider value={{
            periodType,
            selectedDate,
            dateRange,
            setPeriodType,
            navigatePeriod,
            setDate: setSelectedDate
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
