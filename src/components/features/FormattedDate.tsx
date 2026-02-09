import { format as _f } from 'date-fns';
import { enUS as _en, type Locale as _L } from 'date-fns/locale'; 

interface FormattedDateProps {
  dateString: string | Date | number | null | undefined;
  formatString?: string;
  locale?: _L;
  fallback?: string;
  className?: string;
  variant?: 'default' | 'card' | 'detail' | 'meta';
}

const FormattedDate: React.FC<FormattedDateProps> = ({ 
  dateString: _dS, 
  formatString: _fS = "  MMMM d yyyy  ", 
  locale: _lc = _en,
  fallback: _fb = "Date not available",
  className: _cN = "",
  variant: _v = "default"
}) => {

  if (!_dS) {
    return <span className={_cN}>{_fb}</span>;
  }

  try {
    let _d: Date;

    if (_dS instanceof Date) {
      _d = _dS;
    } else if (typeof _dS === 'string') {
      _d = new Date(_dS);
    } else if (typeof _dS === 'number') {
      _d = new Date(_dS);
    } else {
      _d = new Date(_dS as any);
    }

    if (isNaN(_d.getTime())) {
      if (import.meta.env.DEV) console.error('❌ Invalid date:', _dS);
      return <span className={_cN}>{_fb}</span>;
    }

    const _fD = _f(_d, _fS, { locale: _lc });

    const _vC = {
      default: "",
      card: "text-emerald-600 font-medium",
      detail: "text-gray-700",
      meta: "text-gray-500"
    };
    
    const _fCN = `${_vC[_v]} ${_cN}`.trim();
    
    return <span className={_fCN}>{_fD}</span>;
  } catch (_e) {
    if (import.meta.env.DEV) console.error('❌ Error:', _e, 'for:', _dS);
    return <span className={_cN}>{_fb}</span>;
  }
};

export default FormattedDate;