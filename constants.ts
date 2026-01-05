import { LayerConfig } from './types';

export const MOCK_LAYERS: LayerConfig[] = [
  {
    id: 'lotes',
    name: 'geosampa:lotes',
    wfsUrl: 'http://geosampa.prefeitura.sp.gov.br/geoserver/geosampa/wfs',
    targetCrs: 'EPSG:4326',
    estimatedCount: 2500000
  },
  {
    id: 'edificacoes',
    name: 'geosampa:edificacoes',
    wfsUrl: 'http://geosampa.prefeitura.sp.gov.br/geoserver/geosampa/wfs',
    targetCrs: 'EPSG:4326',
    estimatedCount: 1800000
  },
  {
    id: 'zoneamento',
    name: 'geosampa:zoneamento_2016',
    wfsUrl: 'http://geosampa.prefeitura.sp.gov.br/geoserver/geosampa/wfs',
    targetCrs: 'EPSG:4326',
    estimatedCount: 45000
  }
];

export const INITIAL_LOGS = [
  { id: '1', timestamp: new Date().toISOString(), level: 'INFO', message: 'System initialized. Ready for WFS 2.0.0 connection.' },
  { id: '2', timestamp: new Date().toISOString(), level: 'INFO', message: 'Loaded PostGIS configuration.' },
];
