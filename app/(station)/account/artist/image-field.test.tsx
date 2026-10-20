import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ImageField from "./image-field";

// A plain function, not vi.fn(): vitest's call tracking would report a
// rejected upload as unhandled even though the component handles it.
const upload = vi.hoisted(() => ({
  impl: (async () => ({})) as (...args: unknown[]) => Promise<unknown>,
}));
vi.mock("./actions", () => ({
  uploadArtistImageAction: (...args: unknown[]) => upload.impl(...args),
}));

function pick(file: File) {
  const input = screen.getByLabelText("Profile image", {
    selector: "input[type=file]",
  });
  return userEvent.upload(input, file);
}

const jpeg = () => new File(["x"], "me.jpg", { type: "image/jpeg" });

describe("ImageField upload", () => {
  it("shows the staged image after a successful upload", async () => {
    upload.impl = async () => ({
      status: "success",
      stagedImageUrl: "https://example.com/new.jpg",
    });
    render(
      <ImageField
        kind="profile"
        fieldName="imageUrl"
        label="Profile image"
        initialUrl={null}
      />,
    );

    await pick(jpeg());

    await waitFor(() =>
      expect(screen.getByText("Image staged for review.")).toBeInTheDocument(),
    );
    expect(screen.getByText("Replace image")).toBeInTheDocument();
  });

  it("recovers and shows an error when the upload throws", async () => {
    // A real server action rejects after a network round trip, not instantly.
    upload.impl = () =>
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error("Body exceeded 1 MB limit")), 0),
      );
    render(
      <ImageField
        kind="profile"
        fieldName="imageUrl"
        label="Profile image"
        initialUrl={null}
      />,
    );

    await pick(jpeg());

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/couldn.t upload/i),
    );
    expect(screen.queryByText("Uploading…")).toBeNull();
    expect(screen.getByText("Upload image")).toBeInTheDocument();
  });
});
