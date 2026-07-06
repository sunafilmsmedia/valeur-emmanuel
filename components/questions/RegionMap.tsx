"use client";

import dynamic from "next/dynamic";
import { REGIONS } from "@/lib/regions";

const Inner = dynamic(() => import("./RegionMapInner"), { ssr: false });

interface Props {
  value?: string;
  onChange: (id: string) => void;
}

export default function RegionMap({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="relative w-full h-[440px] sm:h-[500px] rounded-2xl overflow-hidden border border-black/10 shadow-[0_30px_80px_-30px_rgba(40,12,14,0.6)]">
        <Inner value={value} onChange={onChange} />
      </div>
      <p className="text-xs text-[var(--color-muted-2)] text-center">
        {value
          ? `Secteur sélectionné : ${REGIONS.find((r) => r.id === value)?.name}`
          : "Touche la carte près de ta propriété — on sélectionne le secteur le plus proche."}
      </p>
    </div>
  );
}
