import {Component, NgZone}                                                from '@angular/core';
import {circle, geoJSON, icon, latLng, Layer, marker, polygon, tileLayer} from 'leaflet';
import * as L                                                             from 'leaflet';
import {OpenStreetMapProvider}                                            from 'leaflet-geosearch';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent
{

  title = 'Bank Maps Solutions';

  layerGrid = L.tileLayer.wms('http://sedac.ciesin.columbia.edu/geoserver/wms', {
    layers: 'foreground-lines',
    format: 'image/png',
    transparent: true
  });

  dataLayer = L.tileLayer.wms('http://sedac.ciesin.columbia.edu/geoserver/wms', {
    layers: 'sdei:sdei-global-annual-avg-pm2-5-modis-misr-seawifs-aod-1998-2012_2010-2012',
    format: 'image/png',
    transparent: true,
    opacity: 0.6,
    attribution: 'SEDAC'
  });

  markers = [this.dataLayer, this.layerGrid];

  searchProvider = new OpenStreetMapProvider();

  constructor(private zone: NgZone)
  {
  }

  // Open Street Map and Open Cycle Map definitions
  LAYER_OCM = {
    id: 'opencyclemap',
    name: 'Open Cycle Map',
    enabled: true,
    layer: tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
      maxZoom: 12,
      attribution: 'Open Cycle Map'
    })

  };
  LAYER_OSM = {
    id: 'openstreetmap',
    name: 'Open Street Map',
    enabled: false,
    layer: tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Open Street Map'
    })
  };

  circle  = {
    id: 'circle',
    name: 'Circle',
    enabled: true,
    layer: circle([46.95, -122], {radius: 5000})
  };
  polygon = {
    id: 'polygon',
    name: 'Polygon',
    enabled: true,
    layer: polygon([[46.8, -121.85], [46.92, -121.92], [46.87, -121.8]])
  };
  square  = {
    id: 'square',
    name: 'Square',
    enabled: true,
    layer: polygon([[46.8, -121.55], [46.9, -121.55], [46.9, -121.7], [46.8, -121.7]])
  };
  marker  = {
    id: 'marker',
    name: 'Marker',
    enabled: true,
    layer: marker([46.879966, -121.726909], {
      icon: icon({
        iconSize: [25, 41],
        iconAnchor: [13, 41],
        iconUrl: '../assets/marker-icon.png',
        shadowUrl: '../assets/marker-shadow.png'
      })
    })
  };
  geoJSON = {
    id: 'geoJSON',
    name: 'Geo JSON Polygon',
    enabled: true,
    layer: geoJSON(
      ({
        type: 'Polygon',
        coordinates: [[
          [-121.6, 46.87],
          [-121.5, 46.87],
          [-121.5, 46.93],
          [-121.6, 46.87]
        ]]
      }) as any,
      {style: () => ({color: '#ff7800'})})
  };

  baseLayers = {
    'Open Street Map': this.LAYER_OSM.layer,
    'Open Cycle Map': this.LAYER_OCM.layer
  };

  // Values to bind to Leaflet Directive
  layers: Layer[] = [...this.markers];

  // Values to bind to Leaflet Directive
  layersControlOptions = {
    position: 'bottomright',
    baseLayers: this.baseLayers,
    overlays: {
      Circle: this.circle.layer,
      Square: this.square.layer,
      Polygon: this.polygon.layer,
      Marker: this.marker.layer,
      GeoJSON: this.geoJSON.layer
    }
  };
  overlays =[ this.circle, this.polygon, this.square, this.marker, this.geoJSON ];

  apply(layer) {

    // Get the active base layer
    const baseLayer = this.overlays.find((l: any) => (l.id === layer.id));

    // Get all the active overlay layers
    const newLayers = this.overlays
                          .filter((l: any) => l.enabled)
                          .map((l: any) => l.layer);
    newLayers.unshift(baseLayer.layer);

    this.layers = newLayers;

    return false;
  }

  options = {
    zoom: 2,
    center: latLng(46.879966, -121.726909),
    timeDimension: true,
    timeDimensionControl: true
  };

  searchText: string = '';
  searchResults      = [];

  async search(value)
  {
    this.searchResults = await this.searchProvider.search({query: value});
  }

  addMarker(item)
  {
    console.log(item);

    const newMarker = marker(
      [item.raw.lat, item.raw.lon],
      {
        icon: icon({
          iconSize: [25, 41],
          iconAnchor: [13, 41],
          iconUrl: '../assets/marker-icon.png',
          shadowUrl: '../assets/marker-shadow.png'
        })
      }
    ).on('click', () =>
    {
      this.zone.run(() => this.onMarkerClick(item));
    }).bindPopup('<p>' + item.label + '</p>');

    this.layers.push(newMarker);
  }

  onMarkerClick(marker)
  {
    console.log('clicked on marker:', marker);
  }
}
