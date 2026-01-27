import { motion } from "framer-motion";
import heroImage from "../../assets/hero-images/hero-image.png";
import flourImage from "../../assets/hero-images/flour.png";
import wheatImage from "../../assets/hero-images/wheat.png";
import yeastImage from "../../assets/hero-images/yeast.png";
import rollingImage from "../../assets/hero-images/rolling.png";
import starIcon from "../../assets/hero-images/stars.png";

const Hero = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 1, ease: "easeOut" },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 1, ease: "easeOut" },
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut", delay: 0.3 },
  };

  const slideInRight = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut", delay: 0.3 },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)] overflow-hidden">
      <div className="absolute inset-0 w-full h-full flex">
        {/* Left Section */}
        <motion.div
          className="w-1/3 h-full"
          style={{ backgroundColor: "#9C4A15" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        />

        {/* Middle Section */}
        <motion.div
          className="w-1/3 h-full"
          style={{ backgroundColor: "#3F2305" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        {/* Right Section */}
        <motion.div
          className="w-1/3 h-full"
          style={{ backgroundColor: "#9C4A15" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      {/* Floating Ingredients */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {/* Flour - Top Left */}
        <motion.div
          className="absolute top-[10%] left-[10%] md:top-[15%] md:left-[12%]"
          variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          <img
            src={flourImage}
            alt="Flour"
            className="w-20 md:w-32 lg:w-45 opacity-90"
          />
        </motion.div>

        {/* Yeast - Top Right */}
        <motion.div
          className="absolute top-[10%] right-[10%] md:top-[15%] md:right-[12%]"
          variants={fadeIn}
          transition={{ delay: 0.5 }}
        >
          <img
            src={yeastImage}
            alt="Yeast"
            className="w-20 md:w-32 lg:w-45 opacity-90"
          />
        </motion.div>

        {/* Rolling Pin - Bottom Left */}
        <motion.div
          className="absolute bottom-[15%] left-[8%] md:bottom-[20%] md:left-[10%] -rotate-12"
          variants={fadeIn}
          transition={{ delay: 0.6 }}
        >
          <img
            src={rollingImage}
            alt="Rolling Pin"
            className="w-24 md:w-36 lg:w-49 opacity-80"
          />
        </motion.div>

        {/* Wheat - Bottom Right */}
        <motion.div
          className="absolute bottom-[15%] right-[8%] md:bottom-[10%] md:right-[15%]"
          variants={fadeIn}
          transition={{ delay: 0.7 }}
        >
          <img
            src={wheatImage}
            alt="Wheat"
            className="w-16 md:w-24 lg:w-45 opacity-90"
          />
        </motion.div>
      </motion.div>

      {/* Text content at top */}
      <div className="relative z-10 pt-6 sm:pt-8 md:pt-10 px-4">
        <div className="text-center">
          {/* Headline */}
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-4 md:mb-6 font-[titleFont]"
            style={{ color: "#F5EFE7" }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
          >
            Hand-Kneaded. Bagong Hango. PandeDaily
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 font-[titleFont]"
            style={{ color: "#F5EFE7" }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.5 }}
          >
            Bread made the right way. Sarap in every bite.
          </motion.p>

          {/* Order Now Button */}
          <motion.button
            className="font-medium py-2 px-8 md:py-2 md:px-10 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer text-base md:text-lg font-[titleFont]"
            style={{
              backgroundColor: "#F5EFE7",
              color: "#3F2305",
            }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={scaleIn}
            transition={{ ...scaleIn.transition, delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Order Now
          </motion.button>
        </div>
      </div>

      {/* Side Text Sections */}
      <div className="relative z-10 w-full h-full flex items-center justify-between px-4 md:px-6 lg:px-8 xl:px-12 pb-16 md:pb-20 lg:pb-24 font-[titleFont]">
        {/* Left Text - "Fresh bakes, Good vibes." */}
        <motion.div
          className="hidden md:block w-36 lg:w-40 xl:w-44 translate-x-70 lg:translate-x-80 translate-y-25"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={slideInLeft}
          transition={{ ...slideInLeft.transition, delay: 0.8 }}
        >
          <h2
            className="text-3xl lg:text-5xl font-bold leading-tight"
            style={{ color: "#F5EFE7" }}
          >
            Fresh{" "}
            <span className="text-xl lg:text-2xl font-normal block">
              bakes,
            </span>
            <span className="block text-4xl lg:text-5xl ml-6 lg:ml-8">
              Good{" "}
              <span className="text-2xl lg:text-3xl font-normal">vibes.</span>
            </span>
          </h2>
        </motion.div>

        {/* Right Text - Rating and Description */}
        <motion.div
          className="hidden md:block w-40 lg:w-48 xl:w-52 text-right -translate-x-65 lg:-translate-x-75 translate-y-35"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={slideInRight}
          transition={{ ...slideInRight.transition, delay: 0.9 }}
        >
          <div className="flex items-center justify-end gap-2 mb-2">
            <span className="text-4xl font-bold" style={{ color: "#F5EFE7" }}>
              4.5
            </span>
            <motion.img
              src={starIcon}
              alt="Stars"
              className="w-35 h-auto"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.0, duration: 0.6 }}
            />
          </div>
          <p
            className="text-sm lg:text-base leading-snug"
            style={{ color: "#F5EFE7" }}
          >
            Savor our freshly baked pandesal and experience the warm, comforting
            taste that will delight your senses.
          </p>
        </motion.div>
      </div>

      {/* Image */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[180%] sm:max-w-[200%] md:max-w-[220%] lg:max-w-[240%]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
      >
        <img
          src={heroImage}
          alt="Hero Image"
          className="w-full object-contain
            h-[65vh] translate-y-8
            sm:h-[70vh] sm:translate-y-10
            md:h-[76vh] md:translate-y-17
            lg:h-[78vh] lg:translate-y-25"
        />
      </motion.div>
    </section>
  );
};

export default Hero;
