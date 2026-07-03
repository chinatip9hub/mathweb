"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "results-summary", label: "สรุป" },
  { id: "results-chart", label: "กราฟ" },
  { id: "results-table", label: "ตาราง" },
  { id: "results-details", label: "รายละเอียด" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function ResultsSectionNav() {
  const [activeSection, setActiveSection] = useState<SectionId>(SECTIONS[0].id);
  const isProgrammaticScroll = useRef(false);
  const scrollUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const elements = SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) {
          return;
        }

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const topEntry = visible[0];
        if (topEntry?.target.id) {
          setActiveSection(topEntry.target.id as SectionId);
        }
      },
      {
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  function scrollToSection(id: SectionId) {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    setActiveSection(id);
    isProgrammaticScroll.current = true;

    if (scrollUnlockTimer.current) {
      clearTimeout(scrollUnlockTimer.current);
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });

    scrollUnlockTimer.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 900);
  }

  return (
    <nav
      className="results-section-nav theme-animate-in theme-animate-delay-2 print:hidden"
      aria-label="นำทางส่วนผลลัพธ์"
    >
      <div className="results-section-nav__inner">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className={`results-section-nav__btn${
              activeSection === section.id ? " results-section-nav__btn--active" : ""
            }`}
            aria-current={activeSection === section.id ? "true" : undefined}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
