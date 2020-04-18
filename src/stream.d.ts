export interface IStream {
    url: string;
    mimetype: string;
    seekable: boolean;
    duration: number;
    format?: {
        container: string,
        streams: {
           index: number,
           codec: string,
           profile: string,
           pixelFormat: string
        }[]
    },
    streams?: {
    }[],
    keyframes?: {
    }[]
}
