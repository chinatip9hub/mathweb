import Image from "next/image";

export default function HomeHero() {
  return (
    <div className="theme-hero-circle theme-animate-in">
      <div className="theme-hero-circle__glow" aria-hidden />
      <div className="theme-hero-circle__halo-ring" aria-hidden />
      <div className="theme-hero-circle__orbit-ring" aria-hidden>
        <span className="theme-hero-circle__orbit-dot theme-hero-circle__orbit-dot--blue" />
        <span className="theme-hero-circle__orbit-dot theme-hero-circle__orbit-dot--mint" />
        <span className="theme-hero-circle__orbit-dot theme-hero-circle__orbit-dot--yellow" />
        <span className="theme-hero-circle__orbit-dot theme-hero-circle__orbit-dot--orange" />
      </div>
      <div
        className="theme-hero-circle__orbit-ring theme-hero-circle__orbit-ring--outer"
        aria-hidden
      >
        <span className="theme-hero-circle__orbit-dot theme-hero-circle__orbit-dot--sky" />
        <span className="theme-hero-circle__orbit-dot theme-hero-circle__orbit-dot--white" />
        <span className="theme-hero-circle__orbit-dot theme-hero-circle__orbit-dot--sky" />
      </div>
      <span className="theme-hero-circle__spark-pos theme-hero-circle__spark-pos--1" aria-hidden>
        <span className="theme-hero-circle__spark">✦</span>
      </span>
      <span className="theme-hero-circle__spark-pos theme-hero-circle__spark-pos--2" aria-hidden>
        <span className="theme-hero-circle__spark">✦</span>
      </span>
      <span className="theme-hero-circle__spark-pos theme-hero-circle__spark-pos--3" aria-hidden>
        <span className="theme-hero-circle__spark">✦</span>
      </span>
      <span className="theme-hero-circle__spark-pos theme-hero-circle__spark-pos--4" aria-hidden>
        <span className="theme-hero-circle__spark">✦</span>
      </span>
      <div className="theme-hero-circle__frame">
        <div className="theme-hero-circle__border-spin" aria-hidden />
        <div className="theme-hero-circle__ring">
          <div className="theme-hero-circle__pad">
            <Image
              src="/refilab-logo-full.png"
              alt="RefiLab — คำนวณ เปรียบเทียบ รีไฟแนนซ์และรีเทนชั่นสินเชื่อบ้าน"
              width={1024}
              height={576}
              priority
              className="theme-hero-circle__img"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
