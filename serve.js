import { build } from "esbuild";
import chokidar from "chokidar";
import liveServer from "live-server";

;(async () => {
	// `esbuild` bundler for JavaScript / TypeScript.
	const builder = await build({
		// Bundles JavaScript.
		bundle: true,
		// Defines env variables for bundled JavaScript; here `process.env.NODE_ENV`
		// is propagated with a fallback.
		define: {},
		// Bundles JavaScript from (see `outfile`).
		entryPoints: ["src/main.ts"],
		// Uses incremental compilation (see `chokidar.on`).
		incremental: true,
		// Removes whitespace, etc. depending on `NODE_ENV=...`.
		minify: false,
		// Bundles JavaScript to (see `entryPoints`).
		outfile: "public/bundle.js",
		platform: "node",
	})
	// `chokidar` watcher source changes.
	chokidar
		// Watches TypeScript and React TypeScript.
		.watch("src/**/*.{ts,tsx}", {
			interval: 0, // No delay
		})
		// Rebuilds esbuild (incrementally -- see `build.incremental`).
		.on("all", () => {
			builder.rebuild()
		})
	// `liveServer` local server for hot reload.
	liveServer.start({
		// Opens the local server on start.
		open: true,
		// Uses `PORT=...` or 14514 as a fallback.
		port: 14514,
		// Uses `public` as the local server folder.
		root: "public",
		middleware: [function(req, res, next) {
			if (req.url == '/favicon.ico') {
				res.writeHead(200);
				res.end();
			}
			next();
		}],
	})
})()