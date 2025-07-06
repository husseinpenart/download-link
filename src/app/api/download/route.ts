import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { url, metadataOnly } = body;

    console.log("🚀 Processing URL:", url);

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const cleanUrl = url.trim();

    // YouTube - Try multiple methods
    if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
      try {
        console.log("🎥 YouTube URL detected, trying download methods...");

        // Method 1: Try ytdl-core first
        try {
          const ytdl = await import("ytdl-core");

          if (!ytdl.validateURL(cleanUrl)) {
            throw new Error("Invalid YouTube URL format");
          }

          console.log("✅ Valid YouTube URL, getting info...");

          // Set custom headers to avoid bot detection
          const info = await ytdl.getInfo(cleanUrl, {
            requestOptions: {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                DNT: "1",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
              },
            },
          });

          if (metadataOnly) {
            const format = ytdl.chooseFormat(info.formats, {
              quality: "highest",
              filter: "videoandaudio",
            });
            return NextResponse.json({
              size: format.contentLength
                ? Number.parseInt(format.contentLength)
                : 50000000,
              contentType: "video/mp4",
              title: info.videoDetails.title,
              success: true,
              isRealVideo: true,
            });
          }

          console.log("⬇️ Starting YouTube download with ytdl-core...");

          const title = info.videoDetails.title
            .replace(/[^\w\s\u0600-\u06FF]/gi, "")
            .substring(0, 50);
          const filename = `${title}.mp4`;

          // Get the best quality format
          const format = ytdl.chooseFormat(info.formats, {
            quality: "highest",
            filter: "videoandaudio",
          });
          console.log("📊 Selected format:", {
            quality: format.qualityLabel,
            size: format.contentLength,
            container: format.container,
          });

          // Create readable stream with custom options
          const videoStream = ytdl(cleanUrl, {
            quality: "highest",
            filter: "videoandaudio",
            requestOptions: {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
            },
          });

          // Convert to Web Stream
          const readableStream = new ReadableStream({
            start(controller) {
              videoStream.on("data", (chunk) => {
                controller.enqueue(new Uint8Array(chunk));
              });

              videoStream.on("end", () => {
                console.log("✅ YouTube stream completed");
                controller.close();
              });

              videoStream.on("error", (error) => {
                console.error("❌ YouTube stream error:", error);
                controller.error(error);
              });
            },
          });

          return new NextResponse(readableStream, {
            headers: {
              "Content-Type": "video/mp4",
              "Content-Disposition": `attachment; filename="${filename}"`,
              "Cache-Control": "no-cache",
              "Content-Length": format.contentLength || "",
            },
          });
        } catch (ytdlError) {
          console.error("❌ ytdl-core failed:", ytdlError);

          // Method 2: Fallback to direct URL extraction
          console.log("🔄 Trying direct URL extraction...");

          try {
            const response = await fetch(cleanUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                Referer: "https://www.youtube.com/",
              },
              timeout: 15000,
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();

            // Look for video URLs in the page
            const videoUrlPatterns = [
              /"url":"([^"]*\.mp4[^"]*)"/g,
              /"videoDetails".*?"videoId":"([^"]+)"/g,
            ];

            let videoUrl = "";
            for (const pattern of videoUrlPatterns) {
              const matches = [...html.matchAll(pattern)];
              if (matches.length > 0) {
                videoUrl = matches[0][1];
                break;
              }
            }

            if (videoUrl) {
              console.log("✅ Found video URL via extraction");

              if (metadataOnly) {
                return NextResponse.json({
                  size: 50000000,
                  contentType: "video/mp4",
                  title: "YouTube-Video",
                  success: true,
                  isRealVideo: true,
                });
              }

              // Try to download the extracted URL
              const videoResponse = await fetch(videoUrl, {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                  Referer: "https://www.youtube.com/",
                },
              });

              if (videoResponse.ok && videoResponse.body) {
                return new NextResponse(videoResponse.body, {
                  headers: {
                    "Content-Type": "video/mp4",
                    "Content-Disposition": `attachment; filename="YouTube-Video.mp4"`,
                    "Cache-Control": "no-cache",
                  },
                });
              }
            }

            throw new Error("Could not extract video URL from page");
          } catch (extractError) {
            console.error("❌ Direct extraction failed:", extractError);

            // Method 3: Return helpful error with alternatives
            return NextResponse.json(
              {
                error:
                  "YouTube bot protection detected. Please try one of these alternatives:\n\n" +
                  "1. Use SaveFrom.net: https://savefrom.net\n" +
                  "2. Use Y2Mate: https://y2mate.com\n" +
                  "3. Use yt-dlp command line tool\n" +
                  "4. Try again in a few minutes\n\n" +
                  "YouTube has enhanced bot protection that blocks automated downloads.",
                isYouTubeBlocked: true,
                alternatives: [
                  { name: "SaveFrom.net", url: "https://savefrom.net" },
                  { name: "Y2Mate", url: "https://y2mate.com" },
                  { name: "SnapInsta", url: "https://snapinsta.app" },
                ],
              },
              { status: 429 }
            ); // 429 = Too Many Requests (rate limited)
          }
        }
      } catch (error) {
        console.error("❌ All YouTube methods failed:", error);
        return NextResponse.json(
          {
            error:
              "YouTube download temporarily unavailable due to bot protection. Please use alternative methods.",
            isYouTubeBlocked: true,
          },
          { status: 503 }
        ); // 503 = Service Unavailable
      }
    }

    // For non-YouTube URLs - Try direct file download
    console.log("🔍 Attempting direct file download...");

    try {
      // First, check if it's a direct file URL
      const response = await fetch(cleanUrl, {
        method: "HEAD",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 10000,
      });

      const contentType = response.headers.get("content-type") || "";
      const contentLength = response.headers.get("content-length");

      console.log("📋 Direct URL check:", {
        status: response.status,
        contentType,
        contentLength,
      });

      // If it's a direct media file
      if (
        contentType.includes("video/") ||
        contentType.includes("audio/") ||
        contentType.includes("image/")
      ) {
        if (metadataOnly) {
          return NextResponse.json({
            size: contentLength ? Number.parseInt(contentLength) : 10000000,
            contentType: contentType,
            title: "Direct-File",
            success: true,
            isRealVideo: true,
          });
        }

        console.log("✅ Direct media file detected, downloading...");

        // Download the file directly
        const fileResponse = await fetch(cleanUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (!fileResponse.ok) {
          throw new Error(`Failed to fetch file: ${fileResponse.status}`);
        }

        // Get filename from URL
        const urlPath = new URL(cleanUrl).pathname;
        const filename = urlPath.split("/").pop() || "download";

        return new NextResponse(fileResponse.body, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-cache",
            "Content-Length": contentLength || "",
          },
        });
      }

      // If not a direct file, return error
      return NextResponse.json(
        {
          error:
            "This URL is not supported. Only direct file URLs and YouTube (when not blocked) are supported.",
          supportedTypes: [
            "Direct video/audio/image files",
            "YouTube (when available)",
          ],
        },
        { status: 400 }
      );
    } catch (directError) {
      console.error("❌ Direct download failed:", directError);
      return NextResponse.json(
        {
          error:
            "Failed to download file. URL may not be accessible or may not be a direct file link.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("💥 API Error:", error);
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
