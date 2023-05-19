"use client";

import config from "@/sanity.config";
import { NextStudio } from "next-sanity/studio";
import { StudioLayout, StudioProvider } from "sanity";

export function Studio() {
  return (
    <NextStudio config={config}>
      <StudioProvider config={config}>
        <StudioLayout />
      </StudioProvider>
    </NextStudio>
  );
}
