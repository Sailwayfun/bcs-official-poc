"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

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

const heroVideoSrc = "/videos/hero-background.mp4";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

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
      const frameTextNodes = gsap.utils.toArray<HTMLElement>("[data-frame-text]");
      const blobs = gsap.utils.toArray<HTMLElement>("[data-blob]");
      const glow = section.querySelector<HTMLElement>("[data-glow]");
      const charFadeValue = 0.4;
      const lineStagger = 0.05;
      const transitionGap = 0.5;
      const transitionDuration = 0.5;
      let activeFrameIndex = 0;
      let currentProgress = 0;
      let entranceDelayCall: gsap.core.Tween | null = null;
      let frameSplits: SplitText[] = [];
      let cancelled = false;

      const resetFrameChars = (frameIndex: number) => {
        const split = frameSplits[frameIndex];

        if (!split) {
          return;
        }

        gsap.set(split.chars, {
          opacity: charFadeValue,
          y: 0,
        });
      };

      const applyActiveCharProgress = (frameIndex: number, progress: number) => {
        const split = frameSplits[frameIndex];

        if (!split) {
          return;
        }

        const reveal = Math.min(progress, 1) * split.chars.length;
        const revealIndex = Math.floor(reveal);
        const revealFraction = reveal - revealIndex;

        split.chars.forEach((char, charIndex) => {
          let opacity = charFadeValue;

          if (charIndex < revealIndex) {
            opacity = 1;
          } else if (charIndex === revealIndex) {
            opacity = charFadeValue + revealFraction * (1 - charFadeValue);
          }

          gsap.set(char, { opacity });
        });
      };

      const createFrameSplits = () => {
        frameSplits.forEach((split) => split.revert());

        frameSplits = frameTextNodes.map((node, frameIndex) => {
          const split = SplitText.create(node, {
            type: "lines,chars",
            linesClass: "hero-frame-line",
            charsClass: "hero-frame-char",
            mask: "lines",
            aria: "hidden",
          });

          gsap.set(split.lines, {
            autoAlpha: frameIndex === activeFrameIndex ? 1 : 0,
            y: frameIndex === activeFrameIndex ? 0 : 30,
          });

          resetFrameChars(frameIndex);

          return split;
        });
      };

      const resetFrames = () => {
        framesList.forEach((frame, frameIndex) => {
          gsap.set(frame, {
            autoAlpha: frameIndex === activeFrameIndex ? 1 : 0,
            x: 0,
            y: 0,
            scale: 1,
          });
        });

        frameSplits.forEach((split, frameIndex) => {
          gsap.killTweensOf(split.lines);
          gsap.set(split.lines, {
            autoAlpha: frameIndex === activeFrameIndex ? 1 : 0,
            y: frameIndex === activeFrameIndex ? 0 : 30,
          });
          resetFrameChars(frameIndex);
        });
      };

      const animateFrameChange = (fromIndex: number, toIndex: number) => {
        entranceDelayCall?.kill();
        entranceDelayCall = null;

        if (fromIndex >= 0 && frameSplits[fromIndex]) {
          const outgoingSplit = frameSplits[fromIndex];

          gsap.killTweensOf(outgoingSplit.lines);
          gsap.to(outgoingSplit.lines, {
            autoAlpha: 0,
            y: -30,
            ease: "power4.out",
            duration: 0.4,
            stagger: lineStagger,
            onComplete: () => {
              if (activeFrameIndex !== fromIndex) {
                gsap.set(framesList[fromIndex], { autoAlpha: 0 });
              }
            },
          });
        }

        entranceDelayCall = gsap.delayedCall(transitionGap, () => {
          const incomingSplit = frameSplits[toIndex];

          if (!incomingSplit) {
            return;
          }

          gsap.set(framesList[toIndex], { autoAlpha: 1 });
          gsap.killTweensOf(incomingSplit.lines);
          gsap.set(incomingSplit.lines, {
            autoAlpha: 0,
            y: 30,
          });
          resetFrameChars(toIndex);

          gsap.to(incomingSplit.lines, {
            autoAlpha: 1,
            y: 0,
            ease: "power4.out",
            duration: transitionDuration,
            stagger: lineStagger,
          });
        });
      };

      const updateStage = (progress: number) => {
        currentProgress = progress;

        const stageStart = 0.26;
        const stageEnd = 0.965;
        const stageProgress = gsap.utils.clamp(
          0,
          1,
          (progress - stageStart) / (stageEnd - stageStart)
        );
        let nextIndex = Math.floor(stageProgress * frames.length + 1e-6);

        nextIndex = Math.max(0, Math.min(frames.length - 1, nextIndex));

        if (nextIndex !== activeFrameIndex) {
          const previousIndex = activeFrameIndex;

          activeFrameIndex = nextIndex;
          animateFrameChange(previousIndex, nextIndex);
        }

        applyActiveCharProgress(
          nextIndex,
          Math.min(stageProgress * frames.length - nextIndex, 1 / 1.5) * 1.5
        );

        if (counter) {
          counter.textContent = frames[nextIndex].index;
        }
      };

      const initialiseFrameText = async () => {
        if ("fonts" in document) {
          await document.fonts.ready;
        }

        if (cancelled) {
          return;
        }

        createFrameSplits();
        resetFrames();
        updateStage(currentProgress);
      };

      gsap.set(framesList, {
        autoAlpha: 0,
        yPercent: 0,
      });

      gsap.set(framesList[0], {
        autoAlpha: 1,
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
        .fromTo(
          section.querySelector("[data-shell]"),
          {
            top: 14,
            right: 14,
            bottom: 14,
            left: 14,
            borderRadius: 34,
          },
          {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            borderRadius: 0,
            duration: 0.2,
          },
          0
        )
        .to(
          intro,
          {
            autoAlpha: 0,
            yPercent: -18,
            stagger: 0.04,
            duration: 0.24,
          },
          0.05
        )
        .fromTo(
          section.querySelector("[data-scene]"),
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
            duration: 0.2,
          },
          0.16
        )
        .fromTo(
          progressLine,
          {
            scaleX: 0,
          },
          {
            scaleX: 1,
            duration: 0.74,
          },
          0.2
        )
        .fromTo(
          progressKnob,
          {
            xPercent: -100,
          },
          {
            xPercent: 0,
            duration: 0.74,
          },
          0.2
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

      initialiseFrameText();

      const handleRefresh = () => {
        entranceDelayCall?.kill();
        createFrameSplits();
        resetFrames();
        updateStage(currentProgress);
      };

      ScrollTrigger.addEventListener("refresh", handleRefresh);

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          updateStage(self.progress);
        },
      });

      return () => {
        cancelled = true;
        entranceDelayCall?.kill();
        frameSplits.forEach((split) => split.revert());
        ScrollTrigger.removeEventListener("refresh", handleRefresh);
      };
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
                  {frames.map((frame) => (
                    <p
                      aria-label={frame.title}
                      className="hero-frame"
                      data-frame
                      key={frame.index}
                    >
                      <span aria-hidden="true" className="hero-frame-text" data-frame-text>
                        {frame.title}
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
