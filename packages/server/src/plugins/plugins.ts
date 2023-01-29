import {Pith} from '../pith';
import {scoped, Lifecycle, InjectionToken} from 'tsyringe';
import {FastifyInstance} from "fastify";

export const PluginSymbol = "PluginSymbol" as InjectionToken<PithPlugin>;

export interface PithPlugin {
    init(opts: {pith: Pith, fastify: FastifyInstance}): Promise<void> | void;
}

export function plugin() {
    return scoped(Lifecycle.ContainerScoped, PluginSymbol);
}
