const Card = ({ title, tone = 'default', className = '', children }) => (
  <div className={['card', tone !== 'default' ? `card--${tone}` : '', className].filter(Boolean).join(' ')}>
    {title && <h3>{title}</h3>}
    {children}
  </div>
)

export default Card
