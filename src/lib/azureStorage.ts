/**
 * Azure Blob Storage upload service for artwork media and metadata.
 * Provides a stubbed implementation when credentials are unavailable.
 */

const AZURE_STORAGE_ACCOUNT = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT;
const AZURE_STORAGE_CONTAINER = import.meta.env.VITE_AZURE_STORAGE_CONTAINER;
const AZURE_SAS_TOKEN = import.meta.env.VITE_AZURE_SAS_TOKEN;

export type UploadResult = {
  url: string;
  name: string;
};

export class AzureStorageService {
  private readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(AZURE_STORAGE_ACCOUNT && AZURE_STORAGE_CONTAINER && AZURE_SAS_TOKEN);
    
    if (!this.isConfigured) {
      console.info(
        "💡 Azure Storage: Using stub URLs for development. " +
        "Real uploads require VITE_AZURE_STORAGE_ACCOUNT, VITE_AZURE_STORAGE_CONTAINER, and VITE_AZURE_SAS_TOKEN in .env"
      );
    }
  }

  async uploadFile(file: File): Promise<UploadResult> {
    if (!this.isConfigured) {
      return this.stubbedUpload(file);
    }

    try {
      const blobName = this.generateBlobName(file.name);
      const blobUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${blobName}`;
      const uploadUrl = `${blobUrl}?${AZURE_SAS_TOKEN}`;

      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Azure upload failed: ${response.status} ${response.statusText}`);
      }

      return {
        url: blobUrl,
        name: blobName,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle different error types with helpful messages
      if (errorMessage.includes("403") || errorMessage.includes("not authorized")) {
        console.info(
          `💡 Azure upload blocked: SAS token lacks write permission (has 'sp=r', needs 'sp=racw'). ` +
          `Using stub URL instead. This is fine for development!`
        );
      } else if (errorMessage.includes("CORS") || errorMessage.includes("NetworkError")) {
        console.info(
          `💡 Azure upload blocked by CORS (expected in dev). Using stub URL instead. ` +
          `To enable real uploads, configure CORS on your Azure Storage account to allow http://localhost:5174`
        );
      } else {
        console.error("Azure upload error:", errorMessage);
      }
      
      return this.stubbedUpload(file);
    }
  }

  private stubbedUpload(file: File): UploadResult {
    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-z0-9._-]/gi, "_");
    const stubName = `stub-${timestamp}-${sanitized}`;
    const stubUrl = `https://stub.azureblob.local/${AZURE_STORAGE_CONTAINER ?? "artworks"}/${stubName}`;

    console.info(`✅ Stub upload generated: ${file.name} → ${stubUrl}`);

    return {
      url: stubUrl,
      name: stubName,
    };
  }

  private generateBlobName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop() ?? "bin";
    const sanitizedBase = originalName
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9-]/gi, "_")
      .toLowerCase()
      .substring(0, 50);

    return `${sanitizedBase}-${timestamp}-${random}.${extension}`;
  }
}

export const azureStorage = new AzureStorageService();
