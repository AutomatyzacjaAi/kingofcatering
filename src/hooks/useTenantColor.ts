import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Converts a hex color (#rrggbb) to HSL string "H S% L%" for CSS variables.
 */
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Determines if a color is light enough to need dark foreground text.
 */
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

export function useTenantColor(tenantId?: string | null) {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      let query = supabase.from("company_settings").select("primary_color");
      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }
      const { data } = await query.limit(1).single();
      if (data && (data as any).primary_color) {
        setColor((data as any).primary_color);
      }
    };
    fetch();
  }, [tenantId]);

  useEffect(() => {
    if (!color) return;
    const root = document.documentElement;
    const hsl = hexToHsl(color);
    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--ring", hsl);
    root.style.setProperty("--sidebar-primary", hsl);
    root.style.setProperty("--sidebar-ring", hsl);

    // Set foreground based on brightness
    const fg = isLightColor(color) ? "0 0% 7%" : "0 0% 100%";
    root.style.setProperty("--primary-foreground", fg);
    root.style.setProperty("--sidebar-primary-foreground", fg);

    return () => {
      // Reset on unmount
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--sidebar-primary");
      root.style.removeProperty("--sidebar-primary-foreground");
      root.style.removeProperty("--sidebar-ring");
    };
  }, [color]);

  return color;
}
