import type { VideoClip, YouTubeClip } from '@/data/topics'

interface VideoPlayerProps {
  clip: VideoClip | undefined
  ytClip: YouTubeClip | undefined
}

export default function VideoPlayer({ clip, ytClip }: VideoPlayerProps) {
  if (ytClip) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${ytClip.id}?start=${ytClip.start}&rel=0`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Session recording"
        />
      </div>
    )
  }

  if (clip) {
    const fragment = `#t=${clip.start}${clip.end !== undefined ? `,${clip.end}` : ''}`
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <video
          src={`/back-dev-guide/videos/${clip.file}${fragment}`}
          controls
          preload="metadata"
          className="h-full w-full"
        />
      </div>
    )
  }

  return null
}
