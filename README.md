# bcs-official-poc

## Hero Frames Animation Notes

This project contains a hero scroller that was tuned to match the frame
transition behavior from `https://integratedbiosciences.com/`.

The goal was not just to make the animation "feel similar", but to inspect the
reference site and align the implementation with the actual mechanics it uses.

## Research Process

The reference animation was analyzed in three layers:

1. Visual inspection

- Compare desktop and mobile behavior.
- Check whether the motion is driven by whole-frame fades, line stagger, char
  reveal, or a combination of all three.
- Inspect transition points between frame `01`, `02`, and `03`.

2. DOM inspection

- Inspect the pinned scroller area in DevTools.
- Confirm that each frame text is split into `lines` and `chars`.
- Verify that the reference site wraps lines with masks, not just plain text
  nodes.

3. Source inspection

- Fetch and inspect the reference site's runtime assets:
  - `hero-xl.js`
  - `hero-xl.css`
  - related GSAP bundles
- Extract the actual animation model and timings from code instead of guessing.

## What The Reference Site Actually Does

The reference site uses:

- `GSAP`
- `ScrollTrigger`
- `SplitText`

The relevant behavior is:

1. Each frame paragraph is split into `lines, chars` with masked lines.
2. A frame change is triggered when scroll progress crosses into the next item.
3. The outgoing frame animates per line:
   - `autoAlpha: 0`
   - `y: -30`
   - `ease: "power4.out"`
   - short stagger between lines
4. After a small gap, the incoming frame animates per line:
   - from `autoAlpha: 0, y: 30`
   - to `autoAlpha: 1, y: 0`
   - same easing and stagger pattern
5. While a frame is active, its chars are not all fully bright immediately:
   - inactive/base char opacity is around `0.4`
   - active chars progressively brighten to `1` as scroll advances

In short:

- frame switching is line-based
- text activation is char-based
- both happen together

That combination is why the original animation feels precise. Reproducing only
"line fade" or only "char reveal" produces the wrong result.

## Local Implementation

The local implementation lives in
[components/hero-section.tsx](/Users/liaoweifan/sail-dev/bcs-official-poc/components/hero-section.tsx).

The implementation follows the same structure:

1. Collect all frame nodes and frame text nodes.
2. Split each frame with `SplitText({ type: "lines,chars", mask: "lines" })`.
3. Keep one active frame index tied to scroll progress.
4. On frame change:
   - animate previous frame lines out
   - wait for a transition gap
   - animate next frame lines in
5. On scroll update:
   - determine active frame index
   - update progress bar and counter
   - brighten active frame chars from `0.4` to `1`
6. On refresh:
   - revert all splits
   - recreate `SplitText`
   - re-apply the current animation state

## Key Parameters

These values were chosen to mirror the reference behavior:

- `charFadeValue = 0.4`
- `lineStagger = 0.05`
- `transitionGap = 0.5`
- `transitionDuration = 0.5`

These correspond closely to the timings found in the reference site's
`hero-xl.js`.

## Why The Code Is Written This Way

This code intentionally does not rely on a simple CSS transition or a single
GSAP tween on the whole paragraph.

That would miss two important details from the reference:

- lines enter and exit independently
- chars brighten progressively while the current frame is active

The current implementation keeps those concerns separate:

- line motion handles frame transitions
- char opacity handles text activation within the active frame

## Validation Workflow

When adjusting this animation, validate in this order:

1. Run `pnpm build`
2. Open the page in a mobile viewport
3. Check three states:
   - current frame mid-reveal
   - outgoing/incoming frame boundary
   - fully settled frame
4. Compare against the reference site at the same approximate scroll position

If the animation feels wrong, verify these first:

- frame index switching timing
- line enter/exit delay
- transition gap before the next frame enters
- char fade baseline

## Important Constraint

This implementation approximates the behavior of the reference site inside this
Next.js project, but it does not literally reuse the reference site's code.

It now uses local `gsap/SplitText` directly, which keeps the animation model
closer to the reference and removes the previous manual line-grouping logic.
