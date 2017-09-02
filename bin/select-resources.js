#!/usr/bin/env node

const yaml = require('js-yaml');
const fs = require('fs-jetpack');
const path = require('path');
const log = require('../util/logger');


/**
 * Put symlinks for selected resources
 *
 * @param {any} dir
 * @returns
 */
function selectResources(dir, resources) {
    fs.list(dir)
        .filter(file => file !== '.keep')
        .forEach(file => fs.remove(`${dir}/${file}`));

    if (resources.length) {
        resources.forEach((file) => {
            const src = path.resolve(`${dir}-available/${file}`);
            const dest = path.resolve(`${dir}/${file}`);

            if (fs.exists(src)) {
                fs.symlink(src, dest);
                log.info(`Selected ${dir}: ${dir}/${file}`);
            } else {
                log.error(`${dir}/${file} doesn't exists`);
            }
        });
    }
}

/**
 * Run resources selection
 *
 */
function main() {
    try {
        const { migrations, test, } = yaml.safeLoad(fs.read('resources.yml'));

        selectResources('migrations', migrations);
        selectResources('test', test);
    } catch (e) {
        log.error(e);
    }
}

main();
