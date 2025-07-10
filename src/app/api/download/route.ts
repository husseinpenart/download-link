import { type NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

// Enhanced video extraction with Puppeteer
async function extractVideoWithPuppeteer(
  url: string
): Promise<{ videoUrl: string; title: string; size?: number } | null> {
  console.log("🤖 Starting Puppeteer extraction for:", url);

  let browser = null;

  try {
    // Launch Puppeteer with stealth settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ],
    });

    const page = await browser.newPage();

    // Set realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set extra headers to look more human
    await page.setExtraHTTPHeaders({
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    });

    // Intercept network requests to capture video URLs
    const videoUrls: string[] = [];
    const interceptedRequests: any[] = [];

    await page.setRequestInterception(true);

    page.on("request", (request) => {
      const url = request.url();
      const resourceType = request.resourceType();

      // Log all requests for debugging
      interceptedRequests.push({ url, resourceType });

      // Capture video URLs
      if (
        resourceType === "media" ||
        url.includes(".mp4") ||
        url.includes(".m3u8") ||
        url.includes("googlevideo.com") ||
        url.includes("cdninstagram.com") ||
        url.includes("tiktokcdn.com") ||
        url.includes("twimg.com")
      ) {
        console.log("🎥 Found potential video URL:", url);
        videoUrls.push(url);
      }

      request.continue();
    });

    console.log("🌐 Navigating to page...");

    // Navigate to the page with timeout
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    console.log("⏳ Waiting for page to load completely...");

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(3000);

    // Platform-specific extraction
    let result = null;

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      result = await extractYouTubeWithPuppeteer(page, videoUrls);
    } else if (url.includes("instagram.com")) {
      result = await extractInstagramWithPuppeteer(page, videoUrls);
    } else if (url.includes("tiktok.com")) {
      result = await extractTikTokWithPuppeteer(page, videoUrls);
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      result = await extractTwitterWithPuppeteer(page, videoUrls);
    } else {
      result = await extractGenericWithPuppeteer(page, videoUrls);
    }

    console.log("📊 Extraction result:", result);
    console.log("🔍 Total intercepted requests:", interceptedRequests.length);
    console.log("🎥 Video URLs found:", videoUrls.length);

    return result;
  } catch (error) {
    console.error("❌ Puppeteer extraction failed:", error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
      console.log("🔒 Browser closed");
    }
  }
}

async function extractYouTubeWithPuppeteer(page: any, videoUrls: string[]) {
  console.log("🎥 Extracting YouTube with Puppeteer...");

  try {
    // Wait for video player to load
    await page.waitForSelector("video", { timeout: 10000 }).catch(() => {});

    // Try to get title
    let title = "YouTube-Video";
    try {
      const titleElement = await page.$(
        "h1.ytd-watch-metadata yt-formatted-string"
      );
      if (titleElement) {
        title = await page.evaluate((el: any) => el.textContent, titleElement);
        title = title.trim().substring(0, 50);
      }
    } catch (e) {
      console.log("Could not extract title");
    }

    // Look for video URLs in intercepted requests
    const youtubeVideoUrls = videoUrls.filter(
      (url) =>
        url.includes("googlevideo.com") &&
        (url.includes("itag=") || url.includes(".mp4"))
    );

    if (youtubeVideoUrls.length > 0) {
      console.log("✅ Found YouTube video URL via network interception");
      return {
        videoUrl: youtubeVideoUrls[0],
        title: title.replace(/[^\w\s\u0600-\u06FF]/g, "-"),
        size: 50000000,
      };
    }

    // Try to extract from page source
    const videoUrl = await page.evaluate(() => {
      // Look for video URLs in window objects
      const scripts = Array.from(document.querySelectorAll("script"));
      for (const script of scripts) {
        const content = script.innerHTML;

        // Look for various patterns
        const patterns = [
          /"url":"([^"]*itag=18[^"]*)"/g,
          /"url":"([^"]*itag=22[^"]*)"/g,
          /https:\/\/[^"'\s]*\.googlevideo\.com[^"'\s]*\.mp4[^"'\s]*/g,
        ];

        for (const pattern of patterns) {
          const matches = [...content.matchAll(pattern)];
          for (const match of matches) {
            let url = match[1] || match[0];
            url = url.replace(/\\u0026/g, "&").replace(/\\/g, "");
            if (url && url.includes("googlevideo.com")) {
              return url;
            }
          }
        }
      }
      return null;
    });

    if (videoUrl) {
      console.log("✅ Found YouTube video URL via page evaluation");
      return {
        videoUrl: videoUrl,
        title: title.replace(/[^\w\s\u0600-\u06FF]/g, "-"),
        size: 50000000,
      };
    }

    throw new Error("Could not extract YouTube video URL");
  } catch (error) {
    console.error("❌ YouTube Puppeteer extraction failed:", error);
    throw error;
  }
}

