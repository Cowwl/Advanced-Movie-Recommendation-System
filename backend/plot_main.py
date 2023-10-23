import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import torch
from transformers import BertTokenizer, BertModel, BertForSequenceClassification
from sklearn.metrics.pairwise import cosine_similarity
import random
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import json
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler
from fastapi.responses import JSONResponse


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

model = SentenceTransformer('all-mpnet-base-v2')

def get_sbert_embeddings(text, model, device):
    embeddings = model.encode(text, convert_to_tensor=True)
    embeddings = embeddings.cpu()

    # # Scale the embeddings to be between 0 and 1
    # min_val = np.min(embeddings)
    # max_val = np.max(embeddings)
    # embeddings = (embeddings - min_val) / (max_val - min_val)

    return embeddings

def process_countries(countries):
    countries = eval(countries)
    country_names = ', '.join([country['name'] for country in countries])
    return country_names

def process_genres(genres):
    genres = eval(genres)
    genre_names = ', '.join([genre['name'] for genre in genres])
    return genre_names

def process_cast(cast):
    cast_list = eval(cast)
    cast_names = ', '.join([actor['name'] for actor in cast_list])
    return cast_names

def search(sample_movies):
    top_10_movies = sample_movies.sort_values(
        by="search_similarity", ascending=False
    ).head(10)
    return top_10_movies

df = pd.read_csv('movies_metadata.csv', usecols=['id','title', 'overview', 'genres', 'production_countries', 'popularity','imdb_id'])
cast_df = pd.read_csv('credits.csv')

df = df[df['id'].str.isnumeric()]
df['id'] = df['id'].astype(int)
df = df.merge(cast_df, on='id', how='left')
df.drop('id', axis=1, inplace=True)
df['popularity'] = pd.to_numeric(df['popularity'], errors='coerce')

# Sort by popularity and take the top 1000 records
df = df.sort_values(by='popularity', ascending=False).head(1000)
df.drop('popularity', axis=1, inplace=True)
df.dropna(inplace=True)

# Initialize GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Move the model to the GPU
model.to(device)

# Process the data using GPU
df['genres'] = df['genres'].apply(process_genres)
vectorizer_genre = TfidfVectorizer()
df['genre_embeddings'] = list(vectorizer_genre.fit_transform(df['genres']).toarray())

# Encode movie overviews (plots) using SBERT
df['overview_embeddings'] = df['overview'].apply(lambda x: get_sbert_embeddings(x, model, device).numpy())

# Process location (production_countries) using TfidfVectorizer
df['production_countries'] = df['production_countries'].apply(process_countries)
vectorizer_location = TfidfVectorizer()
df['location_embeddings'] = list(vectorizer_location.fit_transform(df['production_countries']).toarray())

# Process cast using TfidfVectorizer
df['cast'] = df['cast'].apply(process_cast)
vectorizer_cast = TfidfVectorizer()
df['cast_embeddings'] = list(vectorizer_cast.fit_transform(df['cast']).toarray())

# Process title using TfidfVectorizer
vectorizer_title = TfidfVectorizer()
df['title_embeddings'] = list(vectorizer_title.fit_transform(df['title']).toarray())


def recommend_movies(user_history):
    similarity_scores = []
    for _, row in df.iterrows():
        user_movie_features_list = []
        for movie in user_history:
            user_movie_overview_embeddings = df.loc[df['title'] == movie, 'overview_embeddings'].values
            if user_movie_overview_embeddings.size > 0:
                user_movie_features = np.concatenate((user_movie_overview_embeddings[0] * 5,
                                                      df.loc[df['title'] == movie, 'title_embeddings'].values[0] * 1,
                                                      df.loc[df['title'] == movie, 'location_embeddings'].values[0] * 0.5,
                                                      df.loc[df['title'] == movie, 'cast_embeddings'].values[0] * 0.8,
                                                      df.loc[df['title'] == movie, 'genre_embeddings'].values[0] * 1.5),
                                                      axis=None)
                user_movie_features_list.append(user_movie_features)
        if user_movie_features_list:
            user_movie_features_avg = np.mean(user_movie_features_list, axis=0)
            movie_features = np.concatenate((row['overview_embeddings'] * 5,
                                             row['title_embeddings'] * 1,
                                             row['location_embeddings'] * 0.5,
                                             row['cast_embeddings'] * 0.8,
                                             row['genre_embeddings'] * 1.5),
                                             axis=None)
            similarity_score = cosine_similarity([user_movie_features_avg], [movie_features])[0][0]
            similarity_scores.append(similarity_score)
        else:
            similarity_scores.append(0)

    df['similarity_score'] = similarity_scores
    recommendations = df[~df['title'].isin(user_history)]

    # Sort by plot similarity (similarity_score) instead of popularity
    recommendations = recommendations.sort_values(by='similarity_score', ascending=False)

    recommendations_top10_titles = recommendations.head(10)

    return recommendations_top10_titles, similarity_score


app = FastAPI()

user_history_data = ['Mission: Impossible III', 'Star Trek Beyond', 'The Punisher', 'King Arthur: Legend of the Sword', 'Total Recall']

# @app.get("/recommend-movies-plot")
# async def recommend_movies_endpoint():
#     # This endpoint will recommend movies based on the user's history.
#     if not user_history_data:
#         raise HTTPException(status_code=400, detail="User history not provided")
    
#     recommendations = recommend_movies(user_history_data)

#     # Create a list of lists where IMDb ID corresponds to the respective title
#     recommended_movies = [[title, imdb_id] for title, imdb_id in zip(recommendations['title'], recommendations['imdb_id'])]

#     return recommended_movies
  


@app.get("/recommend-movies-plot")
async def recommend_movies_endpoint():
    top_10_recommendations, _ = recommend_movies(user_history_data)
    # Convert the similarity column to a float to avoid JSON serialization issues
    top_10_recommendations["similarity_score"] = top_10_recommendations["similarity_score"].astype(float)
    top_10_recommendations = top_10_recommendations[['title', 'imdb_id', 'overview', 'similarity_score', 'genres']]
    movies = [movie for movie in top_10_recommendations.to_dict("records")]
    return JSONResponse(content=movies)


movie_scores = []
_, movie_scores = recommend_movies(user_history_data)

movie_scores = torch.from_numpy(movie_scores)

movie_scores_tensor = torch.stack(movie_scores)

@app.post("/search/")
async def search_movies(user_input: str):
    plot_prompt_embedding = get_sbert_embeddings(user_input,model,device)
    df["search_similarity"] = [
        cosine_similarity(plot_prompt_embedding.cpu(), movie_scores.unsqueeze(0))
        for movie_scores in movie_scores_tensor
    ]
    search_results = search(df)
    # Convert the similarity column to a float to avoid JSON serialization issues
    search_results["search_similarity"] = search_results["search_similarity"].astype(float)
    search_results = search_results[['title', 'imdb_id', 'overview', 'search_similarity', 'genres']]
    movies = [movie for movie in search_results.to_dict("records")]
    return JSONResponse(content=movies)

