import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAirtimeLiveMetadata = vi.fn();
const fetchRadioCultLiveMetadata = vi.fn();

vi.mock("@/lib/voices/airtime", () => ({ fetchAirtimeLiveMetadata }));
vi.mock("@/lib/voices/radio-cult", () => ({ fetchRadioCultLiveMetadata }));

const { GET } = await import("./route");

function request(station: string | null) {
  const query = station === null ? "" : `?station=${station}`;
  return GET(new Request(`https://staging.example/api/live${query}`));
}

beforeEach(() => {
  fetchAirtimeLiveMetadata.mockReset();
  fetchRadioCultLiveMetadata.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/live", () => {
  it("serves KX from Airtime by default", async () => {
    fetchAirtimeLiveMetadata.mockResolvedValue({ title: "Airtime Show" });

    const response = await request("kx");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ title: "Airtime Show" });
    expect(fetchAirtimeLiveMetadata).toHaveBeenCalledWith("kx");
    expect(fetchRadioCultLiveMetadata).not.toHaveBeenCalled();
  });

  it("serves EAST from RadioCult", async () => {
    fetchRadioCultLiveMetadata.mockResolvedValue({ title: "East Show" });

    const response = await request("east");

    expect(await response.json()).toEqual({ title: "East Show" });
    expect(fetchAirtimeLiveMetadata).not.toHaveBeenCalled();
  });

  it("lets the CDN absorb the shell's poll", async () => {
    fetchAirtimeLiveMetadata.mockResolvedValue({ title: "x" });

    const response = await request("kx");

    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=30, stale-while-revalidate=60",
    );
  });

  it("rejects an unknown or missing station", async () => {
    expect((await request("nope")).status).toBe(400);
    expect((await request(null)).status).toBe(400);
  });

  it("returns 502 when the upstream fails", async () => {
    fetchAirtimeLiveMetadata.mockRejectedValue(new Error("down"));

    expect((await request("kx")).status).toBe(502);
  });
});
