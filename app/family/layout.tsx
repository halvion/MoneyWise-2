import Navbar from "@/components/Navbar";
import { RootProviders } from "@/components/providers/RootProviders";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-full flex-col">
      <Navbar />
      <RootProviders>{children}</RootProviders>
    </div>
  );
}

export default layout;
