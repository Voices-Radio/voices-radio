import { fetchAirtimeLiveMetadata } from "./airtime";
import { getVoicesLiveStation, type VoicesLiveStationId } from "./config";
import { fetchRadioCultLiveMetadata } from "./radio-cult";

/** Now-playing metadata from whichever source the station is switched to. */
export function fetchLiveMetadata(stationId: VoicesLiveStationId) {
  return getVoicesLiveStation(stationId)?.liveSource === "airtime"
    ? fetchAirtimeLiveMetadata(stationId)
    : fetchRadioCultLiveMetadata(stationId);
}
