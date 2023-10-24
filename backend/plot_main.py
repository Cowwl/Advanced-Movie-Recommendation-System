import pandas as pd
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

# Initialize FastAPI app
plot_app = FastAPI()

# Load the SentenceTransformer model
model = SentenceTransformer("all-mpnet-base-v2")


# Function to calculate SBERT embeddings
def get_sbert_embeddings(text, model, device):
    embeddings = model.encode(text, convert_to_tensor=True)
    embeddings = embeddings.cpu()
    return embeddings


# Function to process lists of items
def process_items(items):
    items = eval(items)
    item_names = ", ".join([item["name"] for item in items])
    return item_names


# Load movie data
df = pd.read_csv(
    "movies_metadata.csv",
    usecols=[
        "id",
        "title",
        "overview",
        "genres",
        "production_countries",
        "popularity",
        "imdb_id",
    ],
)
cast_df = pd.read_csv("credits.csv")

# Filter and clean the movie data
df = df[df["id"].str.isnumeric()]
df["id"] = df["id"].astype(int)
df = df.merge(cast_df, on="id", how="left")
df.drop("id", axis=1, inplace=True)
df["popularity"] = pd.to_numeric(df["popularity"], errors="coerce")

# Sort and select top 1000 popular movies
df = df.sort_values(by="popularity", ascending=False).head(1000)
df.drop("popularity", axis=1, inplace=True)
df.dropna(inplace=True)

# Determine device for SBERT model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Process genres, overviews, countries, and cast
df["genres"] = df["genres"].apply(process_items)
vectorizer_genre = TfidfVectorizer()
df["genre_embeddings"] = list(vectorizer_genre.fit_transform(df["genres"]).toarray())
df["overview_embeddings"] = df["overview"].apply(
    lambda x: get_sbert_embeddings(x, model, device).numpy()
)
df["production_countries"] = df["production_countries"].apply(process_items)
vectorizer_location = TfidfVectorizer()
df["location_embeddings"] = list(
    vectorizer_location.fit_transform(df["production_countries"]).toarray()
)
df["cast"] = df["cast"].apply(process_items)
vectorizer_cast = TfidfVectorizer()
df["cast_embeddings"] = list(vectorizer_cast.fit_transform(df["cast"]).toarray())
vectorizer_title = TfidfVectorizer()
df["title_embeddings"] = list(vectorizer_title.fit_transform(df["title"]).toarray())

df_mystery = df[df["genres"].str.contains("Thriller", na=False)]
top_10_mystery_movies = df_mystery.sample(10, random_state=42)
user_history_data = top_10_mystery_movies[["title"]].dropna()

# Function to recommend movies based on user history
def recommend_movies(user_history):
    similarity_scores = []
    for _, row in df.iterrows():
        user_movie_features_list = []
        for movie in user_history:
            user_movie_overview_embeddings = df.loc[
                df["title"] == movie, "overview_embeddings"
            ].values
            if user_movie_overview_embeddings.size > 0:
                user_movie_features = np.concatenate(
                    (
                        user_movie_overview_embeddings[0] * 5,
                        df.loc[df["title"] == movie, "title_embeddings"].values[0] * 1,
                        df.loc[df["title"] == movie, "location_embeddings"].values[0]
                        * 0.5,
                        df.loc[df["title"] == movie, "cast_embeddings"].values[0] * 0.8,
                        df.loc[df["title"] == movie, "genre_embeddings"].values[0]
                        * 1.5,
                    ),
                    axis=None,
                )
                user_movie_features_list.append(user_movie_features)
        if user_movie_features_list:
            user_movie_features_avg = np.mean(user_movie_features_list, axis=0)
            movie_features = np.concatenate(
                (
                    row["overview_embeddings"] * 5,
                    row["title_embeddings"] * 1,
                    row["location_embeddings"] * 0.5,
                    row["cast_embeddings"] * 0.8,
                    row["genre_embeddings"] * 1.5,
                ),
                axis=None,
            )
            similarity_score = cosine_similarity(
                [user_movie_features_avg], [movie_features]
            )[0][0]
            similarity_scores.append(similarity_score)
        else:
            similarity_scores.append(0)

    df["similarity_score"] = similarity_scores
    recommendations = df[~df["title"].isin(user_history)]
    recommendations = recommendations.sort_values(
        by="similarity_score", ascending=False
    )
    recommendations_top10_titles = recommendations.head(10)
    return recommendations_top10_titles


# Sample user history data
user_history_data = [
    "Mission: Impossible III",
    "Star Trek Beyond",
    "The Punisher",
    "King Arthur: Legend of the Sword",
    "Total Recall",
]

top_10_recommendations = recommend_movies(user_history_data)

top_10_recommendations = top_10_recommendations[
    ["title", "imdb_id", "overview", "similarity_score", "genres"]
]
# Endpoint to recommend movies based on user history
@plot_app.get("/recommend-movies-plot")
async def recommend_movies_endpoint():
    movies = [movie for movie in top_10_recommendations.to_dict("records")]
    return JSONResponse(content=movies)


# Create SBERT embeddings for movie overviews as a tensor
movie_overview_embeddings = torch.tensor(
    np.concatenate(df["overview_embeddings"].values).reshape(-1, 768)
)


# Function to search for movies based on plot similarity
def search_movies(plot_prompt_embedding, movie_overview_embeddings):
    print(plot_prompt_embedding.shape)  # (768), reshape to (1, 768)
    plot_prompt_embedding = plot_prompt_embedding.unsqueeze(0)
    print(plot_prompt_embedding.shape)  # (1, 768)
    print(movie_overview_embeddings.shape)  # (1000, 768)
    # Find the top 10 most similar movies by running a loop
    df["search_similarity"] = [
        cosine_similarity(plot_prompt_embedding.cpu(), movie_score.unsqueeze(0))
        for movie_score in movie_overview_embeddings
    ]
    search_results = df.sort_values(by="search_similarity", ascending=False).head(10)
    return search_results


# Endpoint to search for movies based on plot similarity
@plot_app.post("/search-plot/")
async def search_movies_endpoint(user_input: str):
    plot_prompt_embedding = get_sbert_embeddings(user_input, model, device)
    search_results = search_movies(plot_prompt_embedding, movie_overview_embeddings)
    # Convert search similarity score to a float
    search_results["search_similarity"] = search_results["search_similarity"].astype(
        float
    )
    search_results = search_results[
        ["title", "imdb_id", "overview", "search_similarity", "genres"]
    ]
    movies = [movie for movie in search_results.to_dict("records")]
    return JSONResponse(content=movies)
