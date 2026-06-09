import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, type Lang } from "@/hooks/use-language";

export type TitlePart = { text: string; emph: boolean };
export type SiteContent = {
  dir: "rtl" | "ltr";
  brand: string;
  nav: {
    home: string; features: string; pricing: string; docs: string;
    contact: string; login: string; dashboard: string;
  };
  hero: {
    titleLines: TitlePart[][];
    subtitle: string;
    ctaStart: string;
    ctaFeatures: string;
    scrollHint: string;
  };
  stats: { t: string; d: string }[];
  features: {
    eyebrow: string; title: string; subtitle: string;
    items: { icon: string; t: string; d: string }[];
  };
  pricing: {
    eyebrow: string; title: string; subtitle: string; ctaSelect: string;
    plans: { name: string; price: string; featured?: boolean; features: string[] }[];
  };
  docs: {
    eyebrow: string; title: string; subtitle: string;
    sections: { t: string; body: string }[];
  };
  contact: {
    eyebrow: string; title: string; subtitle: string;
    channels: { icon: string; t: string; d: string; href: string }[];
  };
  footer: string;
};

async function fetchContent(lang: Lang): Promise<SiteContent> {
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("lang", lang)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`No content for lang ${lang}`);
  return data.content as SiteContent;
}

export function useSiteContent() {
  const { lang } = useLanguage();
  return useQuery({
    queryKey: ["site_content", lang],
    queryFn: () => fetchContent(lang),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}
