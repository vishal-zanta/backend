import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// The folder where files will be stored. By putting it in "public/uploads",
// it is automatically served by express.static("public"), which has directory indexing
// DISABLED by default. So nobody can see the files unless they know the exact URL.
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export class StorageService {
  /**
   * Initializes the storage directory.
   */
  static async init() {
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      console.log(`[StorageService] Uploads directory initialized at ${UPLOADS_DIR}`);
      // Note: To make a folder completely undeletable, you would typically use OS commands like 'chattr +i' on Linux.
      // From the code side, we simply ensure this directory is NEVER deleted by our scripts.
    } catch (error) {
      console.error("[StorageService] Failed to initialize uploads directory", error);
    }
  }

  /**
   * Uploads or updates a file. Acts exactly like an S3 putObject command.
   * If the file already exists at the given key, it will be updated (overwritten).
   * 
   * @param key The S3-like key/path (e.g., "profiles/citizen-123.jpg" or "complaints/image1.png")
   * @param fileBuffer The raw file buffer from multer/busboy
   * @param mimetype The MIME type of the file
   * @returns The public URL path of the uploaded file
   */
  static async uploadFile(key: string, fileBuffer: Buffer, mimetype: string): Promise<string> {
    // Prevent directory traversal attacks
    const normalizedKey = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(UPLOADS_DIR, normalizedKey);
    const directory = path.dirname(filePath);

    // Ensure the sub-directory exists
    await fs.mkdir(directory, { recursive: true });

    let finalBuffer = fileBuffer;

    // Apply high-quality compression to images
    if (mimetype.startsWith("image/")) {
      try {
        finalBuffer = await sharp(fileBuffer)
          .webp({ quality: 90, nearLossless: true })
          .toBuffer();
      } catch (error) {
        console.warn("[StorageService] Image compression failed, saving original file...", error);
      }
    }

    // Write file. Overwrites if it already exists (which handles the update requirement)
    await fs.writeFile(filePath, finalBuffer);

    // Return the public URL path that can be saved to the database
    return `/uploads/${key}`;
  }

  /**
   * Deletes a specific file by its key, without ever touching the main folder.
   */
  // static async deleteFile(key: string): Promise<void> {
  //   try {
  //     const normalizedKey = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '');
  //     const filePath = path.join(UPLOADS_DIR, normalizedKey);
  //     await fs.unlink(filePath);
  //   } catch (error: any) {
  //     if (error.code !== "ENOENT") {
  //       console.error(`[StorageService] Error deleting file ${key}`, error);
  //     }
  //   }
  // }
}

// Auto-initialize the directory so it's guaranteed to exist and won't crash
StorageService.init();
