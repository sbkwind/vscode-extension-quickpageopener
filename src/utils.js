const { join, extname } = require("path");
const { existsSync } = require("fs");
const slash = require("slash");

function pathJoin(...paths) {
	return slash(join(...paths));
}

function findEntry(path) {
	if (!!extname(path)) {
		return path;
	}
	return existsSync(`${path}.js`) ? `${path}.js` : `${path}/index.js`;
}

module.exports = {
	pathJoin,
	findEntry,
};
