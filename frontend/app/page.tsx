'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globe.css';

// Import data and components
import { curriculumsGeoJSON, curriculums } from './data/curriculums';
import CurriculumPopup from '@/components/globe/CurriculumPopup';
import VoiceControl from '@/components/globe/VoiceControl';
import TalentMigration from '@/components/globe/TalentMigration';

// Set Mapbox token from environment
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
}

export default function Home() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedCurriculum, setSelectedCurriculum] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<number[] | null>(null);
  const rotationRef = useRef<number | null>(null);

  // Comparison state
  const [comparisonList, setComparisonList] = useState<any[]>([]);
  const [activeComparisonTab, setActiveComparisonTab] = useState(0);

  // Add curriculum to comparison list
  const addToComparison = useCallback((curriculum: any) => {
    setComparisonList(prev => {
      if (prev.find(c => c.id === curriculum.id)) return prev;
      return [...prev, curriculum];
    });
  }, []);

  // Remove curriculum from comparison list
  const removeFromComparison = useCallback((curriculumId: number) => {
    setComparisonList(prev => {
      const newList = prev.filter(c => c.id !== curriculumId);
      if (activeComparisonTab >= newList.length && newList.length > 0) {
        setActiveComparisonTab(Math.max(0, newList.length - 1));
      } else if (newList.length === 0) {
        setActiveComparisonTab(0);
      }
      return newList;
    });
  }, [activeComparisonTab]);

  // Check if curriculum is in comparison
  const isInComparison = useCallback((curriculumId: number) => {
    return comparisonList.some(c => c.id === curriculumId);
  }, [comparisonList]);

  // Filter curriculums and update map
  const filterCurriculums = useCallback((matchingIds: number[] | null) => {
    if (!map.current || !isLoaded) return;

    const source = map.current.getSource('curriculums') as mapboxgl.GeoJSONSource;
    if (!source) return;

    if (!matchingIds || matchingIds.length === 0) {
      source.setData(curriculumsGeoJSON as any);
      setActiveFilter(null);
    } else {
      const filtered = {
        type: 'FeatureCollection',
        features: curriculumsGeoJSON.features.filter(f =>
          matchingIds.includes(f.properties.id)
        )
      };
      source.setData(filtered as any);
      setActiveFilter(matchingIds);
    }
  }, [isLoaded]);

  // Fly to location
  const flyToLocation = useCallback((flyTo: any) => {
    if (!map.current || !flyTo) return;

    // Stop rotation
    if (rotationRef.current) {
      cancelAnimationFrame(rotationRef.current);
      rotationRef.current = null;
    }

    // Use fitBounds if bounds provided (for multiple pins)
    if (flyTo.bounds) {
      map.current.fitBounds(flyTo.bounds, {
        padding: { top: 100, bottom: 150, left: 50, right: 400 },
        pitch: 50,
        duration: 2500,
        maxZoom: 12
      });
    } else {
      map.current.flyTo({
        center: flyTo.center,
        zoom: flyTo.zoom || 10,
        pitch: 55,
        duration: 2000,
        essential: true
      });
    }
  }, []);

  // Handle voice results
  const handleVoiceResults = useCallback((result: any) => {
    filterCurriculums(result.matchingIds);

    if (result.flyTo) {
      flyToLocation(result.flyTo);
    }

    // Auto-show curriculum panel when there are matches
    if (result.matchingIds && result.matchingIds.length > 0) {
      const top3Ids = result.matchingIds.slice(0, 3);
      const top3Curriculums = top3Ids
        .map((id: number) => curriculums.find(c => c.id === id))
        .filter(Boolean);

      setComparisonList(top3Curriculums);
      setActiveComparisonTab(0);

      const curriculum = curriculums.find(c => c.id === result.matchingIds[0]);
      if (curriculum) {
        setTimeout(() => {
          setSelectedCurriculum(curriculum);
        }, 800);
      }
    } else {
      setSelectedCurriculum(null);
      setComparisonList([]);
    }
  }, [filterCurriculums, flyToLocation]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [20, 30],
      zoom: 2.5,
      pitch: 45,
      bearing: 0,
      projection: 'globe' as any,
      antialias: true
    });

    map.current.on('style.load', () => {
      if (!map.current) return;

      map.current.setFog({
        color: 'rgb(10, 10, 20)',
        'high-color': 'rgb(20, 20, 40)',
        'horizon-blend': 0.08,
        'space-color': 'rgb(5, 5, 15)',
        'star-intensity': 0.6
      });

      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });

      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    });

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('curriculums', {
        type: 'geojson',
        data: curriculumsGeoJSON as any
      });

      // Add all the layers for the pins (glow, shadow, base, ring, highlight, labels)
      map.current.addLayer({
        id: 'curriculum-glow-outer',
        type: 'circle',
        source: 'curriculums',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 20, 6, 35, 12, 50],
          'circle-opacity': 0.15,
          'circle-blur': 1.5
        }
      });

      map.current.addLayer({
        id: 'curriculum-glow-inner',
        type: 'circle',
        source: 'curriculums',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 12, 6, 20, 12, 30],
          'circle-opacity': 0.3,
          'circle-blur': 0.8
        }
      });

      map.current.addLayer({
        id: 'curriculum-shadow',
        type: 'circle',
        source: 'curriculums',
        paint: {
          'circle-color': 'rgba(0, 0, 0, 0.5)',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 8, 6, 12, 12, 16],
          'circle-translate': [2, 2],
          'circle-blur': 0.5
        }
      });

      map.current.addLayer({
        id: 'curriculum-pin-base',
        type: 'circle',
        source: 'curriculums',
        paint: {
          'circle-color': 'rgba(255, 255, 255, 0.95)',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 7, 6, 10, 12, 14],
          'circle-stroke-width': 0
        }
      });

      map.current.addLayer({
        id: 'curriculum-pin-ring',
        type: 'circle',
        source: 'curriculums',
        paint: {
          'circle-color': 'transparent',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 7, 6, 10, 12, 14],
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 6, 3.5, 12, 4.5],
          'circle-stroke-color': ['get', 'color']
        }
      });

      map.current.addLayer({
        id: 'curriculum-pins',
        type: 'circle',
        source: 'curriculums',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 3, 6, 5, 12, 7]
        }
      });

      map.current.addLayer({
        id: 'curriculum-pin-highlight',
        type: 'circle',
        source: 'curriculums',
        paint: {
          'circle-color': 'rgba(255, 255, 255, 0.8)',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 1.5, 6, 2, 12, 3],
          'circle-translate': [-1, -1]
        }
      });

      map.current.addLayer({
        id: 'curriculum-labels',
        type: 'symbol',
        source: 'curriculums',
        layout: {
          'text-field': ['get', 'school'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 2, 9, 6, 11, 12, 13],
          'text-offset': [0, 1.8],
          'text-anchor': 'top',
          'text-max-width': 10
        },
        paint: {
          'text-color': 'rgba(255, 255, 255, 0.9)',
          'text-halo-color': 'rgba(0, 20, 40, 0.9)',
          'text-halo-width': 2,
          'text-halo-blur': 1
        }
      });

      // Click handler
      map.current.on('click', 'curriculum-pins', (e: any) => {
        if (rotationRef.current) {
          cancelAnimationFrame(rotationRef.current);
          rotationRef.current = null;
        }

        const feature = e.features[0];
        const curriculum = curriculums.find(c => c.id === feature.properties.id);

        if (curriculum && map.current) {
          setSelectedCurriculum(curriculum);
          map.current.flyTo({
            center: feature.geometry.coordinates,
            zoom: 10,
            pitch: 60,
            duration: 1500
          });
        }
      });

      // Cursor changes
      map.current.on('mouseenter', 'curriculum-pins', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'curriculum-pins', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      setIsLoaded(true);
    });

    // Slow rotation animation
    const rotateGlobe = () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      center.lng -= 0.008;
      map.current.setCenter(center);
      rotationRef.current = requestAnimationFrame(rotateGlobe);
    };

    const startRotation = setTimeout(() => {
      rotateGlobe();
    }, 2000);

    const stopRotation = () => {
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current);
        rotationRef.current = null;
      }
    };

    map.current.on('mousedown', stopRotation);
    map.current.on('wheel', stopRotation);
    map.current.on('touchstart', stopRotation);

    return () => {
      clearTimeout(startRotation);
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const closePopup = () => {
    setSelectedCurriculum(null);
  };

  const resetView = () => {
    setSelectedCurriculum(null);
    setActiveFilter(null);

    if (map.current && isLoaded) {
      const source = map.current.getSource('curriculums') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(curriculumsGeoJSON as any);
      }

      map.current.flyTo({
        center: [20, 30],
        zoom: 2.5,
        pitch: 45,
        bearing: 0,
        duration: 2000
      });
    }
  };

  const displayedCount = activeFilter ? activeFilter.length : curriculums.length;

  return (
    <div className="app">
      <div ref={mapContainer} className="map-container" />

      {!isLoaded && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span>Initializing Globe...</span>
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <h1>OpenCurriculum</h1>
          <span className="header-divider"></span>
          <p>Global Curriculum Platform</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{displayedCount}</span>
            <span className="stat-label">{activeFilter ? 'Matches' : 'Curriculums'}</span>
          </div>
          <div className="stat">
            <span className="stat-value">{new Set(curriculums.map(c => c.location.country)).size}</span>
            <span className="stat-label">Countries</span>
          </div>
          <div className="stat">
            <span className="stat-value">{(curriculums.reduce((a, c) => a + c.students, 0) / 1000).toFixed(1)}K</span>
            <span className="stat-label">Students</span>
          </div>
        </div>
      </header>

      <VoiceControl onResults={handleVoiceResults} />

      {activeFilter && (
        <button className="clear-filter-btn" onClick={resetView}>
          Clear Filter ({activeFilter.length} shown)
        </button>
      )}

      <CurriculumPopup
        curriculum={selectedCurriculum}
        onClose={closePopup}
        comparisonList={comparisonList}
        activeComparisonTab={activeComparisonTab}
        setActiveComparisonTab={setActiveComparisonTab}
        addToComparison={addToComparison}
        removeFromComparison={removeFromComparison}
        isInComparison={isInComparison}
        allCurriculums={curriculums}
        router={router}
      />

      <TalentMigration
        map={map.current}
        isMapLoaded={isLoaded}
      />
    </div>
  );
}
