export interface FlashDesign {
  designId: string;
  studioId: string;
  title: string;
  imageUrl: string;
  /** Individual price; null uses studio `flashUniformPrice`. */
  price: number | null;
  /** Preset sizes clients may choose from, e.g. "5 × 5 cm". */
  allowedSizes: string[];
  active: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}
