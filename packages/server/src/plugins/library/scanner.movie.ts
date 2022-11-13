import {queryMovie} from './metadata.tmdb.js';
import {getLogger} from 'log4js';
import filenameparser from '../../lib/filenameparser';

const logger = getLogger("pith.plugin.library.scanner.movie");

export default opts => {
    const db = opts.db;
    return {
        async scan(channelInstance, dir) {
            async function storeQueryResult(result, item) {
                logger.info(result.title, result.year);
                await db.storeMovie({
                    ...item,
                    ...result,
                    originalId: item.id,
                    channelId: dir.channelId,
                    id: item.id,
                    dateScanned: new Date()
                });
            }

            async function scanToDatabase(item, container) {
                const result = await db.findMovieByOriginalId(dir.channelId, item.id);
                if (result) {
                    // already in database
                    return;
                }

                logger.info("Found new item " + item.id);
                try {
                    const md = filenameparser(container.title, 'movie');
                    const metaData = await queryMovie({
                        ...item,
                        ...(md ? {
                            title: md.title,
                            year: md.year
                        } : {
                            title: container.title
                        })
                    });
                    await storeQueryResult(metaData, item);
                } catch (e) {
                    logger.warn(`Fetching metadata failed`, e);
                }
            }

            async function listContents(container) {
                if (!container) {
                    return;
                }
                const contents = await channelInstance.listContents(container && container.id);
                if (!(contents && contents.length)) {
                    return;
                }
                for (const item of contents) {
                    if (item.type === 'container') {
                        await listContents(item);
                    } else if (item.playable && item.mimetype?.match(/^video\//)) {
                        await scanToDatabase(item, container);
                    }
                }
            }

            return listContents(await channelInstance.getItem(dir.containerId));
        }
    }
};
