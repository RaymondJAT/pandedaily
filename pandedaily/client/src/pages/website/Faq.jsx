 import { motion } from 'framer-motion'

const Faq = () => {
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
        staggerChildren: 0.1,
      },
    },
  }

  const faqItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  }

  return (
    <section className="py-16 md:py-13" style={{ backgroundColor: '#F5EFE7' }}>
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 font-[titleFont]"
            style={{ color: '#2A1803' }}
          >
            Para sa iyong Peace of Mind
          </h1>

          <motion.p
            className="text-base md:text-lg lg:text-lg max-w-3xl mx-auto font-[titleFont] mb-8"
            style={{ color: '#9C4A15' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Everything you need to know about our deliveries, policies, and special discounts para
            iwas-hassle ang iyong #PandeDaily order.
          </motion.p>

          <div className="h-1 w-24 mx-auto" style={{ backgroundColor: '#9C4A15' }}></div>
        </motion.div>

        {/* Layout */}
        <motion.div
          className="mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            {/* Left Column - Delivery Schedule & Cancellation Policy */}
            <div className="space-y-10 flex flex-col h-full">
              {/* Delivery Schedule */}
              <motion.div variants={faqItem} className="flex-1 flex flex-col">
                <h2
                  className="text-2xl md:text-3xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Delivery Schedule
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex-1 flex flex-col">
                  <div className="space-y-8 flex-1">
                    <div>
                      <h3
                        className="text-lg md:text-xl font-medium mb-3 font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        Morning Delivery
                      </h3>
                      <div className="space-y-1">
                        <p
                          className="font-[titleFont] text-base md:text-lg"
                          style={{ color: '#2A1803' }}
                        >
                          Monday to Saturday
                        </p>
                        <p
                          className="text-xl md:text-2xl font-medium font-[titleFont]"
                          style={{ color: '#2A1803' }}
                        >
                          6:30AM to 10:00AM
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3
                        className="text-lg md:text-xl font-medium mb-3 font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        Afternoon/Night Delivery
                      </h3>
                      <div className="space-y-1">
                        <p
                          className="font-[titleFont] text-base md:text-lg"
                          style={{ color: '#2A1803' }}
                        >
                          Monday to Saturday
                        </p>
                        <p
                          className="text-xl md:text-2xl font-medium font-[titleFont]"
                          style={{ color: '#2A1803' }}
                        >
                          3:00PM to 7:00PM
                        </p>
                      </div>
                    </div>

                    {/* Cut-off Times */}
                    <div className="pt-6 border-t" style={{ borderColor: '#F5EFE7' }}>
                      <h3
                        className="text-lg md:text-xl font-medium mb-3 font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        Cut-off Times
                      </h3>
                      <p
                        className="text-lg md:text-xl font-medium font-[titleFont]"
                        style={{ color: '#2A1803' }}
                      >
                        Cut-off for Monday delivery's Saturday, 7:00PM
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Cancellation & Refund Policy */}
              <motion.div
                variants={faqItem}
                transition={{ delay: 0.1 }}
                className="flex-1 flex flex-col"
              >
                <h2
                  className="text-2xl md:text-3xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Cancellation & Refund Policy
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex-1 flex flex-col">
                  <ul className="space-y-4 flex-1">
                    <li className="flex items-start">
                      <span className="inline-block mr-3 mt-1 text-lg" style={{ color: '#9C4A15' }}>
                        •
                      </span>
                      <p
                        className="font-[titleFont] text-base md:text-lg"
                        style={{ color: '#2A1803' }}
                      >
                        Strictly no cancellations or refunds once an order form is completed and
                        delivery has started.
                      </p>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block mr-3 mt-1 text-lg" style={{ color: '#9C4A15' }}>
                        •
                      </span>
                      <p
                        className="font-[titleFont] text-base md:text-lg"
                        style={{ color: '#2A1803' }}
                      >
                        Cancellation is allowed only if requested at least 2 days before
                        subscription start date (with confirmation from our team).
                      </p>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block mr-3 mt-1 text-lg" style={{ color: '#9C4A15' }}>
                        •
                      </span>
                      <p
                        className="font-[titleFont] text-base md:text-lg"
                        style={{ color: '#2A1803' }}
                      >
                        Customers may pause or reschedule their subscription if requested before the
                        weekly cutoff (Saturday at 7:00 PM).
                      </p>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Promos & Discounts */}
            <div className="flex flex-col h-full">
              <motion.div
                variants={faqItem}
                transition={{ delay: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <h2
                  className="text-2xl md:text-3xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Promos & Discounts
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex-1 flex flex-col">
                  <div className="space-y-6 flex-1 overflow-y-auto">
                    {/* Discount Eligibility */}
                    <div>
                      <h3
                        className="text-lg md:text-xl font-medium mb-3 font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        1. Discount Eligibility
                      </h3>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-start">
                          <span
                            className="inline-block mr-3 mt-1 text-lg"
                            style={{ color: '#9C4A15' }}
                          >
                            •
                          </span>
                          <p
                            className="font-[titleFont] text-base md:text-lg"
                            style={{ color: '#2A1803' }}
                          >
                            Each Senior Citizen or PWD cardholder is entitled to one discounted
                            pandesal subscription plan per subscription period, strictly for
                            personal consumption.
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* Submission of Valid ID */}
                    <div>
                      <h3
                        className="text-lg md:text-xl font-medium mb-3 font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        2. Submission of Valid ID
                      </h3>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-start">
                          <span
                            className="inline-block mr-3 mt-1 text-lg"
                            style={{ color: '#9C4A15' }}
                          >
                            •
                          </span>
                          <p
                            className="font-[titleFont] text-base md:text-lg"
                            style={{ color: '#2A1803' }}
                          >
                            A valid Senior Citizen ID or PWD ID must be submitted before placing an
                            order to avail of the discount.
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* Name Verification */}
                    <div>
                      <h3
                        className="text-lg md:text-xl font-medium mb-3 font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        3. Name Verification
                      </h3>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-start">
                          <span
                            className="inline-block mr-3 mt-1 text-lg"
                            style={{ color: '#9C4A15' }}
                          >
                            •
                          </span>
                          <p
                            className="font-[titleFont] text-base md:text-lg"
                            style={{ color: '#2A1803' }}
                          >
                            The name on the ID must match the name on the subscription order form.
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* Separate Orders for Non-Cardholders */}
                    <div>
                      <h3
                        className="text-lg md:text-xl font-medium mb-3 font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        4. Separate Orders for Non-Cardholders
                      </h3>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-start">
                          <span
                            className="inline-block mr-3 mt-1 text-lg"
                            style={{ color: '#9C4A15' }}
                          >
                            •
                          </span>
                          <p
                            className="font-[titleFont] text-base md:text-lg"
                            style={{ color: '#2A1803' }}
                          >
                            If you are ordering for non-SC/PWD cardholders, please place a separate
                            order through the PandeDaily website.
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* Manual Ordering Process */}
                    <div>
                      <h3
                        className="text-lg md:text-xl font-medium mb-3 font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        5. Manual Ordering Process
                      </h3>
                      <ul className="space-y-3 ml-4">
                        <li className="flex items-start">
                          <span
                            className="inline-block mr-3 mt-1 text-lg"
                            style={{ color: '#9C4A15' }}
                          >
                            •
                          </span>
                          <p
                            className="font-[titleFont] text-base md:text-lg"
                            style={{ color: '#2A1803' }}
                          >
                            All Senior Citizen and PWD discount orders must be placed manually with
                            our team:
                          </p>
                        </li>
                        <li className="flex items-start ml-6">
                          <span
                            className="inline-block mr-3 mt-1 text-base"
                            style={{ color: '#9C4A15' }}
                          >
                            1.
                          </span>
                          <p className="font-[titleFont] text-base" style={{ color: '#2A1803' }}>
                            Finalize your order with our PandeDaily representative.
                          </p>
                        </li>
                        <li className="flex items-start ml-6">
                          <span
                            className="inline-block mr-3 mt-1 text-base"
                            style={{ color: '#9C4A15' }}
                          >
                            2.
                          </span>
                          <p className="font-[titleFont] text-base" style={{ color: '#2A1803' }}>
                            Receive a confirmation email with your discounted total.
                          </p>
                        </li>
                        <li className="flex items-start ml-6">
                          <span
                            className="inline-block mr-3 mt-1 text-base"
                            style={{ color: '#9C4A15' }}
                          >
                            3.
                          </span>
                          <p className="font-[titleFont] text-base" style={{ color: '#2A1803' }}>
                            Send your proof of payment within 24 hours via our social media channels
                            or email at customerservice@pandedaily.com.
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* Discount Limitations */}
                    <div>
                      <h3
                        className="text-lg md:text-xl font-medium mb-3 font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        6. Discount Limitations
                      </h3>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-start">
                          <span
                            className="inline-block mr-3 mt-1 text-lg"
                            style={{ color: '#9C4A15' }}
                          >
                            •
                          </span>
                          <p
                            className="font-[titleFont] text-base md:text-lg"
                            style={{ color: '#2A1803' }}
                          >
                            Senior Citizen and PWD discounts cannot be combined with other promos or
                            discounts.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Additional Help */}
          <motion.div className="text-center mt-15" variants={faqItem} transition={{ delay: 0.3 }}>
            <div className="h-1 w-32 mx-auto mb-5" style={{ backgroundColor: '#9C4A15' }}></div>
            <p className="text-lg md:text-xl font-[titleFont]" style={{ color: '#2A1803' }}>
              Still have questions? Contact us at{' '}
              <a
                href="mailto:customerservice@pandedaily.com"
                className="font-medium hover:underline"
                style={{ color: '#9C4A15' }}
              >
                customerservice@pandedaily.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Faq
