export interface IStream {
    url: string;
    mimetype: string;
    seekable: boolean;
    duration: number;
    format?: {
        container: string,
        streams: {
            index: number,
            type: string,
            codec: string,
            profile: string,
            pixelFormat: string,
            channels: string,
            layout: string
        }[]
    },
    streams?: {}[],
    keyframes?: {}[]
}
