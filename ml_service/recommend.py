#!/usr/bin/env python3
"""
AI Placement Mentor - Scikit-Learn Recommendation Engine
Module 6 & Module 7: Uses TF-IDF vectorizer, Cosine Similarity, and Logistic Regression
Difficulty Classifier to match student interests with projects, learning resources,
and practice problems.
"""

import sys
import os
import json
import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "difficulty_classifier.pkl")
VECTORIZER_PATH = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")

def load_artifacts():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        return None, None
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)
    return model, vectorizer

def recommend(student_profile, items):
    """
    student_profile: {
        "role": str,
        "skills": list[str],
        "interests": list[str] or str,
        "coding_success_rate": float (0.0 - 1.0),
        "quiz_accuracy": float (0.0 - 1.0)
    }
    items: list of dicts with {
        "id": str,
        "title": str,
        "domain": str,
        "skills": list[str],
        "difficulty": str ("Beginner"|"Intermediate"|"Advanced" or "Easy"|"Medium"|"Hard"),
        "description": str
    }
    """
    model, vectorizer = load_artifacts()

    # Construct student profile textual document
    skills_text = " ".join(student_profile.get("skills", []))
    interests_text = student_profile.get("interests", "")
    if isinstance(interests_text, list):
        interests_text = " ".join(interests_text)
    role_text = student_profile.get("role", "")

    student_doc = f"{role_text} {skills_text} {interests_text}".strip()
    if not student_doc:
        student_doc = "software engineering python data structures algorithms"

    # Difficulty alignment based on student performance
    coding_rate = student_profile.get("coding_success_rate", 0.0)
    quiz_rate = student_profile.get("quiz_accuracy", 0.0)
    overall_mastery = (coding_rate * 0.6) + (quiz_rate * 0.4)

    # Classify student target difficulty using trained model or mastery score
    difficulty_mapping = {0: "Easy", 1: "Medium", 2: "Hard"}
    predicted_difficulty = "Medium"
    if model and vectorizer:
        try:
            vec = vectorizer.transform([f"{role_text} {student_doc}"])
            pred_idx = model.predict(vec)[0]
            predicted_difficulty = difficulty_mapping.get(pred_idx, "Medium")
        except Exception:
            predicted_difficulty = "Medium"

    # Overwrite target difficulty if mastery is clearly high or early beginner
    if overall_mastery >= 0.75:
        target_diff = "Hard"
    elif overall_mastery >= 0.45:
        target_diff = "Medium"
    else:
        target_diff = "Easy"

    # Match items using TF-IDF and Cosine Similarity
    results = []

    if not items:
        return {"items": [], "student_difficulty": target_diff, "predicted_difficulty": predicted_difficulty}

    if vectorizer:
        item_docs = []
        for item in items:
            it_skills = " ".join(item.get("skills", []))
            it_text = f"{item.get('title', '')} {item.get('domain', '')} {it_skills} {item.get('description', '')}"
            item_docs.append(it_text)

        all_docs = [student_doc] + item_docs
        tfidf_matrix = vectorizer.transform(all_docs)

        student_vector = tfidf_matrix[0:1]
        item_vectors = tfidf_matrix[1:]

        cosine_sims = cosine_similarity(student_vector, item_vectors)[0]
    else:
        cosine_sims = [0.5] * len(items)

    diff_norm = {
        "easy": 0, "beginner": 0,
        "medium": 1, "intermediate": 1,
        "hard": 2, "advanced": 2
    }
    target_num = diff_norm.get(target_diff.lower(), 1)

    for i, item in enumerate(items):
        cos_score = float(cosine_sims[i])

        # Role keyword bonus
        role_bonus = 0.2 if role_text.lower() in (item.get("domain", "") + " " + item.get("title", "")).lower() else 0.0

        # Difficulty proximity penalty/bonus
        item_diff = item.get("difficulty", "Medium").lower()
        item_num = diff_norm.get(item_diff, 1)
        diff_distance = abs(target_num - item_num)
        diff_score = 1.0 - (diff_distance * 0.35)

        # Composite score
        composite_score = (cos_score * 0.50) + (role_bonus * 0.25) + (diff_score * 0.25)

        # Generate reason
        reason_parts = []
        if cos_score > 0.2:
            reason_parts.append(f"Strong content & skill match ({cos_score:.0%} similarity)")
        if role_bonus > 0:
            reason_parts.append(f"Direct alignment with target role: {role_text}")
        if diff_distance == 0:
            reason_parts.append(f"Perfect difficulty fit for your current mastery level ({item.get('difficulty')})")
        elif diff_distance > 0:
            reason_parts.append(f"Recommended progression step ({item.get('difficulty')})")

        reason = " | ".join(reason_parts) if reason_parts else "Fundamental core topic for your placement preparation."

        results.append({
            **item,
            "cosine_similarity": round(cos_score, 4),
            "match_score": round(min(1.0, max(0.05, composite_score)), 4),
            "recommendation_reason": reason,
            "target_difficulty": target_diff
        })

    # Sort descending by composite match_score
    results.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "ranked_items": results,
        "target_difficulty": target_diff,
        "predicted_difficulty": predicted_difficulty,
        "mastery_score": round(overall_mastery, 2),
        "total_evaluated": len(results)
    }

def main():
    if len(sys.argv) > 1:
        # Input provided as JSON file or string argument
        raw_arg = sys.argv[1]
        if os.path.exists(raw_arg):
            with open(raw_arg, "r") as f:
                payload = json.load(f)
        else:
            payload = json.loads(raw_arg)
    else:
        # Read from stdin
        payload = json.load(sys.stdin)

    student_profile = payload.get("student_profile", {})
    items = payload.get("items", [])

    output = recommend(student_profile, items)
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
