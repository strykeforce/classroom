const fs = require("fs");
const { src, dest, parallel, series, lastRun, watch } = require("gulp");
const execa = require("execa");
const log = require("fancy-log");

const THEME = "moon";
const HIGHLIGHT = "zenburn";
const LEVEL = 2;

const SLIDES = [
  {
    slug: "slides",
    files: ["index.md", "appendix.md"],
  },
  {
    slug: "swerve",
    files: ["index.md", "swerve.md", "swerve-math.md", "paths.md"],
  },
];

const REVEALJS_SRC = "node_modules/reveal.js";
const REVEALJS_DEST = "build/static/reveal.js";

const copyRevealJSDist = () =>
  src(
    [
      `${REVEALJS_SRC}/dist/**/*`,
      `!${REVEALJS_SRC}/dist/*.esm.js`,
      `!${REVEALJS_SRC}/dist/*.map`,
    ],
    { since: lastRun(copyRevealJSDist) }
  ).pipe(dest(`${REVEALJS_DEST}/dist`));

const copyRevealJSPlugins = () =>
  src(
    [
      `${REVEALJS_SRC}/plugin/**`,
      `!${REVEALJS_SRC}/plugin/highlight/**`,
      `!${REVEALJS_SRC}/plugin/markdown/**`,
      `!${REVEALJS_SRC}/plugin/math/**`,
    ],
    { since: lastRun(copyRevealJSDist) }
  ).pipe(dest(`${REVEALJS_DEST}/plugin`));

const createDestDir = async (slug) => {
  const destDir = `build/${slug}`;
  log(`creating ${destDir} directory`);
  await fs.promises.mkdir(destDir, { recursive: true });
};

const buildSlides = async (slug, files) => {
  const srcDir = `src/${slug}`;
  const destDir = `build/${slug}`;

  log(`building slides in ${srcDir}`);

  const args = [
    "--from=markdown",
    "--to=revealjs",
    "--standalone",
    "--variable=revealjs-url:../static/reveal.js",
    `--slide-level=${LEVEL}`,
    `--variable=theme:${THEME}`,
    `--highlight-style=${HIGHLIGHT}`,
    `--output=build/${slug}/index.html`,
  ];

  await execa("pandoc", args.concat(files.map((md) => `${srcDir}/${md}`)), {
    stdio: "inherit",
  });
};

const copyImages = (slug) => {
  const srcDir = `src/${slug}`;
  const destDir = `build/${slug}`;

  log(`copying images to ${destDir}`);

  return src(`${srcDir}/img/**/*`).pipe(dest(`${destDir}/img`));
};

const revealJS = parallel(copyRevealJSDist, copyRevealJSPlugins);

exports.buildAll = parallel(
  revealJS,
  SLIDES.map(({ slug, files }) =>
    series(
      () => createDestDir(slug),
      parallel(
        () => buildSlides(slug, files),
        () => copyImages(slug)
      )
    )
  )
);

exports.watch = () =>
  watch("src/*/*.md", { ignoreInitial: false }, this.buildAll);

exports.default = this.buildAll;
