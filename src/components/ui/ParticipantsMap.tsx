import React, { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { Typography, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import 'ol/ol.css';

import { PosResponse } from '@/services/api/marketing';

const { Title } = Typography;

interface ParticipantsMapProps {
  participants: PosResponse[];
  loading?: boolean;
}

const isValidCoordinate = (lat: string, lon: string): boolean => {
  if (!lat || !lon || lat.trim() === '' || lon.trim() === '') {
    return false;
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum)) {
    return false;
  }

  return latNum >= -90 && latNum <= 90 &&
    lonNum >= -180 && lonNum <= 180;
};

const ParticipantsMap: React.FC<ParticipantsMapProps> = ({ participants, loading = false }) => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorLayerRef = useRef<VectorLayer | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const getInitialMapCenter = () => {
    return fromLonLat([15.0, 50.0]);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    const initialCenter = getInitialMapCenter();

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: initialCenter,
        zoom: 4,
      }),
      interactions: [],
      controls: [],
    });

    mapInstanceRef.current = map;

    map.on('loadend', () => {
      console.log('Map loaded successfully');
      setIsMapReady(true);
    });

    setTimeout(() => {
      setIsMapReady(true);
    }, 4000);
  }, [isClient]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || loading) return;

    if (vectorLayerRef.current) {
      mapInstanceRef.current.removeLayer(vectorLayerRef.current);
    }

    const validParticipants = participants.filter(participant => {
      const isValid = isValidCoordinate(participant.address.lat, participant.address.lon);
      return isValid;
    });

    if (validParticipants.length === 0) {
      return;
    }

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    validParticipants.forEach((participant) => {
      const lat = parseFloat(participant.address.lat);
      const lon = parseFloat(participant.address.lon);

      const marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        name: participant.name,
        address: participant.address.location,
        city: participant.address.city,
        posType: participant.posType.name,
        rating: participant.rating,
        status: participant.status,
      });

      marker.setStyle(new Style({
        image: new Icon({
          src: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          scale: 0.8,
        }),
      }));

      vectorSource.addFeature(marker);
    });

    mapInstanceRef.current.addLayer(vectorLayer);
    vectorLayerRef.current = vectorLayer;

    if (validParticipants.length > 0 && mapInstanceRef.current) {
      const extent = vectorSource.getExtent();

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.getView().fit(extent, {
            padding: [80, 80, 80, 80],
            duration: 800,
            maxZoom: 10,
          });
        }
      }, 100);
    }
  }, [participants, isMapReady, loading]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!isClient) {
    return (
      <div className="w-full flex justify-center">
        <div className="h-96 w-full max-w-[700px] rounded-lg overflow-hidden bg-gray-100 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="h-96 w-full max-w-[700px] rounded-lg overflow-hidden relative">
        <div ref={mapRef} className="h-full w-full" />

        {(!isMapReady || loading) && (
          <div className="absolute inset-0 bg-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
              <div className="grid grid-cols-4 gap-1 h-full p-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-300 rounded-sm animate-pulse"
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '1.5s'
                    }}
                  />
                ))}
              </div>

              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
              <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />

              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Spin size="small" />
                    <span className="text-sm text-gray-600">{t('marketingLoyalty.loadingMap')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isMapReady && !loading && (!participants || participants.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95">
            <div className="text-center">
              <Title level={4} type="secondary">
                {t('marketingLoyalty.noParticipants')}
              </Title>
              <p className="text-gray-500">
                {t('marketingLoyalty.noParticipantsDescription')}
              </p>
            </div>
          </div>
        )}

        {isMapReady && !loading && participants && participants.length > 0 &&
          participants.filter(p => isValidCoordinate(p.address.lat, p.address.lon)).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95">
              <div className="text-center">
                <Title level={4} type="secondary">
                  {t('marketingLoyalty.noParticipants')}
                </Title>
                <p className="text-gray-500">
                  {t('marketingLoyalty.noParticipantsDescription')}
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ParticipantsMap;
