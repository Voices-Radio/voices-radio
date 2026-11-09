import NotFoundContent from "./(station)/components/redesign/not-found-content";
import RedesignShell from "./(station)/components/redesign/redesign-shell";

/**
 * Unmatched URLs resolve here, outside the (station) layout, so the shell is
 * added explicitly — otherwise a mistyped link lands on a bare default 404
 * with no header, footer or way back.
 */
export default function NotFound() {
  return (
    <RedesignShell>
      <NotFoundContent />
    </RedesignShell>
  );
}
