const Alert = ({ variant = 'error', children }) => (
  <p role="alert" aria-live="assertive" className={`alert alert-${variant}`}>
    {children}
  </p>
)

export default Alert
