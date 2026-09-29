import { richHtml } from "@/lib/rich-text";
export function RichText({
  value,
  className = "",
}: {
  value?: string | null;
  className?: string;
}) {
  return (
    <div
      className={`qgProse ${className}`}
      dangerouslySetInnerHTML={{ __html: richHtml(value || "") }}
    />
  );
}
