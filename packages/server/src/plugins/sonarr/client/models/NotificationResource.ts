/* generated using openapi-typescript-codegen -- do no edit */
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
    onSeriesAdd?: boolean;
    onSeriesDelete?: boolean;
    onEpisodeFileDelete?: boolean;
    onEpisodeFileDeleteForUpgrade?: boolean;
    onHealthIssue?: boolean;
    onHealthRestored?: boolean;
    onApplicationUpdate?: boolean;
    onManualInteractionRequired?: boolean;
    supportsOnGrab?: boolean;
    supportsOnDownload?: boolean;
    supportsOnUpgrade?: boolean;
    supportsOnRename?: boolean;
    supportsOnSeriesAdd?: boolean;
    supportsOnSeriesDelete?: boolean;
    supportsOnEpisodeFileDelete?: boolean;
    supportsOnEpisodeFileDeleteForUpgrade?: boolean;
    supportsOnHealthIssue?: boolean;
    supportsOnHealthRestored?: boolean;
    supportsOnApplicationUpdate?: boolean;
    supportsOnManualInteractionRequired?: boolean;
    includeHealthWarnings?: boolean;
    testCommand?: string | null;
};

