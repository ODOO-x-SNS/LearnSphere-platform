import { useState } from 'react';
import { AlertTriangle, ExternalLink, Play, FileText, Image as ImageIcon, Eye } from 'lucide-react';
import { clsx } from 'clsx';

// ── URL parsing helpers ──

interface MediaInfo {
  type: 'youtube' | 'google-drive' | 'image' | 'pdf' | 'unknown';
  embedUrl: string | null;
  thumbnailUrl?: string;
}

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
];

const DRIVE_PATTERN =
  /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
const PDF_EXT = /\.pdf(\?.*)?$/i;

export function parseMediaUrl(url: string): MediaInfo {
  if (!url) return { type: 'unknown', embedUrl: null };

  // YouTube
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      const videoId = match[1];
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      };
    }
  }

  // Google Drive
  const driveMatch = url.match(DRIVE_PATTERN);
  if (driveMatch?.[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'google-drive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
    };
  }

  // Direct image URL
  if (IMAGE_EXT.test(url)) {
    return { type: 'image', embedUrl: url };
  }

  // Direct PDF URL
  if (PDF_EXT.test(url)) {
    return { type: 'pdf', embedUrl: url };
  }

  return { type: 'unknown', embedUrl: url };
}

// ── Components ──

interface MediaPreviewProps {
  url: string;
  /** Lesson type hint from backend (VIDEO, DOCUMENT, IMAGE) */
  lessonType?: string;
  /** Compact thumbnail mode for lesson lists */
  compact?: boolean;
  className?: string;
}

/**
 * Renders an inline media preview using iframes (YouTube, Drive)
 * or native elements (img, PDF viewer). Shows a thumbnail in
 * compact mode that can be expanded.
 */
export function MediaPreview({ url, lessonType, compact = false, className }: MediaPreviewProps) {
  const [error, setError] = useState(false);
  const media = parseMediaUrl(url);

  if (!url) return null;

  if (error) {
    return (
      <div className={clsx('flex items-center gap-2 rounded-xl border border-warning-200 bg-warning-50 px-3 py-2', className)}>
        <AlertTriangle className="h-4 w-4 text-warning-500 shrink-0" />
        <span className="text-xs text-warning-700">
          Preview unavailable — the file may not be shared publicly.{' '}
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-warning-800">
            Open in new tab
          </a>
        </span>
      </div>
    );
  }

  // ── Compact thumbnail mode ──
  if (compact) {
    return <CompactPreview url={url} media={media} lessonType={lessonType} className={className} />;
  }

  // ── Full preview ──
  return (
    <div className={clsx('rounded-xl overflow-hidden border border-border bg-surface-dim', className)}>
      {media.type === 'youtube' && media.embedUrl && (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={media.embedUrl}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            onError={() => setError(true)}
          />
        </div>
      )}

      {media.type === 'google-drive' && media.embedUrl && (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={media.embedUrl}
            title="Google Drive preview"
            allow="autoplay"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-popups"
            onError={() => setError(true)}
          />
        </div>
      )}

      {media.type === 'image' && media.embedUrl && (
        <img
          src={media.embedUrl}
          alt="Preview"
          className="w-full max-h-96 object-contain bg-white"
          onError={() => setError(true)}
        />
      )}

      {media.type === 'pdf' && media.embedUrl && (
        <div className="relative w-full" style={{ height: '500px' }}>
          <iframe
            src={media.embedUrl}
            title="PDF preview"
            className="w-full h-full"
            onError={() => setError(true)}
          />
        </div>
      )}

      {media.type === 'unknown' && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
          <FileText className="h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-muted">Cannot preview this file type inline.</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in new tab
          </a>
        </div>
      )}
    </div>
  );
}

// ── Compact thumbnail with click-to-expand ──
function CompactPreview({ url, media, lessonType, className }: {
  url: string;
  media: MediaInfo;
  lessonType?: string;
  className?: string;
}) {
  const icon = media.type === 'youtube'
    ? <Play className="h-4 w-4" />
    : media.type === 'image'
      ? <ImageIcon className="h-4 w-4" />
      : media.type === 'pdf'
        ? <FileText className="h-4 w-4" />
        : <Eye className="h-4 w-4" />;

  const label = media.type === 'youtube'
    ? 'YouTube Video'
    : media.type === 'google-drive'
      ? 'Google Drive File'
      : media.type === 'image'
        ? 'Image'
        : media.type === 'pdf'
          ? 'PDF Document'
          : 'External Link';

  // Show a small thumbnail for YouTube or Drive
  if (media.thumbnailUrl && (media.type === 'youtube' || media.type === 'google-drive')) {
    return (
      <div className={clsx('flex items-center gap-2 mt-1.5', className)}>
        <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-border bg-surface-dim shrink-0">
          <img
            src={media.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {media.type === 'youtube' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="h-4 w-4 text-white fill-white" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <span className="text-xs font-medium text-text-secondary">{label}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block text-[11px] text-primary-600 hover:underline truncate max-w-[280px]"
          >
            {url}
          </a>
        </div>
      </div>
    );
  }

  // Compact image preview
  if (media.type === 'image' && media.embedUrl) {
    return (
      <div className={clsx('mt-1.5', className)}>
        <img
          src={media.embedUrl}
          alt=""
          className="max-h-16 rounded-lg border border-border object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    );
  }

  // Fallback: simple link row
  return (
    <div className={clsx('flex items-center gap-1.5 mt-1', className)}>
      <div className="w-5 h-5 rounded flex items-center justify-center bg-surface-dim text-text-muted shrink-0">
        {icon}
      </div>
      <span className="text-xs text-text-muted">{label}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-[11px] text-primary-600 hover:underline truncate max-w-[200px]"
      >
        {url}
      </a>
    </div>
  );
}
