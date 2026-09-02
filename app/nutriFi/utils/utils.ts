import { RecipeResult } from "@/lib/api";

export type Landmark = {
    x: number
    y: number;
    z: number;
    visibility: number;
    presence: number;
}

export function createVector(landmark1 : Landmark, landmark2 : Landmark): number[] {
    const x1 = landmark1.x
    const y1 = landmark1.y
    const x2 = landmark2.x
    const y2 = landmark2.y

    const x3 =  x2 - x1 
    const y3 = y2 - y1

    const vector = [x3,y3]
    return vector
    
}

export function magnitude(vector: number[]) {
    const sum = vector[0]**2 + vector[1]**2
    const c = Math.sqrt(sum)
    return c
}

export function Angle(vector1: number[], vector2: number[]) {
    const mag1 = magnitude(vector1)
    const mag2 = magnitude(vector2)

    const dotProductX = vector1[0] * vector2[0]
    const dotProductY = vector1[1] * vector2[1]
    const sum = dotProductX + dotProductY

    const divisor = mag1 * mag2

    const angle = Math.acos(sum / divisor)
    return angle * (180 / Math.PI);
}

export function GetAngle(landmark1 : Landmark, landmark2 : Landmark, landmark3: Landmark) {

    const u = createVector(landmark2, landmark1)
    const v = createVector(landmark2,landmark3)

    return Angle(u,v)

}

export type mealPlanMeal = {
    mealType: string
    searchQuery: string
    reason: string
    recipe: recipeInformation | null
}

export type mealPlanDay = {
  day: number
  meals: mealPlanMeal[]
}

export type mealPlanResult = {
   id: string
   summary: string
   days: mealPlanDay[]
}


export type ingredientMeasure = {
    amount: number
    unitShort: string
    unitLong: string
  }
  
  export type ingredientMeasures = {
    us: ingredientMeasure
    metric: ingredientMeasure
  }
  
  export type extendedIngredient = {
    id: number
    aisle: string
    image: string
    consistency: string
    name: string
    nameClean: string
    original: string
    originalName: string
    amount: number
    unit: string
    meta: string[]
    measures: ingredientMeasures
  }
  
  
  export type instructionStep = {
    number: number
    step: string
    ingredients: unknown[]
    equipment: unknown[]
  }
  
  export type analyzedInstruction = {
    name: string
    steps: instructionStep[]
  }
  

  export type recipeInformation = {
    id: number
    image: string
    imageType: string
    title: string
    readyInMinutes: number
    servings: number
    sourceUrl: string
    vegetarian: boolean
    vegan: boolean
    glutenFree: boolean
    dairyFree: boolean
    veryHealthy: boolean
    cheap: boolean
    veryPopular: boolean
    sustainable: boolean
    lowFodmap: boolean
    weightWatcherSmartPoints: number
    gaps: string
    preparationMinutes: number | null
    cookingMinutes: number | null
    aggregateLikes: number
    healthScore: number
    creditsText: string | null
    license: string | null
    sourceName: string
    pricePerServing: number
    extendedIngredients: extendedIngredient[]
    summary: string
    cuisines: string[]
    dishTypes: string[]
    diets: string[]
    occasions: string[]
    instructions: string
    analyzedInstructions: analyzedInstruction[]
    language: string
    spoonacularScore: number
    spoonacularSourceUrl: string
  }


 