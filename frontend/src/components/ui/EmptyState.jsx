const EmptyState = ({ title, description }) => (
  <div className="empty-state">
    <p className="empty-state-title">{title}</p>
    {description && <p className="hint">{description}</p>}
  </div>
)

export default EmptyState
