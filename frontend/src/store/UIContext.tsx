import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type TransparencyMode = 'auto' | 'on' | 'off';
export type VisualStyle = 'liquid' | 'matte';

interface UICtx {
  transparencyMode: TransparencyMode;
  setTransparencyMode: (mode: TransparencyMode) => void;
  visualStyle: VisualStyle;
  setVisualStyle: (style: VisualStyle) => void;
  shouldReduceTransparency: boolean;
  isLowPowerDevice: boolean;
  isHeavyInteraction: boolean;
  theme: 'light' | 'dark';
}

const UIContext = createContext<UICtx>({} as UICtx);

export function UIProvider({ children }: { children: ReactNode }) {
  const [transparencyMode, setTransparencyMode] = useState<TransparencyMode>(() => {
    const saved = localStorage.getItem('transparencyMode');
    if (saved === 'on' || saved === 'off' || saved === 'auto') return saved;
    return 'auto';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(() => {
    const saved = localStorage.getItem('visualStyle');
    if (saved === 'liquid' || saved === 'matte') return saved;
    return 'liquid';
  });
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false);
  const [isHeavyInteraction, setIsHeavyInteraction] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => setTheme(media.matches ? 'dark' : 'light');
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 8;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ?? false;

    const lowPower = reducedMotion || hardwareConcurrency <= 4 || deviceMemory <= 4 || saveData;
    setIsLowPowerDevice(lowPower);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let rafId: number | null = null;

    const beginInteraction = () => {
      setIsHeavyInteraction(true);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsHeavyInteraction(false), 220);
    };

    const throttledInteraction = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        beginInteraction();
        rafId = null;
      });
    };

    window.addEventListener('scroll', throttledInteraction, { passive: true });
    window.addEventListener('wheel', throttledInteraction, { passive: true });
    window.addEventListener('touchmove', throttledInteraction, { passive: true });
    window.addEventListener('resize', throttledInteraction, { passive: true });

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', throttledInteraction);
      window.removeEventListener('wheel', throttledInteraction);
      window.removeEventListener('touchmove', throttledInteraction);
      window.removeEventListener('resize', throttledInteraction);
    };
  }, []);

  const shouldReduceTransparency =
    transparencyMode === 'off' || (transparencyMode === 'auto' && (isLowPowerDevice || isHeavyInteraction));

  useEffect(() => {
    localStorage.setItem('transparencyMode', transparencyMode);
    document.documentElement.setAttribute('data-transparency-mode', transparencyMode);
  }, [transparencyMode]);

  useEffect(() => {
    localStorage.setItem('visualStyle', visualStyle);
    document.documentElement.setAttribute('data-visual-style', visualStyle);
  }, [visualStyle]);

  useEffect(() => {
    document.documentElement.setAttribute('data-transparency', shouldReduceTransparency ? 'reduced' : 'full');
    document.documentElement.setAttribute('data-heavy-interaction', isHeavyInteraction ? 'true' : 'false');
  }, [shouldReduceTransparency, isHeavyInteraction]);

  const value = useMemo(
    () => ({
      transparencyMode,
      setTransparencyMode,
      visualStyle,
      setVisualStyle,
      shouldReduceTransparency,
      isLowPowerDevice,
      isHeavyInteraction,
      theme,
    }),
    [transparencyMode, visualStyle, shouldReduceTransparency, isLowPowerDevice, isHeavyInteraction, theme]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  return useContext(UIContext);
}

