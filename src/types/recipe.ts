export interface RecipeIngredientDTO {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeDTO {
  id: number;
  title: string;
  servings: number;
  instructions: string | null;
  ingredients: RecipeIngredientDTO[];
  createdAt: string;
  updatedAt: string;
}
