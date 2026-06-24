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
    resize(
      width: number,
      height: number,
      options?: { fit?: string },
    ): SharpInstance;
    png(): SharpInstance;
    jpeg(options?: { quality?: number }): SharpInstance;
    webp(options?: { quality?: number }): SharpInstance;
    toBuffer(): Promise<Buffer>;
    toFile(path: string): Promise<void>;
  }

  interface SharpConstructor {
    (input?: Buffer | string, options?: { failOn?: string }): SharpInstance;
  }

  const sharp: SharpConstructor;
  export default sharp;
}
