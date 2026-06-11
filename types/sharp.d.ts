declare module "sharp" {
  interface SharpInstance {
    metadata(): Promise<{
      width?: number;
      height?: number;
      format?: string;
    }>;
    composite(
      images: Array<{ input: Buffer; blend?: string }>
    ): SharpInstance;
    png(): SharpInstance;
    jpeg(options?: { quality?: number }): SharpInstance;
    webp(options?: { quality?: number }): SharpInstance;
    toBuffer(): Promise<Buffer>;
  }

  interface SharpConstructor {
    (input?: Buffer, options?: { failOn?: string }): SharpInstance;
  }

  const sharp: SharpConstructor;
  export default sharp;
}
