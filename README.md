# Geoshop Frontend

This is meant to work with a geoshop-backend: https://github.com/sitn/geoshop-back

## Requirements

 * Node >= 18
 * @angular/cli
 * typescript

## Getting started without Docker

```sh
npm i
```
### Config settings:
Copy the config template and adapt it as needed

```sh
cp src\assets\configs\config.json.tmpl src\assets\configs\config.json
```

**TODO work with env variables or somthing similar!**

#### Some values to note:

- `apiUrl` : URL to the BE/API
- `defaultCenter` : sets the initial center of the map on the langing page
- `initialExten` : the extent used for the calculation of the tiels. If this is changed the `resolutions` and the logic for the calcualtion of the `MatrixId` for the tile requets needs to be adapted as well. Currentli this is a BBox that is somewhat larger than the BBox of Switzerland.
- `basemaps` : configure the base maps that can be selected
- `mediaUrl` : if set to an empty string it will not be used. Instead the media/metadata will require a full functional URL

### Start the application:

```sh
npm start
```
**OR**
```sh
ng serve
```

## With Docker:

**TODO: is not tested!**

An `.env.sample` is provided as an example.


## TODO:

- [ ] There are three forms that are used that are similar and re use a lot of the same code. Unify them into one comonent. The forms are:

	- geoshop-front/src/app/auth/register/register.component.html
	- geoshop-front/src/app/account/profile/modify-profile.component.html
	- geoshop-front/src/app/account/new-order/new-order.component.html

- [ ] Update deprecated external libraries

- [ ] Add translation files for translation into german

- [ ] Make the TVA number a variable that is set in the top level settings or from the DB - perhaps together with the BE
