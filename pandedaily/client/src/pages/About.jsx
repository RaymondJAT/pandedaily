import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import aboutImage from '../assets/story-images/about.png'

const About = () => {
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

  const handleOrderNow = () => {
    navigate('/order')
  }

  return (
    <section className="py-12 md:py-15" style={{ backgroundColor: '#F5EFE7' }}>
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 font-[titleFont]"
            style={{ color: '#2A1803' }}
          >
            Our Story
          </h1>

          {/* Simple divider */}
          <div className="h-1 w-24 mx-auto mb-6" style={{ backgroundColor: '#9C4A15' }}></div>
        </motion.div>

        {/* Text Content - Single Column */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 mb-8 md:mb-12">
            <motion.p
              className="text-base md:text-lg lg:text-lg leading-relaxed font-[titleFont] text-center"
              style={{ color: '#2A1803' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Lahat tayo, may soft spot para sa classic Pinoy morning. 'Yung tipong gigising ka sa
              amoy ng bagong lutong tinapay habang nagtitimpla ng kape. Pero sa totoo lang, sa
              sobrang bilis ng mundo ngayon, minsan mahirap na humanap ng pandesal na lasang
              "tahanan." Minsan matigas, minsan commercialized, at madalas—hindi na mainit pagdating
              sa'yo.
            </motion.p>

            {/* Quote Block */}
            <motion.div
              className="my-6 p-4 border-l-4 mx-auto max-w-3xl"
              style={{ borderColor: '#9C4A15', backgroundColor: '#F5EFE7' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2
                className="text-xl md:text-2xl font-light mb-2 font-[titleFont] text-center"
                style={{ color: '#2A1803' }}
              >
                That's where PandeDaily began.
              </h2>
            </motion.div>

            <motion.p
              className="text-base md:text-lg lg:text-lg leading-relaxed font-[titleFont] text-center"
              style={{ color: '#2A1803' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Nagsimula kami sa isang simpleng pangarap: Ibalik ang sining ng tunay na pandesal. We
              decided to go back to basics—no shortcuts, no industrial machines, and definitely no
              artificial preservatives. Naniniwala kami sa Lutong Tradisyunal, kaya bawat piraso ay
              hand-kneaded at hinahayaang umalsa sa tamang oras para makuha 'yung perfect balance ng
              crunchy crust at soft, airy center.
            </motion.p>

            <motion.p
              className="text-base md:text-lg lg:text-lg leading-relaxed font-[titleFont] text-center"
              style={{ color: '#2A1803' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We took the humble staple we all grew up with and elevated it using only premium
              ingredients. Bakit? Dahil deserve mo na ang bawat kagat ay laging special. Our promise
              is simple: We bake in small batches daily para masiguradong bawat delivery ay "bagong
              hango" at mainit-init pa pagdating sa pinto niyo.
            </motion.p>

            <motion.p
              className="text-base md:text-lg lg:text-lg leading-relaxed font-[titleFont] text-center"
              style={{ color: '#2A1803' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Sa PandeDaily, hindi lang kami nagbebenta ng tinapay. We are delivering a warm slice
              of home, handcrafted with love, para gawing extra special ang bawat simula ng araw mo.
            </motion.p>
          </div>

          {/* Order Now Button - Centered */}
          <motion.div
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.button
              className="font-medium py-2 px-8 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl text-sm md:text-base font-[titleFont] cursor-pointer"
              onClick={handleOrderNow}
              style={{
                backgroundColor: '#9C4A15',
                color: '#F5EFE7',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Order Now
            </motion.button>
          </motion.div>

          {/* Image Section - At the bottom */}
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-2 rounded-3xl"
                style={{ backgroundColor: '#2A1803' }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              ></motion.div>
              <motion.div
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <motion.img
                  src={aboutImage}
                  alt="Traditional Pandesal Baking"
                  className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-2xl transition-transform duration-700 hover:scale-105"
                  initial={{ opacity: 0, scale: 1.1 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
