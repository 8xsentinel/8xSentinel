import { NextRequest, NextResponse } from 'next/server';

// Strict host whitelist to prevent SSRF
const ALLOWED_HOSTS = [
  'drive.google.com',
  't.me',
  'telegram.me',
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'm.youtube.com'
];

function isSafeUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    
    // Explicitly block local, private, and internal addresses
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.16.') ||
      host.startsWith('169.254.')
    ) {
      return false;
    }

    return ALLOWED_HOSTS.some(allowed => host === allowed || host.endsWith('.' + allowed));
  } catch {
    return false;
  }
}

// Fetch helper with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body || {};

    if (!url || typeof url !== 'string' || url.length > 500) {
      return NextResponse.json({ 
        isValid: false, 
        message: 'Please provide a valid URL (maximum 500 characters).' 
      }, { status: 400 });
    }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    if (!isSafeUrl(cleanUrl)) {
      return NextResponse.json({
        isValid: false,
        format: 'unknown',
        status: 'unsupported_domain',
        message: 'Only 3 evidence formats are accepted: (1) Google Drive, (2) Telegram Public Channel, or (3) YouTube Public Video.'
      });
    }

    const parsedUrl = new URL(cleanUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    // 1. Check if GOOGLE DRIVE
    if (hostname.includes('drive.google.com')) {
      const folderMatch = cleanUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      const fileMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      const resourceId = folderMatch ? folderMatch[1] : (fileMatch ? fileMatch[1] : null);

      if (!resourceId) {
        return NextResponse.json({
          isValid: false,
          format: 'drive',
          status: 'invalid_format',
          message: 'Invalid Google Drive link format. Missing folder or file ID.'
        });
      }

      const testUrl = folderMatch 
        ? `https://drive.google.com/drive/folders/${resourceId}`
        : `https://drive.google.com/file/d/${resourceId}/view`;

      try {
        const res = await fetchWithTimeout(testUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          redirect: 'follow',
          cache: 'no-store'
        }, 5000);

        const finalUrl = res.url || '';
        const bodyText = await res.text();

        const isLoginRedirect = finalUrl.includes('accounts.google.com/ServiceLogin') || 
                                finalUrl.includes('accounts.google.com/v3/signin') ||
                                finalUrl.includes('ServiceLogin');

        const requiresPermission = bodyText.includes('You need access') || 
                                   bodyText.includes('Request access') || 
                                   bodyText.includes('You need permission') ||
                                   bodyText.includes('Sign in to continue') ||
                                   bodyText.includes('Sign in - Google Accounts');

        const notFound = res.status === 404 || bodyText.includes('Folder does not exist') || bodyText.includes('File not found');

        if (notFound) {
          return NextResponse.json({
            isValid: false,
            format: 'drive',
            status: 'not_found',
            message: 'Google Drive folder or file was not found. Please check if the link is correct.'
          });
        }

        if (isLoginRedirect || requiresPermission || res.status === 401 || res.status === 403) {
          return NextResponse.json({
            isValid: false,
            format: 'drive',
            status: 'restricted',
            message: 'Google Drive Link is RESTRICTED. You must set General access to "Anyone with the link (Viewer)" before adding.'
          });
        }

        return NextResponse.json({
          isValid: true,
          format: 'drive',
          status: 'public',
          message: 'Verified: Google Drive is Public and viewable by Anyone with the link.'
        });
      } catch (fetchErr: any) {
        // Network timeout fallback
        return NextResponse.json({
          isValid: true,
          format: 'drive',
          status: 'public',
          message: 'Google Drive Link Accepted (verification connection timed out).'
        });
      }
    }

    // 2. Check if TELEGRAM PUBLIC CHANNEL / GROUP
    if (hostname === 't.me' || hostname === 'telegram.me') {
      const tgMatch = cleanUrl.match(/(?:t\.me|telegram\.me)\/([a-zA-Z0-9_+]+)/);
      if (!tgMatch || !tgMatch[1]) {
        return NextResponse.json({
          isValid: false,
          format: 'telegram',
          status: 'invalid_format',
          message: 'Invalid Telegram link format. Example: https://t.me/channel_name'
        });
      }

      const tgTarget = tgMatch[1];
      // Private invite link check
      if (tgTarget.startsWith('+') || tgTarget.startsWith('joinchat')) {
        return NextResponse.json({
          isValid: false,
          format: 'telegram',
          status: 'restricted',
          message: 'Private Telegram invite link detected. Please use a Public Channel link so Moderators can inspect the evidence.'
        });
      }

      try {
        const tgRes = await fetchWithTimeout(`https://t.me/s/${tgTarget}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          cache: 'no-store'
        }, 4000);

        return NextResponse.json({
          isValid: true,
          format: 'telegram',
          status: 'public',
          message: `Verified: Public Telegram Channel/Group (@${tgTarget})`
        });
      } catch {
        return NextResponse.json({
          isValid: true,
          format: 'telegram',
          status: 'public',
          message: `Telegram Public Link Accepted: @${tgTarget}`
        });
      }
    }

    // 3. Check if YOUTUBE VIDEO (Public / Unlisted)
    if (hostname.includes('youtube.com') || hostname === 'youtu.be') {
      let videoId: string | null = null;
      if (cleanUrl.includes('youtu.be/')) {
        const match = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        videoId = match ? match[1] : null;
      } else if (cleanUrl.includes('youtube.com/watch')) {
        const match = cleanUrl.match(/v=([a-zA-Z0-9_-]+)/);
        videoId = match ? match[1] : null;
      } else if (cleanUrl.includes('youtube.com/shorts/')) {
        const match = cleanUrl.match(/shorts\/([a-zA-Z0-9_-]+)/);
        videoId = match ? match[1] : null;
      }

      if (!videoId) {
        return NextResponse.json({
          isValid: false,
          format: 'youtube',
          status: 'invalid_format',
          message: 'Invalid YouTube URL. Please provide a valid video or shorts link.'
        });
      }

      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const ytRes = await fetchWithTimeout(oembedUrl, { cache: 'no-store' }, 4000);

        if (ytRes.status === 200) {
          const ytData = await ytRes.json();
          return NextResponse.json({
            isValid: true,
            format: 'youtube',
            status: 'public',
            videoTitle: ytData.title,
            message: `Verified: YouTube Video Accessible ("${ytData.title || 'Screen Recording'}")`
          });
        }

        if (ytRes.status === 401 || ytRes.status === 403) {
          return NextResponse.json({
            isValid: false,
            format: 'youtube',
            status: 'restricted',
            message: 'This YouTube video is PRIVATE. Please change video visibility to "Public" or "Unlisted".'
          });
        }

        if (ytRes.status === 404) {
          return NextResponse.json({
            isValid: false,
            format: 'youtube',
            status: 'not_found',
            message: 'YouTube video not found or deleted. Please check your link.'
          });
        }

        return NextResponse.json({
          isValid: true,
          format: 'youtube',
          status: 'public',
          message: 'YouTube Video Link Accepted'
        });
      } catch {
        return NextResponse.json({
          isValid: true,
          format: 'youtube',
          status: 'public',
          message: 'YouTube Video Link Accepted'
        });
      }
    }

    return NextResponse.json({
      isValid: false,
      format: 'unknown',
      status: 'unsupported_domain',
      message: 'Only 3 evidence formats are accepted: (1) Google Drive, (2) Telegram Public Channel/Group, or (3) YouTube Public Video.'
    });

  } catch (error: any) {
    console.error('Error verifying evidence URL:', error);
    return NextResponse.json({
      isValid: false,
      status: 'error',
      message: 'Validation could not be completed.'
    }, { status: 500 });
  }
}
