import { motion } from 'framer-motion'

const PageFooter = ({
  fadeInUp,
  contactEmail = 'customerservice@pandedaily.com',
  contactText = 'Need more help? Contact us at',
  tagline = 'Free delivery on all subscriptions • Zero preservatives • Hand-kneaded daily',
  accentColor = '#9C4A15',
  textColor = '#2A1803',
  showDivider = true,
  animation = true,
  className = '',
  delay = 0.3,
}) => {
  const footerContent = (
    <div className={`text-center ${className}`}>
      {showDivider && (
        <div className="h-1 w-32 mx-auto mb-4 mt-12" style={{ backgroundColor: accentColor }}></div>
      )}

      <p className="text-lg md:text-xl font-[titleFont]" style={{ color: textColor }}>
        {contactText}{' '}
        <a
          href={`mailto:${contactEmail}`}
          className="font-medium hover:underline"
          style={{ color: accentColor }}
        >
          {contactEmail}
        </a>
      </p>

      <p className="text-sm font-[titleFont] mt-2" style={{ color: accentColor }}>
        {tagline}
      </p>
    </div>
  )

  if (!animation) {
    return footerContent
  }

  return (
    <motion.div variants={fadeInUp} transition={{ delay }}>
      {footerContent}
    </motion.div>
  )
}

export default PageFooter
