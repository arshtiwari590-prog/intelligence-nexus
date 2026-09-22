import React, { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';

export function MapContainer({ center, liveFeeds, selectedEntity }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    // Initialize Cesium viewer
    Cesium.Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_TOKEN || '';

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrainProvider: Cesium.createWorldTerrain(),
      imageryProvider: Cesium.ArcGisMapServerImageryProvider.fromUrl(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
      ),
      baseLayerPicker: true,
      fullscreenButton: true,
      vrButton: false,
      geocoder: true,
      homeButton: true,
      infoBox: true,
      sceneModePicker: true,
      selectionIndicator: true,
      timeline: false,
      animation: false,
      rightClickMenu: false,
      clockViewModel: new Cesium.ClockViewModel()
    });

    viewer.scene.globe.enableLighting = true;
    viewer.scene.postProcessStages.add(Cesium.PostProcessStageLibrary.createOutlinePostProcessStage());

    viewerRef.current = viewer;

    // Render live aircraft
    if (liveFeeds.aircraft && liveFeeds.aircraft.length > 0) {
      liveFeeds.aircraft.forEach(aircraft => {
        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            aircraft.longitude,
            aircraft.latitude,
            aircraft.altitude
          ),
          model: {
            uri: Cesium.Model.fromGltf({
              url: 'https://cesiumjs.org/public/Models/CesiumAir/Cesium_Air.glb'
            }),
            scale: 1.0
          },
          properties: {
            type: 'aircraft',
            callsign: aircraft.callsign,
            speed: aircraft.speed,
            heading: aircraft.heading
          },
          label: {
            text: aircraft.callsign,
            font: '12px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2
          }
        });

        // Draw trail
        const positions = [];
        aircraft.trajectory?.forEach(point => {
          positions.push(Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.alt));
        });

        if (positions.length > 1) {
          viewer.entities.add({
            polyline: {
              positions: positions,
              width: 2,
              material: Cesium.Color.CYAN,
              clampToGround: false
            }
          });
        }
      });
    }

    // Render live vessels
    if (liveFeeds.vessels && liveFeeds.vessels.length > 0) {
      liveFeeds.vessels.forEach(vessel => {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(vessel.longitude, vessel.latitude),
          point: {
            pixelSize: 10,
            color: Cesium.Color.BLUE,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2
          },
          properties: {
            type: 'vessel',
            mmsi: vessel.mmsi,
            name: vessel.name,
            speed: vessel.speed,
            course: vessel.course
          },
          label: {
            text: vessel.name,
            font: '10px sans-serif',
            fillColor: Cesium.Color.YELLOW,
            pixelOffset: new Cesium.Cartesian2(0, -15)
          }
        });
      });
    }

    // Highlight selected entity
    if (selectedEntity) {
      if (selectedEntity.latitude && selectedEntity.longitude) {
        const position = Cesium.Cartesian3.fromDegrees(
          selectedEntity.longitude,
          selectedEntity.latitude,
          selectedEntity.altitude || 0
        );

        viewer.entities.add({
          position: position,
          point: {
            pixelSize: 15,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 3
          }
        });

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            selectedEntity.longitude,
            selectedEntity.latitude,
            500000
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-60.0),
            roll: 0.0
          }
        });
      }

      // Show related facilities
      if (selectedEntity.facilities) {
        selectedEntity.facilities.forEach(facility => {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              facility.longitude,
              facility.latitude
            ),
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray([
                facility.longitude - 0.01, facility.latitude - 0.01,
                facility.longitude + 0.01, facility.latitude - 0.01,
                facility.longitude + 0.01, facility.latitude + 0.01,
                facility.longitude - 0.01, facility.latitude + 0.01
              ]),
              material: Cesium.Color.RED.withAlpha(0.5),
              outline: true,
              outlineColor: Cesium.Color.RED
            },
            label: {
              text: facility.name,
              font: '12px sans-serif',
              fillColor: Cesium.Color.WHITE
            }
          });
        });
      }
    } else {
      // Default view
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(center[1], center[0], 15000000),
        duration: 0.5
      });
    }

    // Mouse hover for info
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement) => {
      const pickedObject = viewer.scene.pick(movement.endPosition);
      if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
        const entity = pickedObject.id;
        console.log('Entity details:', entity.properties);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [liveFeeds, selectedEntity, center]);

  return (
    <div 
      ref={containerRef} 
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
}
