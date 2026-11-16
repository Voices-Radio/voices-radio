import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ArtistProfile } from "@/lib/voices/membership/schemas";
import ArtistProfileForm from "./artist-profile-form";

const actions = vi.hoisted(() => ({
  updateArtistProfileAction: vi.fn(),
  uploadArtistImageAction: vi.fn(),
  lookupUsernameAction: vi.fn(async () => ({ status: "unavailable" })),
  withdrawProfileReviewAction: vi.fn(
    async (): Promise<{ status: string; message?: string }> => ({ status: "success" }),
  ),
}));
vi.mock("./actions", () => actions);
// Next bundles a React with the form-action hooks; plain react-dom does not.
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  useFormState: (_action: unknown, initial: unknown) => [initial, vi.fn()],
  useFormStatus: () => ({ pending: false }),
}));

function profile(overrides: Partial<ArtistProfile> = {}): ArtistProfile {
  return {
    name: "Jack Onslow",
    artistName: "Test 1",
    showName: null,
    bio: null,
    imageUrl: null,
    bannerUrl: null,
    genres: [],
    mixcloudUsername: null,
    soundcloudUsername: null,
    programmingEmail: null,
    socialLinks: {},
    profileReview: null,
    ...overrides,
  } as ArtistProfile;
}

describe("ArtistProfileForm submit safety", () => {
  it("does not submit when Enter is pressed in a username field", async () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    const { container } = render(<ArtistProfileForm profile={profile()} />);
    container.querySelector("form")!.addEventListener("submit", onSubmit);

    const input = screen.getByLabelText("SoundCloud username");
    await userEvent.type(input, "jonslow10{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("keeps the submit button disabled until the DJ ticks the check box", async () => {
    render(<ArtistProfileForm profile={profile()} />);
    const submit = screen.getByRole("button", { name: "Submit for review" });

    expect(submit).toBeDisabled();
    await userEvent.click(
      screen.getByRole("checkbox", { name: /as complete as I can make it/ }),
    );
    expect(submit).toBeEnabled();
  });

  it("submits with empty fields once the box is ticked, with no extra dialog", async () => {
    const { container } = render(<ArtistProfileForm profile={profile()} />);
    const onSubmit = vi.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    container.querySelector("form")!.addEventListener("submit", onSubmit);

    await userEvent.click(
      screen.getByRole("checkbox", { name: /as complete as I can make it/ }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Submit for review" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("still allows Enter inside the bio", async () => {
    render(<ArtistProfileForm profile={profile()} />);
    const bio = screen.getByLabelText("Bio");
    await userEvent.type(bio, "line one{Enter}line two");
    expect(bio).toHaveValue("line one\nline two");
  });
});

describe("ArtistProfileForm review marks", () => {
  const review = (overrides: object) =>
    ({
      id: "r1",
      submittedAt: "2026-10-20T10:00:00Z",
      pending: false,
      fields: [],
      ...overrides,
    }) as ArtistProfile["profileReview"];

  it("marks an approved field next to the field", () => {
    render(
      <ArtistProfileForm
        profile={profile({
          bio: "Live bio",
          profileReview: review({
            fields: [{ field: "bio", proposed: "Live bio", status: "approved" }],
          }),
        })}
      />,
    );
    const bioField = screen.getByLabelText("Bio").closest("[data-review]")!;
    expect(bioField).toHaveAttribute("data-review", "approved");
    expect(bioField).toHaveTextContent("Approved");
  });

  it("shows the reason and the rejected text inside the rejected field", () => {
    render(
      <ArtistProfileForm
        profile={profile({
          showName: null,
          profileReview: review({
            fields: [
              {
                field: "showName",
                proposed: "Night Bus",
                status: "rejected",
                rejectionReason: "Name already taken",
              },
            ],
          }),
        })}
      />,
    );
    const input = screen.getByLabelText("Show name");
    const field = input.closest("[data-review]")!;
    expect(field).toHaveAttribute("data-review", "rejected");
    expect(field).toHaveTextContent("Not approved");
    expect(field).toHaveTextContent("Name already taken");
    expect(input).toHaveValue("Night Bus");
    expect(input).toHaveAccessibleDescription(/Name already taken/);
  });

  it("maps social link keys to their inputs", () => {
    render(
      <ArtistProfileForm
        profile={profile({
          profileReview: review({
            fields: [
              {
                field: "socialLinks.instagram",
                proposed: "https://instagram.com/x",
                status: "rejected",
                rejectionReason: "Wrong account",
              },
            ],
          }),
        })}
      />,
    );
    const field = screen.getByLabelText("Instagram URL").closest("[data-review]")!;
    expect(field).toHaveTextContent("Wrong account");
  });

  it("puts no mark on a field outside the review", () => {
    render(<ArtistProfileForm profile={profile({ profileReview: review({}) })} />);
    expect(screen.getByLabelText("Bio").closest("[data-review]")).toBeNull();
  });

  it("no longer shows a separate review list at the top", () => {
    render(
      <ArtistProfileForm
        profile={profile({
          profileReview: review({
            fields: [
              { field: "bio", proposed: "x", status: "rejected", rejectionReason: "Too long" },
            ],
          }),
        })}
      />,
    );
    expect(screen.queryByText("Latest profile review")).toBeNull();
    expect(screen.queryByText("Some changes need another look")).toBeNull();
    expect(screen.getAllByText(/Too long/)).toHaveLength(1);
  });

  it("shows an awaiting-review notice and marks while a review is open", () => {
    render(
      <ArtistProfileForm
        profile={profile({
          profileReview: review({
            pending: true,
            fields: [{ field: "bio", proposed: "x", status: "pending" }],
          }),
        })}
      />,
    );
    expect(screen.getByText("Profile update awaiting review")).toBeInTheDocument();
    expect(screen.getByLabelText("Bio").closest("[data-review]")).toHaveTextContent("In review");
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});

describe("ArtistProfileForm withdraw request", () => {
  const pendingReview = {
    id: "r1",
    submittedAt: "2026-11-16T10:00:00Z",
    pending: true,
    fields: [{ field: "bio", proposed: "A very long bio", status: "pending" }],
  } as NonNullable<ArtistProfile["profileReview"]>;

  it("withdraws the pending request after the DJ confirms", async () => {
    actions.withdrawProfileReviewAction.mockClear();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<ArtistProfileForm profile={profile({ profileReview: pendingReview })} />);

    await userEvent.click(screen.getByRole("button", { name: "Withdraw request" }));

    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/withdraw this request/i));
    expect(actions.withdrawProfileReviewAction).toHaveBeenCalledTimes(1);
    confirm.mockRestore();
  });

  it("does nothing when the DJ cancels the confirmation", async () => {
    actions.withdrawProfileReviewAction.mockClear();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<ArtistProfileForm profile={profile({ profileReview: pendingReview })} />);

    await userEvent.click(screen.getByRole("button", { name: "Withdraw request" }));

    expect(actions.withdrawProfileReviewAction).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it("shows the error when the withdrawal fails", async () => {
    actions.withdrawProfileReviewAction.mockResolvedValueOnce({
      status: "error",
      message: "We could not reach Voices.",
    });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<ArtistProfileForm profile={profile({ profileReview: pendingReview })} />);

    await userEvent.click(screen.getByRole("button", { name: "Withdraw request" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("We could not reach Voices.");
    confirm.mockRestore();
  });

  it("has no withdraw button when nothing is pending", () => {
    render(<ArtistProfileForm profile={profile()} />);
    expect(screen.queryByRole("button", { name: "Withdraw request" })).toBeNull();
  });

  it("unlocks the form after a withdrawal and keeps the withdrawn text to edit", () => {
    render(
      <ArtistProfileForm
        profile={profile({
          bio: "Live bio",
          profileReview: {
            ...pendingReview,
            pending: false,
            fields: [
              { field: "bio", proposed: "A very long bio", status: "withdrawn", rejectionReason: null },
            ],
          },
        })}
      />,
    );

    const bio = screen.getByLabelText("Bio");
    expect(bio).toHaveValue("A very long bio");
    expect(bio).toBeEnabled();
    expect(bio.closest("[data-review]")).toHaveTextContent("Withdrawn");
    expect(screen.getByText(/you withdrew your last request/i)).toBeInTheDocument();
    expect(screen.queryByText("Profile update awaiting review")).toBeNull();
    expect(screen.getByRole("checkbox", { name: /as complete as I can make it/ })).toBeInTheDocument();
  });
});

describe("ArtistProfileForm bio length", () => {
  it("counts the bio characters against the limit", () => {
    render(<ArtistProfileForm profile={profile({ bio: "Hello" })} />);

    expect(screen.getByText("5 / 2,000 characters")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "Hello there" } });
    expect(screen.getByText("11 / 2,000 characters")).toBeInTheDocument();
  });

  it("warns when the bio is over the limit", () => {
    render(<ArtistProfileForm profile={profile()} />);

    fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "a".repeat(2_010) } });

    expect(
      screen.getByText("2,010 / 2,000 characters. Remove 10 characters to submit."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Bio")).toHaveAttribute("aria-invalid", "true");
  });
});
