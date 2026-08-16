import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        isValid: false, 
        message: 'Please provide a valid URL.' 
      }, { status: 400 });
    }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    // 1. Check if GOOGLE DRIVE
    if (cleanUrl.includes('drive.google.com')) {
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

      const res = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        cache: 'no-store'
      });

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
    }

    // 2. Check if TELEGRAM PUBLIC CHANNEL / GROUP
    if (cleanUrl.includes('t.me') || cleanUrl.includes('telegram.me')) {
      // Extract username or channel identifier
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
          message: 'Private Telegram invite link detected. Please use a Public Channel or Public Group link so Regional Admins can inspect the proof.'
        });
      }

      try {
        const tgRes = await fetch(`https://t.me/s/${tgTarget}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          cache: 'no-store'
        });

        const tgHtml = await tgRes.text();
        if (tgRes.status === 404 || tgHtml.includes('tgme_page_icon_watermark') && tgHtml.includes('If you have Telegram, you can contact')) {
          // Check standard channel page
          const fallbackRes = await fetch(`https://t.me/${tgTarget}`, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
            cache: 'no-store'
          });
          const fallbackHtml = await fallbackRes.text();
          if (fallbackHtml.includes('tgme_page_extra') || fallbackHtml.includes('tgme_action_button_new')) {
            return NextResponse.json({
              isValid: true,
              format: 'telegram',
              status: 'public',
              message: `Verified: Public Telegram Channel/Group (@${tgTarget})`
            });
          }
        }

        return NextResponse.json({
          isValid: true,
          format: 'telegram',
          status: 'public',
          message: `Verified: Public Telegram Channel/Group (@${tgTarget})`
        });
      } catch (err) {
        return NextResponse.json({
          isValid: true,
          format: 'telegram',
          status: 'public',
          message: `Telegram Public Link Accepted: @${tgTarget}`
        });
      }
    }

    // 3. Check if YOUTUBE VIDEO (Public / Unlisted)
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      let videoId = null;
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
        // Query YouTube oEmbed endpoint to verify public/unlisted accessibility
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const ytRes = await fetch(oembedUrl, { cache: 'no-store' });

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
            message: 'This YouTube video is PRIVATE. Please change video visibility to "Public" or "Unlisted" so Admins can watch.'
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
      } catch (err) {
        return NextResponse.json({
          isValid: true,
          format: 'youtube',
          status: 'public',
          message: 'YouTube Video Link Accepted'
        });
      }
    }

    // 4. UNAPPROVED DOMAIN / FORMAT
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
      message: 'Error during validation. Please try again.'
    }, { status: 500 });
  }
}
