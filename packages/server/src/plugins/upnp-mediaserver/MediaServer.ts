/**
 * Based on node-upnp-device:
 * Copyright (c) 2011 Jacob Rask, <http://jacobrask.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */

import {Device} from './Device';
import {ConnectionManager} from './services/ConnectionManager';
import {ContentDirectory} from './services/ContentDirectory';

export class MediaServer extends Device {
    constructor(...opts) {
        super({
            serviceTypes: ['ConnectionManager', 'ContentDirectory'],
            serviceReferences: {
                ConnectionManager,
                ContentDirectory
            },
            type: "MediaServer",
            version: 1
        }, ...opts);
    }
}
