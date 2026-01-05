import { useMemo } from "react";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import type { Value } from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/teal.css";
import { jalaliToIso, isoToJalali } from "@/lib/dateUtils";

interface PersianDateInputProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function PersianDateInput({
  value,
  onChange,
  placeholder = "1403/09/15 14:30",
  className,
}: PersianDateInputProps) {
  // تبدیل ISO string به فرمت مورد نیاز react-multi-date-picker
  const dateValue = useMemo(() => {
    if (!value) return undefined;
    try {
      const jalaliString = isoToJalali(value);
      if (!jalaliString) return undefined;
      // فرمت: YYYY-MM-DDTHH:mm
      // تبدیل به DateObject برای react-multi-date-picker
      const [datePart, timePart] = jalaliString.split("T");
      if (!datePart) return undefined;
      const [year, month, day] = datePart.split("-").map(Number);
      const [hours = 0, minutes = 0] = timePart
        ? timePart.split(":").map(Number)
        : [0, 0];

      if (!year || !month || !day) return undefined;

      // ساخت DateObject واقعی با تقویم فارسی
      return new DateObject({
        year,
        month,
        day,
        hour: hours,
        minute: minutes,
        calendar: persian,
        locale: persian_fa,
      });
    } catch {
      return undefined;
    }
  }, [value]);

  const handleChange = (selectedDate: Value) => {
    if (!selectedDate) {
      onChange(null);
      return;
    }

    try {
      let jalaliString: string = "";
      let dateObj: any = null;

      // تشخیص نوع ورودی
      if (Array.isArray(selectedDate)) {
        dateObj = selectedDate[0];
      } else if (typeof selectedDate === "string") {
        // اگر string باشد، مستقیماً تبدیل کن
        jalaliString = selectedDate.replace(/\//g, "-").replace(" ", "T");
        if (!jalaliString.includes("T")) {
          jalaliString += "T00:00";
        }
      } else if (typeof selectedDate === "object" && selectedDate !== null) {
        dateObj = selectedDate;
      }

      // اگر dateObj داریم، از آن استخراج کن
      if (dateObj && !jalaliString) {
        const year = dateObj.year;
        let month = dateObj.month;

        // استخراج month - ممکن است object یا number باشد
        if (typeof month === "object" && month !== null) {
          month = month.number || month.index || 1;
        }

        const day = dateObj.day;
        const hour = dateObj.hour ?? 0;
        const minute = dateObj.minute ?? 0;

        if (!year || !month || !day) {
          onChange(null);
          return;
        }

        jalaliString = `${year}-${String(month).padStart(2, "0")}-${String(
          day,
        ).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(
          minute,
        ).padStart(2, "0")}`;
      }

      if (!jalaliString) {
        onChange(null);
        return;
      }

      // تبدیل به ISO string
      const isoString = jalaliToIso(jalaliString);

      if (isoString) {
        onChange(isoString);
      } else {
        onChange(null);
      }
    } catch (error) {
      console.error("Error in PersianDateInput:", error);
      onChange(null);
    }
  };

  return (
    <DatePicker
      value={dateValue}
      onChange={handleChange}
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      inputClass={`${className || ""} h-8 text-sm`}
      containerClassName="w-full"
      placeholder={placeholder}
      format="YYYY/MM/DD HH:mm"
      editable={true}
      plugins={[<TimePicker key="time-picker" position="bottom" />]}
      digits={["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]}
    />
  );
}
