import { useEffect, useRef } from 'react';
import { load } from '@2gis/mapgl';

interface MapWidgetProps {
  points: Array<{
    id: number;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    categories: Array<{
      name: string;
      color: string;
    }>;
  }>;
}

export default function MapWidget({ points }: MapWidgetProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let map: any;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      const mapglAPI = await load();

      map = new mapglAPI.Map(mapContainerRef.current, {
        center: [37.6173, 55.7558],
        zoom: 10,
        key: 'your-2gis-api-key',
      });

      mapInstanceRef.current = map;

      markersRef.current.forEach((marker) => marker.destroy());
      markersRef.current = [];

      points.forEach((point) => {
        if (point.latitude && point.longitude) {
          const marker = new mapglAPI.Marker(map, {
            coordinates: [point.longitude, point.latitude],
          });

          const popup = new mapglAPI.HtmlMarker(map, {
            coordinates: [point.longitude, point.latitude],
            html: `
              <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); max-width: 250px;">
                <h4 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${point.name}</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${point.address}</p>
                <div style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">
                  ${point.categories.map(cat => `<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #e5f5f0;">${cat.name}</span>`).join('')}
                </div>
              </div>
            `,
          });

          markersRef.current.push(marker);
        }
      });
    };

    initMap();

    return () => {
      markersRef.current.forEach((marker) => marker.destroy());
      markersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [points]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '500px', borderRadius: '8px', overflow: 'hidden' }}
    />
  );
}
