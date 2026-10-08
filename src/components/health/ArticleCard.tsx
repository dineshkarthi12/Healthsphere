import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import type { HealthArticle } from "@/types";
import { SmartImage } from "@/components/ui/primitives";
import { cn, formatDate } from "@/lib/utils";

export function ArticleCard({ article, horizontal = false, className }: { article: HealthArticle; horizontal?: boolean; className?: string }) {
  return (
    <Link
      to={`/health-library/${article.slug}`}
      className={cn("group card card-interactive flex overflow-hidden", horizontal ? "flex-row items-stretch" : "flex-col", className)}
    >
      <div className={cn("relative shrink-0 overflow-hidden bg-subtle", horizontal ? "w-28 xs:w-32" : "aspect-[16/9]")}>
        <SmartImage image={article.image} sizes={horizontal ? "128px" : "(min-width: 768px) 33vw, 100vw"} className="absolute inset-0 size-full transition-transform duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className={cn("flex flex-1 flex-col", horizontal ? "p-3.5" : "p-5")}>
        <p className="text-caption font-bold tracking-wide text-primary-700 uppercase">{article.category}</p>
        <h3 className={cn("mt-1 font-bold text-ink-900 group-hover:text-primary-700", horizontal ? "line-clamp-2 text-small" : "line-clamp-2 text-h3 leading-snug")}>{article.title}</h3>
        {!horizontal && <p className="mt-2 line-clamp-2 text-small text-ink-500">{article.excerpt}</p>}
        <p className={cn("flex items-center gap-1.5 text-caption text-ink-500", horizontal ? "mt-1.5" : "mt-auto pt-4")}>
          <Clock className="size-3.5" aria-hidden="true" /> {article.readMinutes} min read · {formatDate(article.date, { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
    </Link>
  );
}
