const FormField = ({ label, htmlFor, className = '', children }) => (
  <div className={['form-field', className].filter(Boolean).join(' ')}>
    <label htmlFor={htmlFor}>{label}</label>
    {children}
  </div>
)

export default FormField
