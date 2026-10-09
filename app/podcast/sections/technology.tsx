import { Mic, Camera, Monitor } from "lucide-react";
import {
  audioEquipment,
  videoEquipment,
  otherEquipment,
} from "../podcast-content";

export function TechnologySection() {
  return (
    <>
      {/* Technology Section */}
      <section id="technology" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-800">
              Studio Equipment
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-slate-600">
              Professional-grade equipment for exceptional podcast production
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Audio Equipment */}
            <div className="rounded-2xl bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-lg">
              <div className="mb-6 flex items-center">
                <div className="mr-4 rounded-xl bg-red-100 p-3">
                  <Mic className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Audio</h3>
              </div>
              <ul className="space-y-3">
                {audioEquipment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent"></div>
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Video Equipment */}
            <div className="rounded-2xl bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-lg">
              <div className="mb-6 flex items-center">
                <div className="mr-4 rounded-xl bg-red-100 p-3">
                  <Camera className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Video</h3>
              </div>
              <ul className="space-y-3">
                {videoEquipment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent"></div>
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Other Equipment - Centered */}
          <div className="mt-8 flex justify-center">
            <div className="w-full rounded-2xl bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-lg md:w-1/2">
              <div className="mb-6 flex items-center">
                <div className="mr-4 rounded-xl bg-red-100 p-3">
                  <Monitor className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Other</h3>
              </div>
              <ul className="space-y-3">
                {otherEquipment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent"></div>
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