async function extractInstagramWithPuppeteer(page: any, videoUrls: string[]) {
  console.log("📸 Extracting Instagram with Puppeteer...");

  try {
    // Wait for content to load
    await page.waitForTimeout(2000);

    // Look for video URLs in intercepted requests
    const instagramVideoUrls = videoUrls.filter(
      (url) => url.includes("cdninstagram.com") && url.includes(".mp4")
    );

    if (instagramVideoUrls.length > 0) {
      console.log("✅ Found Instagram video URL via network interception");
      return {
        videoUrl: instagramVideoUrls[0],
        title: "Instagram-Video",
        size: 25000000,
      };
    }

    // Try to extract from page
    const videoUrl = await page.evaluate(() => {
      // Look for video elements
      const videos = document.querySelectorAll("video");
      for (const video of videos) {
        if (video.src && video.src.includes(".mp4")) {
          return video.src;
        }
      }

      // Look in meta tags
      const metaVideo = document.querySelector('meta[property="og:video"]');
      if (metaVideo && metaVideo.getAttribute("content")) {
        return metaVideo.getAttribute("content");
      }

      return null;
    });

    if (videoUrl) {
      console.log("✅ Found Instagram video URL via page evaluation");
      return {
        videoUrl: videoUrl,
        title: "Instagram-Video",
        size: 25000000,
      };
    }

    throw new Error("Could not extract Instagram video URL");
  } catch (error) {
    console.error("❌ Instagram Puppeteer extraction failed:", error);
    throw error;
  }
}

async function extractTikTokWithPuppeteer(page: any, videoUrls: string[]) {
  console.log("🎵 Extracting TikTok with Puppeteer...");

  try {
    // Wait for video to load
    await page.waitForSelector("video", { timeout: 10000 }).catch(() => {});

    // Look for video URLs in intercepted requests
    const tiktokVideoUrls = videoUrls.filter(
      (url) => url.includes("tiktokcdn.com") && url.includes(".mp4")
    );

    if (tiktokVideoUrls.length > 0) {
      console.log("✅ Found TikTok video URL via network interception");
      return {
        videoUrl: tiktokVideoUrls[0],
        title: "TikTok-Video",
        size: 15000000,
      };
    }

    // Try to extract from page
    const videoUrl = await page.evaluate(() => {
      const videos = document.querySelectorAll("video");
      for (const video of videos) {
        if (video.src && video.src.includes(".mp4")) {
          return video.src;
        }
      }
      return null;
    });

    if (videoUrl) {
      console.log("✅ Found TikTok video URL via page evaluation");
      return {
        videoUrl: videoUrl,
        title: "TikTok-Video",
        size: 15000000,
      };
    }

    throw new Error("Could not extract TikTok video URL");
  } catch (error) {
    console.error("❌ TikTok Puppeteer extraction failed:", error);
    throw error;
  }
}

