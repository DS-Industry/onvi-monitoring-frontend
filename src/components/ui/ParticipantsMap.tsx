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
import { Card, Typography, Spin } from 'antd';
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || loading) return;

    const validParticipants = participants.filter(participant => {
      const isValid = isValidCoordinate(participant.address.lat, participant.address.lon);
      console.log(`Participant ${participant.name}: lat="${participant.address.lat}", lon="${participant.address.lon}", valid=${isValid}`);
      return isValid;
    });

    if (validParticipants.length === 0) return;

    if (!mapInstanceRef.current) {
      
    const map = new Map({
        target: mapRef.current,
        layers: [
        new TileLayer({
            source: new OSM(),
        }),
        ],
        view: new View({
        center: fromLonLat([37.6176, 55.7558]),
        zoom: 10,
        }),
        interactions: [],
        controls: [],
    });

      mapInstanceRef.current = map;
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

    if (validParticipants.length > 0) {
      const extent = vectorSource.getExtent();
      mapInstanceRef.current.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000,
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(vectorLayer);
      }
    };
  }, [participants, loading, isClient]);

  if (!isClient) {
    return (
      <Card className="h-96">
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
    <div className="w-full flex justify-center items-center h-96">
      <div className="flex justify-center items-center">
        <Spin size="large" />
      </div>
    </div>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <Card className="h-96">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <Title level={4} type="secondary">
              {t('marketingLoyalty.noParticipants')}
            </Title>
            <p className="text-gray-500">
              {t('marketingLoyalty.noParticipantsDescription')}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const validParticipants = participants.filter(participant => 
    isValidCoordinate(participant.address.lat, participant.address.lon)
  );

  if (validParticipants.length === 0) {
    return (
      <Card className="h-96">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <Title level={4} type="secondary">
              {t('marketingLoyalty.noParticipants')}
            </Title>
            <p className="text-gray-500">
              Участники не имеют корректных координат для отображения на карте
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="h-96 w-full max-w-[700px] rounded-lg overflow-hidden">
        <div ref={mapRef} className="h-full w-full" />
      </div>
    </div>
  );
};

export default ParticipantsMap;
