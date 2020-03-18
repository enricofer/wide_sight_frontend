# wide_sight_frontend

Widesight frontend for browsing and extracting informations from a [widesight panorama service](https://github.com/enricofer/wide_sight)

![nn](https://raw.githubusercontent.com/enricofer/wide_sight_frontend/docs/Peek_browse.gif)



## Build setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## Configure

The VUEjs app define a new wide-sight html tag as a widesight panorama viewer within the html page.

The viewer needs to be configured with the following parameters:

- backend: a widesight backend server url endpoint: https://github.com/enricofer/wide_sight

- apikey: a valid api key: https://app.swaggerhub.com/apis-docs/enricofer/Widesight/1.0.0#/apikeys/apikeys_list

- panokey: a valid start panorama image to view: https://app.swaggerhub.com/apis-docs/enricofer/Widesight/1.0.0#/panoramas/panoramas_list

- overlay (options): a geojson overlay to render over the panorama image

```http
<html>
  <head>
    <title>wide_sight_frontend</title>
    <style>
    wide-sight {
      width:600px;
      height:400px;
    }
    </style>
  </head>
  <body>
    <wide-sight
        backend="http://localhost:8080"
        apikey="3788e7c9-ace9-4fb6-95b9-db6170b6286f"
        panokey="6d5e2b70-8517-44a8-acd5-e7c12e00272a"
        overlay="https://beato.duckdns.org:8443/static/test.geo.json">
    </wide-sight>
  </body>
</html>
```

## Viewer features

![](https://raw.githubusercontent.com/enricofer/wide_sight_frontend/docs/widesight_frontend_features.png)



### Browse panoramas

Click on yellow spots to browse panoramas

![](https://raw.githubusercontent.com/enricofer/wide_sight_frontend/docs/Peek_browse.gif)



### Viewer options

click on settings button to configure viewer elements visibility

![](https://raw.githubusercontent.com/enricofer/wide_sight_frontend/docs/Peek_settings.gif)



### Tag image

Click on tag button to enable polygon tagging on panorama

![](https://raw.githubusercontent.com/enricofer/wide_sight_frontend/docs/Peek_tag.gif)



### Geolocate map spots on image

Double click on image to insert a geolocated map spot

![](https://raw.githubusercontent.com/enricofer/wide_sight_frontend/docs/Peek_spot.gif)



### Tune panorama visual parameters

Click on tuning icon to rule panorama visual parameters (location, height from ground, pitch, roll)for improving geolocation accurancy

![](https://raw.githubusercontent.com/enricofer/wide_sight_frontend/docs/Peek_tune.gif)




