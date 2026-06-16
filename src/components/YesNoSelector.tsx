interface Props {
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function YesNoSelector({ value, onChange, disabled = false }: Props) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
          value === true
            ? 'bg-red-600 border-red-600 text-white shadow-md'
            : 'bg-white border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {value === true && <span className="text-base font-bold">✗</span>}
        SÍ
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
          value === false
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
            : 'bg-white border-gray-300 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {value === false && <span className="text-base font-bold">✗</span>}
        NO
      </button>
    </div>
  );
}
