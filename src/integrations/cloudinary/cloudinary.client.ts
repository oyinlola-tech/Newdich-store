export class CloudinaryClient {
  constructor(
    private readonly cloudName: string,
    private readonly apiKey: string,
    private readonly apiSecret: string
  ) {}

  async upload(buffer: Buffer, publicId: string, folder = 'telente'): Promise<string> {
    const formData = new FormData();
    formData.append('file', new Blob([new Uint8Array(buffer)]));
    formData.append('upload_preset', '');
    formData.append('public_id', publicId);
    formData.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.status}`);
    }

    const body = (await response.json()) as { secure_url: string };
    return body.secure_url;
  }
}
