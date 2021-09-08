<div align="center">
  <h1><img src="static/logo.svg" width="30"> Boost Note Local</h1>
</div>

Standalone app separated from Boost Note for better local space support. See [Roadmap](https://github.com/BoostIO/BoostNote.next-local/discussions/43).

> ## Boost Note
>
> If you want a collaborative app, please try Boost Note.(https://github.com/BoostIO/BoostNote-App)
>
> ![uiimage](./static/img_ui.png)
>
> <h2 align='center'>A collaborative real-time markdown note app for developer teams</h2>
>
> ## Support Platform
>
> - [Web app](https://boostnote.io)
> - [Desktop app](https://boostnote.io/#download)
> - [iOS app](https://apps.apple.com/gb/app/boost-note-mobile/id1576176505)
> - [Android app](https://play.google.com/store/apps/details?id=com.boostio.boostnote2021)

## Authors & Maintainers

- [Rokt33r](https://github.com/rokt33r)
- [Komediruzecki](https://github.com/Komediruzecki) ([buy me a coffee](https://www.buymeacoffee.com/komediruzecki))

## Community

- [Discussions Forum (New!)](https://github.com/BoostIO/BoostNote.next-local/discussions)
- [Twitter](https://twitter.com/boostnoteapp)
- [Slack Group](https://join.slack.com/t/boostnote-group/shared_invite/zt-cun7pas3-WwkaezxHBB1lCbUHrwQLXw)
- [Blog](https://medium.com/boostnote)
- [Reddit](https://www.reddit.com/r/Boostnote/)

## Development

### Folder structure

- `dist` : Bundled electron app stuff. All executable and installable of the electron app are generated in this folder. You can generate this by `npm run prepack`, `npm run pack`, and `npm run release` scripts.
- `compiled` : Compiled web app resources from `npm run build` script. The resources are for deploying the web app.
- `electron` : Compiled electron resources from `npm run build:electron` script. You can run it by `npm start` script. The resources are for packaging the electron app.
- `src` : Source code.

### Build

Please copy `.env.default` file and create a file named `.env` in the root of the project directory, or the build will fail.

#### Electron app

```sh
# Install dependencies
npm i

# Run webpack
npm run dev:webpack

# Run electron (You have to open another terminal to run this)
npm run dev:electron
```

> For Windows users, If `npm run dev:electron` doesn't spawn an electron window, please try again after removing `%APPDATA%\electron` directory.

## License

[GPL-3.0 © 2016 - 2021 BoostIO](./LICENSE.md)
