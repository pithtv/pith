export interface Stream {
  language: string
  resolution: {
    width: number
    height: number
  }
  index: number
  type: string
  codec: string
  profile: string
  pixelFormat: string
  channels: string
  layout: string
  url: String
}

export interface StreamDescriptor {
  url: string
  mimetype: string
  seekable: boolean
  duration: number
  format?: {
    container: string
    streams: Stream[]
  },
  streams?: {
    url: string
    mimetype: string
    seekable: boolean
    duration: number
  }[]
  keyframes?: {}[]
}
