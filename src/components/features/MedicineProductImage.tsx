import { Pill, ShieldCheck } from 'lucide-react';
import { Medicine } from '@/types';
import { cn } from '@/lib/utils';

interface MedicineProductImageProps {
  medicine: Pick<Medicine, 'name' | 'genericName' | 'manufacturer' | 'category' | 'requiresPrescription'>;
  className?: string;
  compact?: boolean;
}

const categoryStyles: Record<string, { bg: string; accent: string; strip: string }> = {
  'Pain Relief': { bg: 'from-sky-50 to-white', accent: 'text-sky-700', strip: 'bg-sky-600' },
  Antibiotics: { bg: 'from-rose-50 to-white', accent: 'text-rose-700', strip: 'bg-rose-600' },
  Diabetes: { bg: 'from-emerald-50 to-white', accent: 'text-emerald-700', strip: 'bg-emerald-600' },
  Cardiovascular: { bg: 'from-red-50 to-white', accent: 'text-red-700', strip: 'bg-red-600' },
  Allergy: { bg: 'from-amber-50 to-white', accent: 'text-amber-700', strip: 'bg-amber-500' },
  Gastrointestinal: { bg: 'from-purple-50 to-white', accent: 'text-purple-700', strip: 'bg-purple-600' },
  Vitamins: { bg: 'from-teal-50 to-white', accent: 'text-teal-700', strip: 'bg-teal-600' },
};

export default function MedicineProductImage({ medicine, className, compact = false }: MedicineProductImageProps) {
  const style = categoryStyles[medicine.category] || { bg: 'from-slate-50 to-white', accent: 'text-slate-700', strip: 'bg-slate-600' };
  const shortName = medicine.name.replace(/\s+/g, ' ');

  return (
    <div
      role="img"
      aria-label={`${medicine.name} medicine pack`}
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br shadow-sm',
        style.bg,
        className
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-2', style.strip)} />
      <div className="absolute -right-5 -bottom-5 h-20 w-20 rounded-full bg-white/70" />
      <div className="absolute right-2 top-3 rounded-full bg-white/80 p-1.5 shadow-sm">
        {medicine.requiresPrescription ? <ShieldCheck size={compact ? 12 : 16} className={style.accent} /> : <Pill size={compact ? 12 : 16} className={style.accent} />}
      </div>
      <div className={cn('flex h-full flex-col justify-between p-3', compact ? 'p-2' : 'p-4')}>
        <div>
          <div className={cn('font-bold leading-tight tracking-normal', style.accent, compact ? 'text-[10px]' : 'text-sm')}>
            {shortName}
          </div>
          {!compact && <div className="mt-1 text-[10px] font-medium text-slate-500">{medicine.genericName}</div>}
        </div>
        <div className="mt-3">
          <div className={cn('inline-flex rounded-md bg-white/90 px-2 py-1 font-semibold shadow-sm', compact ? 'text-[8px]' : 'text-[10px]', style.accent)}>
            {medicine.manufacturer}
          </div>
          {!compact && <div className="mt-2 text-[9px] font-medium uppercase tracking-wide text-slate-400">{medicine.category}</div>}
        </div>
      </div>
    </div>
  );
}
