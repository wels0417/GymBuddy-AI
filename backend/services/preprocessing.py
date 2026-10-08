# ======================================================
# GYMBUDDY AI - PREPROCESSING
# ======================================================


# ------------------------------------------------------
# FITNESS GOAL
# ------------------------------------------------------

def encode_fitness_goal(goal):

    goals = [
        "Weight Loss",
        "Muscle Gain",
        "Strength",
        "Endurance",
        "General Fitness"
    ]

    return [
        1 if goal == value else 0
        for value in goals
    ]


# ------------------------------------------------------
# EXPERIENCE LEVEL
# ------------------------------------------------------

def encode_experience_level(level):

    levels = [
        "Beginner",
        "Intermediate",
        "Advanced"
    ]

    return [
        1 if level == value else 0
        for value in levels
    ]


# ------------------------------------------------------
# WORKOUT TYPE
# ------------------------------------------------------

def encode_workout_type(workout):

    workouts = [
        "Strength Training",
        "Cardio",
        "HIIT",
        "Yoga",
        "Mixed"
    ]

    return [
        1 if workout == value else 0
        for value in workouts
    ]


# ------------------------------------------------------
# INTENSITY
# ------------------------------------------------------

def encode_intensity(intensity):

    intensities = [
        "Light",
        "Moderate",
        "High"
    ]

    return [
        1 if intensity == value else 0
        for value in intensities
    ]


# ------------------------------------------------------
# WORKOUT PREFERENCE
# ------------------------------------------------------

def encode_preferred_workout(workout):

    workouts = [
        "Strength Training",
        "Cardio",
        "HIIT",
        "Yoga",
        "Mixed"
    ]

    return [
        1 if workout == value else 0
        for value in workouts
    ]


# ------------------------------------------------------
# PREFERRED INTENSITY
# ------------------------------------------------------

def encode_preferred_intensity(intensity):

    intensities = [
        "Light",
        "Moderate",
        "High"
    ]

    return [
        1 if intensity == value else 0
        for value in intensities
    ]


# ------------------------------------------------------
# CREATE NORMALIZED FEATURE VECTOR
# ------------------------------------------------------

def create_feature_vector(
    fitness_profile,
    workout_preference
):

    vector = []


    # ==================================================
    # FITNESS GOAL
    # ==================================================

    vector.extend(
        encode_fitness_goal(
            fitness_profile.fitness_goal
        )
    )


    # ==================================================
    # EXPERIENCE LEVEL
    # ==================================================

    vector.extend(
        encode_experience_level(
            fitness_profile.experience_level
        )
    )


    # ==================================================
    # WORKOUT TYPE
    # ==================================================

    vector.extend(
        encode_workout_type(
            fitness_profile.workout_type
        )
    )


    # ==================================================
    # INTENSITY
    # ==================================================

    vector.extend(
        encode_intensity(
            fitness_profile.intensity
        )
    )


    # ==================================================
    # WORKOUT FREQUENCY
    #
    # Expected range:
    # 1 - 7 days per week
    # ==================================================

    frequency = (
        fitness_profile.workout_frequency
        or 0
    )


    normalized_frequency = (
        frequency / 7
    )


    vector.append(
        normalized_frequency
    )


    # ==================================================
    # PREFERRED WORKOUT
    # ==================================================

    vector.extend(
        encode_preferred_workout(
            workout_preference.preferred_workout
        )
    )


    # ==================================================
    # PREFERRED INTENSITY
    # ==================================================

    vector.extend(
        encode_preferred_intensity(
            workout_preference.preferred_intensity
        )
    )


    # ==================================================
    # PREFERRED DURATION
    #
    # Expected range:
    # 15 - 180 minutes
    # ==================================================

    duration = (
        workout_preference.preferred_duration
        or 0
    )


    normalized_duration = (
        duration / 180
    )


    vector.append(
        normalized_duration
    )


    return vector