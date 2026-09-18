/**
 * A short band explaining the Voices Radio connection. Sits right under the
 * hero so anyone sent this page in isolation has the context before they
 * reach "on air" references further down (e.g. under Offer).
 */
export function StationIntro() {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <p className="mx-auto max-w-3xl text-center text-base font-semibold leading-relaxed text-slate-600 md:text-lg">
        Voices Agency is the commercial programming arm of{" "}
        <span className="font-black text-slate-900">Voices Radio</span>, a
        London community radio station broadcasting daily and running a
        roster of three hundred-plus resident DJs, presenters and guests. The
        agency puts that on-air network to work for venues, brands and
        cultural spaces off air.
      </p>
    </div>
  );
}
