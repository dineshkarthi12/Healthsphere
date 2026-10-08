import { Link } from "react-router-dom";
import { Ambulance, BedDouble, MapPin, Navigation } from "lucide-react";
import type { Hospital } from "@/types";
import { Rating, SmartImage } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function HospitalCard({ hospital, className }: { hospital: Hospital; className?: string }) {
  return (
    <Link to={`/hospitals/${hospital.id}`} className={cn("group card card-interactive flex flex-col overflow-hidden", className)}>
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-b from-primary-50 to-primary-100">
        <SmartImage image={hospital.image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="size-full transition-transform duration-500 group-hover:scale-[1.03]" />
        {hospital.emergency24x7 && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-caption font-bold text-danger-700 shadow-xs">
            <Ambulance className="size-3.5" aria-hidden="true" /> 24/7 Emergency
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-caption font-semibold text-ink-500">{hospital.type}</p>
        <h3 className="mt-1 t-h3 group-hover:text-primary-700">{hospital.name}</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-small text-ink-500">
          <MapPin className="size-4 shrink-0" aria-hidden="true" /> {hospital.area}, {hospital.city}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-small text-ink-600">
          <Rating value={hospital.rating} />
          <span className="inline-flex items-center gap-1"><Navigation className="size-4 text-ink-400" aria-hidden="true" />{hospital.distanceKm} km</span>
          {hospital.beds > 0 && <span className="inline-flex items-center gap-1"><BedDouble className="size-4 text-ink-400" aria-hidden="true" />{hospital.beds} beds</span>}
        </div>
      </div>
    </Link>
  );
}
