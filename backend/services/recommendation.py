from backend.models import (
    User,
    FitnessProfile,
    WorkoutPreference,
    Schedule
)

from backend.services.preprocessing import (
    create_feature_vector
)

from backend.services.similarity import (
    cosine_similarity
)

from backend.services.schedule_match import (
    calculate_schedule_score
)


# ======================================================
# GENERATE MATCHING EXPLANATION
# ======================================================

def generate_explanation(
    current_profile,
    current_preference,
    partner_profile,
    partner_preference,
    overlaps
):

    reasons = []

    if (
        current_profile.fitness_goal
        == partner_profile.fitness_goal
    ):
        reasons.append("Same fitness goal")

    if (
        current_profile.experience_level
        == partner_profile.experience_level
    ):
        reasons.append("Same experience level")

    if (
        current_profile.workout_type
        == partner_profile.workout_type
    ):
        reasons.append("Same workout type")

    if (
        current_profile.intensity
        == partner_profile.intensity
    ):
        reasons.append("Same workout intensity")

    if (
        current_preference.preferred_workout
        == partner_preference.preferred_workout
    ):
        reasons.append("Same preferred workout")

    if (
        current_preference.preferred_intensity
        == partner_preference.preferred_intensity
    ):
        reasons.append("Same preferred intensity")

    current_duration = (
        current_preference.preferred_duration or 0
    )

    partner_duration = (
        partner_preference.preferred_duration or 0
    )

    if abs(
        current_duration - partner_duration
    ) <= 15:

        reasons.append(
            "Similar workout duration"
        )

    current_frequency = (
        current_profile.workout_frequency or 0
    )

    partner_frequency = (
        partner_profile.workout_frequency or 0
    )

    if abs(
        current_frequency - partner_frequency
    ) <= 1:

        reasons.append(
            "Similar workout frequency"
        )

    if overlaps:

        common_days = ", ".join(
            sorted(
                set(
                    overlap["day"]
                    for overlap in overlaps
                )
            )
        )

        reasons.append(
            f"Shared availability: {common_days}"
        )

    if not reasons:

        return (
            "Recommended based on overall "
            "compatibility."
        )

    return (
        "Matched because: "
        + "; ".join(reasons)
        + "."
    )


# ======================================================
# GENERATE RECOMMENDATIONS
# ======================================================

def generate_recommendations(
    db,
    user_id: int
):

    # ----------------------------------------------
    # GET CURRENT USER
    # ----------------------------------------------

    current_user = db.query(User).filter(
        User.user_id == user_id
    ).first()

    if not current_user:
        return []

    # ----------------------------------------------
    # GET CURRENT USER PROFILE
    # ----------------------------------------------

    current_profile = db.query(
        FitnessProfile
    ).filter(
        FitnessProfile.user_id == user_id
    ).first()

    if not current_profile:
        return []

    # ----------------------------------------------
    # GET CURRENT USER PREFERENCES
    # ----------------------------------------------

    current_preference = db.query(
        WorkoutPreference
    ).filter(
        WorkoutPreference.user_id == user_id
    ).first()

    if not current_preference:
        return []

    # ----------------------------------------------
    # GET CURRENT USER SCHEDULE
    # ----------------------------------------------

    current_schedules = db.query(
        Schedule
    ).filter(
        Schedule.user_id == user_id
    ).all()

    # ----------------------------------------------
    # CREATE CURRENT USER VECTOR
    # ----------------------------------------------

    current_vector = create_feature_vector(
        current_profile,
        current_preference
    )

    # ----------------------------------------------
    # GET OTHER USERS
    # ----------------------------------------------

    other_users = db.query(User).filter(
        User.user_id != user_id
    ).all()

    recommendations = []

    # ----------------------------------------------
    # COMPARE WITH OTHER USERS
    # ----------------------------------------------

    for partner in other_users:

        # Partner profile
        partner_profile = db.query(
            FitnessProfile
        ).filter(
            FitnessProfile.user_id
            == partner.user_id
        ).first()

        if not partner_profile:
            continue

        # Partner preferences
        partner_preference = db.query(
            WorkoutPreference
        ).filter(
            WorkoutPreference.user_id
            == partner.user_id
        ).first()

        if not partner_preference:
            continue

        # Partner schedule
        partner_schedules = db.query(
            Schedule
        ).filter(
            Schedule.user_id
            == partner.user_id
        ).all()

        # ------------------------------------------
        # CREATE PARTNER VECTOR
        # ------------------------------------------

        partner_vector = create_feature_vector(
            partner_profile,
            partner_preference
        )

        # ------------------------------------------
        # COSINE SIMILARITY
        # ------------------------------------------

        similarity = cosine_similarity(
            current_vector,
            partner_vector
        )

        similarity_score = round(
            similarity * 100,
            2
        )

        # ------------------------------------------
        # SCHEDULE MATCH
        # ------------------------------------------

        schedule_score, overlaps = (
            calculate_schedule_score(
                current_schedules,
                partner_schedules
            )
        )

        # ------------------------------------------
        # FINAL COMPATIBILITY
        # ------------------------------------------

        compatibility_score = round(
            (
                similarity_score * 0.70
            )
            +
            (
                schedule_score * 0.30
            ),
            2
        )

        # ------------------------------------------
        # EXPLANATION
        # ------------------------------------------

        explanation = generate_explanation(
            current_profile,
            current_preference,
            partner_profile,
            partner_preference,
            overlaps
        )

        # ------------------------------------------
        # ADD RECOMMENDATION
        # ------------------------------------------

        recommendations.append({

            "partner_id":
                partner.user_id,

            "partner_name":
                partner.name,

            "similarity_score":
                similarity_score,

            "schedule_score":
                schedule_score,

            "compatibility_score":
                compatibility_score,

            "explanation":
                explanation
        })

    # ----------------------------------------------
    # SORT BY COMPATIBILITY
    # ----------------------------------------------

    recommendations.sort(
        key=lambda x:
            x["compatibility_score"],
        reverse=True
    )

    return recommendations