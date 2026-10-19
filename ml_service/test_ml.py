#!/usr/bin/env python3
"""
Unit tests for Scikit-Learn ML Component (Module 6)
Validates model artifacts, evaluation metrics, TF-IDF transformations, and recommendation output.
"""

import os
import sys
import json
import unittest
import pickle
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from recommend import recommend

class TestMLComponent(unittest.TestCase):
    def test_artifacts_exist(self):
        model_path = os.path.join(BASE_DIR, "models", "difficulty_classifier.pkl")
        vectorizer_path = os.path.join(BASE_DIR, "models", "tfidf_vectorizer.pkl")
        metrics_path = os.path.join(BASE_DIR, "evaluation_metrics.json")

        self.assertTrue(os.path.exists(model_path), "Model artifact difficulty_classifier.pkl missing")
        self.assertTrue(os.path.exists(vectorizer_path), "Vectorizer artifact tfidf_vectorizer.pkl missing")
        self.assertTrue(os.path.exists(metrics_path), "Metrics file evaluation_metrics.json missing")

    def test_metrics_values(self):
        metrics_path = os.path.join(BASE_DIR, "evaluation_metrics.json")
        with open(metrics_path, "r") as f:
            data = json.load(f)

        self.assertIn("accuracy", data)
        self.assertGreater(data["accuracy"], 0.33)  # Better than random guessing on 3 classes
        self.assertIn("precision_weighted", data)
        self.assertIn("recall_weighted", data)
        self.assertIn("f1_score_weighted", data)
        self.assertIn("confusion_matrix", data)

    def test_recommendation_ranking(self):
        profile = {
            "role": "Data Scientist",
            "skills": ["python", "pandas", "machine learning"],
            "interests": "predictive modeling deep learning data visualization",
            "coding_success_rate": 0.8,
            "quiz_accuracy": 0.85
        }
        items = [
            {
                "id": "item1",
                "title": "Machine Learning Customer Churn Predictor",
                "domain": "Data Science",
                "skills": ["python", "pandas", "scikit-learn"],
                "difficulty": "Intermediate",
                "description": "Predict customer churn using decision trees and logistic regression."
            },
            {
                "id": "item2",
                "title": "React Native Mobile Navigation",
                "domain": "Mobile Development",
                "skills": ["react", "javascript", "css"],
                "difficulty": "Beginner",
                "description": "Tab and stack navigation for mobile applications."
            }
        ]

        result = recommend(profile, items)
        self.assertIn("ranked_items", result)
        self.assertEqual(len(result["ranked_items"]), 2)
        # Data Science project should rank higher than Mobile Dev project for Data Scientist profile
        self.assertEqual(result["ranked_items"][0]["id"], "item1")
        self.assertGreater(result["ranked_items"][0]["match_score"], result["ranked_items"][1]["match_score"])

if __name__ == "__main__":
    unittest.main()
