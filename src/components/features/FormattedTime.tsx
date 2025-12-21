
import { format } from 'date-fns';
import { enUS, type Locale } from 'date-fns/locale';

interface FormattedTimeProps {
  dateString: string | Date | number | null | undefined;
  formatString?: string;
  locale?: Locale;
  fallback?: string;
  className?: string;
  variant?: 'default' | 'card' | 'detail' | 'meta';
}

const FormattedTime: React.FC<FormattedTimeProps> = ({ 
  dateString, 
  formatString = "h a",
  locale = enUS,
  fallback = "Time not available",
  className = "",
  variant = "default"
}) => {

    if (!dateString) {
    return <span className={className}>{fallback}</span>;
  }

  try {
    let date: Date;
    

    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string') {
      if (dateString.includes('T') || dateString.includes('+') || dateString.includes('Z')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString);
      }
    } else if (typeof dateString === 'number') {
      date = new Date(dateString);
    } else {
      date = new Date(dateString);
    }


    if (isNaN(date.getTime())) {
      console.error('❌ Invalid date for time formatting:', dateString);
      return <span className={className}>{fallback}</span>;
    }


    const formattedTime = format(date, formatString, { locale });
    

    const variantClasses = {
      default: "",
      card: "text-emerald-600 font-medium",
      detail: "text-gray-700",
      meta: "text-gray-500"
    };
    
    const finalClassName = `${variantClasses[variant]} ${className}`.trim();
    
    return <span className={finalClassName}>{formattedTime}</span>;
  } catch (error) {
    console.error('❌ Time formatting error:', error, 'for date:', dateString);
    return <span className={className}>{fallback}</span>;
  }
};

export default FormattedTime;