import { ConfigService } from '@app/services/config.service';
import { MapService } from '@app/services/map.service';

import { describe, it, expect, vi } from 'vitest';

import { generateMiniMap } from './geoHelper';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('geoHelper', () => {
  let configService: ConfigService;
  let mapService: MapService;

  beforeEach(() => {
    configService = {
      config: {
        map: {
          projection: { epsg: 'EPSG:2056', initialExtent: [0, 0, 1, 1] },
          basemaps: [{ id: 'basemap',  type: 'wmts',  url: 'https://example.com/wmts'}]
        }
      },
      initialize: vi.fn()
    } as unknown as ConfigService;

    mapService = {
      initialize: vi.fn(),
      createTileLayer: vi.fn().mockResolvedValue(null),
      drawingStyle: {},
      FirstBaseMapLayer: null
    } as unknown as MapService;
  });

  describe('generateMiniMap', () => {
    it('should generate a minimap with vector source', async () => {
      const result = await generateMiniMap(configService, mapService);

      expect(result).toBeDefined();
      expect(result.minimap).toBeDefined();
      expect(result.vectorSource).toBeDefined();
      expect(mapService.initialize).toHaveBeenCalled();
    });
  });
});