async function extractTwitterWithPuppeteer(page: any, videoUrls: string[]) {
  console.log("🐦 Extracting Twitter with Puppeteer...");

  try {
    // Wait for content to load
    await page.waitForTimeout(3000);

    // Look for video URLs in intercepted requests
    const twitterVideoUrls = videoUrls.filter(
      (url) => url.includes("twimg.com") && url.includes(".mp4")
    );

    if (twitterVideoUrls.length > 0) {
      console.log("✅ Found Twitter video URL via network interception");
      return {
        videoUrl: twitterVideoUrls[0],
        title: "Twitter-Video",
        size: 20000000,
      };
    }

    // Try to extract from page
    const videoUrl = await page.evaluate(() => {
      const videos = document.querySelectorAll("video");
      for (const video of videos) {
        if (video.src && video.src.includes(".mp4")) {
          return video.src;
        }
      }
      return null;
    });

    if (videoUrl) {
      console.log("✅ Found Twitter video URL via page evaluation");
      return {
        videoUrl: videoUrl,
        title: "Twitter-Video",
        size: 20000000,
      };
    }

    throw new Error("Could not extract Twitter video URL");
  } catch (error) {
    console.error("❌ Twitter Puppeteer extraction failed:", error);
    throw error;
  }
}

async function extractGenericWithPuppeteer(page: any, videoUrls: string[]) {
  console.log("🔗 Extracting generic video with Puppeteer...");

  try {
    // Look for any video URLs in intercepted requests
    const genericVideoUrls = videoUrls.filter((url) => url.includes(".mp4"));

    if (genericVideoUrls.length > 0) {
      console.log("✅ Found generic video URL via network interception");
      return {
        videoUrl: genericVideoUrls[0],
        title: "Generic-Video",
        size: 10000000,
      };
    }

    // Try to extract from page
    const videoUrl = await page.evaluate(() => {
      // Look for video elements
      const videos = document.querySelectorAll("video");
      for (const video of videos) {
        if (video.src) {
          return video.src;
        }
      }

      // Look for source elements
      const sources = document.querySelectorAll("source");
      for (const source of sources) {
        if (source.src && source.src.includes(".mp4")) {
          return source.src;
        }
      }

      return null;
    });

    if (videoUrl) {
      console.log("✅ Found generic video URL via page evaluation");
      return {
        videoUrl: videoUrl,
        title: "Generic-Video",
        size: 10000000,
      };
    }

    throw new Error("Could not extract generic video URL");
  } catch (error) {
    console.error("❌ Generic Puppeteer extraction failed:", error);
    throw error;
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { url, metadataOnly } = body;

    console.log("🚀 Processing URL with Puppeteer:", url);

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const cleanUrl = url.trim();

    // Extract video URL using Puppeteer
    const extractionResult = await extractVideoWithPuppeteer(cleanUrl);

    if (!extractionResult) {
      return NextResponse.json(
        {
          error:
            "Could not extract video from this URL. The platform may have enhanced protection or the URL format is not supported.",
        },
        { status: 400 }
      );
    }

    const { videoUrl, title, size } = extractionResult;

    if (metadataOnly) {
      return NextResponse.json({
        size: size || 25000000,
        contentType: "video/mp4",
        title: title,
        success: true,
        isRealVideo: true,
      });
    }

    console.log("⬇️ Downloading video from extracted URL:", videoUrl);

    // Download the actual video with proper headers
    const videoResponse = await fetch(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: new URL(cleanUrl).origin,
        Accept: "*/*",
        "Accept-Encoding": "identity",
        Range: "bytes=0-", // Support range requests
      },
      timeout: 300000, // 5 minutes
    });

    if (!videoResponse.ok) {
      throw new Error(
        `Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`
      );
    }

    console.log("✅ Video download response received");
    console.log("Content-Type:", videoResponse.headers.get("content-type"));
    console.log("Content-Length:", videoResponse.headers.get("content-length"));

    const contentType =
      videoResponse.headers.get("content-type") || "video/mp4";
    const contentLength = videoResponse.headers.get("content-length");
    const filename = `${title.replace(/[^\w\s\u0600-\u06FF]/g, "-")}.mp4`;

    // Return the video stream directly
    return new NextResponse(videoResponse.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
        "Content-Length": contentLength || "",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error("💥 Puppeteer API Error:", error);
    return NextResponse.json(
      {
        error:
          "Processing failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  return NextResponse.json({ error: "Use POST method" }, { status: 405 });
};
