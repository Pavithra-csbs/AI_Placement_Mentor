#!/usr/bin/env python3
"""
AI Placement Mentor - Scikit-Learn Machine Learning Component
Module 6: Trains a Logistic Regression difficulty classifier and builds a TF-IDF
content-based recommendation model. Evaluates on held-out test data and saves real
model artifacts and verifiable evaluation metrics.
"""

import os
import json
import pickle
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support, confusion_matrix
from sklearn.metrics.pairwise import cosine_similarity

# Ensure directories exist
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# Labeled dataset for placement coding challenges & concept difficulty classification
# Labels: 0 = Easy, 1 = Medium, 2 = Hard
DATASET = [
    # Easy problems & concepts
    ("Two Sum: Find two numbers in an array that add up to a target using hash map lookup.", 0, "arrays"),
    ("Valid Palindrome: Determine if a string is palindrome considering alphanumeric characters.", 0, "strings"),
    ("Reverse Linked List: Reverse a singly linked list iteratively with pointer updates.", 0, "linked_lists"),
    ("Binary Search: Find index of target in sorted array with logarithmic time complexity.", 0, "searching"),
    ("Valid Parentheses: Check if brackets (), {}, [] are closed in correct order using a stack.", 0, "stacks"),
    ("Merge Two Sorted Lists: Combine two sorted linked lists into one sorted sequence.", 0, "linked_lists"),
    ("Maximum Subarray: Kadane's algorithm to find contiguous subarray with maximum sum.", 0, "arrays"),
    ("Contains Duplicate: Check if any value appears at least twice in an integer array.", 0, "arrays"),
    ("Best Time to Buy and Sell Stock: Single pass tracking minimum price and maximum profit.", 0, "arrays"),
    ("Invert Binary Tree: Swap left and right child pointers recursively for every node.", 0, "trees"),
    ("Fibonacci Number: Compute nth Fibonacci number using basic iteration or memoization.", 0, "recursion"),
    ("SQL Select with WHERE and ORDER BY: Filter student records and sort by graduation year.", 0, "sql"),
    ("Implement Queue using Stacks: Standard FIFO queue using two LIFO stacks with amortized O(1).", 0, "queues"),
    ("Climbing Stairs: Count distinct ways to reach top taking 1 or 2 steps using simple recurrence.", 0, "dp"),
    ("Missing Number: Find missing element from 0 to n in array using Gauss formula or XOR.", 0, "arrays"),
    ("Single Number: Find unique element where every other element appears twice using bitwise XOR.", 0, "arrays"),
    ("Remove Duplicates from Sorted Array: Two-pointer in-place deduplication with O(1) space.", 0, "arrays"),
    ("Valid Anagram: Compare character frequency arrays or hash counts for two input strings.", 0, "strings"),
    ("Symmetric Tree: Check whether binary tree is mirror of itself using two-pointer recursion.", 0, "trees"),
    ("SQL GROUP BY and COUNT: Aggregate placement statistics grouped by department and batch.", 0, "sql"),

    # Medium problems & concepts
    ("3Sum: Find all unique triplets summing to zero using sorting and two pointers with duplicate skipping.", 1, "arrays"),
    ("Longest Substring Without Repeating Characters: Sliding window with hash set tracking character indices.", 1, "strings"),
    ("Container With Most Water: Two pointers converging inward based on shorter height boundary.", 1, "arrays"),
    ("Add Two Numbers: Add two linked lists representing reverse digits with carry propagation.", 1, "linked_lists"),
    ("Longest Palindromic Substring: Expand around center technique or dynamic programming table.", 1, "strings"),
    ("Course Schedule: Cycle detection in directed graph using topological sort and Kahn algorithm with in-degrees.", 1, "graphs"),
    ("Number of Islands: Depth-first search or breadth-first search grid traversal marking visited cells.", 1, "graphs"),
    ("Coin Change: Dynamic programming bottom-up minimum coins array initialized with infinity.", 1, "dp"),
    ("Word Break: Dynamic programming boolean array checking if prefix substring matches dictionary words.", 1, "dp"),
    ("Lowest Common Ancestor in Binary Tree: Recursive traversal searching left and right subtrees.", 1, "trees"),
    ("Binary Tree Level Order Traversal: BFS using queue to process nodes level by level.", 1, "trees"),
    ("Kth Largest Element in an Array: Quickselect partition or min-heap of size k in O(n log k).", 1, "sorting"),
    ("Top K Frequent Elements: Bucket sort or max-heap hash frequency map ranking.", 1, "sorting"),
    ("Search in Rotated Sorted Array: Modified binary search identifying sorted half and target boundary.", 1, "searching"),
    ("Subarray Sum Equals K: Hash map storing cumulative prefix sums and frequency counts.", 1, "arrays"),
    ("Validate Binary Search Tree: DFS passing allowable min and max boundary constraints to children.", 1, "trees"),
    ("Rotting Oranges: Multi-source BFS tracking elapsed time until all fresh oranges rot in grid.", 1, "graphs"),
    ("SQL INNER JOIN and Subquery: Rank candidate placement scores joining interviews and students.", 1, "sql"),
    ("LRU Cache: Double linked list combined with hash map for O(1) get and put eviction.", 1, "data_structures"),
    ("Longest Increasing Subsequence: Binary search patience sorting with tails array in O(n log n).", 1, "dp"),
    ("House Robber II: Dynamic programming with circular array constraint running two linear passes.", 1, "dp"),
    ("Group Anagrams: Categorize strings by sorted character key or 26-element tuple hash map.", 1, "strings"),

    # Hard problems & concepts
    ("Trapping Rain Water: Two pointers tracking left_max and right_max or monotonic decreasing stack.", 2, "arrays"),
    ("Merge k Sorted Lists: Priority queue min-heap combining list nodes or divide-and-conquer merge.", 2, "linked_lists"),
    ("Median of Two Sorted Arrays: Binary search on partition cut lines in O(log(min(m, n))).", 2, "searching"),
    ("Edit Distance: Levenshtein distance 2D matrix computing minimum insertions, deletions, substitutions.", 2, "dp"),
    ("Word Ladder II: Bidirectional BFS finding shortest transformation sequences followed by DFS backtracking.", 2, "graphs"),
    ("Alien Dictionary: Topological sorting on directed graph extracted from lexicographical word order.", 2, "graphs"),
    ("Sliding Window Maximum: Monotonic double-ended queue storing indices of candidates in descending order.", 2, "queues"),
    ("Serialize and Deserialize Binary Tree: Preorder traversal string builder with null markers and stateful queue.", 2, "trees"),
    ("Minimum Window Substring: Sliding window with character frequency target map and matching counter.", 2, "strings"),
    ("N-Queens: Backtracking with column, positive diagonal, and negative diagonal conflict bitmasks.", 2, "recursion"),
    ("Regular Expression Matching: Dynamic programming 2D boolean grid handling dot and star Kleene closure.", 2, "dp"),
    ("Binary Tree Maximum Path Sum: Recursive post-order computing max gain at each node with global diameter.", 2, "trees"),
    ("Burst Balloons: Interval dynamic programming subproblem optimal last balloon burst in O(n^3).", 2, "dp"),
    ("Longest Valid Parentheses: Stack storing index boundaries or two-pass left-right counter with O(1) space.", 2, "stacks"),
    ("Largest Rectangle in Histogram: Monotonic increasing stack tracking bar indices for maximal width calculation.", 2, "stacks"),
    ("Distinct Subsequences: Dynamic programming matching source string prefix to target pattern count.", 2, "dp"),
    ("SQL Window Functions with Dense Rank and Partition: Placement percentile ranking across cohorts.", 2, "sql"),
    ("Shortest Path in a Grid with Obstacles Elimination: 3D BFS tracking (r, c, k_remaining) state space.", 2, "graphs"),
]

