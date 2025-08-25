/**
 * Reusable Glass Card component with fluid glass effect
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Glass effect variant ('light', 'medium', 'heavy')
 * @returns {JSX.Element} Glass card component
 */
const GlassCard = ({ 
  children, 
  className = '', 
  variant = 'medium' 
}) => {
  const glassVariants = {
    light: 'bg-white/5 backdrop-blur-sm border border-white/10',
    medium: 'bg-white/10 backdrop-blur-xl border border-white/20',
    heavy: 'bg-white/15 backdrop-blur-2xl border border-white/30'
  };

  return (
    <div className={`${glassVariants[variant]} rounded-2xl shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
