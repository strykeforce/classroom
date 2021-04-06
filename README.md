# classroom

Published [presentations](https://strykeforce.github.io/classroom/) are hosted on GitHub pages.

## Installation

1. Install LTS version of [Node.js](https://nodejs.org/)
2. Install [Pandoc](https://pandoc.org/installing.html)
3. Run `npm install --global gulp-cli` to install Gulp build tool
4. Run `npm install` to install dependencies

## Building Slide Shows

1. Run `gulp` as needed to build slides in `build/**/index.html`
2. For automatic building and browser refreshing as you write, open two terminal windows and:
   1. Run `gulp watch` to automatically rebuild presentation when you save a markdown file.
   2. Run `npm run watch` to automatically refresh your browser when a slide show is built.
