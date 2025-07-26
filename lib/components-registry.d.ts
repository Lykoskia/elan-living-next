import { ReactNode } from 'react';

export const DEFAULT_LOCALE: string;

export const componentsRegistry: Record<string, React.ComponentType<any>>;

export function getLocalizedUrl(path: string, locale: string): string;

export function renderPageSections(
  sections: any[] | null | undefined, 
  locale: string
): Promise<ReactNode[] | null>;