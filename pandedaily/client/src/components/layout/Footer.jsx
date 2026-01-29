import logoImage from '../../assets/footer.png'
import { FaFacebook, FaInstagram } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#2A1803' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start">
            <img src={logoImage} alt="PandeDaily Logo" className="h-20 md:h-24 w-auto mb-4" />
            <p className="text-sm font-[titleFont]" style={{ color: '#F5EFE7' }}>
              Hand-Kneaded. Bagong Hango. PandeDaily
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-8 md:gap-12">
              {/* First Column */}
              <div className="space-y-3">
                <a
                  href="/about"
                  className="block text-sm font-medium font-[titleFont] hover:opacity-80 transition-opacity duration-200"
                  style={{ color: '#F5EFE7' }}
                >
                  About
                </a>
                <a
                  href="/faq"
                  className="block text-sm font-medium font-[titleFont] hover:opacity-80 transition-opacity duration-200"
                  style={{ color: '#F5EFE7' }}
                >
                  FAQ
                </a>
                <a
                  href="/order"
                  className="block text-sm font-medium font-[titleFont] hover:opacity-80 transition-opacity duration-200"
                  style={{ color: '#F5EFE7' }}
                >
                  Order
                </a>
              </div>

              {/* Second Column */}
              <div className="space-y-3">
                <a
                  href="#"
                  className="block text-sm font-medium font-[titleFont] hover:opacity-80 transition-opacity duration-200"
                  style={{ color: '#F5EFE7' }}
                >
                  Terms & Conditions
                </a>
                <a
                  href="#"
                  className="block text-sm font-medium font-[titleFont] hover:opacity-80 transition-opacity duration-200"
                  style={{ color: '#F5EFE7' }}
                >
                  Privacy Notice
                </a>
              </div>
            </div>
          </div>

          {/* Follow Us & Social Media */}
          <div className="flex flex-col items-center md:items-end">
            <h3
              className="text-base font-medium mb-4 font-[titleFont]"
              style={{ color: '#F5EFE7' }}
            >
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:opacity-90"
                style={{ backgroundColor: '#F5EFE7' }}
                aria-label="Facebook"
              >
                <FaFacebook className="text-xl" style={{ color: '#3F2305' }} />
              </a>
              <a
                href="#"
                className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:opacity-90"
                style={{ backgroundColor: '#F5EFE7' }}
                aria-label="Instagram"
              >
                <FaInstagram className="text-xl" style={{ color: '#3F2305' }} />
              </a>
            </div>
            <p className="text-xs mt-6 font-[titleFont]" style={{ color: '#F5EFE7' }}>
              © {new Date().getFullYear()} PandeDaily. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
