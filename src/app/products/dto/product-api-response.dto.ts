import { Product } from "./product.dto";

export interface ProductApiResponse {
    limit: number;
    products: Product[];
    skip: number;
    total: number;
  }