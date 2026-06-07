export const formatSize = (mb: number) => {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb} MB`;
};

export const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "قبل لحظات";
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
  return `قبل ${Math.floor(diff / 86400)} يوم`;
};

export const dbTypeColor: Record<string, string> = {
  MySQL: "text-[oklch(0.8_0.16_80)]",
  PostgreSQL: "text-[oklch(0.72_0.18_200)]",
  MongoDB: "text-[oklch(0.72_0.18_155)]",
};