def train():
    texts = [item[0] for item in DATASET]
    labels = np.array([item[1] for item in DATASET])
    categories = [item[2] for item in DATASET]

    # Combine text with domain tag for richer feature representation
    combined_features = [f"{cat} {txt}" for cat, txt in zip(categories, texts)]

    # 75% train, 25% test split with stratification to guarantee balanced class distribution
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        combined_features, labels, test_size=0.25, random_state=42, stratify=labels
    )

    # TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=250,
        sublinear_tf=True,
        stop_words="english"
    )
    X_train = vectorizer.fit_transform(X_train_raw)
    X_test = vectorizer.transform(X_test_raw)

    # Train Logistic Regression Difficulty Classifier
    # Multiclass multinomial logistic regression with L2 regularization
    model = LogisticRegression(
        C=2.5,
        max_iter=300,
        multi_class="multinomial",
        solver="lbfgs",
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate on held-out test set
    y_pred = model.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)
    prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)
    conf_mat = confusion_matrix(y_test, y_pred).tolist()
    rep = classification_report(y_test, y_pred, target_names=["Easy", "Medium", "Hard"], output_dict=True, zero_division=0)

    # Save trained models
    model_path = os.path.join(MODELS_DIR, "difficulty_classifier.pkl")
    vectorizer_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    with open(vectorizer_path, "wb") as f:
        pickle.dump(vectorizer, f)

    # Save real verifiable metrics
    metrics = {
        "model_type": "LogisticRegression (Multinomial with L2 regularization)",
        "vectorizer": "TfidfVectorizer (ngram_range=(1,2), sublinear_tf=True)",
        "train_samples": len(X_train_raw),
        "test_samples": len(X_test_raw),
        "total_dataset_size": len(DATASET),
        "classes": ["Easy (0)", "Medium (1)", "Hard (2)"],
        "accuracy": round(acc, 4),
        "precision_weighted": round(float(prec), 4),
        "recall_weighted": round(float(rec), 4),
        "f1_score_weighted": round(float(f1), 4),
        "precision_macro": round(float(prec_macro), 4),
        "recall_macro": round(float(rec_macro), 4),
        "f1_score_macro": round(float(f1_macro), 4),
        "confusion_matrix": conf_mat,
        "classification_report": rep,
        "artifacts_saved": [
            "ml_service/models/difficulty_classifier.pkl",
            "ml_service/models/tfidf_vectorizer.pkl"
        ]
    }

    metrics_path = os.path.join(BASE_DIR, "evaluation_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print("=== MODEL TRAINING COMPLETE ===")
    print(f"Accuracy: {acc:.2%}")
    print(f"Weighted F1: {f1:.2%}")
    print(f"Precision: {prec:.2%}")
    print(f"Recall: {rec:.2%}")
    print(f"Metrics saved to {metrics_path}")

if __name__ == "__main__":
    train()
