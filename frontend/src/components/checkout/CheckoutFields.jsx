import { INPUT_CLASS, SELECT_OPTION_CLASS } from '../../constants/checkout'

export const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium mb-1">{label}</label>
    <input {...props} className={INPUT_CLASS} />
  </div>
)

export const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium mb-1">{label}</label>
    <select value={value} onChange={onChange} className={INPUT_CLASS}>
      <option className={SELECT_OPTION_CLASS} value="">Select {label}</option>
      {options.map(opt => (
        <option className={SELECT_OPTION_CLASS} key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
)
