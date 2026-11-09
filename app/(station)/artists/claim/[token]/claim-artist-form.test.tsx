import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ArtistInvitation } from "@/lib/voices/membership/artist-invitations-client";
import ClaimArtistForm from "./claim-artist-form";

vi.mock("./actions", () => ({ claimArtistInvitationAction: vi.fn() }));
// Next bundles a React with the form-action hooks; the plain react-dom used by
// vitest does not export them, and the hooks are not what is under test.
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  useFormState: (_action: unknown, initial: unknown) => [initial, vi.fn()],
  useFormStatus: () => ({ pending: false }),
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

type InvitationOverrides = Omit<Partial<ArtistInvitation>, "artist"> & {
  artist?: Partial<NonNullable<ArtistInvitation["artist"]>> | null;
};

function invitation(overrides: InvitationOverrides = {}): ArtistInvitation {
  const { artist, ...rest } = overrides;
  return {
    id: "inv-1",
    email: "hayley@example.com",
    expiresAt: "2027-01-01T00:00:00Z",
    kind: "claim_existing",
    account: { exists: false, passwordSet: false },
    nameTaken: false,
    artist:
      artist === null
        ? null
        : {
            id: "artist-1",
            name: null,
            artistNameRequired: true,
            imageUrl: null,
            bio: null,
            ...artist,
          },
    ...rest,
  };
}

function renderForm(inv: ArtistInvitation, sessionMatchesInvitation = false) {
  return render(
    <ClaimArtistForm
      token="tok"
      invitation={inv}
      sessionMatchesInvitation={sessionMatchesInvitation}
    />,
  );
}

describe("claim form — what each field is for", () => {
  it("does not label sections as private or public", () => {
    renderForm(invitation());

    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.queryByText(/^private$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^public$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/about you/i)).not.toBeInTheDocument();
  });

  it("shows the invitation email read-only as the username", () => {
    renderForm(invitation({ account: { exists: true, passwordSet: true } }));

    const email = screen.getByLabelText("Email");
    expect(email).toHaveValue("hayley@example.com");
    expect(email).toHaveAttribute("readonly");
    expect(email).toHaveAttribute("autocomplete", "username");
    // The server reads the address from the hidden field, not this one.
    expect(email).not.toHaveAttribute("name");
  });

  it("says first and last name are the DJ's legal names, not their artist name", () => {
    renderForm(invitation());

    const first = screen.getByLabelText("First name");
    const last = screen.getByLabelText("Last name");
    const firstHint = document.getElementById(
      first.getAttribute("aria-describedby") ?? "",
    );
    const lastHint = document.getElementById(
      last.getAttribute("aria-describedby") ?? "",
    );

    expect(firstHint).toHaveTextContent(/legal first name/i);
    expect(firstHint).toHaveTextContent(/not your artist name/i);
    expect(lastHint).toHaveTextContent(/legal last name/i);
  });

  it("tells the DJ the artist name is public and must match their Mixcloud and SoundCloud shows", () => {
    renderForm(invitation());

    const input = screen.getByLabelText("Artist name");
    const hint = document.getElementById(
      input.getAttribute("aria-describedby") ?? "",
    );

    expect(input).toBeRequired();
    expect(hint).toHaveTextContent(/shown publicly/i);
    expect(hint).toHaveTextContent(/mixcloud and soundcloud/i);
  });

  it("asks for the artist name whichever way the DJ signs in, not just when creating an account", () => {
    renderForm(invitation({ account: { exists: true, passwordSet: true } }));

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByText(/you already have a voices account/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/reset it first/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Artist name")).toBeRequired();
    expect(screen.queryByLabelText("First name")).not.toBeInTheDocument();
  });

  it("asks for it in the signed-in one-click path too", () => {
    renderForm(invitation(), true);

    expect(screen.getByLabelText("Artist name")).toBeRequired();
  });

  it("does not ask for an artist name that is already set", () => {
    renderForm(
      invitation({
        artist: { name: "Aeron Darka", artistNameRequired: false },
      }),
    );

    expect(screen.queryByLabelText("Artist name")).not.toBeInTheDocument();
    expect(screen.queryByText(/name is the one shown above/i)).toBeNull();
    expect(
      screen.queryByRole("link", { name: "info@voicesradio.co.uk" }),
    ).toBeNull();
  });

  it("keeps the taken-name guidance for a net-new artist whose invited name was taken", () => {
    renderForm(
      invitation({
        kind: "create_new",
        nameTaken: true,
        artist: { id: null, name: "osBrain", artistNameRequired: false },
      }),
    );

    const input = screen.getByLabelText("Artist name");
    const hint = document.getElementById(
      input.getAttribute("aria-describedby") ?? "",
    );
    expect(hint).toHaveTextContent(
      /“osBrain” is already the name of another artist/,
    );
    expect(hint).toHaveTextContent(/mixcloud and soundcloud/i);
  });
});

describe("claim form — artist name that looks like a legal name", () => {
  it("warns, without blocking, when the artist name matches the first and last name typed", async () => {
    const user = userEvent.setup();
    renderForm(invitation());

    await user.type(screen.getByLabelText("First name"), "Hayley");
    await user.type(screen.getByLabelText("Last name"), "Newsam");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Artist name"), "hayley  newsam");

    expect(screen.getByRole("status")).toHaveTextContent(
      /matches your first and last name/i,
    );
    expect(
      screen.getByRole("button", { name: /claim artist profile/i }),
    ).toBeEnabled();
  });

  it("does not warn for a different artist name", async () => {
    const user = userEvent.setup();
    renderForm(invitation());

    await user.type(screen.getByLabelText("First name"), "Hayley");
    await user.type(screen.getByLabelText("Last name"), "Newsam");
    await user.type(screen.getByLabelText("Artist name"), "Haylo");

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
