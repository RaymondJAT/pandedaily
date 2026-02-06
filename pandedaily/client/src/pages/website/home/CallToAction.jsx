import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ctaBackground from '../../../assets/story-images/image-sixteen.png'

const CallToAction = () => {
  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(63, 35, 5, 0.85), rgba(156, 74, 21, 0.8)), url(${ctaBackground})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100%',
    minHeight: '45vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
  }

  const navigate = useNavigate()

  const handleOrderNow = () => {
    navigate('/order')
  }

  return (
    <div style={backgroundStyle}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.8,
            ease: [0.5, 0.71, 0.2, 1.01],
          }}
          className="max-w-5xl mx-auto"
        >
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.5, 0.71, 0.2, 1.01],
            }}
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-4 md:mb-6 font-[titleFont]"
            style={{ color: '#F5EFE7' }}
          >
            Start your day, The PandeDaily way!
          </motion.h2>

          {/* Sub Headline */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
            }}
            className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 font-[titleFont]"
            style={{ color: '#F5EFE7' }}
          >
            Order your warm, fresh pandesal now!
          </motion.p>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              ease: [0.5, 0.71, 0.2, 1.01],
            }}
          >
            <motion.button
              className="font-medium py-2 px-8 md:py-2 md:px-10 rounded-full transition-all duration-300 shadow-xl cursor-pointer text-base md:text-lg font-[titleFont]"
              onClick={handleOrderNow}
              style={{
                backgroundColor: '#F5EFE7',
                color: '#3F2305',
              }}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              Order Now
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default CallToAction
