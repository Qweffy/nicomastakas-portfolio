/**
 * A small "?" affordance that reveals a Spanish explanation on hover/focus/tap.
 * Pure CSS (styles in globals.css: .nm-info / .nm-info__tip). Tap on mobile
 * focuses the button, which shows the tip via :focus.
 */
export function InfoTip({ text, align = "right" }: { text: string; align?: "left" | "right" }) {
  return (
    <span className="nm-info">
      <button type="button" className="nm-info__btn nm-focusable" aria-label={text}>
        ?
      </button>
      <span className={`nm-info__tip nm-info__tip--${align}`} role="tooltip" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
