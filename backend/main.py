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
