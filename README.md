# Geoshop Frontend

This is meant to work with a geoshop-backend: https://github.com/camptocamp/geoshop-back

## Requirements

 * Node >= 18
 * @angular/cli
 * typescript

## Running

### Preparing the config:
Copy the config template and adapt it as needed. Do not

```sh
cp .env.sample .env
set -a
source .env
set +a
envsubst < src/assets/configs/config.json.tmpl > src/assets/configs/config.json

```

**TODO work with env variables or somthing similar!**

#### Some values to note:

- `apiUrl` : URL to the BE/API
- `defaultCenter` : sets the initial center of the map on the langing page
- `initialExten` : the extent used for the calculation of the tiels. If this is changed the `resolutions` and the logic for the calcualtion of the `MatrixId` for the tile requets needs to be adapted as well. Currentli this is a BBox that is somewhat larger than the BBox of Switzerland.
- `basemaps` : configure the base maps that can be selected
- `mediaUrl` : if set to an empty string it will not be used. Instead the media/metadata will require a full functional URL

### Auth configuration
| Variable          | Example                                   | Description                                           |
| ----------------- | ----------------------------------------- | ----------------------------------------------------- |
| OIDC_OP_BASE_URL  | https://geoshop-demo-abcdef.zitadel.cloud | Your Zitadel instance url                             |
| OIDC_RP_CLIENT_ID | 123456789098765432                        | The Client ID you copied when creating the application |

### Start the application:

```sh
npm run build
npm start
```
And navigate to [http://localhost:4200](http://localhost:4200)


## With Docker:


An `.env.sample` is provided as an example.
