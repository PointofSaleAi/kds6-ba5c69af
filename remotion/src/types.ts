export interface VideoStep {
  title: string;
  instruction: string;
  image?: string;
}

export interface VideoIngredient {
  name: string;
  qty: string;
  image?: string;
  allergen?: string;
}

export interface RecipeVideoProps {
  productName: string;
  steps: VideoStep[];
  ingredients?: VideoIngredient[];
  durationSeconds: number;
  headerColor?: string;
}
