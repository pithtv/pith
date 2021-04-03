import {queryMovie} from './metadata.tmdb.js';
import {getLogger} from 'log4js';
import filenameparser from '../../lib/filenameparser';
const logger = getLogger("pith.plugin.library.scanner.movie");

export default opts => {
    const db = opts.db;
    return {
        async scan(channelInstance, dir) {
            async function listContents(container) {
                if (!container) {
                    return;
                }
                let contents = await channelInstance.listContents(container && container.id);
                if (!(contents && contents.length)) {
                    return;
                }
                for (let item of contents) {
                    if (item.type === 'container') {
                        await listContents(item);
                    } else if (item.playable && item.mimetype?.match(/^video\//)) {
                        let result = await db.findMovieByOriginalId(dir.channelId, item.id);
                        if (!result) {
                            logger.info("Found new item " + item.id);

                            const store = async result => {
                                logger.info(result.title, result.year);
                                result.originalId = item.id;
                                result.channelId = dir.channelId;
                                result.id = item.id;
                                result.dateScanned = new Date();
                                await db.storeMovie(result);
                            };

                            try {
                                const metaData = await queryMovie(item);
                                await store({
                                    ...item,
                                    ...metaData

                                });
                            } catch (e) {
                                const md = filenameparser(container.title, 'movie');
                                if (md) {
                                    item.title = md.title;
                                    item.year = md.year;
                                } else {
                                    item.title = container.title;
                                }
                                try {
                                    const metaData = await queryMovie(item);
                                    await store({
                                        ...item,
                                        ...metaData
                                    });
                                } catch (ee) {
                                    logger.warn(`Fetching metadata failed`, ee);
                                }
                            }
                        }
                    }
                }
            }

            return listContents(await channelInstance.getItem(dir.containerId));
        }
    }
};
