const Button = ({ variant = 'primary', active = false, className = '', ...props }) => (
  <button
    className={['btn', `btn-${variant}`, active ? 'active' : '', className].filter(Boolean).join(' ')}
    {...props}
  />
)

export default Button
