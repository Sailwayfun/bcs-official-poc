"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const frames = [
  {
    index: "01",
    title:
      "Aging is an intrinsically complex systems biology challenge. Our discovery engine is built to unravel its dense, shifting networks.",
  },
  {
    index: "02",
    title:
      "By combining synthetic biology, chemistry, and AI, we probe disease biology with unusual control and map routes through hidden chemical space.",
  },
  {
    index: "03",
    title:
      "Through integrated biological and chemical signals, we unlock sharper therapeutic hypotheses for age-related disease programs.",
  },
];

const frameWords = frames.map((frame) => frame.title.split(" "));
const heroVideoSrc = "/videos/hero-background.mp4";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const intro = gsap.utils.toArray<HTMLElement>("[data-intro]");
      const progressLine = section.querySelector<HTMLElement>("[data-progress-line]");
      const progressKnob = section.querySelector<HTMLElement>("[data-progress-knob]");
      const counter = section.querySelector<HTMLElement>("[data-counter]");
      const framesList = gsap.utils.toArray<HTMLElement>("[data-frame]");
      const frameChars = framesList.map((frame) =>
        gsap.utils.toArray<HTMLElement>("[data-char]", frame)
      );
      const blobs = gsap.utils.toArray<HTMLElement>("[data-blob]");
      const glow = section.querySelector<HTMLElement>("[data-glow]");
      const dimOpacity = 0.26;
      const springOut = (value: number) => {
        const t = gsap.utils.clamp(0, 1, value);

        return 1 - Math.exp(-4.25 * t) * Math.cos(10.5 * t);
      };

      gsap.set(framesList, {
        autoAlpha: 0,
        yPercent: 0,
      });

      gsap.set(framesList[0], {
        autoAlpha: 1,
      });

      gsap.set(frameChars.flat(), {
        opacity: dimOpacity,
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "none",
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
        },
      });

      timeline
        .to(
          intro,
          {
            autoAlpha: 0,
            yPercent: -18,
            stagger: 0.04,
            duration: 0.18,
          },
          0
        )
        .to(
          section.querySelector("[data-shell]"),
          {
            borderRadius: 26,
            scale: 0.985,
            duration: 0.22,
          },
          0
        )
        .fromTo(
          section.querySelector("[data-scene]"),
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
            duration: 0.16,
          },
          0.1
        )
        .fromTo(
          progressLine,
          {
            scaleX: 0,
          },
          {
            scaleX: 1,
            duration: 0.68,
          },
          0.12
        )
        .fromTo(
          progressKnob,
          {
            xPercent: -100,
          },
          {
            xPercent: 0,
            duration: 0.68,
          },
          0.12
        )
        .to(
          blobs[0],
          {
            xPercent: 24,
            yPercent: 16,
            rotation: -12,
            scale: 1.08,
            duration: 1,
          },
          0
        )
        .to(
          blobs[1],
          {
            xPercent: -20,
            yPercent: -12,
            rotation: 16,
            scale: 0.9,
            duration: 1,
          },
          0
        )
        .to(
          blobs[2],
          {
            xPercent: -8,
            yPercent: 24,
            rotation: -10,
            scale: 1.14,
            duration: 1,
          },
          0
        )
        .to(
          glow,
          {
            opacity: 0.88,
            duration: 1,
          },
          0
        );

      const updateStage = (progress: number) => {
        const stageStart = 0.16;
        const stageEnd = 0.94;
        const stageProgress = gsap.utils.clamp(
          0,
          1,
          (progress - stageStart) / (stageEnd - stageStart)
        );
        const activeIndex = Math.min(
          frames.length - 1,
          Math.floor(stageProgress * frames.length)
        );
        const segment = 1 / frames.length;

        framesList.forEach((frame, index) => {
          const localProgress = (stageProgress - index * segment) / segment;
          const started = localProgress >= 0;
          const entranceProgress = gsap.utils.clamp(0, 1, localProgress / 0.44);
          const exitProgress = gsap.utils.clamp(0, 1, (localProgress - 0.74) / 0.26);
          const springProgress = springOut(entranceProgress);
          const frameOpacity = started ? 1 - exitProgress : 0;
          const x = gsap.utils.interpolate(16, 0, springProgress) + exitProgress * 6;
          const y = gsap.utils.interpolate(72, 0, springProgress) - exitProgress * 24;
          const scale =
            gsap.utils.interpolate(0.952, 1, springProgress) - exitProgress * 0.016;
          const revealProgress =
            localProgress >= 1
              ? 1
              : gsap.utils.clamp(0, 1, localProgress / 0.84);
          const revealCount = Math.round(frameChars[index].length * revealProgress);

          gsap.set(frame, {
            autoAlpha: frameOpacity,
            x,
            y,
            scale,
          });

          frameChars[index].forEach((char, charIndex) => {
            gsap.set(char, {
              opacity: started && charIndex < revealCount ? 1 : dimOpacity,
            });
          });
        });

        if (counter) {
          counter.textContent = frames[activeIndex].index;
        }
      };

      updateStage(0);

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          updateStage(self.progress);
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <>
      <section className="hero-section" ref={sectionRef}>
        <div className="hero-sticky">
          <div className="hero-shell" data-shell>
            <div className="hero-backdrop">
              <video
                aria-hidden="true"
                autoPlay
                className="hero-video"
                loop
                muted
                playsInline
                preload="auto"
              >
                <source src={heroVideoSrc} type="video/mp4" />
              </video>
              <div className="hero-blob hero-blob-a" data-blob />
              <div className="hero-blob hero-blob-b" data-blob />
              <div className="hero-blob hero-blob-c" data-blob />
              <div className="hero-grid" />
              <div className="hero-glow" data-glow />
            </div>

            <header className="hero-nav">
              <div className="hero-brand">
                <span className="hero-brand-mark" />
                BioCanvas
              </div>
              <nav className="hero-menu" aria-label="Primary">
                <a href="#platform">Platform</a>
                <a href="#approach">Approach</a>
                <a href="#programs">Programs</a>
                <a href="#contact" className="hero-menu-cta">
                  Work with us
                </a>
              </nav>
            </header>

            <div className="hero-intro">
              <div className="hero-kicker" data-intro>
                Synthetic biology • chemistry • AI
              </div>
              <h1 className="hero-title" data-intro>
                Engineering the future of aging medicine.
              </h1>
              <div className="hero-bottom">
                <p className="hero-copy" data-intro>
                  We build high-fidelity discovery systems that move from
                  controllable biology to therapeutic hypotheses with cinematic
                  clarity.
                </p>
                <a className="hero-button" href="#platform" data-intro>
                  Discover our platform
                </a>
              </div>
            </div>

            <div className="hero-scene" data-scene>
              <div className="hero-scene-top">
                <span className="hero-chip">
                  <i />
                  What we do
                </span>
                <div className="hero-progress">
                  <div className="hero-progress-line" data-progress-line />
                  <div className="hero-progress-knob" data-progress-knob />
                </div>
              </div>

              <div className="hero-scene-body">
                <aside className="hero-index">
                  <span data-counter>01</span>
                  <span>/</span>
                  <span>03</span>
                </aside>
                <div className="hero-stage">
                  {frames.map((frame, frameIndex) => (
                    <p
                      aria-label={frame.title}
                      className="hero-frame"
                      data-frame
                      key={frame.index}
                    >
                      <span aria-hidden="true">
                        {frameWords[frameIndex].map((word, wordIndex) => (
                          <span className="hero-frame-word-wrap" key={wordIndex}>
                            <span className="hero-frame-word">
                              {Array.from(word).map((char, charIndex) => (
                                <span
                                  className="hero-frame-char"
                                  data-char
                                  key={`${wordIndex}-${charIndex}`}
                                >
                                  {char}
                                </span>
                              ))}
                            </span>
                            {wordIndex < frameWords[frameIndex].length - 1 ? " " : null}
                          </span>
                        ))}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="after-hero" id="platform">
        <div className="section-chip">The Integrated Platform</div>
        <div className="section-grid">
          <h2>
            Combining synthetic biology, chemistry, and AI into an engine of
            discovery.
          </h2>
          <p>
            This continuation block gives the hero room to release naturally
            after the final pinned frame, mirroring the transition rhythm from
            the reference site while keeping the demo self-contained.
          </p>
        </div>
      </section>
    </>
  );
}
