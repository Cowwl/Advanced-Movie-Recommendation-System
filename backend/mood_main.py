from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import torch
import json
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.responses import JSONResponse
from typing import List

app = FastAPI()

# Load the data and precompute the necessary values
df = pd.read_csv("movies_metadata.csv")
reviews = pd.read_csv("top_1000_movie_reviews.csv")
df = df.merge(reviews, on="imdb_id")
df_mystery = df[df["genres"].str.contains("Thriller", na=False)]
top_10_mystery_movies = df_mystery.sample(10, random_state=42)
user_history = top_10_mystery_movies[
    ["title", "overview", "imdb_id", "genres"]
].dropna()
model = SentenceTransformer("all-mpnet-base-v2")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)
model = model.to(device)
embedding_size = model.get_sentence_embedding_dimension()
zero_tensor = torch.zeros((embedding_size,), device=device)


# Define utility functions
def calculate_embeddings(texts):
    if not texts:
        return zero_tensor
    embeddings = model.encode(
        texts, convert_to_tensor=True, device=device, show_progress_bar=False
    )
    return embeddings


def calculate_mood_score(
    plot,
    reviews,
    genres_json,
    popularity,
    plot_weight=0.1,
    review_weight=0.7,
    genre_weight=0.2,
):
    plot_embeddings = calculate_embeddings([plot]) if plot else zero_tensor
    review_embeddings = calculate_embeddings(reviews) if reviews else zero_tensor
    avg_review_embeddings = (
        review_embeddings.mean(dim=0) if len(review_embeddings) > 0 else zero_tensor
    )
    genres = json.loads(genres_json.replace("'", '"'))
    genre_names = " ".join([genre["name"] for genre in genres])
    genre_embeddings = (
        calculate_embeddings([genre_names]) if genre_names else zero_tensor
    )
    mood_score = (
        plot_weight * plot_embeddings
        + review_weight * avg_review_embeddings
        + genre_weight * genre_embeddings
    ) / (plot_weight + review_weight + genre_weight)
    return mood_score.cpu()


def recommend_movies(user_history, sample_movies):
    user_history_titles = set(user_history["title"].tolist())
    recommended_movies = sample_movies[
        ~sample_movies["title"].isin(user_history_titles)
    ]
    top_10_movies = recommended_movies.sort_values(
        by="similarity", ascending=False
    ).head(10)
    return top_10_movies


def search(sample_movies):
    top_10_movies = sample_movies.sort_values(
        by="search_similarity", ascending=False
    ).head(10)
    return top_10_movies


# Define data preprocessing and calculations
sample_movies = df.dropna(subset=["overview", "genres", "popularity"])
scaler = StandardScaler()
popularity = sample_movies["popularity"].values.reshape(-1, 1)
sample_movies["normalized_popularity"] = scaler.fit_transform(popularity)

movie_scores = []
for _, movie in sample_movies.iterrows():
    movie_scores.append(
        calculate_mood_score(
            movie["overview"],
            movie["reviews"],
            movie["genres"],
            movie["normalized_popularity"],
        )
    )

movie_scores_tensor = torch.stack(movie_scores)

user_history_embeddings = calculate_embeddings(user_history["overview"].tolist())
user_history_mood_score = user_history_embeddings.mean(dim=0).cpu()
movie_scores_tensor = movie_scores_tensor.squeeze()
sample_movies["similarity"] = [
    cosine_similarity(user_history_mood_score.unsqueeze(0), movie_score.unsqueeze(0))
    for movie_score in movie_scores_tensor
]

print("Data preprocessing and calculations complete!")



@app.get("/history/")
async def get_history():
    movies = [movie for movie in user_history.to_dict("records")]
    return JSONResponse(content=movies)


@app.get("/recommendations/")
async def get_recommendations():
    top_10_recommendations = recommend_movies(user_history, sample_movies)
    # Convert the similarity column to a float to avoid JSON serialization issues
    top_10_recommendations["similarity"] = top_10_recommendations["similarity"].astype(float)
    top_10_recommendations = top_10_recommendations[['title', 'imdb_id', 'overview', 'similarity', 'genres']]
    movies = [movie for movie in top_10_recommendations.to_dict("records")]
    return JSONResponse(content=movies)


@app.post("/search/")
async def search_movies(user_input: str):
    mood_prompt_embedding = calculate_embeddings([user_input])
    sample_movies["search_similarity"] = [
        cosine_similarity(mood_prompt_embedding.cpu(), movie_score.unsqueeze(0))
        for movie_score in movie_scores_tensor
    ]
    search_results = search(sample_movies)
    # Convert the similarity column to a float to avoid JSON serialization issues
    search_results["search_similarity"] = search_results["search_similarity"].astype(float)
    search_results = search_results[['title', 'imdb_id', 'overview', 'search_similarity', 'genres']]
    movies = [movie for movie in search_results.to_dict("records")]
    return JSONResponse(content=movies)
