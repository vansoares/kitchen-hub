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

export interface MenuRecipeDTO {
  id: number;
  recipeId: number;
  recipeTitle: string;
  recipeServings: number;
  servings: number;
}

export interface AggregatedIngredientDTO {
  name: string;
  unit: string;
  quantity: number;
}

export interface MenuDTO {
  id: number;
  name: string;
  recipes: MenuRecipeDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuDetailDTO extends MenuDTO {
  totalIngredients: AggregatedIngredientDTO[];
}
