/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Field } from './Field';
import type { ProviderMessage } from './ProviderMessage';

export type NotificationResource = {
    id?: number;
    name?: string | null;
    fields?: Array<Field> | null;
    implementationName?: string | null;
    implementation?: string | null;
    configContract?: string | null;
    infoLink?: string | null;
    message?: ProviderMessage;
    tags?: Array<number> | null;
    presets?: Array<NotificationResource> | null;
    link?: string | null;
    onGrab?: boolean;
    onDownload?: boolean;
    onUpgrade?: boolean;
    onRename?: boolean;
    onMovieAdded?: boolean;
    onMovieDelete?: boolean;
    onMovieFileDelete?: boolean;
    onMovieFileDeleteForUpgrade?: boolean;
    onHealthIssue?: boolean;
    onApplicationUpdate?: boolean;
    supportsOnGrab?: boolean;
    supportsOnDownload?: boolean;
    supportsOnUpgrade?: boolean;
    supportsOnRename?: boolean;
    supportsOnMovieAdded?: boolean;
    supportsOnMovieDelete?: boolean;
    supportsOnMovieFileDelete?: boolean;
    supportsOnMovieFileDeleteForUpgrade?: boolean;
    supportsOnHealthIssue?: boolean;
    supportsOnApplicationUpdate?: boolean;
    includeHealthWarnings?: boolean;
    testCommand?: string | null;
};

