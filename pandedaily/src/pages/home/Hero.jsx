import heroImage from "../../assets/hero-image.png";

const Hero = () => {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)] overflow-hidden">
      {/* Three equal solid color sections */}
      <div className="absolute inset-0 w-full h-full flex">
        {/* Left Section */}
        <div className="w-1/3 h-full" style={{ backgroundColor: "#9C4A15" }} />

        {/* Middle Section */}
        <div className="w-1/3 h-full" style={{ backgroundColor: "#3F2305" }} />

        {/* Right Section */}
        <div className="w-1/3 h-full" style={{ backgroundColor: "#9C4A15" }} />
      </div>

      {/* Text content at top */}
      <div className="relative z-10 pt-6 sm:pt-8 md:pt-10 px-4">
        <div className="text-center">
          {/* Headline */}
          <h1
            className="text-lg sm:text-2xl md:text-5xl font-bold mb-1 sm:mb-2 font-[titleFont]"
            style={{ color: "#F5EFE7" }}
          >
            Hand-Kneaded. Bagong Hango. PandeDaily
          </h1>

          {/* Subheadline */}
          <p
            className="text-xs sm:text-sm md:text-lg mb-3 sm:mb-4 max-w-lg mx-auto font-[titleFont]"
            style={{ color: "#F5EFE7" }}
          >
            Bread made the right way. Sarap in every bite.
          </p>

          {/* Order Now Button */}
          <button
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:opacity-90 uppercase"
            style={{
              backgroundColor: "#9C4A15",
              color: "#F5EFE7",
            }}
          >
            Order Now
          </button>
        </div>
      </div>

      {/* Image remains large and prominent */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[180%] sm:max-w-[200%] md:max-w-[220%] lg:max-w-[240%]">
        <img
          src={heroImage}
          alt="Hero Image"
          className="w-full object-contain
            h-[50vh] translate-y-8
            sm:h-[60vh] sm:translate-y-12
            md:h-[70vh] md:translate-y-16
            lg:h-[80vh] lg:translate-y-20"
        />
      </div>
    </section>
  );
};

export default Hero;
