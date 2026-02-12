import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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

interface YMapsGeoObject {
  geometry?: {
    getType: () => string;
  };
}

interface YMapsMap {
  geoObjects: {
    add: (obj: unknown) => void;
    remove: (obj: unknown) => void;
    each: (callback: (geoObject: YMapsGeoObject) => void) => void;
  };
  destroy: () => void;
}

declare global {
  interface Window {
    ymaps: {
      ready: (callback: () => void) => void;
      Map: new (container: HTMLElement | null, options: Record<string, unknown>) => YMapsMap;
      Placemark: new (coords: number[], content: Record<string, string>, options: Record<string, string>) => unknown;
      multiRouter: {
        MultiRoute: new (config: Record<string, unknown>, options: Record<string, unknown>) => {
          model: {
            events: {
              add: (event: string, callback: () => void) => void;
            };
          };
          getActiveRoute: () => {
            properties: {
              get: (key: string) => { text: string };
            };
          };
        };
      };
    };
  }
}

export default function MapWidget({ points }: MapWidgetProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<YMapsMap | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<typeof points[0] | null>(null);
  const [routeBuilt, setRouteBuilt] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Геолокация недоступна:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window.ymaps === 'undefined') {
      console.error('Яндекс.Карты не загружены');
      return;
    }

    window.ymaps.ready(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }

      const map = new window.ymaps.Map(mapContainerRef.current, {
        center: [55.7558, 37.6173],
        zoom: 10,
        controls: ['zoomControl', 'searchControl', 'typeSelector', 'fullscreenControl', 'geolocationControl']
      });

      mapInstanceRef.current = map;

      points.forEach((point) => {
        if (point.latitude && point.longitude) {
          const placemark = new window.ymaps.Placemark(
            [point.latitude, point.longitude],
            {
              balloonContent: `
                <div style="padding: 8px; max-width: 280px;">
                  <h4 style="margin: 0 0 8px 0; font-weight: 600; font-size: 15px;">${point.name}</h4>
                  <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">${point.address}</p>
                  <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 12px;">
                    ${point.categories.map(cat => `<span style="font-size: 11px; padding: 3px 8px; border-radius: 4px; background: #e5f5f0; color: #047857;">${cat.name}</span>`).join('')}
                  </div>
                  <button 
                    id="route-btn-${point.id}" 
                    style="width: 100%; padding: 8px 16px; background: #047857; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;"
                  >
                    Построить маршрут
                  </button>
                </div>
              `,
            },
            {
              preset: 'islands#greenDotIcon',
            }
          );

          placemark.events.add('balloonopen', () => {
            setTimeout(() => {
              const routeBtn = document.getElementById(`route-btn-${point.id}`);
              if (routeBtn) {
                routeBtn.addEventListener('click', () => {
                  setSelectedPoint(point);
                });
              }
            }, 100);
          });

          map.geoObjects.add(placemark);
        }
      });

      if (userLocation) {
        const userPlacemark = new window.ymaps.Placemark(
          userLocation,
          {
            balloonContent: 'Ваше местоположение',
          },
          {
            preset: 'islands#blueDotIcon',
          }
        );
        map.geoObjects.add(userPlacemark);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [points, userLocation]);

  const buildRoute = () => {
    if (!selectedPoint || !userLocation || !mapInstanceRef.current) {
      alert('Не удалось определить ваше местоположение. Разрешите доступ к геолокации.');
      return;
    }

    if (!selectedPoint.latitude || !selectedPoint.longitude) {
      alert('У выбранного пункта нет координат');
      return;
    }

    window.ymaps.ready(() => {
      const map = mapInstanceRef.current;
      if (!map) return;

      map.geoObjects.each((geoObject: YMapsGeoObject) => {
        if (geoObject.geometry && geoObject.geometry.getType() === 'LineString') {
          map.geoObjects.remove(geoObject);
        }
      });

      const multiRoute = new window.ymaps.multiRouter.MultiRoute(
        {
          referencePoints: [
            userLocation,
            [selectedPoint.latitude, selectedPoint.longitude]
          ],
          params: {
            routingMode: 'pedestrian',
          }
        },
        {
          boundsAutoApply: true,
          wayPointVisible: false,
          routeActiveStrokeWidth: 6,
          routeActiveStrokeColor: '#047857',
        }
      );

      map.geoObjects.add(multiRoute);
      setRouteBuilt(true);

      multiRoute.model.events.add('requestsuccess', () => {
        const activeRoute = multiRoute.getActiveRoute();
        if (activeRoute) {
          const distance = activeRoute.properties.get('distance').text;
          const duration = activeRoute.properties.get('duration').text;
          alert(`Маршрут построен!\nРасстояние: ${distance}\nВремя в пути: ${duration}`);
        }
      });
    });
  };

  useEffect(() => {
    if (selectedPoint) {
      buildRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPoint]);

  const clearRoute = () => {
    if (!mapInstanceRef.current) return;
    
    window.ymaps.ready(() => {
      const map = mapInstanceRef.current;
      if (!map) return;

      map.geoObjects.each((geoObject: YMapsGeoObject) => {
        if (geoObject.geometry && geoObject.geometry.getType() === 'LineString') {
          map.geoObjects.remove(geoObject);
        }
      });
      setRouteBuilt(false);
      setSelectedPoint(null);
    });
  };

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '500px', borderRadius: '8px', overflow: 'hidden' }}
      />
      
      {routeBuilt && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={clearRoute}
            variant="secondary"
            size="sm"
            className="shadow-lg"
          >
            <Icon name="X" size={16} className="mr-2" />
            Очистить маршрут
          </Button>
        </div>
      )}

      {!userLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 shadow-lg">
          <Icon name="MapPin" size={16} className="inline mr-2" />
          Разрешите доступ к геолокации для построения маршрутов
        </div>
      )}
    </div>
  );
}