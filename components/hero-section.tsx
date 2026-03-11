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
      let frameLines = framesList.map(() => [] as HTMLElement[][]);
      let frameLineStates = framesList.map(() => [] as { opacity: number; y: number }[]);
      const frameCharProgress = framesList.map(() => 0);
      const blobs = gsap.utils.toArray<HTMLElement>("[data-blob]");
      const glow = section.querySelector<HTMLElement>("[data-glow]");
      const charFadeValue = 0.4;
      const lineStagger = 0.05;
      const transitionGap = 0.5;
      const transitionDuration = 0.5;
      let activeFrameIndex = 0;
      let currentProgress = 0;
      let entranceDelayCall: gsap.core.Tween | null = null;
      const syncFrameLines = () => {
        frameLines = frameChars.map((chars) => {
          const lines: HTMLElement[][] = [];
          let currentLine: HTMLElement[] = [];
          let currentTop: number | null = null;

          chars.forEach((char) => {
            const top = Math.round(char.offsetTop);

            if (currentTop === null || Math.abs(top - currentTop) <= 2) {
              currentLine.push(char);
              currentTop = currentTop ?? top;
              return;
            }

            lines.push(currentLine);
            currentLine = [char];
            currentTop = top;
          });

          if (currentLine.length > 0) {
            lines.push(currentLine);
          }

          return lines;
        });
        frameLineStates = frameLines.map((lines, frameIndex) =>
          lines.map(() => ({
            opacity: frameIndex === activeFrameIndex ? 1 : 0,
            y: frameIndex === activeFrameIndex ? 0 : 30,
          }))
        );
      };
      const renderFrameChars = (frameIndex: number) => {
        const lines = frameLines[frameIndex];
        const lineStates = frameLineStates[frameIndex];
        const chars = frameChars[frameIndex];
        const reveal = frameCharProgress[frameIndex] * chars.length;
        const revealIndex = Math.floor(reveal);
        const revealFraction = reveal - revealIndex;
        let charCursor = 0;

        lines.forEach((lineChars, lineIndex) => {
          const lineState = lineStates[lineIndex] ?? { opacity: 0, y: 30 };

          lineChars.forEach((char) => {
            let targetOpacity = charFadeValue;

            if (charCursor < revealIndex) {
              targetOpacity = 1;
            } else if (charCursor === revealIndex) {
              targetOpacity = charFadeValue + revealFraction * (1 - charFadeValue);
            }

            gsap.set(char, {
              opacity: lineState.opacity * targetOpacity,
              y: lineState.y,
            });
            charCursor += 1;
          });
        });
      };
      const renderFrames = () => {
        framesList.forEach((frame, frameIndex) => {
          const hasVisibleLines = frameLineStates[frameIndex].some(
            (line) => line.opacity > 0.001
          );

          gsap.set(frame, {
            autoAlpha: frameIndex === activeFrameIndex || hasVisibleLines ? 1 : 0,
            x: 0,
            y: 0,
            scale: 1,
          });

          renderFrameChars(frameIndex);
        });
      };
      const animateFrameChange = (fromIndex: number, toIndex: number) => {
        entranceDelayCall?.kill();
        entranceDelayCall = null;

        if (fromIndex >= 0) {
          const outgoingLines = frameLineStates[fromIndex];

          gsap.killTweensOf(outgoingLines);
          outgoingLines.forEach((lineState, lineIndex) => {
            gsap.to(lineState, {
              opacity: 0,
              y: -30,
              duration: 0.4,
              ease: "power4.out",
              delay: lineIndex * lineStagger,
              onUpdate: renderFrames,
              onComplete:
                lineIndex === outgoingLines.length - 1
                  ? () => {
                      if (activeFrameIndex !== fromIndex) {
                        gsap.set(framesList[fromIndex], { autoAlpha: 0 });
                      }
                    }
                  : undefined,
            });
          });
        }

        entranceDelayCall = gsap.delayedCall(transitionGap, () => {
          if (toIndex < 0) {
            return;
          }

          const incomingLines = frameLineStates[toIndex];

          gsap.killTweensOf(incomingLines);
          gsap.set(framesList[toIndex], { autoAlpha: 1 });
          incomingLines.forEach((lineState) => {
            lineState.opacity = 0;
            lineState.y = 30;
          });
          renderFrames();

          incomingLines.forEach((lineState, lineIndex) => {
            gsap.to(lineState, {
              opacity: 1,
              y: 0,
              duration: transitionDuration,
              ease: "power4.out",
              delay: lineIndex * lineStagger,
              onUpdate: renderFrames,
            });
          });
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
        renderFrames();
      };

      gsap.set(framesList, {
        autoAlpha: 0,
        yPercent: 0,
      });

      gsap.set(framesList[0], {
        autoAlpha: 1,
      });

      gsap.set(frameChars.flat(), {
        opacity: 0,
        y: 30,
      });

      syncFrameLines();
      resetFrames();

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
        frameCharProgress[nextIndex] =
          Math.min(stageProgress * frames.length - nextIndex, 1 / 1.5) * 1.5;

        if (nextIndex !== activeFrameIndex) {
          const previousIndex = activeFrameIndex;

          activeFrameIndex = nextIndex;
          animateFrameChange(previousIndex, nextIndex);
        }

        renderFrames();

        if (counter) {
          counter.textContent = frames[nextIndex].index;
        }
      };

      updateStage(0);

      const handleRefresh = () => {
        entranceDelayCall?.kill();
        syncFrameLines();
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
        entranceDelayCall?.kill();
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
