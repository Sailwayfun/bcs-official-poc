"use client";

import { useEffect, useRef } from "react";
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

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const ctx = gsap.context(() => {
      const intro = gsap.utils.toArray<HTMLElement>("[data-intro]");
      const progressLine = section.querySelector<HTMLElement>("[data-progress-line]");
      const progressKnob = section.querySelector<HTMLElement>("[data-progress-knob]");
      const counter = section.querySelector<HTMLElement>("[data-counter]");
      const framesList = gsap.utils.toArray<HTMLElement>("[data-frame]");
      const blobs = gsap.utils.toArray<HTMLElement>("[data-blob]");
      const glow = section.querySelector<HTMLElement>("[data-glow]");

      gsap.set(framesList, {
        autoAlpha: 0,
        yPercent: 12,
      });

      gsap.set(framesList[0], {
        autoAlpha: 1,
        yPercent: 0,
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

      const stageTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
          onUpdate: (self) => {
            const frameIndex = Math.min(
              frames.length - 1,
              Math.floor(self.progress * frames.length)
            );

            if (counter) {
              counter.textContent = frames[frameIndex].index;
            }
          },
        },
      });

      framesList.forEach((frame, index) => {
        const start = 0.16 + index * 0.26;
        const middle = start + 0.12;
        const end = start + 0.24;

        stageTimeline
          .to(
            frame,
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 0.12,
            },
            start
          )
          .to(
            frame,
            {
              autoAlpha: index === framesList.length - 1 ? 1 : 0,
              yPercent: index === framesList.length - 1 ? 0 : -10,
              duration: 0.12,
            },
            middle
          );

        if (index < framesList.length - 1) {
          stageTimeline.fromTo(
            framesList[index + 1],
            {
              autoAlpha: 0,
              yPercent: 12,
            },
            {
              autoAlpha: 0,
              yPercent: 12,
              duration: 0.001,
            },
            end - 0.001
          );
        }
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section className="hero-section" ref={sectionRef}>
        <div className="hero-sticky">
          <div className="hero-shell" data-shell>
            <div className="hero-backdrop">
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
                  {frames.map((frame) => (
                    <p className="hero-frame" data-frame key={frame.index}>
                      {frame.title}
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
