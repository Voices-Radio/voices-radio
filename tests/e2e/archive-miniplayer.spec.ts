import { expect, test, type APIRequestContext } from "@playwright/test";

type RawShow = {
  _id?: string;
  matching_status?: string;
  mixcloudUrl?: string | null;
  mixcloudKey?: string | null;
  soundcloudUrl?: string | null;
  soundcloudId?: string | null;
  platform?: string | null;
  url?: string | null;
};

function hasArchive(show: RawShow) {
  return Boolean(
    show.mixcloudUrl ||
      show.mixcloudKey ||
      show.soundcloudUrl ||
      show.soundcloudId ||
      (show.platform === "mixcloud" && show.url) ||
      (show.platform === "soundcloud" && show.url),
  );
}

async function findArchivedShowId(request: APIRequestContext) {
  const response = await request.get(
    "https://api.voicesradio.co.uk/api/shows?limit=40",
  );
  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as RawShow[];
  const show = payload.find(
    (item) => item._id && item.matching_status === "matched" && hasArchive(item),
  );

  return show?._id;
}

test("archive MiniPlayer persists across navigation and stops when live starts", async ({
  page,
  request,
}) => {
  const showId = await findArchivedShowId(request);

  test.skip(!showId, "No public archived show returned by the Voices API.");
  if (!showId) return;

  await page.goto(`/shows/${showId}`);
  await page.getByRole("button", { name: /listen back/i }).click();

  const miniPlayer = page.getByRole("region", {
    name: /archive mini player/i,
  });
  await expect(miniPlayer).toBeVisible();

  await page.getByRole("link", { name: "Explore" }).click();
  await page.waitForURL("**/explore");
  await expect(miniPlayer).toBeVisible();

  const liveButton = page.getByRole("button", { name: /play kx/i }).first();
  if ((await liveButton.count()) && (await liveButton.isEnabled())) {
    await liveButton.click();
  } else {
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("voices:stop-live-audio", {
          detail: { playerId: "e2e-live-player" },
        }),
      );
    });
  }

  await expect(miniPlayer).toHaveCount(0);
});

for (const viewport of [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
]) {
  test(`archive MiniPlayer controls fit ${viewport.width}px viewport`, async ({
    page,
    request,
  }) => {
    const showId = await findArchivedShowId(request);

    test.skip(!showId, "No public archived show returned by the Voices API.");
    if (!showId) return;

    await page.setViewportSize(viewport);
    await page.goto(`/shows/${showId}`);
    await page.getByRole("button", { name: /listen back/i }).click();

    const miniPlayer = page.getByRole("region", {
      name: /archive mini player/i,
    });
    await expect(miniPlayer).toBeVisible();
    await expect(
      miniPlayer.getByRole("button", { name: /pause archive/i }),
    ).toBeVisible();
    await expect(
      miniPlayer.getByRole("button", { name: /close archive player/i }),
    ).toBeVisible();

    const box = await miniPlayer.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.ceil(box?.width ?? 0)).toBeLessThanOrEqual(viewport.width);

    await miniPlayer.getByRole("button", { name: /close archive player/i }).click();
    await expect(miniPlayer).toHaveCount(0);
  });
}
