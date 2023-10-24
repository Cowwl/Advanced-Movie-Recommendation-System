# Advanced Movie Recommendation System

This project is the submission for Amazon HackOn Season 3 by Team Hackverlords from BITS Pilani, Hyderabad Campus. Our project is an Advanced Movie Recommendation System that leverages machine learning and user-generated content for personalized movie recommendations.

## Prototype Video

You can watch a detailed demonstration of our project in this [Prototype Video](https://drive.google.com/file/d/1-pJYRUeIow-3jsFRKaUuVm79-rdjPzKl/view).

## Team Information

- **Team Name:** Hackverlords
- **Institution:** BITS Pilani, Hyderabad Campus

## Dataset

For building the recommendation system, we used "The Movies Dataset" available on Kaggle. You can access the dataset [here](https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset).

## API for Thumbnails and Movie Details

We used the OMDb API to fetch movie details, thumbnails, and additional information. You can find the API documentation [here](https://www.omdbapi.com/).

## Custom Scraped Reviews Dataset

To enhance our recommendation system's accuracy, we gathered a custom scraped reviews dataset. You can download the dataset [here](https://drive.google.com/file/d/1MQyYZtUyaRqvlSL8zRt33fxzuPJ9AtXv/view?usp=sharing).

## Documentation

All the details about our recommendation system, including how it works, its components, and the algorithms used, are provided in the documentation. You can find the documentation in the root folder of the repository.

## Installation and Execution

To run our recommendation system, follow these steps:

1. Create a virtual environment.
2. Install the necessary libraries from `requirements.txt`.
3. Run the `main.py` file using `uvicorn main:main_app`.
4. To run the frontend, navigate to the `frontend` folder.
5. Run `npm install --force` to install frontend dependencies.
6. Run `npm run start` to start the frontend.
