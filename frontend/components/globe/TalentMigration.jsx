import { useEffect, useRef, useState, useCallback } from 'react';
import { MigrationService } from '@/services/migration';
import { gsap } from 'gsap';
import './TalentMigration.css';

/**
 * TalentMigration - Visualizes intellectual capital migration from tech hubs to emerging cities
 * Features:
 * - 3D arcs connecting source hubs to emerging hubs
 * - Animated flow effects along migration paths
 * - Dynamic city glow based on FII scores
 * - Temporal scrubbing (2026-2035)
 */
function TalentMigration({ map, isMapLoaded }) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2035);
  const [isActive, setIsActive] = useState(false);
  const [arcSources, setArcSources] = useState([]);
  const animationRef = useRef(null);
  const timelineRef = useRef(null);

  // Load forecast data
  useEffect(() => {
    if (isMapLoaded && isActive) {
      loadForecastData();
    }
  }, [isMapLoaded, isActive]);

  // Update visualization when year changes
  useEffect(() => {
    if (forecastData && map && isMapLoaded && isActive) {
      updateVisualization(selectedYear);
    }
  }, [selectedYear, forecastData, map, isMapLoaded, isActive]);

  const loadForecastData = async () => {
    setLoading(true);
    try {
      const data = await MigrationService.getTalentMigrationForecast();
      setForecastData(data);
      initializeVisualization(data);
    } catch (error) {
      console.error('Failed to load migration forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize Mapbox GL visualization with arcs and city markers
   */
  const initializeVisualization = useCallback((data) => {
    if (!map || !data) return;

    // Create GeoJSON for migration arcs
    const arcsGeoJSON = {
      type: 'FeatureCollection',
      features: data.migration_paths.map((path, index) => {
        // Create great circle arc between source and destination
        const arc = createGreatCircleArc(
          path.source.coordinates,
          path.destination.coordinates
        );

        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: arc
          },
          properties: {
            id: `arc-${index}`,
            source: path.source.city,
            destination: path.destination.city,
            strength: path.strength,
            color: path.color,
            sourceFII: path.source.fii_2035,
            destFII: path.destination.fii_2035,
            destAttractiveness: path.destination.attractiveness_2035
          }
        };
      })
    };

    // Create arrow markers along arcs
    const arrowsGeoJSON = {
      type: 'FeatureCollection',
      features: data.migration_paths.flatMap((path, pathIndex) => {
        const arc = createGreatCircleArc(
          path.source.coordinates,
          path.destination.coordinates
        );
        
        // Place arrows at 30%, 50%, 70% along the path
        const arrowPositions = [0.3, 0.5, 0.7];
        return arrowPositions.map((fraction, arrowIndex) => {
          const pointIndex = Math.floor(fraction * (arc.length - 1));
          const point = arc[pointIndex];
          const nextPoint = arc[Math.min(pointIndex + 1, arc.length - 1)];
          
          // Calculate bearing (direction) for arrow rotation
          const bearing = calculateBearing(point, nextPoint);
          
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: point
            },
            properties: {
              id: `arrow-${pathIndex}-${arrowIndex}`,
              bearing: bearing,
              color: path.color,
              strength: path.strength
            }
          };
        });
      })
    };

    // Create GeoJSON for city markers
    const citiesGeoJSON = {
      type: 'FeatureCollection',
      features: [
        ...data.source_hubs.map(hub => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: hub.coordinates
          },
          properties: {
            id: `city-${hub.city}`,
            city: hub.city,
            country: hub.country,
            type: 'source',
            fii_2035: hub.fii_forecast.forecast[9].fii,
            curriculum_velocity: hub.curriculum_velocity
          }
        })),
        ...data.emerging_hubs.map(hub => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: hub.coordinates
          },
          properties: {
            id: `city-${hub.city}`,
            city: hub.city,
            country: hub.country,
            type: 'emerging',
            fii_2035: hub.fii_forecast.forecast[9].fii,
            attractiveness_2035: hub.attractiveness.attractiveness_forecast[9].attractiveness,
            curriculum_velocity: hub.curriculum_velocity
          }
        }))
      ]
    };

    // Add arc source
    if (!map.getSource('migration-arcs')) {
      map.addSource('migration-arcs', {
        type: 'geojson',
        data: arcsGeoJSON,
        lineMetrics: true // Enable line metrics for gradient
      });

      // Add arc layer with gradient (base layer)
      map.addLayer({
        id: 'migration-arcs',
        type: 'line',
        source: 'migration-arcs',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': [
            'interpolate',
            ['linear'],
            ['get', 'strength'],
            0.2, 1.5,
            1, 3.5
          ],
          'line-opacity': 0.85,
          'line-blur': 2
        }
      }, 'curriculum-labels'); // Insert before curriculum labels

      // Add animated flow layer (dashed line that moves)
      map.addLayer({
        id: 'migration-arcs-flow',
        type: 'line',
        source: 'migration-arcs',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': [
            'interpolate',
            ['linear'],
            ['get', 'strength'],
            0.2, 1,
            1, 2.5
          ],
          'line-opacity': 1,
          'line-dasharray': [2, 2],
          'line-dasharray-transition': { duration: 0 }
        }
      }, 'migration-arcs'); // Insert after base arc layer

      // Add arrow markers source
      if (!map.getSource('migration-arrows')) {
        map.addSource('migration-arrows', {
          type: 'geojson',
          data: arrowsGeoJSON
        });

        // Create arrow icon as SVG (right-pointing arrow)
        const arrowSvg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M 2 12 L 18 12 M 18 12 L 12 6 M 18 12 L 12 18" 
                stroke="currentColor" 
                stroke-width="3" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                fill="none"/>
        </svg>`;
        
        const arrowDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(arrowSvg);
        
        map.loadImage(arrowDataUrl, (error, image) => {
          if (error) {
            console.error('Error loading arrow image:', error);
            return;
          }
          
          if (!map.hasImage('arrow-icon')) {
            map.addImage('arrow-icon', image);
          }

          // Add arrow symbol layer
          map.addLayer({
            id: 'migration-arrows',
            type: 'symbol',
            source: 'migration-arrows',
            layout: {
              'icon-image': 'arrow-icon',
              'icon-size': [
                'interpolate',
                ['linear'],
                ['get', 'strength'],
                0.2, 0.5,
                1, 1.0
              ],
              'icon-rotate': ['get', 'bearing'],
              'icon-rotation-alignment': 'map',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            },
            paint: {
              'icon-color': ['get', 'color'],
              'icon-opacity': 0.95
            }
          }, 'migration-arcs-flow');
        });
      } else {
        map.getSource('migration-arrows').setData(arrowsGeoJSON);
      }
    } else {
      map.getSource('migration-arcs').setData(arcsGeoJSON);
      if (map.getSource('migration-arrows')) {
        map.getSource('migration-arrows').setData(arrowsGeoJSON);
      }
    }

    // Add city markers source
    if (!map.getSource('migration-cities')) {
      map.addSource('migration-cities', {
        type: 'geojson',
        data: citiesGeoJSON
      });

      // Source hub markers (red/orange)
      map.addLayer({
        id: 'migration-cities-source',
        type: 'circle',
        source: 'migration-cities',
        filter: ['==', ['get', 'type'], 'source'],
        paint: {
          'circle-color': '#ff6b6b',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'fii_2035'],
            0, 2,
            100, 6
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ff4757',
          'circle-stroke-opacity': 1
        }
      });

      // Emerging hub markers (cyan/purple gradient based on attractiveness)
      map.addLayer({
        id: 'migration-cities-emerging',
        type: 'circle',
        source: 'migration-cities',
        filter: ['==', ['get', 'type'], 'emerging'],
        paint: {
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'attractiveness_2035'],
            0, '#00ffff',
            50, '#7c3aed',
            100, '#a855f7'
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'attractiveness_2035'],
            0, 2.5,
            100, 8
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': [
            'interpolate',
            ['linear'],
            ['get', 'attractiveness_2035'],
            0, '#00ffff',
            100, '#a855f7'
          ],
          'circle-stroke-opacity': 1
        }
      });

      // City labels
      map.addLayer({
        id: 'migration-cities-labels',
        type: 'symbol',
        source: 'migration-cities',
        layout: {
          'text-field': ['get', 'city'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': 12,
          'text-offset': [0, 2],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      }, 'curriculum-labels'); // Insert before curriculum labels
    } else {
      map.getSource('migration-cities').setData(citiesGeoJSON);
    }

    setArcSources(['migration-arcs', 'migration-arcs-flow']);
    startFlowAnimation();
  }, [map]);

  /**
   * Calculate bearing between two points
   */
  const calculateBearing = (start, end) => {
    const startLat = start[1] * Math.PI / 180;
    const startLng = start[0] * Math.PI / 180;
    const endLat = end[1] * Math.PI / 180;
    const endLng = end[0] * Math.PI / 180;

    const dLng = endLng - startLng;
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - 
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  /**
   * Create great circle arc between two points, ALWAYS taking the longer route around the globe
   */
  const createGreatCircleArc = (start, end, numPoints = 200) => {
    const arc = [];
    const startLng = start[0];
    const startLat = start[1];
    const endLng = end[0];
    const endLat = end[1];

    // Convert to radians
    const lat1 = startLat * Math.PI / 180;
    const lng1 = startLng * Math.PI / 180;
    const lat2 = endLat * Math.PI / 180;
    const lng2 = endLng * Math.PI / 180;

    // Calculate the shorter great circle distance
    const shorterDistance = Math.acos(
      Math.max(-1, Math.min(1, 
        Math.sin(lat1) * Math.sin(lat2) + 
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
      ))
    );
    
    // ALWAYS use the longer route (complement of shorter distance)
    const longerDistance = 2 * Math.PI - shorterDistance;

    // Calculate the midpoint of the SHORTER arc
    const midShorterLat = Math.asin(
      (Math.sin(lat1) + Math.sin(lat2)) / 
      (2 * Math.cos(shorterDistance / 2))
    );
    const midShorterLng = lng1 + Math.atan2(
      Math.cos(lat2) * Math.sin(lng2 - lng1),
      Math.cos(lat1) + Math.cos(lat2) * Math.cos(lng2 - lng1)
    );

    // The midpoint of the LONGER arc is the antipodal point of the shorter arc's midpoint
    const midLongerLat = -midShorterLat;
    let midLongerLng = midShorterLng + Math.PI;
    if (midLongerLng > Math.PI) midLongerLng -= 2 * Math.PI;
    if (midLongerLng < -Math.PI) midLongerLng += 2 * Math.PI;

    // Interpolate along the longer arc by going through the longer midpoint
    for (let i = 0; i <= numPoints; i++) {
      const fraction = i / numPoints;
      let lat, lng;
      
      if (fraction <= 0.5) {
        // First half: start to midpoint of longer arc
        const t = fraction * 2; // 0 to 1 for first half
        const distToMid = longerDistance / 2;
        const a = Math.sin((1 - t) * distToMid) / Math.sin(distToMid);
        const b = Math.sin(t * distToMid) / Math.sin(distToMid);
        
        const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(midLongerLat) * Math.cos(midLongerLng);
        const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(midLongerLat) * Math.sin(midLongerLng);
        const z = a * Math.sin(lat1) + b * Math.sin(midLongerLat);
        
        lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
        lng = Math.atan2(y, x) * 180 / Math.PI;
      } else {
        // Second half: midpoint to end
        const t = (fraction - 0.5) * 2; // 0 to 1 for second half
        const distFromMid = longerDistance / 2;
        const a = Math.sin((1 - t) * distFromMid) / Math.sin(distFromMid);
        const b = Math.sin(t * distFromMid) / Math.sin(distFromMid);
        
        const x = a * Math.cos(midLongerLat) * Math.cos(midLongerLng) + b * Math.cos(lat2) * Math.cos(lng2);
        const y = a * Math.cos(midLongerLat) * Math.sin(midLongerLng) + b * Math.cos(lat2) * Math.sin(lng2);
        const z = a * Math.sin(midLongerLat) + b * Math.sin(lat2);
        
        lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
        lng = Math.atan2(y, x) * 180 / Math.PI;
      }
      
      // Normalize longitude to -180 to 180 range
      while (lng > 180) lng -= 360;
      while (lng < -180) lng += 360;
      
      arc.push([lng, lat]);
    }

    return arc;
  };

  /**
   * Start animated flow effect along arcs
   */
  const startFlowAnimation = () => {
    if (!map || !arcSources.length) return;

    let offset = 0;
    let direction = 1;
    
    const animate = () => {
      offset = (offset + 0.02 * direction) % 2;
      if (offset < 0) offset = 2 + offset;
      
      if (map.getLayer('migration-arcs-flow')) {
        // Animate dash array to create flowing effect
        const dashLength = 4;
        map.setPaintProperty('migration-arcs-flow', 'line-dasharray', [
          offset * dashLength,
          dashLength,
          (2 - offset) * dashLength,
          dashLength
        ]);
        
        // Pulse opacity for more visible effect
        const pulse = 0.7 + Math.sin(Date.now() / 1000) * 0.2;
        map.setPaintProperty('migration-arcs-flow', 'line-opacity', pulse);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  /**
   * Update visualization based on selected year
   */
  const updateVisualization = useCallback((year) => {
    if (!map || !forecastData) return;

    const yearIndex = year - 2026;
    
    // Update city glow based on FII for selected year
    if (map.getLayer('migration-cities-emerging')) {
      // Update opacity based on FII progression
      const baseOpacity = 0.6 + (yearIndex / 10) * 0.3; // Increase over time
      
      map.setPaintProperty('migration-cities-emerging', 'circle-opacity', baseOpacity);
      map.setPaintProperty('migration-cities-emerging', 'circle-stroke-opacity', baseOpacity);
    }

    // Update arc opacity based on year (stronger migration in later years)
    if (map.getLayer('migration-arcs')) {
      const arcOpacity = 0.7 + (yearIndex / 10) * 0.25;
      map.setPaintProperty('migration-arcs', 'line-opacity', arcOpacity);
    }

    // Smooth transition using GSAP
    gsap.to({}, {
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => {
        // Additional smooth transitions can be added here
      }
    });
  }, [map, forecastData]);

  /**
   * Toggle migration visualization
   */
  const toggleMigration = () => {
    if (!isActive) {
      setIsActive(true);
    } else {
      // Remove layers
      if (map) {
        ['migration-arcs', 'migration-arcs-flow', 'migration-arrows', 'migration-cities-source', 
         'migration-cities-emerging', 'migration-cities-labels'].forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        });
        ['migration-arcs', 'migration-arrows', 'migration-cities'].forEach(sourceId => {
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        });
        // Remove arrow icon if it exists
        if (map.hasImage('arrow-icon')) {
          map.removeImage('arrow-icon');
        }
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      setIsActive(false);
      setForecastData(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!isMapLoaded) return null;

  return (
    <div className="talent-migration-panel">
      <button 
        className={`migration-toggle ${isActive ? 'active' : ''}`}
        onClick={toggleMigration}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
        {isActive ? 'Hide' : 'Show'} Talent Migration
      </button>

      {isActive && (
        <div className="migration-controls">
          {loading ? (
            <div className="migration-loading">
              <div className="loading-spinner-small"></div>
              <span>Calculating migration forecast...</span>
            </div>
          ) : forecastData ? (
            <>
              <div className="migration-header">
                <h3>Talent Migration Forecast</h3>
                <p className="migration-subtitle">
                  Intellectual capital flow from tech hubs to emerging cities
                </p>
              </div>

              <div className="timeline-control">
                <label className="timeline-label">
                  Year: <span className="year-value">{selectedYear}</span>
                </label>
                <input
                  type="range"
                  min="2026"
                  max="2035"
                  value={selectedYear}
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value);
                    setSelectedYear(newYear);
                  }}
                  className="timeline-slider"
                />
                <div className="timeline-markers">
                  <span>2026</span>
                  <span>2035</span>
                </div>
              </div>

              <div className="migration-stats">
                <div className="stat-item">
                  <span className="stat-label">Source Hubs</span>
                  <span className="stat-value">{forecastData.source_hubs.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Emerging Hubs</span>
                  <span className="stat-value">{forecastData.emerging_hubs.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Migration Paths</span>
                  <span className="stat-value">{forecastData.migration_paths.length}</span>
                </div>
              </div>

              <div className="migration-legend">
                <div className="legend-item">
                  <div className="legend-color source"></div>
                  <span>Source Hub (Saturated)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color emerging"></div>
                  <span>Emerging Hub (Brain Gain)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-arc"></div>
                  <span>Migration Flow (Cyan → Purple)</span>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default TalentMigration;

