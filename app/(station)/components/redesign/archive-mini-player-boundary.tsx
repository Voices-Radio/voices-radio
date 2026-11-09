"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Scoped error boundary around ArchiveMiniPlayer.
 *
 * The mini player embeds third-party SoundCloud/Mixcloud iframes and talks
 * to them via postMessage; a teardown race (widget unbind firing after the
 * iframe is detached) can throw. React error boundaries must be class
 * components — there is no hook equivalent — so this stays a class even
 * though the rest of the redesign is functional components.
 *
 * Without this, that throw propagates up to the (station) segment's
 * error.tsx and blanks the entire page (header, content, footer) just
 * because the archive player broke. Scoping it here means closing/switching
 * an archive show degrades to "no mini player" instead of "no page".
 */
export default class ArchiveMiniPlayerBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Archive mini player crashed", error);
  }

  render() {
    if (this.state.hasError) return null;

    return this.props.children;
  }
}
