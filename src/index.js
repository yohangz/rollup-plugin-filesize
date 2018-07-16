import fileSize from "filesize";
import boxen from "boxen";
import colors from "colors";
import deepAssign from "deep-assign";
import gzip from "gzip-size";
import brotli from "brotli-size";

function render(opt, size, gzip, brotliSize, bundle) {
	const primaryColor = opt.theme === "dark" ? "green" : "black";
	const secondaryColor = opt.theme === "dark" ? "yellow" : "blue";

	return boxen(
		`${bundle.file
			? colors[primaryColor].bold("Destination: ") +
					colors[secondaryColor](bundle.file) +
					"\n"
			: ""}${colors[primaryColor].bold("Bundle size: ")}${colors[
			secondaryColor
		](size)}${opt.showGzippedSize
			? ", " +
					colors[primaryColor].bold("Gzipped size: ") +
					colors[secondaryColor](gzip)
			: ""}${opt.showBrotliSize
			? ", " +
			colors[primaryColor].bold("Brotli size: ") +
			colors[secondaryColor](brotliSize)
			: ""}`,
		{ padding: 1 }
	);
}

export default function filesize(options = {}, env) {
	let defaultOptions = {
		format: {},
		theme: "dark",
		render: render,
		showGzippedSize: true,
		showBrotliSize: false
	};

	let opts = deepAssign({}, defaultOptions, options);
	if (options.render) {
		opts.render = options.render;
	}

	const getData = function(bundle, code) {
		let size = fileSize(Buffer.byteLength(code), opts.format);
		let gzipSize = opts.showGzippedSize
			? fileSize(gzip.sync(code), opts.format)
			: "";
		let brotliSize = opts.showBrotliSize
			? fileSize(brotli.sync(code), opts.format)
			: "";
		return opts.render(opts, size, gzipSize, brotliSize, bundle);
	};

	if (env === "test") {
		return getData
	}

	return {
		ongenerate(bundle, { code }) {
			console.log(getData(bundle, code));
		}
	};
}
