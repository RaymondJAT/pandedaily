import { motion } from 'framer-motion'
import { features } from '../../../mapping/features'

const Why = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: 'easeOut' },
  }

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, ease: 'easeOut' },
  }

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  }

  const imageVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: 'easeOut' },
  }

  return (
    <section className="py-13" style={{ backgroundColor: '#F5EFE7' }}>
      <div className="container mx-auto px-4">
        {/* Headline */}
        <div className="text-center mb-10">
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 font-[titleFont]"
            style={{ color: '#3F2305' }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
          >
            Why PandeDaily?
          </motion.h2>
          <motion.p
            className="text-base md:text-lg max-w-2xl mx-auto font-[titleFont]"
            style={{ color: '#9C4A15' }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            Discover what makes our bread special and why our customers keep coming back for more.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              className="flex flex-col h-full"
              variants={cardVariants}
              transition={{ ...cardVariants.transition, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
            >
              {/* Image and Title */}
              <div className="flex items-center mb-3">
                <motion.div
                  variants={imageVariants}
                  transition={{
                    ...imageVariants.transition,
                    delay: 0.3 + index * 0.1,
                  }}
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-cover rounded-lg mr-4 md:mr-5 shrink-0"
                  />
                </motion.div>

                <motion.h3
                  className="text-lg md:text-xl lg:text-2xl font-medium flex-1 font-[titleFont]"
                  style={{ color: '#3F2305' }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  {feature.title}
                </motion.h3>
              </div>

              {/* Description */}
              <div className="flex-1">
                <motion.p
                  className="text-sm md:text-base lg:text-lg font-[titleFont]"
                  style={{ color: '#9C4A15' }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  {feature.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Why
