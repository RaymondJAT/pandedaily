import { motion } from 'framer-motion'
import { FiArrowLeft } from 'react-icons/fi'

const PageHeader = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  fadeInUp,
  titleColor = '#2A1803',
  subtitleColor = '#9C4A15',
  accentColor = '#9C4A15',
  titleSize = 'text-2xl md:text-3xl lg:text-4xl',
  subtitleSize = 'text-base md:text-lg',
  alignment = 'center',
  showDivider = true,
  rightElement = null,
  animation = 'fadeInUp',
}) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <motion.div
      className={`mb-8 md:mb-12 ${alignmentClasses[alignment]}`}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      {/* Header with back button */}
      <div className={`flex items-center ${alignment === 'center' ? 'justify-between' : ''} mb-6`}>
        {showBackButton && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition-colors hover:opacity-80"
            style={{ color: accentColor }}
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        )}

        <h1
          className={`${titleSize} font-light font-[titleFont] ${showBackButton ? '' : 'w-full'}`}
          style={{ color: titleColor }}
        >
          {title}
        </h1>

        {rightElement && <div className="w-20 flex justify-end">{rightElement}</div>}

        {showBackButton && !rightElement && <div className="w-20"></div>}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          className={`${subtitleSize} max-w-3xl mx-auto font-[titleFont] mb-6`}
          style={{ color: subtitleColor }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* Divider */}
      {showDivider && (
        <div
          className={`h-1 w-24 ${alignment === 'center' ? 'mx-auto' : ''}`}
          style={{ backgroundColor: accentColor }}
        ></div>
      )}
    </motion.div>
  )
}

export default PageHeader
