export interface Icon {
  type: string,
  url: string,
  width: number,
  height: number
}

export interface Player {
  readonly icons: { [size: string]: Icon }
  readonly friendlyName: string
  readonly status: PlayerStatus
}

export interface PlayerStatus {
  position?: {time: number, title?: string, uri?: string, duration?: number};
  serverTimestamp?: number;
  state?: {playing?: boolean};
  actions?: {stop?: boolean, seek?: boolean, play?: boolean, pause?: boolean}
}
