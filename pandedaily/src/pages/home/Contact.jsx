import { useState } from "react";
import { motion } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      fullName: "",
      contactNumber: "",
      email: "",
      message: "",
    });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut" },
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const formStagger = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const formItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  return (
    <section className="py-16" style={{ backgroundColor: "#F5EFE7" }}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-10">
            <motion.h2
              className="text-3xl md:text-4xl font-light mb-4 font-[titleFont]"
              style={{ color: "#3F2305" }}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
            >
              Let's Connect
            </motion.h2>
            <motion.p
              className="text-base max-w-2xl mx-auto font-[titleFont]"
              style={{ color: "#9C4A15" }}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
            >
              At PandeDaily, we value your feedback as much as we value our
              dough. For inquiries, feedback, or partnership opportunities,
              reach out to us through our social media or the contact details
              below. Looking forward to serving you fresh bakes soon!
            </motion.p>
          </div>

          {/* Contact Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-6 md:p-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
            variants={formStagger}
          >
            <div className="space-y-5">
              {/* Full Name */}
              <motion.div variants={formItem} transition={{ delay: 0.1 }}>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium mb-1 font-[titleFont]"
                  style={{ color: "#3F2305" }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-[#9C4A15] transition-all duration-200 font-[titleFont] text-sm"
                  style={{
                    borderColor: "#9C4A15",
                    color: "#3F2305",
                    backgroundColor: "#F5EFE7",
                  }}
                  placeholder="Enter your full name"
                />
              </motion.div>

              {/* Contact Number and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div variants={formItem} transition={{ delay: 0.2 }}>
                  <label
                    htmlFor="contactNumber"
                    className="block text-sm font-medium mb-1 font-[titleFont]"
                    style={{ color: "#3F2305" }}
                  >
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-[#9C4A15] transition-all duration-200 font-[titleFont] text-sm"
                    style={{
                      borderColor: "#9C4A15",
                      color: "#3F2305",
                      backgroundColor: "#F5EFE7",
                    }}
                    placeholder="09XX XXX XXXX"
                  />
                </motion.div>

                <motion.div variants={formItem} transition={{ delay: 0.3 }}>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1 font-[titleFont]"
                    style={{ color: "#3F2305" }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-[#9C4A15] transition-all duration-200 font-[titleFont] text-sm"
                    style={{
                      borderColor: "#9C4A15",
                      color: "#3F2305",
                      backgroundColor: "#F5EFE7",
                    }}
                    placeholder="your.email@example.com"
                  />
                </motion.div>
              </div>

              {/* Message */}
              <motion.div variants={formItem} transition={{ delay: 0.4 }}>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-1 font-[titleFont]"
                  style={{ color: "#3F2305" }}
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-[#9C4A15] transition-all duration-200 font-[titleFont] text-sm resize-none"
                  style={{
                    borderColor: "#9C4A15",
                    color: "#3F2305",
                    backgroundColor: "#F5EFE7",
                  }}
                  placeholder="Your message here..."
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                className="pt-3 text-center"
                variants={formItem}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  type="submit"
                  className="font-medium py-2 px-7 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer text-sm font-[titleFont]"
                  style={{
                    backgroundColor: "#9C4A15",
                    color: "#F5EFE7",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit Message
                </motion.button>
              </motion.div>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
