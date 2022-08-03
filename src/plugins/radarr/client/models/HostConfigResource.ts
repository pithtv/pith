/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AuthenticationType } from './AuthenticationType';
import type { CertificateValidationType } from './CertificateValidationType';
import type { ProxyType } from './ProxyType';
import type { UpdateMechanism } from './UpdateMechanism';

export type HostConfigResource = {
    id?: number;
    bindAddress?: string | null;
    port?: number;
    sslPort?: number;
    enableSsl?: boolean;
    launchBrowser?: boolean;
    authenticationMethod?: AuthenticationType;
    analyticsEnabled?: boolean;
    username?: string | null;
    password?: string | null;
    logLevel?: string | null;
    consoleLogLevel?: string | null;
    branch?: string | null;
    apiKey?: string | null;
    sslCertPath?: string | null;
    sslCertPassword?: string | null;
    urlBase?: string | null;
    instanceName?: string | null;
    updateAutomatically?: boolean;
    updateMechanism?: UpdateMechanism;
    updateScriptPath?: string | null;
    proxyEnabled?: boolean;
    proxyType?: ProxyType;
    proxyHostname?: string | null;
    proxyPort?: number;
    proxyUsername?: string | null;
    proxyPassword?: string | null;
    proxyBypassFilter?: string | null;
    proxyBypassLocalAddresses?: boolean;
    certificateValidation?: CertificateValidationType;
    backupFolder?: string | null;
    backupInterval?: number;
    backupRetention?: number;
};

