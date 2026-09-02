from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

class MealPlanMeal(BaseModel):
    mealType: str
    searchQuery: str
    reason: str
    recipe: Optional["RecipeInformation"] = None

class RecipeResult(BaseModel):
    id: int
    title: str
    image: str | None
    imageType: str
    

class MealPlanDay(BaseModel):
    day: int
    meals: list[MealPlanMeal]

class MealPlanResponse(BaseModel):
    summary: str
    days: list[MealPlanDay]


class IngredientMeasure(BaseModel):
    model_config = ConfigDict(extra="ignore")

    amount: float
    unitShort: str | None = None
    unitLong: str | None = None


class IngredientMeasures(BaseModel):
    model_config = ConfigDict(extra="ignore")

    us: IngredientMeasure
    metric: IngredientMeasure


class ExtendedIngredient(BaseModel):
    """Spoonacular extendedIngredients — several string fields may be null."""

    model_config = ConfigDict(extra="ignore")

    id: int
    aisle: str | None = None
    image: str | None = None
    consistency: str | None = None
    name: str
    nameClean: str | None = None
    original: str
    originalName: str | None = None
    amount: float
    unit: str | None = None
    meta: list[str] = Field(default_factory=list)
    measures: IngredientMeasures

    @field_validator("meta", mode="before")
    @classmethod
    def meta_none_to_empty(cls, v: Any) -> list[str]:
        if v is None:
            return []
        return v
class InstructionStep(BaseModel):
    model_config = ConfigDict(extra="ignore")

    number: int
    step: str
    ingredients: list[Any] = Field(default_factory=list)
    equipment: list[Any] = Field(default_factory=list)


class AnalyzedInstruction(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    steps: list[InstructionStep]


class RecipeInformation(BaseModel):

    model_config = ConfigDict(extra="ignore")

    id: int
    image: str | None = None
    imageType: str | None = None
    title: str
    readyInMinutes: int
    servings: int
    sourceUrl: str | None = None
    vegetarian: bool
    vegan: bool
    glutenFree: bool
    dairyFree: bool
    veryHealthy: bool
    cheap: bool
    veryPopular: bool
    sustainable: bool
    lowFodmap: bool
    weightWatcherSmartPoints: int
    gaps: str | None = None
    preparationMinutes: Optional[int] = None
    cookingMinutes: Optional[int] = None
    aggregateLikes: int
    healthScore: int
    creditsText: Optional[str] = None
    license: Optional[str] = None
    sourceName: str
    pricePerServing: float
    extendedIngredients: list[ExtendedIngredient] = Field(default_factory=list)
    summary: str | None = None
    cuisines: list[str] = Field(default_factory=list)
    dishTypes: list[str] = Field(default_factory=list)
    diets: list[str] = Field(default_factory=list)
    occasions: list[str] = Field(default_factory=list)
    instructions: str | None = None
    analyzedInstructions: list[AnalyzedInstruction] = Field(default_factory=list)
    language: str | None = None
    spoonacularScore: float
    spoonacularSourceUrl: str | None = None

    @field_validator(
        "cuisines",
        "dishTypes",
        "diets",
        "occasions",
        "analyzedInstructions",
        "extendedIngredients",
        mode="before",
    )
    @classmethod
    def none_list_to_empty(cls, v: Any) -> Any:
        if v is None:
            return []
        return v