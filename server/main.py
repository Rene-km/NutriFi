from pydantic_core import from_json
import os
from typing import Any
import re
import json

import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from supabase import create_client, Client
from response import MealPlanResponse, RecipeInformation, RecipeResult

load_dotenv()
client = OpenAI()

app = FastAPI()
api_key = os.getenv("API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not api_key:
    raise ValueError("API_KEY is not set")
if not supabase_url:
    raise ValueError("SUPABASE_URL is not set")
if not supabase_key:
    raise ValueError("SUPABASE_KEY is not set")


supabase: Client = create_client(supabase_url, supabase_key)





def spoonacular_complex_search(query: str, number: int = 10) -> list[dict[str, Any]]:
    """Shared Spoonacular complexSearch — used by the HTTP route and meal-plan enrichment."""
    if not api_key:
        raise ValueError("API_KEY is not set")
    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {"apiKey": api_key, "query": query, "number": number}
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    items = data.get("results", [])
    if not isinstance(items, list):
        return []
    return items


def get_recipe_infomation(recipe_id: str | int) -> dict[str, Any]:
    """Shared recipe information JSON — used by the HTTP route and meal-plan enrichment."""
    key = str(recipe_id)
    # 1. Try DB cache
    cached = (
        supabase.table("recipe_data")
        .select("data")
        .eq("recipe_id", key)
        .limit(1)
        .execute()
    )
    if cached.data and len(cached.data) > 0:
        return cached.data[0]["data"]

    if not api_key:
        raise ValueError("API_KEY is not set")
    url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
    params = {"apiKey": api_key}
    response = requests.get(url, params=params)
    data = response.json()
    response.raise_for_status()

    data = re.sub(r'\bNaN\b', 'null', response.text)
    data = json.loads(data)

    supabase.table("recipe_data").upsert({
        "recipe_id": key,
        "data": data,
    }).execute()

    return data

def update_meal_plan(meal_plan: MealPlanResponse) -> None:
    meals_by_type: dict[str, list] = {}
    for day in meal_plan.days:
        for meal in day.meals:
            meals_by_type.setdefault(meal.mealType, []).append(meal)

    for meal_type, meals in meals_by_type.items():
        query = meals[0].searchQuery
        results = spoonacular_complex_search(query, number=len(meals))
        for i, meal in enumerate(meals):
            if i >= len(results):
                break
            recipe_id = results[i]["id"]
            data = get_recipe_infomation(recipe_id)
            meal.recipe = RecipeInformation.model_validate(data)
            print(meal.recipe.id)


class Recipe_Query(BaseModel):
    query: str


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/recipes/search")
def search_recipe(query: Recipe_Query) -> list[RecipeResult]:
    res = spoonacular_complex_search(query.query, number=10)
    return [RecipeResult.model_validate(i) for i in res]


@app.get("/recipes/{recipe_id}/information")
def get_recipe(recipe_id: str) -> RecipeInformation:
    data = get_recipe_infomation(recipe_id)
    return RecipeInformation.model_validate(data)


class planReq(BaseModel):
    goal: str
    days: str
    mealsPerDay: str
    anythingElse: str | None



@app.post("/mealPlan")
def get_meal_plan(planReq: planReq):
    plan = client.responses.create(
        model="gpt-5-mini",
        input=f"""
Generate a meal plan as strict JSON only.


Important:
- The searchQuery must be easy for Spoonacular to match.
- Use short, broad, common recipe search terms.
- searchQuery should usually be 2 to 4 words.
- Prefer common dish names over descriptive phrases.
- Do not include long ingredient lists.
- Do not include brand names.
- Do not include extra adjectives unless needed.
- Do not include cooking instructions.
- Do not include recipe ids, URLs, or nutrition facts.
- Keep meals realistic and varied.
- Make the summary easy to read and understand.
Search query rules:
- Day 1's searchQuery for each meal type will be used to search for ALL days of that meal type.
- So day 1's searchQuery MUST be broad enough to return {planReq.days} varied results.
- Day 2+ searchQuery fields are still required in the JSON but are ignored for search — keep them descriptive for display only.
- Day 1 query examples for a high protein goal: "high protein breakfast", "chicken lunch", "beef dinner"
- Day 1 query examples for a vegan goal: "vegan breakfast", "vegan lunch", "vegan dinner"
- Day 1 query examples for weight loss: "low calorie breakfast", "light lunch", "lean dinner"
- Always factor in the user's goal when writing day 1's searchQuery.
- The summary should be easy to read and understand.
- The summary should be descriptive of the meal plan.

Bad searchQuery examples:
- high protein greek yogurt berry bowl with chia seeds
- quick healthy chicken stir fry with brown rice and broccoli
- easy low calorie roasted salmon with quinoa and vegetables

Return this exact JSON shape:
{{
  "summary": "short summary",
  "days": [
    {{
      "day": 1,
      "meals": [
        {{
          "mealType": "breakfast",
          "searchQuery": "oatmeal",
          "reason": "Simple filling breakfast."
        }},
        {{
          "mealType": "lunch",
          "searchQuery": "lentil salad",
          "reason": "Balanced lunch with protein and fiber."
        }},
        {{
          "mealType": "dinner",
          "searchQuery": "tofu stir fry",
          "reason": "Quick dinner that fits the plan."
        }}
      ]
    }}
  ]
}}

User request:
- Goal: {planReq.goal}
- Days: {planReq.days}
- Meals per day: {planReq.mealsPerDay}
- Extra notes: {planReq.anythingElse if planReq.anythingElse else "none"}
"""
,
    )
    # TODO: error path
    meal_plan = MealPlanResponse.model_validate(from_json(plan.output_text, allow_partial=True))
    update_meal_plan(meal_plan)
    return meal_plan


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 