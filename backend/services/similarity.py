import math


def cosine_similarity(user_a, user_b):
    """
    Calculate cosine similarity between two numeric vectors.
    Returns a value between 0 and 1.
    """

    dot_product = sum(
        a * b
        for a, b in zip(user_a, user_b)
    )

    magnitude_a = math.sqrt(
        sum(a * a for a in user_a)
    )

    magnitude_b = math.sqrt(
        sum(b * b for b in user_b)
    )

    # Prevent division by zero
    if magnitude_a == 0 or magnitude_b == 0:
        return 0

    return dot_product / (
        magnitude_a * magnitude_b
    )


def compatibility_score(user_a, user_b):
    """
    Convert cosine similarity into a percentage.
    """

    similarity = cosine_similarity(
        user_a,
        user_b
    )

    return round(
        similarity * 100,
        2
    )