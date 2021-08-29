## Setup
You can help contribute to BoostNote.next-local by following these steps:

Make sure you have a working installation of `npm` and `git`. Run `npm -v` and `git --version` to verify this.
1. Fork the [project](https://github.com/BoostIO/BoostNote.next-local).
2. Clone your fork into an empty directory with SSH: `git@github.com:BoostIO/BoostNote.next-local.git`
3. Follow development details and build instructions (see below) to run and test your code

You can now start making changes to the code. This is a good point to look through [open issues](https://github.com/BoostIO/BoostNote.next-local/issues).

## Submit your changes
[Submit a PR](https://github.com/BoostIO/BoostNote.next-local/compare) with your changes, and wait for it to be reviewed. Make any changes if needed and it will be merged.

## Development and Build details

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

# Run electron (you have to open another terminal to run this)
npm run dev:electron
```

#### Production Build
```sh
# Run electron build
npm run build:electron

# Run pack (see results in dist folder)
npm run pack
```

> For Windows users, If `npm run dev:electron` doesn't spawn an electron window, please try again after removing `%APPDATA%\electron` directory.


Thanks for your contribution! <3
