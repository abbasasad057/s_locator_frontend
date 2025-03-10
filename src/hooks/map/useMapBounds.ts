import { useEffect } from 'react';
import { useCatalogContext } from '../../context/CatalogContext';
import { useMapContext } from '../../context/MapContext';
import { defaultMapConfig } from '../../hooks/map/useMapInitialization';
import { isIntelligentLayer } from '../../utils/layerUtils';

export function useMapBounds() {
  const { mapRef, shouldInitializeFeatures } = useMapContext();
  const { geoPoints } = useCatalogContext();
  useEffect(() => {
    if (!shouldInitializeFeatures) return;

    const map = mapRef.current;
    if (!map || !geoPoints.length) return;

    let noFly = false;
    // Calculate center point of all features
    let sumLng = 0;
    let sumLat = 0;
    let pointCount = 0;

    geoPoints.forEach(point => {
      if(isIntelligentLayer(point) && point.is_refetch) {
        noFly = true;
        return;
      }
      if (point.display && point.features) {
        point.features.forEach(feature => {
          const coords = feature.geometry.coordinates as [number, number];
          sumLng += coords[0];
          sumLat += coords[1];
          pointCount++;
        });
      }
    });

    if (pointCount > 0 && !noFly) {
      const centerLng = sumLng / pointCount;
      const centerLat = sumLat / pointCount;

      map.flyTo({
        center: [centerLng, centerLat],
        speed: defaultMapConfig.speed,
        curve: 1,
        essential: true,
        maxDuration: 1000,
      });
    }
  }, [mapRef, geoPoints, shouldInitializeFeatures]);
}
