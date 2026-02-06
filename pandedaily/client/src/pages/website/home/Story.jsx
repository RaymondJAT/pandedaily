import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import storyImage from '../../../assets/story-images/image-nine.jpg'

const Story = () => {
  const navigate = useNavigate()

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

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: 'easeOut' },
  }

  const slideInLeft = {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
  }

  const slideInRight = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
  }

  const handleMoreAboutUs = () => {
    navigate('/about')
  }

  return (
    <section className="py-18" style={{ backgroundColor: '#9C4A15' }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Content */}
          <motion.div
            className="w-full lg:w-1/2"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={slideInLeft}
          >
            <div className="max-w-2xl">
              {/* Title */}
              <motion.h2
                className="text-lg sm:text-2xl md:text-5xl font-light mb-6 md:mb-8 font-[titleFont]"
                style={{ color: '#F5EFE7' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Pandesal Diaries:
                <br />
                "Mainit-init" Pa!
              </motion.h2>

              {/* Story Text */}
              <div className="mb-8 md:mb-10">
                <motion.p
                  className="text-sm md:text-base lg:text-lg mb-4 font-[titleFont]"
                  style={{ color: '#F5EFE7' }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Sa PandeDaily, we are dedicated to creating a Pandesal Wonderland kung saan bawat
                  piraso tells a story of tradition and flavor. Ang aming hand-crafted breads, baked
                  fresh every morning using traditional methods, are designed to elevate your daily
                  almusal with the finest ingredients and the exquisite craftsmanship of a true
                  Pinoy baker.
                </motion.p>
              </div>

              {/* Button */}
              <motion.button
                onClick={handleMoreAboutUs}
                className="font-medium py-2 px-7 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer text-sm font-[titleFont]"
                style={{
                  backgroundColor: '#F5EFE7',
                  color: '#3F2305',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                More About Us
              </motion.button>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            className="w-full lg:w-1/2"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={slideInRight}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-2 rounded-3xl"
                style={{ backgroundColor: '#2A1803' }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              ></motion.div>
              <motion.div
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <motion.img
                  src={storyImage}
                  alt="Pandesal fresh from the oven"
                  className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 hover:scale-105"
                  initial={{ opacity: 0, scale: 1.1 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Story
