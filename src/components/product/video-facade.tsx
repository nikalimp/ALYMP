"use client";
// Видео без потерь для скорости: до клика — только постер и кнопка, iframe youtube-nocookie грузится по клику.
import { useState } from "react";
import { Play } from "lucide-react";

export function VideoFacade({ id, title, poster }: { id: string; title: string; poster?: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-foreground">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-4 text-background" aria-label={`Смотреть видео: ${title}`}>
          {poster && <img src={poster} alt={`Кадр из видео: ${title}`} width={1280} height={720} loading="lazy" className="absolute inset-0 size-full object-cover opacity-70" />}
          <span className="relative flex size-16 items-center justify-center rounded-full bg-background text-foreground transition-transform duration-200 ease-out group-hover:scale-105">
            <Play className="ml-0.5 size-6" strokeWidth={1.5} fill="currentColor" aria-hidden="true" />
          </span>
          <span className="relative max-w-md px-6 text-center text-sm font-medium">{title}</span>
        </button>
      )}
    </div>
  );
}
