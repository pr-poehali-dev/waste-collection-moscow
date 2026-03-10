import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface MapWidgetProps {
  points: Array<{
    id: number;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    phone?: string | null;
    hours?: string | null;
    categories: Array<{
      code?: string;
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
      geocode: (query: string) => Promise<{ geoObjects: { get: (i: number) => { geometry: { getCoordinates: () => number[] } } } }>;
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
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setGeoError(false);
        },
        () => {
          setGeoError(true);
        }
      );
    } else {
      setGeoError(true);
    }
  }, []);

  const categoryPreset: Record<string, string> = {
    batteries:   'islands#yellowDotIcon',
    lamps:       'islands#orangeDotIcon',
    dangerous:   'islands#redDotIcon',
    oil:         'islands#darkBlueDotIcon',
    tires:       'islands#blackDotIcon',
    textiles:    'islands#pinkDotIcon',
    toys:        'islands#violetDotIcon',
    electronics: 'islands#darkOrangeDotIcon',
    plastic:     'islands#blueDotIcon',
    glass:       'islands#cyanDotIcon',
    paper:       'islands#brownDotIcon',
    metal:       'islands#grayDotIcon',
    mixed:       'islands#greenDotIcon',
  };

  const categoryBadgeColor: Record<string, string> = {
    batteries:   '#fef3c7; color: #92400e',
    lamps:       '#ffedd5; color: #9a3412',
    dangerous:   '#fee2e2; color: #991b1b',
    oil:         '#dbeafe; color: #1e40af',
    tires:       '#f3f4f6; color: #374151',
    textiles:    '#fce7f3; color: #9d174d',
    toys:        '#ede9fe; color: #5b21b6',
    electronics: '#e0e7ff; color: #3730a3',
    plastic:     '#dbeafe; color: #1d4ed8',
    glass:       '#cffafe; color: #0e7490',
    paper:       '#fef9c3; color: #854d0e',
    metal:       '#f3f4f6; color: #374151',
    mixed:       '#d1fae5; color: #047857',
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window.ymaps === 'undefined') return;

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
          const primaryCode = point.categories[0]?.code || 'mixed';
          const preset = categoryPreset[primaryCode] || 'islands#greenDotIcon';

          const badgesHtml = point.categories.map(cat => {
            const code = cat.code || 'mixed';
            const style = categoryBadgeColor[code] || '#d1fae5; color: #047857';
            return `<span style="font-size:11px;padding:3px 8px;border-radius:4px;background:${style};">${cat.name}</span>`;
          }).join('');

          const phoneHtml = point.phone
            ? `<p style="margin:4px 0 8px;font-size:12px;color:#555;">📞 ${point.phone}</p>`
            : '';
          const hoursHtml = point.hours
            ? `<p style="margin:4px 0 8px;font-size:12px;color:#555;">🕐 ${point.hours}</p>`
            : '';

          const placemark = new window.ymaps.Placemark(
            [point.latitude, point.longitude],
            {
              balloonContent: `
                <div style="padding:8px;max-width:300px;">
                  <h4 style="margin:0 0 4px;font-weight:600;font-size:15px;">${point.name}</h4>
                  <p style="margin:0 0 4px;font-size:13px;color:#666;">📍 ${point.address}</p>
                  ${phoneHtml}${hoursHtml}
                  <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;">${badgesHtml}</div>
                  <button id="route-btn-${point.id}" style="width:100%;padding:8px 16px;background:#047857;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;">
                    Построить маршрут
                  </button>
                </div>
              `,
            },
            { preset }
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
          { balloonContent: 'Ваше местоположение' },
          { preset: 'islands#blueDotIcon' }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, userLocation]);

  const buildRouteFromCoords = (from: [number, number], to: [number, number]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.geoObjects.each((geoObject: YMapsGeoObject) => {
      if (geoObject.geometry && geoObject.geometry.getType() === 'LineString') {
        map.geoObjects.remove(geoObject);
      }
    });

    const multiRoute = new window.ymaps.multiRouter.MultiRoute(
      {
        referencePoints: [from, to],
        params: { routingMode: 'pedestrian' }
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
    setIsBuilding(false);

    multiRoute.model.events.add('requestsuccess', () => {
      const activeRoute = multiRoute.getActiveRoute();
      if (activeRoute) {
        setRouteInfo({
          distance: activeRoute.properties.get('distance').text,
          duration: activeRoute.properties.get('duration').text,
        });
      }
    });
  };

  const buildRoute = async (point: typeof points[0]) => {
    if (!point.latitude || !point.longitude) return;
    const dest: [number, number] = [point.latitude, point.longitude];

    setIsBuilding(true);
    setRouteInfo(null);

    if (userLocation) {
      buildRouteFromCoords(userLocation, dest);
      return;
    }

    // No geolocation — try to geocode the address input
    if (addressInput.trim()) {
      try {
        window.ymaps.ready(async () => {
          const result = await window.ymaps.geocode(addressInput.trim());
          const coords = result.geoObjects.get(0).geometry.getCoordinates() as [number, number];
          setUserLocation(coords);
          buildRouteFromCoords(coords, dest);
        });
      } catch {
        setIsBuilding(false);
      }
    } else {
      setShowAddressForm(true);
      setIsBuilding(false);
    }
  };

  useEffect(() => {
    if (selectedPoint) {
      buildRoute(selectedPoint);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPoint]);

  const handleAddressSubmit = () => {
    if (!addressInput.trim() || !selectedPoint) return;
    setShowAddressForm(false);
    buildRoute(selectedPoint);
  };

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
      setRouteInfo(null);
    });
  };

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '500px', borderRadius: '8px', overflow: 'hidden' }}
      />

      {/* Route info panel */}
      {routeInfo && (
        <div className="absolute top-4 left-4 right-16 z-10 bg-white border border-emerald-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
          <div className="flex-1 flex gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Icon name="Navigation" size={15} className="text-emerald-600" />
              <span className="font-semibold text-emerald-700">{routeInfo.distance}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Icon name="Clock" size={15} className="text-muted-foreground" />
              <span className="text-muted-foreground">{routeInfo.duration}</span>
            </div>
          </div>
          <Button onClick={clearRoute} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
            <Icon name="X" size={15} />
          </Button>
        </div>
      )}

      {/* Clear route button (no info yet) */}
      {routeBuilt && !routeInfo && (
        <div className="absolute top-4 right-4 z-10">
          <Button onClick={clearRoute} variant="secondary" size="sm" className="shadow-lg gap-1.5">
            <Icon name="X" size={15} />
            Очистить
          </Button>
        </div>
      )}

      {/* Building spinner */}
      {isBuilding && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-2 text-sm">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          Строю маршрут...
        </div>
      )}

      {/* Address input form */}
      {showAddressForm && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white rounded-xl shadow-xl border p-4">
          <p className="text-sm font-semibold mb-1">Откуда строить маршрут?</p>
          <p className="text-xs text-muted-foreground mb-3">
            Геолокация недоступна — введи адрес или название места
          </p>
          <div className="flex gap-2">
            <Input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Например: Тверская, 12"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddressSubmit()}
              autoFocus
            />
            <Button onClick={handleAddressSubmit} disabled={!addressInput.trim()} className="gap-1.5">
              <Icon name="Navigation" size={15} />
              Найти
            </Button>
          </div>
          <button
            onClick={() => { setShowAddressForm(false); setSelectedPoint(null); }}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Отмена
          </button>
        </div>
      )}

      {/* Geo permission hint */}
      {geoError && !showAddressForm && !routeBuilt && (
        <div className="absolute bottom-4 left-4 right-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 shadow-lg flex items-start gap-2">
          <Icon name="MapPin" size={16} className="flex-shrink-0 mt-0.5" />
          <span>Геолокация недоступна. При построении маршрута можно ввести адрес вручную.</span>
        </div>
      )}
    </div>
  );
}
