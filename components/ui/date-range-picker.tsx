"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  dateRange?: DateRange
  onSelect?: (dateRange: DateRange | undefined) => void
  className?: string
  align?: "start" | "center" | "end"
  showComparisonRange?: boolean
  disabled?: boolean
}

export function DateRangePicker({
  dateRange,
  onSelect,
  className,
  align = "start",
  showComparisonRange = false,
  disabled = false,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(dateRange)

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    onSelect?.(range)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="rounded-md border shadow-lg"
          />
          {showComparisonRange && (
            <div className="p-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compare with</span>
                <Button
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => {
                    if (date?.from && date?.to) {
                      const days = Math.ceil(
                        (date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)
                      )
                      handleSelect({
                        from: addDays(date.from, -days - 1),
                        to: addDays(date.to, -days - 1),
                      })
                    }
                  }}
                >
                  Previous period
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}