import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Image from "../components/Image";
import { useApp } from "../state/AppContext";

export default function Onboarding() {
  const {
    content: { onboardingSlides },
    site,
  } = useApp();
  const [active, setActive] = useState(0);
  const slide = onboardingSlides[active] ?? onboardingSlides[0];
  return (
    <main className="onboarding page-enter">
      <div className="onboarding-image" key={slide.image}>
        <Image src={slide.image} alt={slide.alt} />
      </div>
      <div className="onboarding-shade bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <header className="onboarding-header">
        <Logo />
        <span className="edition-label">
          A SPACE
          <br />
          THAT’S YOU.
        </span>
      </header>
      <div className="image-caption">
        <span className="caption-line" />
        <div>
          <span>{slide.caption}</span>
          <small>{slide.detail}</small>
        </div>
        <ArrowUpRight size={18} strokeWidth={1.2} />
      </div>
      <div className="onboarding-content">
        <p className="eyebrow">
          <span />
          {slide.label}
        </p>
        <h1>
          {site.welcomeHeading}
          <br />
          <span>{site.welcomeEmphasis}</span>
        </h1>
        <p className="onboarding-description">{site.welcomeDescription}</p>
        <Link to="/home" className="start-button active:scale-95">
          <span>Get Started</span>
          <span className="start-arrow">
            <ArrowRight size={22} strokeWidth={1.5} />
          </span>
        </Link>
        <div className="onboarding-footer">
          <div className="page-dots" aria-label="Inspiration slides">
            {onboardingSlides.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActive(index)}
                aria-label={`View inspiration ${index + 1}`}
                aria-pressed={index === active}
              >
                <span className={index === active ? "active-dot" : ""} />
              </button>
            ))}
          </div>
          <span>MAKE ROOM FOR YOU</span>
          <span className="slide-counter">
            0{active + 1}
            <span> / {String(onboardingSlides.length).padStart(2, "0")}</span>
          </span>
        </div>
      </div>
    </main>
  );
}
