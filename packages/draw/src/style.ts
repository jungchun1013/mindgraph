import { GraphStyleConfig } from './types';

export interface Styles {
  width: number;
  height: number;
  deviceScale: number;
  nodeColor: string;
  activeNodeColor: string;
  dimmedNodeColor: string;
  linkColor: string;
  activeLinkColor: string;
  dimmedLinkColor: string;
  titleColor: string;
  hoverAnimationDuration: number;
  nodeTitlePadding: number;
  activeNodeTitlePadding: number;
  activeNodeRadiusPadding: number;
  minimumNodeSize: number;
  nodeScaleFactor: number;
  minZoom: number;
  maxZoom: number;
}

export function createStyles(
  styleConfig: Partial<GraphStyleConfig> | undefined,
  canvasWidth: number,
  canvasHeight: number,
): Styles {
  if (isSSR()) {
    return { ...default_styles, width: 0, height: 0, deviceScale: 0 };
  }

  const width =
    window.innerWidth <= canvasWidth ? window.innerWidth : canvasWidth;
  const height =
    window.innerHeight <= canvasHeight ? window.innerHeight : canvasHeight;
  const deviceScale = window.devicePixelRatio;

  return {
    ...default_styles,
    ...styleConfig,
    width,
    height,
    deviceScale,
  };
}

export function isSSR(): boolean {
  return typeof window === 'undefined';
}

const default_styles: GraphStyleConfig = {
  minZoom: 0.6,
  maxZoom: 8,
  hoverAnimationDuration: 0.2,
  // nodeColor: '#01b0d3',
  // linkColor: '#01586a',
  nodeColor: '#61c0d9',
  linkColor: '#61586a',
  activeNodeColor: '#ffffff',
  dimmedNodeColor: '#466588',
  activeLinkColor: '#ffffff',
  dimmedLinkColor: '#41414e',
  titleColor: 'white',
  dimmedTitleColor: '#808080',
  nodeTitlePadding: 12,
  activeNodeTitlePadding: 14,
  activeNodeRadiusPadding: 1,
  nodeScaleFactor: 0.64,
  minimumNodeSize: 4,
};
