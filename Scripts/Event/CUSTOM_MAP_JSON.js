var config = {
	"Default": {
 		"operationalLayer": [{
 			"operationalLayerURL": "https://arcgisserver.dev.accela.com/arcgis/rest/services/Metropolis/FeatureServer/24",
 			"operationalLaerUIDField": "ID",
 			"operationalLayerOBJECTIDField": "OBJECTID",
 			"operationalLayerTitle": "Centerlines",
 			"operationalLayerOutFields": [
 				"*"
 			]
 		}],
 		"showWidgetsLocate": true,
 		"showWidgetsHome": true,
 		"showWidgetsSearch": true,
 		"showWidgetsBasemap": true,
 		"geocodingService": {
 			"geolocator": [{
 				"name": "ArcGIS World Geocoding Service",
 				"url": "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
 				"singleLineFieldName": "SingleLine",
 				"outFields": [
 					"Addr_type"
 				],
 				"exactMatch": true,
 				"placeholder": "Enter an address"
 			}]
 		},
 		"accelaDataFieldToStoreUID": "CenterlineIds",
 		"accelaDataFieldToStoreDisplayFeatureInformaiton": "RoadNames",
 		"baseMaps": {
 			"useEsriBasemaps": true,
 			"defaultEsriBasemap": "streets-vector"
 		}
 	},
    "DEQ Complaint":{
        "operationalLayer": [
          {
            "operationalLayerURL": "https://gis.southamptontownny.gov/gisserver/rest/services/DataServices/LandManager/MapServer/2",
            "operationalLaerUIDField": "TOWNS_ID",
            "operationalLayerOBJECTIDField": "OBJECTID",
            "operationalLayerTitle": "Towns",
            "operationalLayerOutFields": [
              "*"
            ]
          }
        ],
        "showWidgetsLocate": true,
        "showWidgetsHome": true,
        "showWidgetsSearch": true,
        "showWidgetsBasemap": true,
        "geocodingService": {
          "geolocator": [
            {
              "name": "ArcGIS World Geocoding Service",
              "url": "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
              "singleLineFieldName": "SingleLine",
              "outFields": [
                "Addr_type"
              ],
              "exactMatch": true,
              "placeholder": "Enter an address"
            }
          ]
        },
        "accelaDataFieldToStoreUID": "Lat Long",
        "accelaDataFieldToStoreDisplayFeatureInformaiton": "Lat Long",
        "accelaDataFieldToStoreXCoord": "Latitude",
        "accelaDataFieldToStoreYCoord": "Longitude",
        "baseMaps": {
          "useEsriBasemaps": true,
          "defaultEsriBasemap": "streets-vector"
        },
        "mapType": "createPoint"
    }
  }
 aa.env.setValue("map_config", config);