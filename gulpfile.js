const fs = require("fs");
const { src, dest, parallel, series, lastRun, watch } = require("gulp");
const execa = require("execa");
const log = require("fancy-log");

const THEME = "white";
const HIGHLIGHT = "zenburn";
const LEVEL = 2;
const WIDTH = 3072 * 0.6;
const HEIGHT = 1920 * 0.6;
const MARGIN = 0.08;

const SLIDES = [
  { slug: "common", files: [] },
  {
    slug: "swerve",
    files: [
      "swerve/index.md",
      "swerve/swerve.md",
      "swerve/swerve-math.md",
      "swerve/swerve-software.md",
      "swerve/paths.md",
      "swerve/appendix.md",
      "common/colophon.md",
    ],
  },
  {
    slug: "telemetry",
    files: ["telemetry/index.md", "common/colophon.md"],
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
    ],
    { since: lastRun(copyRevealJSDist) }
  ).pipe(dest(`${REVEALJS_DEST}/plugin`));

const copyClassroomIndex = () => src("src/index.html").pipe(dest("build/"));

const copyClassroomCss = () =>
  src("src/theme/classroom.css").pipe(dest("build/static/css"));

const createDestDir = async (slug) => {
  const destDir = `build/${slug}`;
  log(`creating ${destDir} directory`);
  await fs.promises.mkdir(destDir, { recursive: true });
};

const buildSlides = async (slug, files) => {
  if (files.length === 0) return;

  const srcDir = "src";
  const destDir = `build/${slug}`;

  log(`building slides in ${srcDir}/${slug}`);

  const args = [
    "--from=markdown",
    "--to=revealjs",
    "--standalone",
    "--variable=revealjs-url:../static/reveal.js",
    "--css=../static/css/classroom.css",
    "--mathjax",
    `--slide-level=${LEVEL}`,
    `--variable=theme:${THEME}`,
    `--highlight-style=${HIGHLIGHT}`,
    `--variable=width:${WIDTH}`,
    `--variable=height:${HEIGHT}`,
    `--variable=margin:${MARGIN}`,
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
  copyClassroomIndex,
  copyClassroomCss,
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
