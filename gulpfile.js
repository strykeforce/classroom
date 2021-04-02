const fs = require("fs");
const { src, dest, parallel, series } = require("gulp");
const execa = require("execa");

const THEME = "moon";
const HIGHLIGHT = "zenburn";

const PRESENTATIONS = [
  {
    slug: "paths",
    files: ["src/paths/index.md"],
  },
];

const REVEALJS_SRC = "node_modules/reveal.js";
const REVEALJS_DEST = "build/static/reveal.js";

const copyRevealJSDist = () =>
  src([
    `${REVEALJS_SRC}/dist/**/*`,
    `!${REVEALJS_SRC}/dist/**/*.esm.js`,
    `!${REVEALJS_SRC}/dist/**/*.map`,
  ]).pipe(dest(`${REVEALJS_DEST}/dist`));

const copyRevealJSPlugins = () =>
  src([
    `${REVEALJS_SRC}/plugin/**`,
    `!${REVEALJS_SRC}/plugin/highlight/**`,
    `!${REVEALJS_SRC}/plugin/markdown/**`,
    `!${REVEALJS_SRC}/plugin/math/**`,
  ]).pipe(dest(`${REVEALJS_DEST}/plugin`));

const buildRevealJS = async (slug, slides) => {
  await fs.promises.mkdir(`build/${slug}`, { recursive: true });

  const args = [
    "--to=revealjs",
    "--standalone",
    "--variable=revealjs-url:../static/reveal.js",
    `--variable=theme:${THEME}`,
    `--highlight-style=${HIGHLIGHT}`,
    `--output=build/${slug}/index.html`,
  ];

  await execa("pandoc", args.concat(slides), { stdio: "inherit" });
};

const revealJS = parallel(copyRevealJSDist, copyRevealJSPlugins);

exports.default = parallel(
  revealJS,
  PRESENTATIONS.map(({ slug, files }) => () => buildRevealJS(slug, files))
);
